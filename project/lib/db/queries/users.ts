import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Get an active user by their database ID
export async function getUserById(userId: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(and(eq(users.id, userId), isNull(users.deletedAt)))
		.limit(1);

	return user ?? null;
}

// Get an active user linked to a Clerk account
export async function getUserByClerkId(clerkId: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)))
		.limit(1);

	return user ?? null;
}

// Get active users from a list of database IDs
export async function getUsersByIds(userIds: string[]) {
	// Skip the database query when the list is empty
	if (userIds.length === 0) {
		return [];
	}

	return db
		.select()
		.from(users)
		.where(and(inArray(users.id, userIds), isNull(users.deletedAt)));
}
