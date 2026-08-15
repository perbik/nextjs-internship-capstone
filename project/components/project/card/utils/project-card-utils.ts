import type { ProjectStatus } from "@/lib/db/schema";
import type { BoardList } from "@/stores/board-store";
import type { ProjectDatePresentation, ProjectTaskCounts } from "../types";

export function getProjectTaskCounts(
	lists: BoardList[] | null,
	savedTaskCount: number,
	savedCompletedTaskCount: number,
): ProjectTaskCounts {
	if (!lists) {
		return {
			taskCount: savedTaskCount,
			completedTaskCount: savedCompletedTaskCount,
		};
	}

	return lists.reduce<ProjectTaskCounts>(
		(counts, list) => ({
			taskCount: counts.taskCount + list.tasks.length,
			completedTaskCount:
				counts.completedTaskCount + (list.isCompleted ? list.tasks.length : 0),
		}),
		{ taskCount: 0, completedTaskCount: 0 },
	);
}

export function calculateProjectProgress(
	completedTaskCount: number,
	taskCount: number,
): number {
	if (taskCount <= 0) return 0;

	const progress = Math.round((completedTaskCount / taskCount) * 100);
	return Math.min(100, Math.max(0, progress));
}

export function isProjectOverdue(dueDate: Date, now = new Date()): boolean {
	const today = new Date(now);
	today.setUTCHours(0, 0, 0, 0);

	return dueDate.getTime() < today.getTime();
}

export function formatProjectDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}

export function getProjectDatePresentation(
	dueDate: Date | null,
	status: ProjectStatus,
): ProjectDatePresentation {
	if (status === "completed") {
		return {
			label: "Completed",
			badgeClassName: "bg-success text-white dark:text-background",
		};
	}

	if (status === "on_hold") {
		return {
			label: "On hold",
			badgeClassName: "bg-warning text-[#51421a]",
		};
	}

	if (!dueDate) {
		return {
			label: "No due date",
			badgeClassName: "bg-info text-white",
		};
	}

	const formattedDate = formatProjectDate(dueDate);

	return {
		label: `Due on ${formattedDate}`,
		badgeClassName: isProjectOverdue(dueDate)
			? "bg-destructive text-destructive-foreground"
			: "bg-info text-white",
	};
}
