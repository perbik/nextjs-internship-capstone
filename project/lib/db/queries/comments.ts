import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { activityLogs, comments, lists, tasks, users } from "@/lib/db/schema";

// Limit each discussion load to its latest records
const DISCUSSION_LIMIT = 50;

// Get the latest comments for an accessible task
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

	// Display the selected comments from oldest to newest
	return recentComments.reverse();
}

// Get task comments and activity for the discussion panel
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

	// Comments and activity can load at the same time
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
			// Keep activity records even when their actor no longer exists
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
