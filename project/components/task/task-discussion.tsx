"use client";

import { useCallback, useEffect, useState } from "react";
import { getTaskDiscussionAction } from "@/app/(dashboard)/projects/[id]/comment-actions";
import { TaskDiscussionSkeleton } from "@/components/loading";
import { ActivitySection } from "@/components/task/discussion/activity-section";
import { CommentsSection } from "@/components/task/discussion/comments-section";
import type {
	TaskActivityItem,
	TaskCommentItem,
} from "@/components/task/discussion/types";
import { Button } from "@/components/ui/button";

export type {
	TaskActivityItem,
	TaskCommentItem,
} from "@/components/task/discussion/types";

export function TaskDiscussion({
	taskId,
	variant = "default",
}: {
	taskId: string;
	variant?: "default" | "sidebar";
}) {
	const [comments, setComments] = useState<TaskCommentItem[]>([]);
	const [activities, setActivities] = useState<TaskActivityItem[]>([]);
	const [limit, setLimit] = useState(50);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const refreshDiscussion = useCallback(
		async (showLoading = false) => {
			if (showLoading) setIsLoading(true);
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
		},
		[taskId],
	);

	useEffect(() => {
		void refreshDiscussion(true);
	}, [refreshDiscussion]);

	const handleRefresh = useCallback(() => {
		void refreshDiscussion();
	}, [refreshDiscussion]);

	const containerClassName = getDiscussionContainerClass(variant);

	if (isLoading) {
		return <TaskDiscussionSkeleton className={containerClassName} />;
	}

	if (error) {
		return (
			<div className={containerClassName}>
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
				<Button
					type="button"
					variant="link"
					size="sm"
					onClick={() => void refreshDiscussion(true)}
					className="-ml-3 mt-1"
				>
					Try again
				</Button>
			</div>
		);
	}

	return (
		<div className={containerClassName}>
			<CommentsSection
				taskId={taskId}
				comments={comments}
				limit={limit}
				variant={variant}
				onRefresh={handleRefresh}
			/>
			<div
				className={
					variant === "sidebar"
						? "border-t border-border pt-6"
						: "border-t border-border pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0"
				}
			>
				<ActivitySection activities={activities} limit={limit} />
			</div>
		</div>
	);
}

// Loading, error, and loaded states layout
function getDiscussionContainerClass(variant: "default" | "sidebar") {
	return variant === "sidebar"
		? "grid content-start gap-6 bg-surface-panel p-5"
		: "mt-6 grid gap-6 border-t border-border pt-5 md:grid-cols-2";
}
