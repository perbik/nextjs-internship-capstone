import { ProjectProgressCard } from "@/components/analytics/project-progress-card";
import {
	TeamActivityCard,
	type TeamActivityItem,
} from "@/components/analytics/team-activity-card";
import { MetricCard } from "@/components/shared/metric-card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getAnalyticsData } from "@/lib/db/queries";

const activityLabels: Record<string, string> = {
	task_created: "created a task",
	task_field_changed: "updated a task",
	task_moved: "moved a task",
	task_reordered: "reordered a task",
	task_deleted: "deleted a task",
	task_label_added: "added a task label",
	task_label_removed: "removed a task label",
	comment_added: "added a comment",
	comment_updated: "edited a comment",
	comment_deleted: "deleted a comment",
};

function actorName(actor: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[actor.firstName, actor.lastName].filter(Boolean).join(" ") || actor.email
	);
}

export default async function AnalyticsPage() {
	const user = await requireCurrentUser();
	const { metrics, recentActivity } = await getAnalyticsData(user.id);
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
		({ activity, projectName, actor }) => ({
			id: activity.id,
			actorName: actor ? actorName(actor) : "Former member",
			action: activityLabels[activity.action] ?? activity.action,
			taskTitle:
				typeof activity.metadata.title === "string"
					? activity.metadata.title
					: undefined,
			projectId: activity.projectId,
			projectName,
			date: activity.createdAt.toLocaleDateString("en-US", {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
			}),
		}),
	);

	return (
		<div className="space-y-5">
			<header>
				<h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl ">
					Analytics
				</h1>
				<p className="mt-1 text-sm text-muted-foreground ">
					Live project and task insights from your accessible work
				</p>
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
				<TeamActivityCard activities={activities} />
			</div>
		</div>
	);
}
