import type { ReactNode } from "react";

interface DashboardQuickActionsProps {
	createProjectAction: ReactNode;
	createTaskAction: ReactNode;
	addTeamMemberAction: ReactNode;
}

export function DashboardQuickActions({
	createProjectAction,
	createTaskAction,
	addTeamMemberAction,
}: DashboardQuickActionsProps) {
	return (
		<section className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
			<h2 className="font-display text-lg font-extrabold leading-7">
				Quick Actions
			</h2>
			<div className="mt-4 grid gap-2.5">
				{createProjectAction}
				{createTaskAction}
				{addTeamMemberAction}
			</div>
		</section>
	);
}
