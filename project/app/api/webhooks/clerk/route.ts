import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Keep only webhook payloads that contain a complete Clerk user
type ClerkUser = Extract<WebhookEvent["data"], { email_addresses: unknown }>;

function getPrimaryEmail(user: ClerkUser) {
	// The first email is not always the user's selected primary email
	const primaryEmail = user.email_addresses.find(
		(email) => email.id === user.primary_email_address_id,
	);

	if (!primaryEmail) {
		throw new Error("Clerk user does not have a primary email address");
	}

	return primaryEmail.email_address;
}

async function upsertUser(user: ClerkUser) {
	const values = {
		clerkId: user.id,
		email: getPrimaryEmail(user),
		firstName: user.first_name,
		lastName: user.last_name,
		imageUrl: user.image_url,
		createdAt: new Date(user.created_at),
		updatedAt: new Date(user.updated_at),
		deletedAt: null,
	};

	// Replayed create events update the existing Clerk user instead of duplicating it
	await db
		.insert(users)
		.values(values)
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email: values.email,
				firstName: values.firstName,
				lastName: values.lastName,
				imageUrl: values.imageUrl,
				updatedAt: values.updatedAt,
				deletedAt: null,
			},
		});
}

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
				await upsertUser(event.data);
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
