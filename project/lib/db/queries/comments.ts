import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { activityLogs, comments, lists, tasks, users } from "@/lib/db/schema";

const DISCUSSION_LIMIT = 50;

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

	const recentComments = await db
		.select({ comment: comments, author: users })
		.from(comments)
		.innerJoin(users, eq(comments.authorId, users.id))
		.where(eq(comments.taskId, taskId))
		.orderBy(desc(comments.createdAt))
		.limit(DISCUSSION_LIMIT);

	return recentComments.reverse();
}

export async function getTaskDiscussion(taskId: string, userId: string) {
	const [task] = await db
		.select({ projectId: lists.projectId })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.limit(1);

	if (!task || !(await canAccessProject(task.projectId, userId))) {
		return null;
	}

	const [recentComments, activities] = await Promise.all([
		db
			.select({ comment: comments, author: users })
			.from(comments)
			.innerJoin(users, eq(comments.authorId, users.id))
			.where(eq(comments.taskId, taskId))
			.orderBy(desc(comments.createdAt))
			.limit(DISCUSSION_LIMIT),
		db
			.select({ activity: activityLogs, actor: users })
			.from(activityLogs)
			.leftJoin(users, eq(activityLogs.actorId, users.id))
			.where(eq(activityLogs.taskId, taskId))
			.orderBy(desc(activityLogs.createdAt))
			.limit(DISCUSSION_LIMIT),
	]);

	return {
		comments: recentComments.reverse(),
		activities,
		limit: DISCUSSION_LIMIT,
	};
}
