import { Pool } from "@neondatabase/serverless";
import { and, asc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import * as schema from "@/lib/db/schema";
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

export async function moveTask(
	taskId: string,
	targetListId: string,
	targetPosition: number,
	userId: string,
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
		throw new Error("You do not have permission to move this task");
	}

	const targetList = await getAccessibleList(targetListId, userId);

	if (targetList.projectId !== currentTask.projectId) {
		throw new Error("A task cannot be moved to a different project");
	}

	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required");
	}

	const pool = new Pool({ connectionString: databaseUrl });
	const transactionDb = drizzle({ client: pool, schema });

	try {
		await transactionDb.transaction(async (tx) => {
			await tx.execute(
				sql`select pg_advisory_xact_lock(hashtextextended(${currentTask.projectId}, 0))`,
			);

			const [lockedTask] = await tx
				.select({ task: tasks, projectId: lists.projectId })
				.from(tasks)
				.innerJoin(lists, eq(tasks.listId, lists.id))
				.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
				.limit(1);

			if (!lockedTask || lockedTask.projectId !== currentTask.projectId) {
				throw new Error("The task is no longer available");
			}

			const [lockedTargetList] = await tx
				.select({ projectId: lists.projectId })
				.from(lists)
				.where(eq(lists.id, targetListId))
				.limit(1);

			if (lockedTargetList?.projectId !== lockedTask.projectId) {
				throw new Error("The target list is no longer available");
			}

			const sourceTasks = await tx
				.select({ id: tasks.id })
				.from(tasks)
				.where(
					and(
						eq(tasks.listId, lockedTask.task.listId),
						isNull(tasks.deletedAt),
					),
				)
				.orderBy(asc(tasks.position));
			const sourceIds = sourceTasks
				.map(({ id }) => id)
				.filter((id) => id !== taskId);

			if (targetListId === lockedTask.task.listId) {
				const nextPosition = Math.min(targetPosition, sourceIds.length);
				sourceIds.splice(nextPosition, 0, taskId);
				await persistTaskOrder(sourceIds, targetListId);
			} else {
				const targetTasks = await tx
					.select({ id: tasks.id })
					.from(tasks)
					.where(and(eq(tasks.listId, targetListId), isNull(tasks.deletedAt)))
					.orderBy(asc(tasks.position));
				const targetIds = targetTasks
					.map(({ id }) => id)
					.filter((id) => id !== taskId);
				const nextPosition = Math.min(targetPosition, targetIds.length);

				targetIds.splice(nextPosition, 0, taskId);
				await persistTaskOrder(sourceIds, lockedTask.task.listId);
				await persistTaskOrder(targetIds, targetListId);
			}

			await tx
				.update(projects)
				.set({ updatedAt: new Date() })
				.where(eq(projects.id, lockedTask.projectId));

			async function persistTaskOrder(taskIds: string[], listId: string) {
				if (taskIds.length === 0) {
					return;
				}

				const positionCases = sql.join(
					taskIds.map(
						(id, position) => sql`when ${tasks.id} = ${id} then ${position}`,
					),
					sql.raw(" "),
				);

				await tx
					.update(tasks)
					.set({
						listId,
						position: sql`case ${positionCases} else ${tasks.position} end`,
						updatedAt: new Date(),
					})
					.where(and(inArray(tasks.id, taskIds), isNull(tasks.deletedAt)));
			}
		});
	} finally {
		await pool.end();
	}
}
