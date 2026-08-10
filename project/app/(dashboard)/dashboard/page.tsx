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
			trend: "+2.5%",
			direction: "up" as const,
		},
		{
			label: "Team Members",
			value: stats.teamMembers,
			trend: "+4.1%",
			direction: "up" as const,
		},
		{
			label: "Completed Tasks",
			value: stats.completedTasks,
			trend: "+12.3%",
			direction: "up" as const,
		},
		{
			label: "Pending Tasks",
			value: stats.pendingTasks,
			trend: "-2.1%",
			direction: "down" as const,
		},
	];
	const taskOptions = taskCreationProjects.map((project) => {
		const currentMembership = project.members.find(
			(member) => member.userId === user.id,
		);

		return {
			id: project.id,
			name: project.name,
			lists: project.lists.map((list) => ({ id: list.id, name: list.name })),
			members: project.members
				.filter(({ user: member }) => !member.deletedAt)
				.map(({ user: member }) => ({
					id: member.id,
					name:
						[member.firstName, member.lastName].filter(Boolean).join(" ") ||
						member.email,
					isCurrentUser: member.id === user.id,
				})),
			labels: project.labels.map((label) => ({
				id: label.id,
				name: label.name,
				color: label.color,
			})),
			canManageLabels:
				project.ownerId === user.id ||
				currentMembership?.role === "owner" ||
				currentMembership?.role === "admin",
		};
	});

	return (
		<div className="space-y-6">
			<header>
				<p className="text-sm text-muted-foreground dark:text-muted-foreground">
					Good Morning,
				</p>
				<h1 className="mt-0.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
					{name}!
				</h1>
				<p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
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
						<CreateProjectModal teams={manageableTeams} dashboardLabel />
					}
					createTaskAction={<DashboardCreateTaskModal projects={taskOptions} />}
					addTeamMemberAction={<AddTeamMemberDialog teams={manageableTeams} />}
				/>
				<RecentProjectsPanel projects={recentProjects} />
			</div>
		</div>
	);
}
