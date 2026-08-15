"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { createLabel, deleteLabel } from "@/lib/db/mutations";
import { labelCreateSchema } from "@/lib/validations";

export interface LabelActionState {
	message: string;
	success?: boolean;
}

const LABEL_ID_SCHEMA = z.uuid("Label must be a valid ID");
const LABEL_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your ProjectFlow account is not synchronized yet",
	"You do not have permission to create project labels",
	"You do not have permission to delete this label",
	"A label with this name already exists",
]);

// Shared helpers for label actions
function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function actionError(error: unknown, fallback: string): LabelActionState {
	if (error instanceof Error && LABEL_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

function revalidateLabelViews(projectId: string) {
	revalidatePath(`/projects/${projectId}`);
}

// Create a reusable task label for a project
export async function createLabelAction(
	_previousState: LabelActionState,
	formData: FormData,
): Promise<LabelActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = labelCreateSchema.safeParse({
			projectId: formValue(formData, "projectId"),
			name: formValue(formData, "name"),
			color: formValue(formData, "color"),
		});

		if (!parsed.success) {
			return {
				message: parsed.error.issues[0]?.message ?? "Invalid label",
			};
		}

		const label = await createLabel(parsed.data.projectId, user.id, {
			name: parsed.data.name,
			color: parsed.data.color,
		});
		savedProjectId = label.projectId;
	} catch (error) {
		return actionError(error, "Unable to create the label");
	}

	revalidateLabelViews(savedProjectId);
	return { message: "Label created", success: true };
}

// Delete a label and remove it from every assigned task
export async function deleteLabelAction(
	_previousState: LabelActionState,
	formData: FormData,
): Promise<LabelActionState> {
	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const labelId = LABEL_ID_SCHEMA.safeParse(formValue(formData, "labelId"));

		if (!labelId.success) {
			return { message: labelId.error.issues[0]?.message ?? "Invalid label" };
		}

		const result = await deleteLabel(labelId.data, user.id);
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to delete the label");
	}

	revalidateLabelViews(savedProjectId);
	return { message: "Label deleted", success: true };
}
