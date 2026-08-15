import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import type { DatabaseTransaction } from "@/lib/db/transaction";

// Actions shown in task and project history
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

// Save one task-related activity record
export async function recordTaskActivity({
	projectId,
	taskId,
	actorId,
	action,
	metadata = {},
	database = db,
}: {
	projectId: string;
	taskId: string;
	actorId: string;
	action: ActivityAction;
	metadata?: Record<string, string | number | boolean | null>;
	database?: typeof db | DatabaseTransaction;
}) {
	await database.insert(activityLogs).values({
		projectId,
		taskId,
		actorId,
		action,
		metadata,
	});
}
