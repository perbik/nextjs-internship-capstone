import { and, asc, eq, gte, inArray, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	labels,
	lists,
	projectMembers,
	projects,
	tasks,
} from "@/lib/db/schema";

export async function getCalendarDeadlines(
	userId: string,
	start: Date,
	end: Date,
) {
	const [projectDeadlines, taskDeadlines] = await Promise.all([
		db
			.select({
				id: projects.id,
				title: projects.name,
				dueDate: projects.dueDate,
				projectId: projects.id,
				projectName: projects.name,
				status: projects.status,
			})
			.from(projectMembers)
			.innerJoin(projects, eq(projectMembers.projectId, projects.id))
			.where(
				and(
					eq(projectMembers.userId, userId),
					isNull(projects.deletedAt),
					gte(projects.dueDate, start),
					lt(projects.dueDate, end),
				),
			)
			.orderBy(asc(projects.dueDate)),
		db
			.select({
				id: tasks.id,
				title: tasks.title,
				dueDate: tasks.dueDate,
				projectId: projects.id,
				projectName: projects.name,
				priority: tasks.priority,
				isCompleted: lists.isCompleted,
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
					gte(tasks.dueDate, start),
					lt(tasks.dueDate, end),
				),
			)
			.orderBy(asc(tasks.dueDate)),
	]);

	return {
		projectDeadlines: projectDeadlines.filter(
			(deadline): deadline is typeof deadline & { dueDate: Date } =>
				Boolean(deadline.dueDate),
		),
		taskDeadlines: taskDeadlines.filter(
			(deadline): deadline is typeof deadline & { dueDate: Date } =>
				Boolean(deadline.dueDate),
		),
	};
}

export async function getTaskCreationOptions(userId: string) {
	const memberships = await db
		.select({ projectId: projectMembers.projectId })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(and(eq(projectMembers.userId, userId), isNull(projects.deletedAt)));

	if (memberships.length === 0) return [];

	return db.query.projects.findMany({
		where: and(
			inArray(
				projects.id,
				memberships.map(({ projectId }) => projectId),
			),
			isNull(projects.deletedAt),
		),
		orderBy: asc(projects.name),
		with: {
			lists: { orderBy: asc(lists.position) },
			members: { with: { user: true } },
			labels: { orderBy: asc(labels.name) },
		},
	});
}
