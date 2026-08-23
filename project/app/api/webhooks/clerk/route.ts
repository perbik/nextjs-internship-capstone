import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { syncClerkWebhookUser } from "@/lib/auth/sync-clerk-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
	let event: WebhookEvent;

	try {
		// Verify the request before trusting its event data
		event = await verifyWebhook(request);
	} catch {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	try {
		switch (event.type) {
			case "user.created":
			case "user.updated":
				await syncClerkWebhookUser(event.data);
				break;
			case "user.deleted":
				if (event.data.id) {
					// Preserve related projects, tasks, comments, and activity history
					await db
						.update(users)
						.set({
							deletedAt: new Date(),
							updatedAt: new Date(),
						})
						.where(eq(users.clerkId, event.data.id));
				}
				break;
		}

		return new Response("Webhook processed", { status: 200 });
	} catch (error) {
		console.error("Failed to synchronize Clerk user", error);
		return new Response("Webhook processing failed", { status: 500 });
	}
}
