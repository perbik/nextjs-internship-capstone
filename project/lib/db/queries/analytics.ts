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
	const [projectSummaries, priorityRows, taskMetrics, recentActivity] =
		await Promise.all([
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
					assignedToMe:
						sql<number>`count(*) filter (where ${tasks.assigneeId} = ${userId})::int`.mapWith(
							Number,
						),
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

	return {
		metrics: {
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
