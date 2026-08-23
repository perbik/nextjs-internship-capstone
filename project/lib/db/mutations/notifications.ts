import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, type notificationType } from "@/lib/db/schema";
import type { DatabaseTransaction } from "@/lib/db/transaction";

type NotificationType = (typeof notificationType.enumValues)[number];

export interface NotificationInput {
	recipientId: string | null | undefined;
	actorId: string;
	type: NotificationType;
	message: string;
	teamId?: string | null;
	projectId?: string | null;
	taskId?: string | null;
}

export async function markNotificationRead(
	notificationId: string,
	recipientId: string,
	database: typeof db | DatabaseTransaction = db,
) {
	await database
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.id, notificationId),
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		);
}

export async function markAllNotificationsRead(
	recipientId: string,
	database: typeof db | DatabaseTransaction = db,
) {
	await database
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		);
}

export async function createNotification(
	input: NotificationInput,
	database: typeof db | DatabaseTransaction = db,
) {
	if (!input.recipientId || input.recipientId === input.actorId) return;

	await database.insert(notifications).values({
		recipientId: input.recipientId,
		actorId: input.actorId,
		type: input.type,
		message: input.message,
		teamId: input.teamId ?? null,
		projectId: input.projectId ?? null,
		taskId: input.taskId ?? null,
	});
}
