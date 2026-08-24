"use server";

import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createComment,
	deleteComment,
	updateComment,
} from "@/lib/db/mutations";
import { getTaskDiscussion } from "@/lib/db/queries";
import { commentCreateSchema, commentSchema } from "@/lib/validations";

export interface CommentActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const COMMENT_ID_SCHEMA = z.uuid("Comment must be a valid ID");
const TASK_ID_SCHEMA = z.uuid("Task must be a valid ID");
const COMMENT_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your Brix account is not synchronized yet",
	"You do not have access to this task",
	"You can only edit your own comments",
	"You can only delete your own comments",
]);

// Shared helpers for comment actions
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

function actionError(error: unknown, fallback: string): CommentActionState {
	if (error instanceof Error && COMMENT_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

// Add a comment to an accessible task
export async function createCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	try {
		const user = await requireCurrentUser();
		const parsed = commentCreateSchema.safeParse({
			taskId: stringValue(formData, "taskId"),
			content: stringValue(formData, "content"),
		});

		if (!parsed.success) {
			return validationError(parsed.error);
		}

		await createComment(parsed.data.taskId, user.id, parsed.data.content);
	} catch (error) {
		return actionError(error, "Unable to add the comment");
	}

	return { message: "Comment added", success: true };
}

// Update a comment written by the current user
export async function updateCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	try {
		const user = await requireCurrentUser();
		const commentId = COMMENT_ID_SCHEMA.safeParse(
			stringValue(formData, "commentId"),
		);
		const parsed = commentSchema.safeParse({
			content: stringValue(formData, "content"),
		});

		if (!commentId.success || !parsed.success) {
			return parsed.success
				? { message: "Invalid comment ID" }
				: validationError(parsed.error);
		}

		await updateComment(commentId.data, user.id, parsed.data.content);
	} catch (error) {
		return actionError(error, "Unable to edit the comment");
	}

	return { message: "Comment updated", success: true };
}

// Delete a comment written by the current user
export async function deleteCommentAction(
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	try {
		const user = await requireCurrentUser();
		const commentId = COMMENT_ID_SCHEMA.safeParse(
			stringValue(formData, "commentId"),
		);

		if (!commentId.success) {
			return {
				message: commentId.error.issues[0]?.message ?? "Invalid comment ID",
			};
		}

		await deleteComment(commentId.data, user.id);
	} catch (error) {
		return actionError(error, "Unable to delete the comment");
	}

	return { message: "Comment deleted", success: true };
}

export async function getTaskDiscussionAction(taskId: string) {
	const parsedTaskId = TASK_ID_SCHEMA.safeParse(taskId);

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
