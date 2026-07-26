import { Pool } from "@neondatabase/serverless";
import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import * as schema from "@/lib/db/schema";
import {
	labels,
	lists,
	projectMembers,
	projects,
	taskLabels,
	tasks,
} from "@/lib/db/schema";

interface TaskMutationData {
	listId: string;
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high";
	dueDate?: Date | null;
	assigneeId?: string | null;
	labelIds: string[];
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

async function requireProjectLabels(projectId: string, labelIds: string[]) {
	if (labelIds.length === 0) {
		return;
	}

	const uniqueLabelIds = new Set(labelIds);

	if (uniqueLabelIds.size !== labelIds.length) {
		throw new Error("A label cannot be assigned more than once");
	}

	const projectLabels = await db
		.select({ id: labels.id })
		.from(labels)
		.where(and(eq(labels.projectId, projectId), inArray(labels.id, labelIds)));

	if (projectLabels.length !== labelIds.length) {
		throw new Error("Every label must belong to this project");
	}
}

async function syncTaskLabels(taskId: string, labelIds: string[]) {
	await db.delete(taskLabels).where(eq(taskLabels.taskId, taskId));

	if (labelIds.length > 0) {
		await db
			.insert(taskLabels)
			.values(labelIds.map((labelId) => ({ taskId, labelId })));
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
	await requireProjectLabels(list.projectId, data.labelIds);

	const [positionResult] = await db
		.select({
			nextPosition: sql<number>`coalesce(max(${tasks.position}), -1) + 1`,
		})
		.from(tasks)
		.where(and(eq(tasks.listId, data.listId), isNull(tasks.deletedAt)));

	const [task] = await db
		.insert(tasks)
		.values({
			listId: data.listId,
			title: data.title,
			description: data.description ?? null,
			priority: data.priority,
			dueDate: data.dueDate ?? null,
			assigneeId: data.assigneeId ?? null,
			position: Number(positionResult?.nextPosition ?? 0),
		})
		.returning();

	await syncTaskLabels(task.id, data.labelIds);
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
	await requireProjectLabels(currentTask.projectId, data.labelIds);
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

	await syncTaskLabels(taskId, data.labelIds);
	await touchProject(currentTask.projectId);
	return task;
}

export async function saveBoardLayout(
	projectId: string,
	userId: string,
	layout: Array<{ id: string; taskIds: string[] }>,
) {
	if (!(await canAccessProject(projectId, userId))) {
		throw new Error("You do not have permission to update this board");
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
				sql`select pg_advisory_xact_lock(hashtextextended(${projectId}, 0))`,
			);

			const projectLists = await tx
				.select({ id: lists.id })
				.from(lists)
				.where(eq(lists.projectId, projectId));
			const validListIds = new Set(projectLists.map(({ id }) => id));
			const submittedListIds = layout.map(({ id }) => id);

			if (
				submittedListIds.length !== validListIds.size ||
				new Set(submittedListIds).size !== submittedListIds.length ||
				submittedListIds.some((id) => !validListIds.has(id))
			) {
				throw new Error(
					"The board columns have changed. Reload and try again.",
				);
			}

			const projectTasks = await tx
				.select({ id: tasks.id })
				.from(tasks)
				.innerJoin(lists, eq(tasks.listId, lists.id))
				.where(and(eq(lists.projectId, projectId), isNull(tasks.deletedAt)));
			const validTaskIds = new Set(projectTasks.map(({ id }) => id));
			const submittedTaskIds = layout.flatMap(({ taskIds }) => taskIds);

			if (
				submittedTaskIds.length !== validTaskIds.size ||
				new Set(submittedTaskIds).size !== submittedTaskIds.length ||
				submittedTaskIds.some((id) => !validTaskIds.has(id))
			) {
				throw new Error("The board tasks have changed. Reload and try again.");
			}

			for (const list of layout) {
				if (list.taskIds.length === 0) {
					continue;
				}

				const positionCases = sql.join(
					list.taskIds.map(
						(id, position) => sql`when ${tasks.id} = ${id} then ${position}`,
					),
					sql.raw(" "),
				);

				await tx
					.update(tasks)
					.set({
						listId: list.id,
						position: sql`case ${positionCases} else ${tasks.position} end`,
						updatedAt: new Date(),
					})
					.where(and(inArray(tasks.id, list.taskIds), isNull(tasks.deletedAt)));
			}

			await tx
				.update(projects)
				.set({ updatedAt: new Date() })
				.where(eq(projects.id, projectId));
		});
	} finally {
		await pool.end();
	}
}
