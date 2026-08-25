import { Badge } from "@/components/ui/badge";
import type { ProjectCardProject, ProjectCardVariant } from "./types";
import { getProjectDatePresentation } from "./utils/project-card-utils";

interface ProjectCardFooterProps {
	memberCount: number;
	dueDate: ProjectCardProject["dueDate"];
	status: ProjectCardProject["status"];
	variant: ProjectCardVariant;
}

export function ProjectCardFooter({
	memberCount,
	dueDate,
	status,
	variant,
}: ProjectCardFooterProps) {
	const isDashboard = variant === "dashboard";
	const datePresentation = getProjectDatePresentation(dueDate, status);

	return (
		<div
			className={
				isDashboard
					? "flex items-center justify-between px-5 py-3"
					: "flex min-w-0 items-center justify-between gap-2 px-4 py-2.5"
			}
		>
			<div
				className={`flex items-center ${isDashboard ? "gap-2" : "min-w-0 gap-1.5"}`}
			>
				<Badge
					variant="secondary"
					className={`border-0 bg-brand-soft font-display font-bold text-brand hover:bg-brand-soft ${isDashboard ? "px-2.5 py-0.5 text-[11px] leading-[16.5px]" : "truncate px-2 py-0.5 text-[10px]"}`}
				>
					{memberCount} {memberCount === 1 ? "member" : "members"}
				</Badge>
			</div>
			<Badge
				className={`shrink-0 rounded-xl border-0 font-display font-bold ${datePresentation.badgeClassName} ${isDashboard ? "px-3 py-1.5 text-xs" : "px-2 py-1.5 text-[10px]"}`}
			>
				{datePresentation.label}
			</Badge>
		</div>
	);
}
