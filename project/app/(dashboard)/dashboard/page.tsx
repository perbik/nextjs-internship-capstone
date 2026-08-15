import { AddTeamMemberDialog } from "@/components/dashboard/add-team-members-dialog";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { RecentProjectsPanel } from "@/components/dashboard/recent-projects-panel";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { MetricCard } from "@/components/shared/metric-card";
import { DashboardCreateTaskModal } from "@/components/task/create-task-modal";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getDashboardData,
	getManageableTeamsForUser,
	getTaskCreationOptions,
} from "@/lib/db/queries";

export default async function DashboardPage() {
	const user = await requireCurrentUser();
	const [{ stats, recentProjects }, manageableTeams, taskCreationProjects] =
		await Promise.all([
			getDashboardData(user.id),
			getManageableTeamsForUser(user.id),
			getTaskCreationOptions(user.id),
		]);
	const name = user.firstName || user.email.split("@")[0];
	const metrics = [
		{
			label: "Active Projects",
			value: stats.activeProjects,
			detail: "Across accessible projects",
		},
		{
			label: "Team Members",
			value: stats.teamMembers,
			detail: "Across accessible projects",
		},
		{
			label: "Completed Tasks",
			value: stats.completedTasks,
			detail: "Current total",
		},
		{
			label: "Pending Tasks",
			value: stats.pendingTasks,
			detail: "Current total",
		},
	];
	return (
		<div className="space-y-6">
			<header>
				<p className="text-sm text-muted-foreground">Welcome,</p>
				<h1 className="mt-0.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
					{name}!
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Welcome back. Here is the latest overview of your work.
				</p>
			</header>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
				{metrics.map((metric) => (
					<MetricCard key={metric.label} {...metric} />
				))}
			</div>

			<div className="grid gap-5 lg:grid-cols-2">
				<DashboardQuickActions
					createProjectAction={
						<CreateProjectModal
							teams={manageableTeams}
							triggerVariant="dashboard"
						/>
					}
					createTaskAction={
						<DashboardCreateTaskModal projects={taskCreationProjects} />
					}
					addTeamMemberAction={<AddTeamMemberDialog teams={manageableTeams} />}
				/>
				<RecentProjectsPanel projects={recentProjects} />
			</div>
		</div>
	);
}
