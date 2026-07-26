"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createComment,
	deleteComment,
	updateComment,
} from "@/lib/db/mutations";
import { commentCreateSchema, commentUpdateSchema } from "@/lib/validations";

export interface CommentActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

function stringValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function validationError(error: z.ZodError): CommentActionState {
	return {
		message: "Please correct the comment",
		errors: Object.fromEntries(
			Object.entries(error.flatten().fieldErrors).filter(
				(entry): entry is [string, string[]] => Boolean(entry[1]),
			),
		),
	};
}

export async function createCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	const projectId = z.uuid().safeParse(stringValue(formData, "projectId"));
	const parsed = commentCreateSchema.safeParse({
		taskId: stringValue(formData, "taskId"),
		content: stringValue(formData, "content"),
	});

	if (!projectId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid project ID" }
			: validationError(parsed.error);
	}

	try {
		const user = await requireCurrentUser();
		await createComment(parsed.data.taskId, user.id, parsed.data.content);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to add the comment",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	return { message: "Comment added", success: true };
}

export async function updateCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	const projectId = z.uuid().safeParse(stringValue(formData, "projectId"));
	const commentId = z.uuid().safeParse(stringValue(formData, "commentId"));
	const parsed = commentUpdateSchema.safeParse({
		content: stringValue(formData, "content"),
	});

	if (!projectId.success || !commentId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid project or comment ID" }
			: validationError(parsed.error);
	}

	try {
		const user = await requireCurrentUser();
		await updateComment(commentId.data, user.id, parsed.data.content ?? "");
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to edit the comment",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	return { message: "Comment updated", success: true };
}

export async function deleteCommentAction(formData: FormData) {
	const projectId = z.uuid().safeParse(stringValue(formData, "projectId"));
	const commentId = z.uuid().safeParse(stringValue(formData, "commentId"));

	if (!projectId.success || !commentId.success) {
		return;
	}

	const user = await requireCurrentUser();
	await deleteComment(commentId.data, user.id);
	revalidatePath(`/projects/${projectId.data}`);
}
