import type { ProjectCardVariant } from "./types";
import { calculateProjectProgress } from "./utils/project-card-utils";

const PROGRESS_SEGMENTS = Array.from({ length: 10 }, (_, index) => index + 1);

interface ProjectCardProgressProps {
	projectName: string;
	completedTaskCount: number;
	taskCount: number;
	variant: ProjectCardVariant;
}

export function ProjectCardProgress({
	projectName,
	completedTaskCount,
	taskCount,
	variant,
}: ProjectCardProgressProps) {
	const progress = calculateProjectProgress(completedTaskCount, taskCount);
	const filledSegmentCount = Math.round(progress / 10);
	const isDashboard = variant === "dashboard";

	return (
		<div className={isDashboard ? "px-5 pb-3 pt-4" : "px-4 py-2.5"}>
			<div
				className={
					isDashboard
						? "flex items-center justify-between font-display text-[13px] font-bold leading-[19.5px] text-foreground dark:text-muted-foreground"
						: "flex items-center justify-between font-display text-xs font-bold text-foreground dark:text-muted-foreground"
				}
			>
				<span>Progress</span>
				<span>
					{completedTaskCount} of {taskCount} tasks
				</span>
			</div>
			<div
				className={isDashboard ? "mt-2.5 flex gap-1.25" : "mt-1.5 flex gap-1"}
				role="progressbar"
				aria-label={`${projectName} progress`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={progress}
				aria-valuetext={`${completedTaskCount} of ${taskCount} tasks completed`}
			>
				{PROGRESS_SEGMENTS.map((segment) => (
					<span
						key={segment}
						className={`${isDashboard ? "h-2.5" : "h-2"} min-w-0 flex-1 rounded-full ${segment <= filledSegmentCount ? "bg-brand" : "bg-brand-soft"}`}
					/>
				))}
			</div>
		</div>
	);
}
