import { Pool } from "@neondatabase/serverless";
import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/mutations/activities";
import { canAccessProject } from "@/lib/db/queries/project-members";
import * as schema from "@/lib/db/schema";
import {
	activityLogs,
	labels,
	lists,
	projectMembers,
	projects,
	taskLabels,
	tasks,
	users,
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

function sameDate(left: Date | null, right: Date | null) {
	return left?.getTime() === right?.getTime();
}

function userDisplayName(user: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
	);
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
	await recordTaskActivity({
		projectId: list.projectId,
		taskId: task.id,
		actorId: userId,
		action: "task_created",
		metadata: {
			title: task.title,
			listCompleted: list.isCompleted,
		},
	});
	return task;
}

export async function updateTask(
	taskId: string,
	userId: string,
	data: TaskMutationData,
) {
	const [currentTask] = await db
		.select({
			task: tasks,
			projectId: lists.projectId,
			listName: lists.name,
		})
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

	const currentTaskLabels = await db
		.select({ id: labels.id, name: labels.name })
		.from(taskLabels)
		.innerJoin(labels, eq(taskLabels.labelId, labels.id))
		.where(eq(taskLabels.taskId, taskId));
	const comparedLabelIds = [
		...new Set([...currentTaskLabels.map(({ id }) => id), ...data.labelIds]),
	];
	const comparedLabels =
		comparedLabelIds.length > 0
			? await db
					.select({ id: labels.id, name: labels.name })
					.from(labels)
					.where(inArray(labels.id, comparedLabelIds))
			: [];
	const labelNames = new Map(comparedLabels.map(({ id, name }) => [id, name]));
	const assigneeIds = [
		...new Set(
			[currentTask.task.assigneeId, data.assigneeId].filter(
				(id): id is string => Boolean(id),
			),
		),
	];
	const comparedAssignees =
		assigneeIds.length > 0
			? await db
					.select({
						id: users.id,
						firstName: users.firstName,
						lastName: users.lastName,
						email: users.email,
					})
					.from(users)
					.where(inArray(users.id, assigneeIds))
			: [];
	const assigneeNames = new Map(
		comparedAssignees.map((assignee) => [
			assignee.id,
			userDisplayName(assignee),
		]),
	);
	const currentLabelNames = currentTaskLabels
		.map(({ name }) => name)
		.sort()
		.join(", ");
	const nextLabelNames = data.labelIds
		.map((id) => labelNames.get(id))
		.filter((name): name is string => Boolean(name))
		.sort()
		.join(", ");
	const fieldChanges: Array<{
		field: string;
		from: string | null;
		to: string | null;
	}> = [];

	if (currentTask.task.title !== data.title) {
		fieldChanges.push({
			field: "title",
			from: currentTask.task.title,
			to: data.title,
		});
	}

	if (currentTask.task.description !== (data.description ?? null)) {
		fieldChanges.push({ field: "description", from: null, to: null });
	}

	if (currentTask.task.priority !== data.priority) {
		fieldChanges.push({
			field: "priority",
			from: currentTask.task.priority,
			to: data.priority,
		});
	}

	if (!sameDate(currentTask.task.dueDate, data.dueDate ?? null)) {
		fieldChanges.push({
			field: "dueDate",
			from: currentTask.task.dueDate?.toISOString() ?? null,
			to: data.dueDate?.toISOString() ?? null,
		});
	}

	if (currentTask.task.assigneeId !== (data.assigneeId ?? null)) {
		fieldChanges.push({
			field: "assignee",
			from: currentTask.task.assigneeId
				? (assigneeNames.get(currentTask.task.assigneeId) ?? "Unknown member")
				: null,
			to: data.assigneeId
				? (assigneeNames.get(data.assigneeId) ?? "Unknown member")
				: null,
		});
	}

	if (currentLabelNames !== nextLabelNames) {
		fieldChanges.push({
			field: "labels",
			from: currentLabelNames || null,
			to: nextLabelNames || null,
		});
	}

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

	for (const change of fieldChanges) {
		await recordTaskActivity({
			projectId: currentTask.projectId,
			taskId,
			actorId: userId,
			action: "task_field_changed",
			metadata: change,
		});
	}

	if (data.listId !== currentTask.task.listId) {
		await recordTaskActivity({
			projectId: currentTask.projectId,
			taskId,
			actorId: userId,
			action: "task_moved",
			metadata: {
				title: task.title,
				fromListName: currentTask.listName,
				toListName: targetList.name,
				toListCompleted: targetList.isCompleted,
			},
		});
	}
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
				.select({
					id: lists.id,
					name: lists.name,
					isCompleted: lists.isCompleted,
				})
				.from(lists)
				.where(eq(lists.projectId, projectId));
			const validListIds = new Set(projectLists.map(({ id }) => id));
			const listNames = new Map(projectLists.map(({ id, name }) => [id, name]));
			const completedLists = new Map(
				projectLists.map(({ id, isCompleted }) => [id, isCompleted]),
			);
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
				.select({
					id: tasks.id,
					listId: tasks.listId,
					position: tasks.position,
					title: tasks.title,
				})
				.from(tasks)
				.innerJoin(lists, eq(tasks.listId, lists.id))
				.where(and(eq(lists.projectId, projectId), isNull(tasks.deletedAt)));
			const validTaskIds = new Set(projectTasks.map(({ id }) => id));
			const currentTasks = new Map(projectTasks.map((task) => [task.id, task]));
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

			const activityValues = layout.flatMap((list) =>
				list.taskIds.flatMap((taskId, position) => {
					const current = currentTasks.get(taskId);

					if (
						!current ||
						(current.listId === list.id && current.position === position)
					) {
						return [];
					}

					return [
						{
							projectId,
							taskId,
							actorId: userId,
							action:
								current.listId === list.id ? "task_reordered" : "task_moved",
							metadata: {
								title: current.title,
								fromListName:
									current.listId === list.id
										? null
										: (listNames.get(current.listId) ?? "Unknown column"),
								toListName:
									current.listId === list.id
										? null
										: (listNames.get(list.id) ?? "Unknown column"),
								toListCompleted:
									current.listId === list.id
										? null
										: (completedLists.get(list.id) ?? false),
							},
						},
					];
				}),
			);

			if (activityValues.length > 0) {
				await tx.insert(activityLogs).values(activityValues);
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
