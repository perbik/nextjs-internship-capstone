import { and, asc, eq, gte, inArray, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	labels,
	lists,
	projectMembers,
	projects,
	tasks,
} from "@/lib/db/schema";

// Get project and task deadlines within a date range
export async function getCalendarDeadlines(
	userId: string,
	start: Date,
	end: Date,
) {
	// Project and task deadlines
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

	// Remove deadlines without a date
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

// Get accessible projects and fields needed by the task form
export async function getTaskCreationOptions(userId: string) {
	const memberships = await db
		.select({ projectId: projectMembers.projectId })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(and(eq(projectMembers.userId, userId), isNull(projects.deletedAt)));

	// Avoid an empty project ID query
	if (memberships.length === 0) return [];

	const taskProjects = await db.query.projects.findMany({
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

	return taskProjects.map((project) => {
		const currentMembership = project.members.find(
			(member) => member.userId === userId,
		);

		return {
			id: project.id,
			name: project.name,
			lists: project.lists.map((list) => ({ id: list.id, name: list.name })),
			members: project.members
				.filter(({ user }) => !user.deletedAt)
				.map(({ user }) => ({
					id: user.id,
					name:
						[user.firstName, user.lastName].filter(Boolean).join(" ") ||
						user.email,
					isCurrentUser: user.id === userId,
				})),
			labels: project.labels.map((label) => ({
				id: label.id,
				name: label.name,
				color: label.color,
			})),
			canManageLabels:
				project.ownerId === userId ||
				currentMembership?.role === "owner" ||
				currentMembership?.role === "admin",
		};
	});
}
