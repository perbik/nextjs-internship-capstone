import { auth, clerkClient } from "@clerk/nextjs/server";
import { syncClerkBackendUser } from "@/lib/auth/sync-clerk-user";
import { getUserByClerkId } from "@/lib/db/queries";

export async function requireCurrentUser() {
	const { userId: clerkId } = await auth();

	if (!clerkId) {
		throw new Error("You must be signed in");
	}

	const user = await getUserByClerkId(clerkId);

	if (user) {
		return user;
	}

	try {
		// Repair a missing Neon user when the signup webhook has not arrived yet
		const clerk = await clerkClient();
		const clerkUser = await clerk.users.getUser(clerkId);
		return await syncClerkBackendUser(clerkUser);
	} catch (error) {
		console.error("Failed to provision the current Brix user", error);
		throw new Error("Unable to prepare your Brix account");
	}
}
