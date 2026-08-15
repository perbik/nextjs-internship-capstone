import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries";

export async function requireCurrentUser() {
	const { userId: clerkId } = await auth();

	if (!clerkId) {
		throw new Error("You must be signed in");
	}

	const user = await getUserByClerkId(clerkId);

	if (!user) {
		throw new Error("Your Brix account is not synchronized yet");
	}

	return user;
}
