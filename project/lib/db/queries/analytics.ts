import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getProjectSummariesForUser } from "@/lib/db/queries/projects";
import {
	activityLogs,
	lists,
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
	const [
		projectSummaries,
		priorityRows,
		taskMetrics,
		activityMetrics,
		completionRows,
		recentActivity,
	] = await Promise.all([
		getProjectSummariesForUser(userId),
		db
			.select({
				priority: tasks.priority,
				count: sql<number>`count(*)::int`.mapWith(Number),
			})
			.from(projectMembers)
			.innerJoin(projects, eq(projectMembers.projectId, projects.id))
			.innerJoin(lists, eq(lists.projectId, projects.id))
			.innerJoin(tasks, eq(tasks.listId, lists.id))
			.where(
				and(
					eq(projectMembers.userId, userId),
					isNull(projects.deletedAt),
					isNull(tasks.deletedAt),
				),
			)
			.groupBy(tasks.priority),
		db
			.select({
				overdue:
					sql<number>`count(*) filter (where ${tasks.dueDate} < now() and not ${lists.isCompleted})::int`.mapWith(
						Number,
					),
				assignedToMe: sql<number>`count(*) filter (
						where ${tasks.assigneeId} = ${userId}
						and not ${lists.isCompleted}
					)::int`.mapWith(Number),
			})
			.from(projectMembers)
			.innerJoin(projects, eq(projectMembers.projectId, projects.id))
			.innerJoin(lists, eq(lists.projectId, projects.id))
			.innerJoin(tasks, eq(tasks.listId, lists.id))
			.where(
				and(
					eq(projectMembers.userId, userId),
					isNull(projects.deletedAt),
					isNull(tasks.deletedAt),
				),
			),
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
			activeProjects: projectSummaries.filter(
				({ project }) => project.status === "active",
			).length,
			totalTasks,
			completedTasks,
			completionRate:
				totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
			overdueTasks: taskMetrics[0]?.overdue ?? 0,
			assignedToMe: taskMetrics[0]?.assignedToMe ?? 0,
		},
		priorities: {
			low: priorityRows.find(({ priority }) => priority === "low")?.count ?? 0,
			medium:
				priorityRows.find(({ priority }) => priority === "medium")?.count ?? 0,
			high:
				priorityRows.find(({ priority }) => priority === "high")?.count ?? 0,
		},
		projectStatuses: {
			active: projectSummaries.filter(
				({ project }) => project.status === "active",
			).length,
			completed: projectSummaries.filter(
				({ project }) => project.status === "completed",
			).length,
			onHold: projectSummaries.filter(
				({ project }) => project.status === "on_hold",
			).length,
		},
		recentActivity,
	};
}
