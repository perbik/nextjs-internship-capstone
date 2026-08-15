import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { lists, projectMembers, projects, tasks } from "@/lib/db/schema";

interface TaskMutationData {
	listId: string;
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high";
	dueDate?: Date | null;
	assigneeId?: string | null;
}

async function getAccessibleList(listId: string, userId: string) {
	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list || !(await canAccessProject(list.projectId, userId))) {
		throw new Error("You do not have access to this task list");
	}

	return list;
}

async function requireProjectAssignee(
	projectId: string,
	assigneeId?: string | null,
) {
	if (!assigneeId) {
		return;
	}

	const [membership] = await db
		.select({ userId: projectMembers.userId })
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, assigneeId),
			),
		)
		.limit(1);

	if (!membership) {
		throw new Error("The assignee must be a member of this project");
	}
}

async function touchProject(projectId: string) {
	await db
		.update(projects)
		.set({ updatedAt: new Date() })
		.where(eq(projects.id, projectId));
}

export async function createTask(userId: string, data: TaskMutationData) {
	const list = await getAccessibleList(data.listId, userId);
	await requireProjectAssignee(list.projectId, data.assigneeId);

	const [positionResult] = await db
		.select({
			nextPosition: sql<number>`coalesce(max(${tasks.position}), -1) + 1`,
		})
		.from(tasks)
		.where(and(eq(tasks.listId, data.listId), isNull(tasks.deletedAt)));

	const [task] = await db
		.insert(tasks)
		.values({
			...data,
			description: data.description ?? null,
			dueDate: data.dueDate ?? null,
			assigneeId: data.assigneeId ?? null,
			position: Number(positionResult?.nextPosition ?? 0),
		})
		.returning();

	await touchProject(list.projectId);
	return task;
}

export async function updateTask(
	taskId: string,
	userId: string,
	data: TaskMutationData,
) {
	const [currentTask] = await db
		.select({ task: tasks, projectId: lists.projectId })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.limit(1);

	if (
		!currentTask ||
		!(await canAccessProject(currentTask.projectId, userId))
	) {
		throw new Error("You do not have permission to edit this task");
	}

	const targetList = await getAccessibleList(data.listId, userId);

	if (targetList.projectId !== currentTask.projectId) {
		throw new Error("A task cannot be moved to a different project");
	}

	await requireProjectAssignee(currentTask.projectId, data.assigneeId);
	let targetPosition = currentTask.task.position;

	if (data.listId !== currentTask.task.listId) {
		const [positionResult] = await db
			.select({
				nextPosition: sql<number>`coalesce(max(${tasks.position}), -1) + 1`,
			})
			.from(tasks)
			.where(and(eq(tasks.listId, data.listId), isNull(tasks.deletedAt)));
		targetPosition = Number(positionResult?.nextPosition ?? 0);
	}

	const [task] = await db
		.update(tasks)
		.set({
			listId: data.listId,
			title: data.title,
			description: data.description ?? null,
			priority: data.priority,
			dueDate: data.dueDate ?? null,
			assigneeId: data.assigneeId ?? null,
			position: targetPosition,
			updatedAt: new Date(),
		})
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.returning();

	if (data.listId !== currentTask.task.listId) {
		await db
			.update(tasks)
			.set({
				position: sql`${tasks.position} - 1`,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(tasks.listId, currentTask.task.listId),
					gt(tasks.position, currentTask.task.position),
					isNull(tasks.deletedAt),
				),
			);
	}

	await touchProject(currentTask.projectId);
	return task;
}
