import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/mutations/activities";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { comments, lists, tasks } from "@/lib/db/schema";

async function requireAccessibleTask(taskId: string, userId: string) {
	const [task] = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			projectId: lists.projectId,
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
		.limit(1);

	if (!task || !(await canAccessProject(task.projectId, userId))) {
		throw new Error("You do not have access to this task");
	}

	return task;
}

export async function createComment(
	taskId: string,
	authorId: string,
	content: string,
) {
	const task = await requireAccessibleTask(taskId, authorId);
	const [comment] = await db
		.insert(comments)
		.values({ taskId, authorId, content })
		.returning();

	await recordTaskActivity({
		projectId: task.projectId,
		taskId,
		actorId: authorId,
		action: "comment_added",
	});

	return comment;
}

export async function updateComment(
	commentId: string,
	authorId: string,
	content: string,
) {
	const [existing] = await db
		.select({
			id: comments.id,
			taskId: comments.taskId,
			projectId: lists.projectId,
		})
		.from(comments)
		.innerJoin(tasks, eq(comments.taskId, tasks.id))
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(
			and(
				eq(comments.id, commentId),
				eq(comments.authorId, authorId),
				isNull(tasks.deletedAt),
			),
		)
		.limit(1);

	if (!existing || !(await canAccessProject(existing.projectId, authorId))) {
		throw new Error("You can only edit your own comments");
	}

	const [comment] = await db
		.update(comments)
		.set({ content, updatedAt: new Date() })
		.where(eq(comments.id, commentId))
		.returning();

	await recordTaskActivity({
		projectId: existing.projectId,
		taskId: existing.taskId,
		actorId: authorId,
		action: "comment_updated",
	});

	return comment;
}

export async function deleteComment(commentId: string, authorId: string) {
	const [existing] = await db
		.select({
			id: comments.id,
			taskId: comments.taskId,
			projectId: lists.projectId,
		})
		.from(comments)
		.innerJoin(tasks, eq(comments.taskId, tasks.id))
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(
			and(
				eq(comments.id, commentId),
				eq(comments.authorId, authorId),
				isNull(tasks.deletedAt),
			),
		)
		.limit(1);

	if (!existing || !(await canAccessProject(existing.projectId, authorId))) {
		throw new Error("You can only delete your own comments");
	}

	await db.delete(comments).where(eq(comments.id, commentId));
	await recordTaskActivity({
		projectId: existing.projectId,
		taskId: existing.taskId,
		actorId: authorId,
		action: "comment_deleted",
	});
}
