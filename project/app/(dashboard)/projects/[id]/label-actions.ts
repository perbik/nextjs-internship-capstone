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

function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

export async function createLabelAction(
	_previousState: LabelActionState,
	formData: FormData,
): Promise<LabelActionState> {
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

	try {
		const user = await requireCurrentUser();
		await createLabel(parsed.data.projectId, user.id, {
			name: parsed.data.name,
			color: parsed.data.color,
		});
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to create the label",
		};
	}

	revalidatePath(`/projects/${parsed.data.projectId}`);
	return { message: "Label created", success: true };
}

export async function deleteLabelAction(formData: FormData) {
	const labelId = z.uuid().safeParse(formValue(formData, "labelId"));
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));

	if (!labelId.success || !projectId.success) {
		return;
	}

	const user = await requireCurrentUser();
	await deleteLabel(labelId.data, user.id);
	revalidatePath(`/projects/${projectId.data}`);
}
