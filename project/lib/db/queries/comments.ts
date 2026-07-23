import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { comments, lists, tasks, users } from "@/lib/db/schema";

export async function getCommentsByTask(taskId: string, userId: string) {
	const [task] = await db
		.select({ projectId: lists.projectId })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.limit(1);

	if (!task || !(await canAccessProject(task.projectId, userId))) {
		return [];
	}

	return db
		.select({ comment: comments, author: users })
		.from(comments)
		.innerJoin(users, eq(comments.authorId, users.id))
		.where(eq(comments.taskId, taskId))
		.orderBy(asc(comments.createdAt));
}
