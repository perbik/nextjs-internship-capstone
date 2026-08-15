import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { lists, tasks } from "@/lib/db/schema";

// Get the active tasks in a list when the user can access its project
export async function getTasksByList(listId: string, userId: string) {
	// Find the parent project used for the access check
	const [list] = await db
		.select({ projectId: lists.projectId })
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list || !(await canAccessProject(list.projectId, userId))) {
		return [];
	}

	return db
		.select()
		.from(tasks)
		.where(and(eq(tasks.listId, listId), isNull(tasks.deletedAt)))
		.orderBy(asc(tasks.position));
}

// Get active project tasks with their list information
export async function getTasksByProject(projectId: string, userId: string) {
	if (!(await canAccessProject(projectId, userId))) {
		return [];
	}

	return db
		.select({ task: tasks, list: lists })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(lists.projectId, projectId), isNull(tasks.deletedAt)))
		.orderBy(asc(lists.position), asc(tasks.position));
}

// Get one active task when the user can access its project
export async function getTaskById(taskId: string, userId: string) {
	const [result] = await db
		.select({ task: tasks, projectId: lists.projectId })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.limit(1);

	if (!result || !(await canAccessProject(result.projectId, userId))) {
		return null;
	}

	return result.task;
}
