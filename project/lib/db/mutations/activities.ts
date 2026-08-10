import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";

export type ActivityAction =
	| "task_created"
	| "task_updated"
	| "task_field_changed"
	| "task_moved"
	| "task_reordered"
	| "task_deleted"
	| "task_label_added"
	| "task_label_removed"
	| "comment_added"
	| "comment_updated"
	| "comment_deleted";

export async function recordTaskActivity({
	projectId,
	taskId,
	actorId,
	action,
	metadata = {},
}: {
	projectId: string;
	taskId: string;
	actorId: string;
	action: ActivityAction;
	metadata?: Record<string, string | number | boolean | null>;
}) {
	await db.insert(activityLogs).values({
		projectId,
		taskId,
		actorId,
		action,
		metadata,
	});
}
