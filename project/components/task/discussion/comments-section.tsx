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
import { Textarea } from "@/components/ui/textarea";

const initialState: CommentActionState = { message: "" };

export function CommentsSection({
	projectId,
	taskId,
	comments,
	limit,
	variant,
	onRefresh,
}: {
	projectId: string;
	taskId: string;
	comments: TaskCommentItem[];
	limit: number;
	variant: "default" | "sidebar";
	onRefresh: () => void;
}) {
	const [editingId, setEditingId] = useState<string | null>(null);

	return (
		<section>
			<h3 className="mb-3 text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
				Comments ({comments.length})
			</h3>
			<div
				className={`${variant === "sidebar" ? "max-h-72" : "max-h-56"} mb-4 space-y-3 overflow-y-auto`}
			>
				{comments.length === 0 && (
					<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
						No comments yet.
					</p>
				)}
				{comments.map((comment) => (
					<article
						key={comment.id}
						className="rounded-lg bg-platinum-500/70 p-3 dark:bg-outer_space-400"
					>
						{editingId === comment.id ? (
							<CommentForm
								projectId={projectId}
								taskId={taskId}
								comment={comment}
								onCancel={() => setEditingId(null)}
								onSaved={onRefresh}
							/>
						) : (
							<>
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="text-xs font-medium text-outer_space-500 dark:text-platinum-500">
											{comment.authorName}
										</p>
										<p className="text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
											{new Date(comment.createdAt).toLocaleString()}
											{comment.updatedAt > comment.createdAt ? " · edited" : ""}
										</p>
									</div>
									{comment.isOwn && (
										<div className="flex gap-1">
											<button
												type="button"
												onClick={() => setEditingId(comment.id)}
												aria-label="Edit comment"
												className="rounded p-1 hover:bg-card dark:hover:bg-paynes_gray-400"
											>
												<Pencil size={13} />
											</button>
											<DeleteCommentForm
												projectId={projectId}
												comment={comment}
												onDeleted={onRefresh}
											/>
										</div>
									)}
								</div>
								<p className="mt-2 whitespace-pre-wrap text-sm text-paynes_gray-600 dark:text-french_gray-300">
									{comment.content}
								</p>
							</>
						)}
					</article>
				))}
			</div>
			<CommentForm projectId={projectId} taskId={taskId} onSaved={onRefresh} />
			{comments.length >= limit && (
				<p className="mt-2 text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
					Showing the {limit} most recent comments.
				</p>
			)}
		</section>
	);
}

function CommentForm({
	projectId,
	taskId,
	comment,
	onCancel,
	onSaved,
}: {
	projectId: string;
	taskId: string;
	comment?: TaskCommentItem;
	onCancel?: () => void;
	onSaved: () => void;
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const handledSuccess = useRef(false);
	const [state, action, isPending] = useActionState(
		comment ? updateCommentAction : createCommentAction,
		initialState,
	);

	useEffect(() => {
		if (!state.success || handledSuccess.current) {
			if (!state.success) handledSuccess.current = false;
			return;
		}

		handledSuccess.current = true;
		formRef.current?.reset();
		onCancel?.();
		onSaved();
	}, [onCancel, onSaved, state.success]);

	return (
		<form ref={formRef} action={action} className="space-y-2">
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="taskId" value={taskId} />
			{comment && <input type="hidden" name="commentId" value={comment.id} />}
			<Textarea
				name="content"
				required
				maxLength={1000}
				rows={comment ? 2 : 3}
				defaultValue={comment?.content}
				placeholder="Write a comment..."
				aria-label={comment ? "Edit comment" : "New comment"}
			/>
			{state.errors?.content?.[0] && (
				<p className="text-xs text-red-600 dark:text-red-400">
					{state.errors.content[0]}
				</p>
			)}
			{state.message && !state.success && (
				<p className="text-xs text-red-600 dark:text-red-400" role="alert">
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

function DeleteCommentForm({
	projectId,
	comment,
	onDeleted,
}: {
	projectId: string;
	comment: TaskCommentItem;
	onDeleted: () => void;
}) {
	const handledSuccess = useRef(false);
	const [state, action, isPending] = useActionState(
		deleteCommentAction,
		initialState,
	);

	useEffect(() => {
		if (!state.success || handledSuccess.current) {
			if (!state.success) handledSuccess.current = false;
			return;
		}

		handledSuccess.current = true;
		onDeleted();
	}, [onDeleted, state.success]);

	return (
		<DestructiveActionDialog
			title="Delete this comment?"
			description="This comment will be permanently removed from the task discussion."
			action={action}
			fields={[
				{ name: "projectId", value: projectId },
				{ name: "commentId", value: comment.id },
			]}
			confirmLabel="Delete comment"
			pendingLabel="Deleting..."
			error={state.success ? undefined : state.message}
			trigger={
				<button
					type="button"
					disabled={isPending}
					aria-label={`Delete comment by ${comment.authorName}`}
					className="rounded p-1 text-red-600 hover:bg-card disabled:opacity-50 dark:text-red-400 dark:hover:bg-paynes_gray-400"
				>
					<Trash2 size={13} />
				</button>
			}
		/>
	);
}
