"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { ProjectCardFooter } from "./project-card-footer";
import { ProjectCardHeader } from "./project-card-header";
import { ProjectCardProgress } from "./project-card-progress";
import type { ProjectCardProps } from "./types";
import { getProjectTaskCounts } from "./utils/project-card-utils";

export function ProjectCard({ summary, variant = "grid" }: ProjectCardProps) {
	const {
		project,
		memberCount,
		taskCount: savedTaskCount,
		completedTaskCount: savedCompletedTaskCount,
		role,
	} = summary;
	const optimisticLists = useBoardStore((state) =>
		state.projectId === project.id ? state.lists : null,
	);
	const { taskCount, completedTaskCount } = getProjectTaskCounts(
		optimisticLists,
		savedTaskCount,
		savedCompletedTaskCount,
	);
	const canManage = role === "owner" || role === "admin";
	const canDelete = role === "owner";
	const projectHref = `/projects/${project.id}`;
	const isDashboard = variant === "dashboard";

	return (
		<Card
			className={cn(
				"group relative cursor-pointer overflow-hidden rounded-[20px] border-black/18 bg-card text-inherit transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md dark:border-white/20",
				!isDashboard && "flex h-full min-h-52 flex-col",
			)}
		>
			<Link
				href={projectHref}
				aria-label={`Open ${project.name}`}
				className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-inset"
			/>

			<ProjectCardHeader
				project={project}
				variant={variant}
				canManage={canManage}
				canDelete={canDelete}
			/>

			<p
				className={
					isDashboard
						? "line-clamp-2 min-h-15.5 px-5 pb-4 pt-2 font-display text-sm leading-[19.25px] text-foreground"
						: "line-clamp-2 min-h-10 px-4 pb-2 pt-1 font-display text-xs leading-4 text-foreground"
				}
			>
				{project.description || "No project description provided."}
			</p>

			<div
				className={
					isDashboard
						? "mx-5 border-t border-border"
						: "mx-4 border-t border-border"
				}
			/>

			<ProjectCardProgress
				projectName={project.name}
				completedTaskCount={completedTaskCount}
				taskCount={taskCount}
				variant={variant}
			/>

			<div
				className={
					isDashboard
						? "mx-5 border-t border-border"
						: "mx-4 mt-auto border-t border-border"
				}
			/>

			<ProjectCardFooter
				memberCount={memberCount}
				dueDate={project.dueDate}
				status={project.status}
				variant={variant}
			/>
		</Card>
	);
}
