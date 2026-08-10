import { UserRound } from "lucide-react";
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
					: "flex min-w-0 items-center justify-between gap-2 px-[18px] py-3"
			}
		>
			<div
				className={`flex items-center ${isDashboard ? "gap-2" : "min-w-0 gap-1.5"}`}
			>
				<span
					className={`flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-brand text-white ${isDashboard ? "size-8" : "size-7"}`}
				>
					<UserRound size={isDashboard ? 16 : 14} />
				</span>
				<span
					className={`rounded-full bg-[#ffb79d] font-display font-bold text-brand ${isDashboard ? "px-2.5 py-0.5 text-[11px] leading-[16.5px]" : "truncate px-2 py-0.5 text-[10px]"}`}
				>
					{memberCount} {memberCount === 1 ? "member" : "members"}
				</span>
			</div>
			<span
				className={`shrink-0 rounded-xl font-display font-bold ${datePresentation.className} ${isDashboard ? "px-3 py-1.5 text-xs" : "px-2 py-1.5 text-[10px]"}`}
			>
				{datePresentation.label}
			</span>
		</div>
	);
}
