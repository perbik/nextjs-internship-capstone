import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getUserById(userId: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(and(eq(users.id, userId), isNull(users.deletedAt)))
		.limit(1);

	return user ?? null;
}

export async function getUserByClerkId(clerkId: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)))
		.limit(1);

	return user ?? null;
}

export async function getUsersByIds(userIds: string[]) {
	if (userIds.length === 0) {
		return [];
	}

	return db
		.select()
		.from(users)
		.where(and(inArray(users.id, userIds), isNull(users.deletedAt)));
}
