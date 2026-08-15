import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { canManageProject } from "@/lib/db/queries/project-members";
import { lists, projects, tasks } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db/transaction";

interface CreateListData {
	name: string;
	isCompleted: boolean;
}

interface UpdateListData {
	name: string;
	isCompleted: boolean;
}

// Load a list and require project management permission
async function requireManageableList(listId: string, userId: string) {
	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list || !(await canManageProject(list.projectId, userId))) {
		throw new Error("You do not have permission to manage this list");
	}

	return list;
}

// Mark the project as recently updated
async function touchProject(projectId: string) {
	await db
		.update(projects)
		.set({ updatedAt: new Date() })
		.where(eq(projects.id, projectId));
}

// Keep at least one column that counts tasks as completed
async function requireCompletedList(
	projectId: string,
	excludedListId?: string,
) {
	const conditions = [
		eq(lists.projectId, projectId),
		eq(lists.isCompleted, true),
	];

	if (excludedListId) {
		conditions.push(sql`${lists.id} <> ${excludedListId}`);
	}

	const [{ completedListCount }] = await db
		.select({
			completedListCount: sql<number>`count(*)::int`.mapWith(Number),
		})
		.from(lists)
		.where(and(...conditions));

	if (completedListCount < 1) {
		throw new Error("A project must keep at least one completed column");
	}
}

// Add a list at the end of a project board
export async function createList(
	projectId: string,
	userId: string,
	data: CreateListData,
) {
	if (!(await canManageProject(projectId, userId))) {
		throw new Error("You do not have permission to add lists to this project");
	}
	if (!data.isCompleted) {
		await requireCompletedList(projectId);
	}

	const [positionResult] = await db
		.select({
			nextPosition: sql<number>`coalesce(max(${lists.position}), -1) + 1`,
		})
		.from(lists)
		.where(eq(lists.projectId, projectId));

	const [list] = await db
		.insert(lists)
		.values({
			projectId,
			name: data.name,
			isCompleted: data.isCompleted,
			position: Number(positionResult?.nextPosition ?? 0),
		})
		.returning();

	await touchProject(projectId);
	return list;
}

// Rename a list or change whether it completes tasks
export async function updateList(
	listId: string,
	userId: string,
	data: UpdateListData,
) {
	const currentList = await requireManageableList(listId, userId);
	if (!data.isCompleted) {
		await requireCompletedList(currentList.projectId, currentList.id);
	}
	const [list] = await db
		.update(lists)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(lists.id, listId))
		.returning();

	await touchProject(currentList.projectId);
	return { list, projectId: currentList.projectId };
}

// Delete a list while keeping at least one project column
export async function deleteList(listId: string, userId: string) {
	const list = await requireManageableList(listId, userId);

	await withTransaction(async (tx) => {
		const [{ listCount }] = await tx
			.select({ listCount: sql<number>`count(*)::int`.mapWith(Number) })
			.from(lists)
			.where(eq(lists.projectId, list.projectId));
		const [{ completedListCount }] = await tx
			.select({
				completedListCount: sql<number>`count(*)::int`.mapWith(Number),
			})
			.from(lists)
			.where(
				and(
					eq(lists.projectId, list.projectId),
					eq(lists.isCompleted, true),
					sql`${lists.id} <> ${list.id}`,
				),
			);
		const [{ taskCount }] = await tx
			.select({ taskCount: sql<number>`count(*)::int`.mapWith(Number) })
			.from(tasks)
			.where(and(eq(tasks.listId, listId), isNull(tasks.deletedAt)));

		if (listCount <= 1) {
			throw new Error("A project must keep at least one list");
		}

		if (completedListCount < 1) {
			throw new Error("A project must keep at least one completed column");
		}

		if (taskCount > 0) {
			throw new Error(
				"Move or delete the tasks in this column before deleting it",
			);
		}

		const updatedAt = new Date();
		await tx.delete(lists).where(eq(lists.id, listId));
		await tx
			.update(lists)
			.set({
				position: sql`${lists.position} - 1`,
				updatedAt,
			})
			.where(
				and(
					eq(lists.projectId, list.projectId),
					gt(lists.position, list.position),
				),
			);
		await tx
			.update(projects)
			.set({ updatedAt })
			.where(eq(projects.id, list.projectId));
	});

	return { projectId: list.projectId };
}

// Swap a list with the column beside it
export async function moveList(
	listId: string,
	userId: string,
	direction: "left" | "right",
) {
	const list = await requireManageableList(listId, userId);
	const projectLists = await db
		.select()
		.from(lists)
		.where(eq(lists.projectId, list.projectId))
		.orderBy(asc(lists.position));
	const currentIndex = projectLists.findIndex((item) => item.id === listId);
	const targetIndex =
		direction === "left" ? currentIndex - 1 : currentIndex + 1;
	const target = projectLists[targetIndex];

	if (currentIndex < 0 || !target) {
		return { projectId: list.projectId };
	}

	await db.batch([
		db
			.update(lists)
			.set({ position: target.position, updatedAt: new Date() })
			.where(eq(lists.id, list.id)),
		db
			.update(lists)
			.set({ position: list.position, updatedAt: new Date() })
			.where(eq(lists.id, target.id)),
		db
			.update(projects)
			.set({ updatedAt: new Date() })
			.where(eq(projects.id, list.projectId)),
	]);

	return { projectId: list.projectId };
}

// Save a dragged column at its final position in one transaction
export async function moveListToPosition(
	listId: string,
	userId: string,
	targetPosition: number,
) {
	const list = await requireManageableList(listId, userId);

	await withTransaction(async (tx) => {
		const projectLists = await tx
			.select()
			.from(lists)
			.where(eq(lists.projectId, list.projectId))
			.orderBy(asc(lists.position));
		const currentIndex = projectLists.findIndex((item) => item.id === listId);

		if (currentIndex < 0) {
			throw new Error("The column no longer exists");
		}

		const finalPosition = Math.min(targetPosition, projectLists.length - 1);
		if (currentIndex === finalPosition) return;

		const reorderedLists = [...projectLists];
		const [movedList] = reorderedLists.splice(currentIndex, 1);
		reorderedLists.splice(finalPosition, 0, movedList);
		const updatedAt = new Date();

		for (const [position, projectList] of reorderedLists.entries()) {
			if (projectList.position === position) continue;

			await tx
				.update(lists)
				.set({ position, updatedAt })
				.where(eq(lists.id, projectList.id));
		}

		await tx
			.update(projects)
			.set({ updatedAt })
			.where(eq(projects.id, list.projectId));
	});

	return { projectId: list.projectId };
}
