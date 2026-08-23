import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";

const NOTIFICATION_LIMIT = 10;

export async function getNotificationSummary(recipientId: string) {
	// Load the visible inbox and total unread count at the same time
	const [items, unread] = await Promise.all([
		db
			.select({
				id: notifications.id,
				type: notifications.type,
				message: notifications.message,
				teamId: notifications.teamId,
				projectId: notifications.projectId,
				taskId: notifications.taskId,
				readAt: notifications.readAt,
				createdAt: notifications.createdAt,
				actorFirstName: users.firstName,
				actorLastName: users.lastName,
				actorEmail: users.email,
			})
			.from(notifications)
			.leftJoin(users, eq(notifications.actorId, users.id))
			.where(eq(notifications.recipientId, recipientId))
			.orderBy(desc(notifications.createdAt))
			.limit(NOTIFICATION_LIMIT),
		db
			.select({ total: count() })
			.from(notifications)
			.where(
				and(
					eq(notifications.recipientId, recipientId),
					isNull(notifications.readAt),
				),
			),
	]);

	return { items, unreadCount: unread[0]?.total ?? 0 };
}
