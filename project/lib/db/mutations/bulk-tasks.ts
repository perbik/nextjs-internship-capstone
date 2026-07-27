import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, isNull, max, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
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
import type { BulkTaskOperation } from "@/lib/validations";

function displayName(user: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
	);
}

export async function bulkUpdateTasks(
	userId: string,
	input: BulkTaskOperation,
) {
	if (!(await canAccessProject(input.projectId, userId))) {
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
				sql`select pg_advisory_xact_lock(hashtextextended(${input.projectId}, 0))`,
			);

			const selectedTasks = await tx
				.select({
					id: tasks.id,
					title: tasks.title,
					listId: tasks.listId,
					position: tasks.position,
					priority: tasks.priority,
					assigneeId: tasks.assigneeId,
				})
				.from(tasks)
				.innerJoin(lists, eq(tasks.listId, lists.id))
				.where(
					and(
						eq(lists.projectId, input.projectId),
						inArray(tasks.id, input.taskIds),
						isNull(tasks.deletedAt),
					),
				);

			if (
				selectedTasks.length !== input.taskIds.length ||
				new Set(input.taskIds).size !== input.taskIds.length
			) {
				throw new Error(
					"Some selected tasks are no longer available. Reload and try again.",
				);
			}

			const taskOrder = new Map(input.taskIds.map((id, index) => [id, index]));
			selectedTasks.sort(
				(left, right) =>
					(taskOrder.get(left.id) ?? 0) - (taskOrder.get(right.id) ?? 0),
			);
			const now = new Date();

			if (input.operation === "move") {
				const [targetList] = await tx
					.select({
						id: lists.id,
						name: lists.name,
						isCompleted: lists.isCompleted,
					})
					.from(lists)
					.where(
						and(
							eq(lists.id, input.value),
							eq(lists.projectId, input.projectId),
						),
					)
					.limit(1);

				if (!targetList) {
					throw new Error("The selected column is not part of this project");
				}

				const sourceListIds = [
					...new Set(selectedTasks.map(({ listId }) => listId)),
				];
				const sourceLists = await tx
					.select({ id: lists.id, name: lists.name })
					.from(lists)
					.where(inArray(lists.id, sourceListIds));
				const listNames = new Map(
					sourceLists.map(({ id, name }) => [id, name]),
				);
				const [positionResult] = await tx
					.select({ position: max(tasks.position) })
					.from(tasks)
					.where(and(eq(tasks.listId, targetList.id), isNull(tasks.deletedAt)));
				const startPosition = Number(positionResult?.position ?? -1) + 1;

				for (const [index, task] of selectedTasks.entries()) {
					if (task.listId === targetList.id) {
						continue;
					}

					await tx
						.update(tasks)
						.set({
							listId: targetList.id,
							position: startPosition + index,
							updatedAt: now,
						})
						.where(eq(tasks.id, task.id));
					await tx.insert(activityLogs).values({
						projectId: input.projectId,
						taskId: task.id,
						actorId: userId,
						action: "task_moved",
						metadata: {
							title: task.title,
							fromListName: listNames.get(task.listId) ?? "Unknown column",
							toListName: targetList.name,
							toListCompleted: targetList.isCompleted,
						},
					});
				}
			}

			if (input.operation === "priority") {
				const changedTasks = selectedTasks.filter(
					(task) => task.priority !== input.value,
				);

				if (changedTasks.length > 0) {
					await tx
						.update(tasks)
						.set({ priority: input.value, updatedAt: now })
						.where(
							inArray(
								tasks.id,
								changedTasks.map(({ id }) => id),
							),
						);
					await tx.insert(activityLogs).values(
						changedTasks.map((task) => ({
							projectId: input.projectId,
							taskId: task.id,
							actorId: userId,
							action: "task_field_changed",
							metadata: {
								field: "priority",
								from: task.priority,
								to: input.value,
							},
						})),
					);
				}
			}

			if (input.operation === "assign") {
				const assigneeId = input.value === "unassigned" ? null : input.value;
				let nextAssigneeName: string | null = null;

				if (assigneeId) {
					const [assignee] = await tx
						.select({
							id: users.id,
							firstName: users.firstName,
							lastName: users.lastName,
							email: users.email,
						})
						.from(projectMembers)
						.innerJoin(users, eq(projectMembers.userId, users.id))
						.where(
							and(
								eq(projectMembers.projectId, input.projectId),
								eq(projectMembers.userId, assigneeId),
								isNull(users.deletedAt),
							),
						)
						.limit(1);

					if (!assignee) {
						throw new Error("The assignee must be a project member");
					}

					nextAssigneeName = displayName(assignee);
				}

				const currentAssigneeIds = [
					...new Set(
						selectedTasks
							.map(({ assigneeId: id }) => id)
							.filter((id): id is string => Boolean(id)),
					),
				];
				const currentAssignees =
					currentAssigneeIds.length > 0
						? await tx
								.select({
									id: users.id,
									firstName: users.firstName,
									lastName: users.lastName,
									email: users.email,
								})
								.from(users)
								.where(inArray(users.id, currentAssigneeIds))
						: [];
				const currentAssigneeNames = new Map(
					currentAssignees.map((assignee) => [
						assignee.id,
						displayName(assignee),
					]),
				);
				const changedTasks = selectedTasks.filter(
					(task) => task.assigneeId !== assigneeId,
				);

				if (changedTasks.length > 0) {
					await tx
						.update(tasks)
						.set({ assigneeId, updatedAt: now })
						.where(
							inArray(
								tasks.id,
								changedTasks.map(({ id }) => id),
							),
						);
					await tx.insert(activityLogs).values(
						changedTasks.map((task) => ({
							projectId: input.projectId,
							taskId: task.id,
							actorId: userId,
							action: "task_field_changed",
							metadata: {
								field: "assignee",
								from: task.assigneeId
									? (currentAssigneeNames.get(task.assigneeId) ??
										"Unknown member")
									: null,
								to: nextAssigneeName,
							},
						})),
					);
				}
			}

			if (
				input.operation === "add_label" ||
				input.operation === "remove_label"
			) {
				const [label] = await tx
					.select({ id: labels.id, name: labels.name })
					.from(labels)
					.where(
						and(
							eq(labels.id, input.value),
							eq(labels.projectId, input.projectId),
						),
					)
					.limit(1);

				if (!label) {
					throw new Error("The selected label is not part of this project");
				}

				const existingLinks = await tx
					.select({ taskId: taskLabels.taskId })
					.from(taskLabels)
					.where(
						and(
							inArray(
								taskLabels.taskId,
								selectedTasks.map(({ id }) => id),
							),
							eq(taskLabels.labelId, label.id),
						),
					);
				const linkedTaskIds = new Set(
					existingLinks.map(({ taskId }) => taskId),
				);
				const affectedTasks = selectedTasks.filter((task) =>
					input.operation === "add_label"
						? !linkedTaskIds.has(task.id)
						: linkedTaskIds.has(task.id),
				);

				if (input.operation === "add_label") {
					if (affectedTasks.length > 0) {
						await tx.insert(taskLabels).values(
							affectedTasks.map((task) => ({
								taskId: task.id,
								labelId: label.id,
							})),
						);
					}
				} else if (affectedTasks.length > 0) {
					await tx.delete(taskLabels).where(
						and(
							inArray(
								taskLabels.taskId,
								affectedTasks.map(({ id }) => id),
							),
							eq(taskLabels.labelId, label.id),
						),
					);
				}

				if (affectedTasks.length > 0) {
					await tx.insert(activityLogs).values(
						affectedTasks.map((task) => ({
							projectId: input.projectId,
							taskId: task.id,
							actorId: userId,
							action:
								input.operation === "add_label"
									? "task_label_added"
									: "task_label_removed",
							metadata: { labelName: label.name },
						})),
					);
				}
			}

			await tx
				.update(projects)
				.set({ updatedAt: now })
				.where(eq(projects.id, input.projectId));
		});
	} finally {
		await pool.end();
	}
}
