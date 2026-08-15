"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
	useActionState,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type CommentActionState,
	createCommentAction,
	deleteCommentAction,
	getTaskDiscussionAction,
	updateCommentAction,
} from "@/app/(dashboard)/projects/[id]/comment-actions";
import { Skeleton } from "@/components/ui/skeleton";

export interface TaskCommentItem {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	authorName: string;
	isOwn: boolean;
}

export interface TaskActivityItem {
	id: string;
	action: string;
	createdAt: Date;
	actorName: string;
	metadata: Record<string, string | number | boolean | null>;
}

const initialState: CommentActionState = { message: "" };
const discussionSkeletonSections = ["comments", "activity"];

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
			if (!state.success) {
				handledSuccess.current = false;
			}
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
			<textarea
				name="content"
				required
				maxLength={1000}
				rows={comment ? 2 : 3}
				defaultValue={comment?.content}
				placeholder="Write a comment..."
				aria-label={comment ? "Edit comment" : "New comment"}
				className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
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
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg px-3 py-1.5 text-xs text-paynes_gray-500 hover:bg-platinum-500 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
					>
						Cancel
					</button>
				)}
				<button
					type="submit"
					disabled={isPending}
					className="rounded-lg bg-blue_munsell-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-60"
				>
					{isPending ? "Saving..." : comment ? "Save" : "Comment"}
				</button>
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
			if (!state.success) {
				handledSuccess.current = false;
			}
			return;
		}

		handledSuccess.current = true;
		onDeleted();
	}, [onDeleted, state.success]);

	return (
		<form action={action}>
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="commentId" value={comment.id} />
			<button
				type="submit"
				disabled={isPending}
				aria-label={`Delete comment by ${comment.authorName}`}
				className="rounded p-1 text-red-600 hover:bg-white disabled:opacity-50 dark:text-red-400 dark:hover:bg-paynes_gray-400"
			>
				<Trash2 size={13} />
			</button>
			{state.message && !state.success && (
				<span className="sr-only" role="alert">
					{state.message}
				</span>
			)}
		</form>
	);
}

const activityLabels: Record<string, string> = {
	task_created: "created the task",
	task_updated: "updated the task",
	task_moved: "moved the task",
	task_reordered: "reordered the task",
	comment_added: "added a comment",
	comment_updated: "edited a comment",
	comment_deleted: "deleted a comment",
};

function activityDescription(activity: TaskActivityItem) {
	if (
		activity.action === "task_moved" &&
		typeof activity.metadata.fromListName === "string" &&
		typeof activity.metadata.toListName === "string"
	) {
		return `moved the task from ${activity.metadata.fromListName} to ${activity.metadata.toListName}`;
	}

	if (
		activity.action === "task_field_changed" &&
		typeof activity.metadata.field === "string"
	) {
		const from =
			typeof activity.metadata.from === "string"
				? activity.metadata.from
				: null;
		const to =
			typeof activity.metadata.to === "string" ? activity.metadata.to : null;

		switch (activity.metadata.field) {
			case "title":
				return `changed the title from “${from}” to “${to}”`;
			case "description":
				return "updated the description";
			case "priority":
				return `changed the priority from ${from} to ${to}`;
			case "dueDate":
				if (!from && to) {
					return `set the due date to ${new Date(to).toLocaleDateString()}`;
				}
				if (from && !to) {
					return `removed the due date (${new Date(from).toLocaleDateString()})`;
				}
				return `changed the due date from ${new Date(from ?? "").toLocaleDateString()} to ${new Date(to ?? "").toLocaleDateString()}`;
			case "assignee":
				if (!from && to) {
					return `assigned the task to ${to}`;
				}
				if (from && !to) {
					return `unassigned the task from ${from}`;
				}
				return `reassigned the task from ${from} to ${to}`;
			case "labels":
				if (!from && to) {
					return `added labels: ${to}`;
				}
				if (from && !to) {
					return `removed labels: ${from}`;
				}
				return `changed the labels from ${from} to ${to}`;
			default:
				return `changed ${activity.metadata.field}`;
		}
	}

	if (
		(activity.action === "task_label_added" ||
			activity.action === "task_label_removed") &&
		typeof activity.metadata.labelName === "string"
	) {
		return `${
			activity.action === "task_label_added" ? "added" : "removed"
		} the ${activity.metadata.labelName} label`;
	}

	return activityLabels[activity.action] ?? activity.action;
}

