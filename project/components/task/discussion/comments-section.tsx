"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
	type CommentActionState,
	createCommentAction,
	deleteCommentAction,
	updateCommentAction,
} from "@/app/(dashboard)/projects/[id]/comment-actions";
import type { TaskCommentItem } from "@/components/task/discussion/types";
import { Button } from "@/components/ui/button";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import { FieldError } from "@/components/ui/field-error";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

const INITIAL_COMMENT_STATE: CommentActionState = { message: "" };

interface CommentsSectionProps {
	taskId: string;
	comments: TaskCommentItem[];
	limit: number;
	variant: "default" | "sidebar";
	onRefresh: () => void;
}

interface CommentFormProps {
	taskId: string;
	comment?: TaskCommentItem;
	onCancel?: () => void;
	onSaved: () => void;
}

interface DeleteCommentFormProps {
	comment: TaskCommentItem;
	onDeleted: () => void;
}

export function CommentsSection({
	taskId,
	comments,
	limit,
	variant,
	onRefresh,
}: CommentsSectionProps) {
	// Only one comment can show its edit form at a time
	const [editingId, setEditingId] = useState<string | null>(null);

	return (
		<section>
			<h3 className="mb-3 text-sm font-semibold text-foreground">
				Comments ({comments.length})
			</h3>
			<div
				className={`${variant === "sidebar" ? "max-h-72" : "max-h-56"} mb-4 space-y-3 overflow-y-auto`}
			>
				{comments.length === 0 && (
					<p className="text-xs text-muted-foreground">No comments yet.</p>
				)}
				{comments.map((comment) => (
					<article
						key={comment.id}
						className="rounded-lg bg-card border border-border p-3"
					>
						{editingId === comment.id ? (
							<CommentForm
								taskId={taskId}
								comment={comment}
								onCancel={() => setEditingId(null)}
								onSaved={onRefresh}
							/>
						) : (
							<>
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="text-xs font-medium text-foreground">
											{comment.authorName}
										</p>
										<p className="text-[10px] text-muted-foreground">
											{new Date(comment.createdAt).toLocaleString()}
											{comment.updatedAt > comment.createdAt ? " · edited" : ""}
										</p>
									</div>
									{/* Only the author can edit or delete this comment */}
									{comment.isOwn && (
										<div className="flex gap-1">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => setEditingId(comment.id)}
												aria-label="Edit comment"
												className="size-7"
											>
												<Pencil size={13} />
											</Button>
											<DeleteCommentForm
												comment={comment}
												onDeleted={onRefresh}
											/>
										</div>
									)}
								</div>
								<p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
									{comment.content}
								</p>
							</>
						)}
					</article>
				))}
			</div>
			<CommentForm taskId={taskId} onSaved={onRefresh} />
			{/* The query intentionally returns only the latest records */}
			{comments.length >= limit && (
				<p className="mt-2 text-[10px] text-muted-foreground">
					Showing the {limit} most recent comments.
				</p>
			)}
		</section>
	);
}

function CommentForm({ taskId, comment, onCancel, onSaved }: CommentFormProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, isPending] = useActionState(
		comment ? updateCommentAction : createCommentAction,
		INITIAL_COMMENT_STATE,
	);

	useEffect(() => {
		if (!state.success) return;

		// Clear the form and reload both comments and activity
		formRef.current?.reset();
		onCancel?.();
		onSaved();
	}, [onCancel, onSaved, state]);

	return (
		<form ref={formRef} action={action} className="space-y-2">
			{/* Server actions use these IDs to find and authorize the records */}
			<input type="hidden" name="taskId" value={taskId} />
			{comment && <input type="hidden" name="commentId" value={comment.id} />}
			<TextareaWithCounter
				name="content"
				required
				maxLength={1000}
				rows={comment ? 2 : 3}
				defaultValue={comment?.content}
				placeholder="Write a comment..."
				aria-label={comment ? "Edit comment" : "New comment"}
			/>
			<FieldError message={state.errors?.content?.[0]} className="text-xs" />
			{state.message && !state.success && (
				<p className="text-xs text-destructive" role="alert">
					{state.message}
				</p>
			)}
			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button type="button" variant="outline" size="sm" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" size="sm" disabled={isPending}>
					{isPending ? "Saving..." : comment ? "Save" : "Comment"}
				</Button>
			</div>
		</form>
	);
}

function DeleteCommentForm({ comment, onDeleted }: DeleteCommentFormProps) {
	const [state, action, isPending] = useActionState(
		deleteCommentAction,
		INITIAL_COMMENT_STATE,
	);

	useEffect(() => {
		if (!state.success) return;

		// Refresh the discussion after the dialog completes the deletion
		onDeleted();
	}, [onDeleted, state]);

	return (
		<DestructiveActionDialog
			title="Delete this comment?"
			description="This comment will be permanently removed from the task discussion."
			action={action}
			fields={[{ name: "commentId", value: comment.id }]}
			confirmLabel="Delete comment"
			pendingLabel="Deleting..."
			error={state.success ? undefined : state.message}
			trigger={
				<Button
					type="button"
					variant="ghost"
					size="icon"
					disabled={isPending}
					aria-label={`Delete comment by ${comment.authorName}`}
					className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 size={13} />
				</Button>
			}
		/>
	);
}
