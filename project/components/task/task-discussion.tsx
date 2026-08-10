"use client";

import { useCallback, useEffect, useState } from "react";
import { getTaskDiscussionAction } from "@/app/(dashboard)/projects/[id]/comment-actions";
import { ActivitySection } from "@/components/task/discussion/activity-section";
import { CommentsSection } from "@/components/task/discussion/comments-section";
import type {
	TaskActivityItem,
	TaskCommentItem,
} from "@/components/task/discussion/types";
import { Skeleton } from "@/components/ui/skeleton";

export type {
	TaskActivityItem,
	TaskCommentItem,
} from "@/components/task/discussion/types";

const discussionSkeletonSections = ["comments", "activity"];

export function TaskDiscussion({
	projectId,
	taskId,
	variant = "default",
}: {
	projectId: string;
	taskId: string;
	variant?: "default" | "sidebar";
}) {
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

	if (isLoading) return <DiscussionSkeleton variant={variant} />;

	if (error) {
		return (
			<div className={discussionContainerClass(variant)}>
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
				<button
					type="button"
					onClick={() => void refreshDiscussion()}
					className="mt-2 text-xs text-brand hover:underline"
				>
					Try again
				</button>
			</div>
		);
	}

	return (
		<div className={discussionContainerClass(variant)}>
			<CommentsSection
				projectId={projectId}
				taskId={taskId}
				comments={comments}
				limit={limit}
				variant={variant}
				onRefresh={() => void refreshDiscussion()}
			/>
			<ActivitySection activities={activities} limit={limit} />
		</div>
	);
}

function DiscussionSkeleton({ variant }: { variant: "default" | "sidebar" }) {
	return (
		<div className={discussionContainerClass(variant)}>
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

function discussionContainerClass(variant: "default" | "sidebar") {
	return variant === "sidebar"
		? "grid content-start gap-6 bg-surface-panel p-5"
		: "mt-6 grid gap-6 border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400 md:grid-cols-2";
}