export function TaskDiscussion({
	projectId,
	taskId,
}: {
	projectId: string;
	taskId: string;
}) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [comments, setComments] = useState<TaskCommentItem[]>([]);
	const [activities, setActivities] = useState<TaskActivityItem[]>([]);
	const [limit, setLimit] = useState(50);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const refreshDiscussion = useCallback(async () => {
		setIsLoading(true);
		setError("");

		try {
			const result = await getTaskDiscussionAction(taskId);

			if (!result.discussion) {
				setError(result.message || "Unable to load task discussion");
				return;
			}

			setComments(result.discussion.comments);
			setActivities(result.discussion.activities);
			setLimit(result.discussion.limit);
		} catch {
			setError("Unable to load task discussion");
		} finally {
			setIsLoading(false);
		}
	}, [taskId]);

	useEffect(() => {
		void refreshDiscussion();
	}, [refreshDiscussion]);

	if (isLoading) {
		return (
			<div className="mt-6 grid gap-6 border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400 md:grid-cols-2">
				{discussionSkeletonSections.map((section) => (
					<div key={section} className="space-y-3">
						<Skeleton className="h-5 w-28" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-6 border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400">
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
				<button
					type="button"
					onClick={() => void refreshDiscussion()}
					className="mt-2 text-xs text-blue_munsell-600 hover:underline dark:text-blue_munsell-300"
				>
					Try again
				</button>
			</div>
		);
	}

	return (
		<div className="mt-6 grid gap-6 border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400 md:grid-cols-2">
			<section>
				<h3 className="mb-3 text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
					Comments ({comments.length})
				</h3>
				<div className="mb-4 max-h-56 space-y-3 overflow-y-auto">
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
									onSaved={refreshDiscussion}
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
												{comment.updatedAt > comment.createdAt
													? " · edited"
													: ""}
											</p>
										</div>
										{comment.isOwn && (
											<div className="flex gap-1">
												<button
													type="button"
													onClick={() => setEditingId(comment.id)}
													aria-label="Edit comment"
													className="rounded p-1 hover:bg-white dark:hover:bg-paynes_gray-400"
												>
													<Pencil size={13} />
												</button>
												<DeleteCommentForm
													projectId={projectId}
													comment={comment}
													onDeleted={refreshDiscussion}
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
				<CommentForm
					projectId={projectId}
					taskId={taskId}
					onSaved={refreshDiscussion}
				/>
				{comments.length >= limit && (
					<p className="mt-2 text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
						Showing the {limit} most recent comments.
					</p>
				)}
			</section>

			<section>
				<h3 className="mb-3 text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
					Activity
				</h3>
				<div className="max-h-72 space-y-3 overflow-y-auto">
					{activities.length === 0 && (
						<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
							No recorded activity yet.
						</p>
					)}
					{activities.map((activity) => (
						<div key={activity.id} className="flex gap-2 text-xs">
							<span className="mt-1 size-2 shrink-0 rounded-full bg-blue_munsell-500" />
							<p className="text-paynes_gray-500 dark:text-french_gray-400">
								<span className="font-medium text-outer_space-500 dark:text-platinum-500">
									{activity.actorName}
								</span>{" "}
								{activityDescription(activity)}
								<br />
								<span className="text-[10px]">
									{new Date(activity.createdAt).toLocaleString()}
								</span>
							</p>
						</div>
					))}
				</div>
				{activities.length >= limit && (
					<p className="mt-2 text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
						Showing the {limit} most recent activity entries.
					</p>
				)}
			</section>
		</div>
	);
}
