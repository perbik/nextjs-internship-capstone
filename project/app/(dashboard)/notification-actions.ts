"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	markAllNotificationsRead,
	markNotificationRead,
} from "@/lib/db/mutations";

const NOTIFICATION_ID_SCHEMA = z.uuid();

// Get the recipient from the session
export async function markNotificationReadAction(notificationId: string) {
	const parsed = NOTIFICATION_ID_SCHEMA.safeParse(notificationId);
	if (!parsed.success) return;

	const user = await requireCurrentUser();
	await markNotificationRead(parsed.data, user.id);
	revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsReadAction() {
	const user = await requireCurrentUser();
	await markAllNotificationsRead(user.id);
	revalidatePath("/dashboard", "layout");
}
