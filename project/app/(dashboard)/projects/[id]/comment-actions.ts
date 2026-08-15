"use server";

import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createComment,
	deleteComment,
	updateComment,
} from "@/lib/db/mutations";
import { getTaskDiscussion } from "@/lib/db/queries";
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

	return { message: "Comment updated", success: true };
}

export async function deleteCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	const projectId = z.uuid().safeParse(stringValue(formData, "projectId"));
	const commentId = z.uuid().safeParse(stringValue(formData, "commentId"));

	if (!projectId.success || !commentId.success) {
		return { message: "Invalid project or comment ID" };
	}

	try {
		const user = await requireCurrentUser();
		await deleteComment(commentId.data, user.id);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to delete the comment",
		};
	}

	return { message: "Comment deleted", success: true };
}

export async function getTaskDiscussionAction(taskId: string) {
	const parsedTaskId = z.uuid().safeParse(taskId);

	if (!parsedTaskId.success) {
		return { message: "Invalid task ID", discussion: null };
	}

	const user = await requireCurrentUser();
	const discussion = await getTaskDiscussion(parsedTaskId.data, user.id);

	if (!discussion) {
		return {
			message: "You do not have access to this task",
			discussion: null,
		};
	}

	return {
		message: "",
		discussion: {
			comments: discussion.comments.map(({ comment, author }) => ({
				...comment,
				authorName:
					[author.firstName, author.lastName].filter(Boolean).join(" ") ||
					author.email,
				isOwn: author.id === user.id,
			})),
			activities: discussion.activities.map(({ activity, actor }) => ({
				...activity,
				actorName: actor
					? [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
						actor.email
					: "Former member",
			})),
			limit: discussion.limit,
		},
	};
}
