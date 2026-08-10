import { ProjectActions } from "@/components/project/project-actions";
import type { ProjectCardProject, ProjectCardVariant } from "./types";

interface ProjectCardHeaderProps {
	project: ProjectCardProject;
	variant: ProjectCardVariant;
	canManage: boolean;
	canDelete: boolean;
}

export function ProjectCardHeader({
	project,
	variant,
	canManage,
	canDelete,
}: ProjectCardHeaderProps) {
	const isDashboard = variant === "dashboard";

	return (
		<div
			className={
				isDashboard
					? "flex items-start justify-between px-5 pt-5"
					: "flex items-start justify-between gap-3 px-[18px] pt-[18px]"
			}
		>
			<h2
				className={
					isDashboard
						? "min-w-0 truncate font-display text-[22px] font-extrabold leading-[27.5px] text-foreground group-hover:text-brand"
						: "min-w-0 truncate font-display text-xl font-extrabold leading-7 text-foreground transition-colors group-hover:text-brand"
				}
			>
				{project.name}
			</h2>
			<div className={`relative z-20 ${isDashboard ? "" : "shrink-0 pt-0.5"}`}>
				<ProjectActions
					project={{
						id: project.id,
						name: project.name,
						description: project.description,
						status: project.status,
						dueDate: project.dueDate?.toISOString() ?? null,
					}}
					canManage={canManage}
					canDelete={canDelete}
					variant="compact"
				/>
			</div>
		</div>
	);
}
