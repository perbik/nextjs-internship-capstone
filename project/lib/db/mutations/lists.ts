import { and, asc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { canManageProject } from "@/lib/db/queries/project-members";
import { lists, projects } from "@/lib/db/schema";

interface CreateListData {
	name: string;
	isCompleted: boolean;
}

interface UpdateListData {
	name: string;
	isCompleted: boolean;
}

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

async function touchProject(projectId: string) {
	await db
		.update(projects)
		.set({ updatedAt: new Date() })
		.where(eq(projects.id, projectId));
}

export async function createList(
	projectId: string,
	userId: string,
	data: CreateListData,
) {
	if (!(await canManageProject(projectId, userId))) {
		throw new Error("You do not have permission to add lists to this project");
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

export async function updateList(
	listId: string,
	userId: string,
	data: UpdateListData,
) {
	const currentList = await requireManageableList(listId, userId);
	const [list] = await db
		.update(lists)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(lists.id, listId))
		.returning();

	await touchProject(currentList.projectId);
	return list;
}

export async function deleteList(listId: string, userId: string) {
	const list = await requireManageableList(listId, userId);
	const [{ listCount }] = await db
		.select({ listCount: sql<number>`count(*)::int`.mapWith(Number) })
		.from(lists)
		.where(eq(lists.projectId, list.projectId));

	if (listCount <= 1) {
		throw new Error("A project must keep at least one list");
	}

	await db.delete(lists).where(eq(lists.id, listId));
	await db
		.update(lists)
		.set({
			position: sql`${lists.position} - 1`,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(lists.projectId, list.projectId),
				gt(lists.position, list.position),
			),
		);
	await touchProject(list.projectId);
}

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
		return;
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
}
