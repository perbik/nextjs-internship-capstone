"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createList,
	deleteList,
	moveList,
	moveListToPosition,
	updateList,
} from "@/lib/db/mutations";
import { listCreateSchema, listSchema } from "@/lib/validations";

export interface ListActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const LIST_ID_SCHEMA = z.uuid("List must be a valid ID");
const DIRECTION_SCHEMA = z.enum(["left", "right"]);
const LIST_POSITION_SCHEMA = z.object({
	projectId: z.uuid(),
	listId: z.uuid(),
	targetPosition: z.number().int().nonnegative(),
});

const LIST_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your Brix account is not synchronized yet",
	"You do not have permission to manage this list",
	"A project must keep at least one completed column",
	"You do not have permission to add lists to this project",
	"A project must keep at least one list",
	"Move or delete the tasks in this column before deleting it",
	"The column no longer exists",
]);

// Shared helpers for column actions
function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function validationState(
	message: string,
	errors: Record<string, string[] | undefined>,
): ListActionState {
	return {
		message,
		errors: Object.fromEntries(
			Object.entries(errors).filter((entry): entry is [string, string[]] =>
				Boolean(entry[1]),
			),
		),
	};
}

function actionError(error: unknown, fallback: string): ListActionState {
	if (error instanceof Error && LIST_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

function revalidateListViews(projectId: string) {
	revalidatePath(`/projects/${projectId}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/calendar");
	revalidatePath("/analytics");
}

// Create a column at the end of a project board
export async function createListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = listCreateSchema.safeParse({
			projectId: formValue(formData, "projectId"),
			name: formValue(formData, "name"),
			isCompleted: formData.get("isCompleted") === "on",
		});

		if (!parsed.success) {
			return validationState(
				"Please correct the list fields",
				parsed.error.flatten().fieldErrors,
			);
		}

		const list = await createList(parsed.data.projectId, user.id, {
			name: parsed.data.name,
			isCompleted: parsed.data.isCompleted ?? false,
		});
		savedProjectId = list.projectId;
	} catch (error) {
		return actionError(error, "Unable to add the list");
	}

	revalidateListViews(savedProjectId);
	return { message: "List added", success: true };
}

// Update a column's name and completion behavior
export async function updateListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const listId = LIST_ID_SCHEMA.safeParse(formValue(formData, "listId"));
		const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
		const parsed = listSchema.safeParse({
			name: formValue(formData, "name"),
			isCompleted: formData.get("isCompleted") === "on",
		});

		if (!listId.success || !projectId.success || !parsed.success) {
			return parsed.success
				? { message: "Invalid list or project ID" }
				: validationState(
						"Please correct the list fields",
						parsed.error.flatten().fieldErrors,
					);
		}

		const result = await updateList(listId.data, user.id, {
			name: parsed.data.name,
			isCompleted: parsed.data.isCompleted ?? false,
		});
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to update the list");
	}

	revalidateListViews(savedProjectId);
	return { message: "List updated", success: true };
}

// Delete an empty column while preserving board invariants
export async function deleteListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const listId = LIST_ID_SCHEMA.safeParse(formValue(formData, "listId"));
		const projectId = z.uuid().safeParse(formValue(formData, "projectId"));

		if (!listId.success || !projectId.success) {
			return { message: "Invalid list or project ID" };
		}

		const result = await deleteList(listId.data, user.id);
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to delete the list");
	}

	revalidateListViews(savedProjectId);
	return { message: "List deleted", success: true };
}

// Move a column one position with accessible form controls
export async function moveListAction(
	formData: FormData,
): Promise<ListActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const listId = LIST_ID_SCHEMA.safeParse(formValue(formData, "listId"));
		const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
		const direction = DIRECTION_SCHEMA.safeParse(
			formValue(formData, "direction"),
		);

		if (!listId.success || !projectId.success || !direction.success) {
			return { message: "Invalid list move" };
		}

		const result = await moveList(listId.data, user.id, direction.data);
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to move the column");
	}

	revalidateListViews(savedProjectId);
	return { message: "Column moved", success: true };
}

// Persist a dragged column at its final position
export async function moveListToPositionAction(
	input: unknown,
): Promise<ListActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = LIST_POSITION_SCHEMA.safeParse(input);

		if (!parsed.success) {
			return { message: "Invalid column position" };
		}

		const result = await moveListToPosition(
			parsed.data.listId,
			user.id,
			parsed.data.targetPosition,
		);
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to move the column");
	}

	revalidateListViews(savedProjectId);
	return { message: "Column moved", success: true };
}
