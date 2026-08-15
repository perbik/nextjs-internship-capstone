import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getProjectSummariesForUser } from "@/lib/db/queries/projects";
import {
	activityLogs,
	projectMembers,
	projects,
	tasks,
	users,
} from "@/lib/db/schema";

export async function getAnalyticsData(userId: string) {
	const completionEvent = sql<boolean>`
		coalesce(
			(${activityLogs.metadata} ->> 'toListCompleted')::boolean,
			(${activityLogs.metadata} ->> 'listCompleted')::boolean,
			false
		)
	`;
	const [projectSummaries, activityMetrics, completionRows, recentActivity] =
		await Promise.all([
			getProjectSummariesForUser(userId),
			db
				.select({
					activeUsersThisWeek:
						sql<number>`count(distinct ${activityLogs.actorId}) filter (
							where ${activityLogs.createdAt} >= now() - interval '7 days'
							and ${activityLogs.actorId} is not null
						)::int`.mapWith(Number),
				})
				.from(activityLogs)
				.innerJoin(
					projectMembers,
					and(
						eq(projectMembers.projectId, activityLogs.projectId),
						eq(projectMembers.userId, userId),
					),
				)
				.innerJoin(projects, eq(activityLogs.projectId, projects.id))
				.where(isNull(projects.deletedAt)),
			db
				.select({
					taskId: activityLogs.taskId,
					taskCreatedAt: tasks.createdAt,
					completedAt: sql<Date>`min(${activityLogs.createdAt})`.mapWith(
						activityLogs.createdAt,
					),
				})
				.from(activityLogs)
				.innerJoin(tasks, eq(activityLogs.taskId, tasks.id))
				.innerJoin(
					projectMembers,
					and(
						eq(projectMembers.projectId, activityLogs.projectId),
						eq(projectMembers.userId, userId),
					),
				)
				.innerJoin(projects, eq(activityLogs.projectId, projects.id))
				.where(
					and(
						isNull(projects.deletedAt),
						isNull(tasks.deletedAt),
						completionEvent,
					),
				)
				.groupBy(activityLogs.taskId, tasks.createdAt),
			db
				.select({
					activity: activityLogs,
					projectName: projects.name,
					actor: users,
				})
				.from(activityLogs)
				.innerJoin(
					projectMembers,
					and(
						eq(projectMembers.projectId, activityLogs.projectId),
						eq(projectMembers.userId, userId),
					),
				)
				.innerJoin(projects, eq(activityLogs.projectId, projects.id))
				.leftJoin(users, eq(activityLogs.actorId, users.id))
				.where(isNull(projects.deletedAt))
				.orderBy(desc(activityLogs.createdAt))
				.limit(10),
		]);

	const totalTasks = projectSummaries.reduce(
		(total, summary) => total + summary.taskCount,
		0,
	);
	const completedTasks = projectSummaries.reduce(
		(total, summary) => total + summary.completedTaskCount,
		0,
	);
	const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const projectVelocity = completionRows.filter(
		({ completedAt }) => completedAt.getTime() >= oneWeekAgo,
	).length;
	const completionDurations = completionRows.map(
		({ taskCreatedAt, completedAt }) =>
			Math.max(completedAt.getTime() - taskCreatedAt.getTime(), 0) /
			(24 * 60 * 60 * 1000),
	);
	const averageTaskTime =
		completionDurations.length === 0
			? 0
			: completionDurations.reduce((total, duration) => total + duration, 0) /
				completionDurations.length;

	return {
		metrics: {
			projectVelocity,
			activeUsersThisWeek: activityMetrics[0]?.activeUsersThisWeek ?? 0,
			averageTaskTime: Math.round(averageTaskTime * 10) / 10,
			totalTasks,
			completedTasks,
			completionRate:
				totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
		},
		recentActivity,
	};
}
