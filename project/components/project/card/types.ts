import type { ProjectSummary } from "@/lib/db/queries";

export type ProjectCardVariant = "grid" | "dashboard";

export interface ProjectCardProps {
	summary: ProjectSummary;
	variant?: ProjectCardVariant;
}

export type ProjectCardProject = ProjectSummary["project"];

export interface ProjectTaskCounts {
	taskCount: number;
	completedTaskCount: number;
}

export interface ProjectDatePresentation {
	label: string;
	className: string;
}
