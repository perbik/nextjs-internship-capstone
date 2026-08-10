"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createList,
	deleteList,
	moveList,
	updateList,
} from "@/lib/db/mutations";
import { listCreateSchema, listUpdateSchema } from "@/lib/validations";

export interface ListActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const listIdSchema = z.uuid("List must be a valid ID");
const directionSchema = z.enum(["left", "right"]);

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

export async function createListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
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

	try {
		const user = await requireCurrentUser();
		await createList(parsed.data.projectId, user.id, {
			name: parsed.data.name,
			isCompleted: parsed.data.isCompleted ?? false,
		});
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to add the list",
		};
	}

	revalidatePath(`/projects/${parsed.data.projectId}`);
	revalidatePath("/dashboard");
	return { message: "List added", success: true };
}

export async function updateListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
	const listId = listIdSchema.safeParse(formValue(formData, "listId"));
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
	const parsed = listUpdateSchema.safeParse({
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

	try {
		const user = await requireCurrentUser();
		await updateList(listId.data, user.id, {
			name: parsed.data.name ?? "",
			isCompleted: parsed.data.isCompleted ?? false,
		});
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to update the list",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	revalidatePath("/dashboard");
	return { message: "List updated", success: true };
}

export async function deleteListAction(
	_previousState: ListActionState,
	formData: FormData,
): Promise<ListActionState> {
	const listId = listIdSchema.safeParse(formValue(formData, "listId"));
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));

	if (!listId.success || !projectId.success) {
		return { message: "Invalid list or project ID" };
	}

	try {
		const user = await requireCurrentUser();
		await deleteList(listId.data, user.id);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to delete the list",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	revalidatePath("/dashboard");
	return { message: "List deleted", success: true };
}

export async function moveListAction(
	formData: FormData,
): Promise<ListActionState> {
	const listId = listIdSchema.safeParse(formValue(formData, "listId"));
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
	const direction = directionSchema.safeParse(formValue(formData, "direction"));

	if (!listId.success || !projectId.success || !direction.success) {
		return { message: "Invalid list move" };
	}

	try {
		const user = await requireCurrentUser();
		await moveList(listId.data, user.id, direction.data);
	} catch (error) {
		console.error("Failed to move list", error);
		return { message: "Unable to move the column" };
	}

	revalidatePath(`/projects/${projectId.data}`);
	revalidatePath("/dashboard");
	return { message: "Column moved", success: true };
}
