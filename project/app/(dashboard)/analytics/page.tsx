import { AnalyticsScopeFilter } from "@/components/analytics/analytics-scope-filter";
import { ProjectProgressCard } from "@/components/analytics/project-progress-card";
import {
	TeamActivityCard,
	type TeamActivityItem,
} from "@/components/analytics/team-activity-card";
import { MetricCard } from "@/components/shared/metric-card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import type { ActivityAction } from "@/lib/db/mutations/activities";
import { getAnalyticsData, getAnalyticsScopeOptions } from "@/lib/db/queries";

const ACTIVITY_LABELS = {
	task_created: "created a task",
	task_updated: "updated a task",
	task_field_changed: "updated a task",
	task_moved: "moved a task",
	task_reordered: "reordered a task",
	task_deleted: "deleted a task",
	task_label_added: "added a task label",
	task_label_removed: "removed a task label",
	comment_added: "added a comment",
	comment_updated: "edited a comment",
	comment_deleted: "deleted a comment",
} satisfies Partial<Record<ActivityAction, string>>;

function actorName(actor: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[actor.firstName, actor.lastName].filter(Boolean).join(" ") || actor.email
	);
}

export default async function AnalyticsPage({
	searchParams,
}: {
	searchParams: Promise<{
		team?: string | string[];
		activityPage?: string | string[];
	}>;
}) {
	const user = await requireCurrentUser();
	const params = await searchParams;
	const requestedScope = Array.isArray(params.team)
		? params.team[0]
		: params.team;
	const requestedActivityPage = Array.isArray(params.activityPage)
		? params.activityPage[0]
		: params.activityPage;
	const activityPage = Math.max(
		1,
		Number.parseInt(requestedActivityPage ?? "1", 10) || 1,
	);
	const scopeOptions = await getAnalyticsScopeOptions(user.id);
	const selectedTeam = scopeOptions.teams.find(
		(team) => team.id === requestedScope,
	);
	const selectedScope = selectedTeam
		? selectedTeam.id
		: requestedScope === "standalone" && scopeOptions.hasStandaloneProjects
			? "standalone"
			: "all";
	const scope =
		selectedScope === "standalone"
			? { standalone: true }
			: selectedTeam
				? { teamId: selectedTeam.id }
				: {};
	const scopeLabel =
		selectedScope === "standalone"
			? "standalone projects"
			: selectedTeam
				? selectedTeam.name
				: "all your accessible work";
	const { metrics, recentActivity, activityPagination } =
		await getAnalyticsData(user.id, scope, activityPage);
	const metricCards = [
		{
			label: "Team Efficiency",
			value: `${metrics.completionRate}%`,
			detail: "Completion Rate",
		},
		{
			label: "Project Velocity",
			value: metrics.projectVelocity,
			detail: "Tasks per week",
		},
		{
			label: "Active Users",
			value: metrics.activeUsersThisWeek,
			detail: "This week",
		},
		{
			label: "Average Task Time",
			value: metrics.averageTaskTime,
			detail: "Days",
		},
	];
	const activities: TeamActivityItem[] = recentActivity.map(
		({ activity, projectName, teamName, actor }) => ({
			id: activity.id,
			actorName: actor ? actorName(actor) : "Former member",
			action:
				ACTIVITY_LABELS[activity.action as ActivityAction] ?? activity.action,
			taskTitle:
				typeof activity.metadata.title === "string"
					? activity.metadata.title
					: undefined,
			projectId: activity.projectId,
			projectName,
			teamName: teamName ?? "Standalone project",
			date: activity.createdAt.toLocaleDateString("en-US", {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
			}),
		}),
	);

	return (
		<div className="space-y-5">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl ">
						Analytics
					</h1>
					<p className="mt-1 text-sm text-muted-foreground ">
						Live project and task insights for {scopeLabel}
					</p>
				</div>
				<AnalyticsScopeFilter
					value={selectedScope}
					teams={scopeOptions.teams}
					hasStandaloneProjects={scopeOptions.hasStandaloneProjects}
				/>
			</header>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
				{metricCards.map((metric) => (
					<MetricCard key={metric.label} {...metric} />
				))}
			</div>

			<div className="grid gap-5 lg:grid-cols-2">
				<ProjectProgressCard
					completionRate={metrics.completionRate}
					completedTasks={metrics.completedTasks}
					totalTasks={metrics.totalTasks}
				/>
				<TeamActivityCard
					activities={activities}
					page={activityPagination.page}
					totalPages={activityPagination.totalPages}
					selectedScope={selectedScope}
					showTeam={selectedScope === "all"}
				/>
			</div>
		</div>
	);
}
