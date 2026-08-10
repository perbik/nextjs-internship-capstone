import type { BoardList } from "@/stores/board-store";
import type { ProjectStatus } from "@/types";
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
	return taskCount === 0
		? 0
		: Math.round((completedTaskCount / taskCount) * 100);
}

export function isProjectOverdue(
	dueDate: Date | null,
	status: ProjectStatus,
	now = Date.now(),
): boolean {
	return Boolean(dueDate && status !== "completed" && dueDate.getTime() < now);
}

export function formatProjectDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function getProjectDatePresentation(
	dueDate: Date | null,
	status: ProjectStatus,
): ProjectDatePresentation {
	if (!dueDate) {
		return {
			label: "No due date",
			className: "bg-[#2986ff] text-white",
		};
	}

	const formattedDate = formatProjectDate(dueDate);

	if (status === "completed") {
		return {
			label: `Completed on ${formattedDate}`,
			className: "bg-[#66c24b] text-white",
		};
	}

	if (status === "on_hold") {
		return {
			label: `Paused on ${formattedDate}`,
			className: "bg-[#ffbb00] text-[#51421a]",
		};
	}

	return {
		label: `Due on ${formattedDate}`,
		className: isProjectOverdue(dueDate, status)
			? "bg-red-500 text-white"
			: "bg-[#2986ff] text-white",
	};
}
