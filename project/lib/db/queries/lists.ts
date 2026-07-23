import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { lists } from "@/lib/db/schema";

export async function getListsByProject(projectId: string, userId: string) {
	if (!(await canAccessProject(projectId, userId))) {
		return [];
	}

	return db
		.select()
		.from(lists)
		.where(eq(lists.projectId, projectId))
		.orderBy(asc(lists.position));
}

export async function getListById(listId: string, userId: string) {
	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list || !(await canAccessProject(list.projectId, userId))) {
		return null;
	}

	return list;
}
