import type { User } from "@clerk/nextjs/server";
import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

type ClerkWebhookUser = Extract<
	WebhookEvent["data"],
	{ email_addresses: unknown }
>;

type SynchronizedUser = {
	clerkId: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	imageUrl: string;
	createdAt: Date;
	updatedAt: Date;
};

function getWebhookPrimaryEmail(user: ClerkWebhookUser) {
	const primaryEmail = user.email_addresses.find(
		(email) => email.id === user.primary_email_address_id,
	);

	if (!primaryEmail) {
		throw new Error("Clerk user does not have a primary email address");
	}

	return primaryEmail.email_address;
}

// Normalize both Clerk payload formats into the same database shape
function normalizeWebhookUser(user: ClerkWebhookUser): SynchronizedUser {
	return {
		clerkId: user.id,
		email: getWebhookPrimaryEmail(user),
		firstName: user.first_name,
		lastName: user.last_name,
		imageUrl: user.image_url,
		createdAt: new Date(user.created_at),
		updatedAt: new Date(user.updated_at),
	};
}

function normalizeBackendUser(user: User): SynchronizedUser {
	const primaryEmail = user.primaryEmailAddress;

	if (!primaryEmail) {
		throw new Error("Clerk user does not have a primary email address");
	}

	return {
		clerkId: user.id,
		email: primaryEmail.emailAddress,
		firstName: user.firstName,
		lastName: user.lastName,
		imageUrl: user.imageUrl,
		createdAt: new Date(user.createdAt),
		updatedAt: new Date(user.updatedAt),
	};
}

// // Upsert makes webhook retries and first-request recovery safe to run multiple times
async function upsertSynchronizedUser(user: SynchronizedUser) {
	const [synchronizedUser] = await db
		.insert(users)
		.values({ ...user, deletedAt: null })
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				imageUrl: user.imageUrl,
				updatedAt: user.updatedAt,
				deletedAt: null,
			},
		})
		.returning();

	return synchronizedUser;
}

export function syncClerkWebhookUser(user: ClerkWebhookUser) {
	return upsertSynchronizedUser(normalizeWebhookUser(user));
}

export function syncClerkBackendUser(user: User) {
	return upsertSynchronizedUser(normalizeBackendUser(user));
}
