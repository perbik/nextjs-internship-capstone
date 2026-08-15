import { and, eq, ilike, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	lists,
	projectMembers,
	projects,
	tasks,
	teamMembers,
	teams,
	users,
} from "@/lib/db/schema";
import { withTransaction } from "@/lib/db/transaction";

// Roles that can be assigned without transferring ownership
type MemberRole = "admin" | "member";

// Require the current user to be a team owner or admin
async function requireManager(teamId: string, actorId: string) {
	const [context] = await db
		.select({ ownerId: teams.ownerId, actorRole: teamMembers.role })
		.from(teams)
		.innerJoin(
			teamMembers,
			and(eq(teamMembers.teamId, teams.id), eq(teamMembers.userId, actorId)),
		)
		.where(and(eq(teams.id, teamId), isNull(teams.deletedAt)))
		.limit(1);

	if (
		!context ||
		(context.actorRole !== "owner" && context.actorRole !== "admin")
	) {
		throw new Error("You do not have permission to manage this team");
	}
	return context;
}

// Create a team and its owner membership together
export async function createTeam(
	ownerId: string,
	data: { name: string; description?: string },
) {
	const teamId = crypto.randomUUID();
	await db.batch([
		db.insert(teams).values({ id: teamId, ownerId, ...data }),
		db.insert(teamMembers).values({ teamId, userId: ownerId, role: "owner" }),
	]);
	return teamId;
}

// Add a registered user to a managed team
export async function addTeamMember(
	teamId: string,
	actorId: string,
	email: string,
	role: MemberRole,
) {
	const context = await requireManager(teamId, actorId);
	if (context.actorRole === "admin" && role !== "member") {
		throw new Error("Only the team owner can invite administrators");
	}

	const [user] = await db
		.select({ id: users.id })
		.from(users)
		.where(and(ilike(users.email, email), isNull(users.deletedAt)))
		.limit(1);
	if (!user) {
		throw new Error("No registered Brix user was found with that email");
	}

	const [existing] = await db
		.select({ userId: teamMembers.userId })
		.from(teamMembers)
		.where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)))
		.limit(1);
	if (existing) throw new Error("This user is already a team member");

	await db.insert(teamMembers).values({ teamId, userId: user.id, role });
	await db
		.update(teams)
		.set({ updatedAt: new Date() })
		.where(eq(teams.id, teamId));
}

// Change a team member's role as the team owner
export async function updateTeamMemberRole(
	teamId: string,
	actorId: string,
	userId: string,
	role: MemberRole,
) {
	const context = await requireManager(teamId, actorId);
	if (context.actorRole !== "owner") {
		throw new Error("Only the team owner can change member roles");
	}
	if (userId === context.ownerId) {
		throw new Error("The team owner's role cannot be changed");
	}

	const [updated] = await db
		.update(teamMembers)
		.set({ role })
		.where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
		.returning();
	if (!updated) throw new Error("Team member not found");
}

// Remove a member from the team and its projects
export async function removeTeamMember(
	teamId: string,
	actorId: string,
	userId: string,
) {
	const context = await requireManager(teamId, actorId);
	if (userId === context.ownerId) {
		throw new Error("The team owner cannot be removed");
	}

	const [target] = await db
		.select({ role: teamMembers.role })
		.from(teamMembers)
		.where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
		.limit(1);
	if (!target) throw new Error("Team member not found");
	if (context.actorRole === "admin" && target.role !== "member") {
		throw new Error("Administrators can only remove regular members");
	}

	await withTransaction(async (tx) => {
		const now = new Date();
		const teamProjects = await tx
			.select({ id: projects.id, ownerId: projects.ownerId })
			.from(projects)
			.where(and(eq(projects.teamId, teamId), isNull(projects.deletedAt)));

		if (teamProjects.some(({ ownerId }) => ownerId === userId)) {
			throw new Error(
				"Transfer or delete this member's team projects before removing them",
			);
		}

		const projectIds = teamProjects.map(({ id }) => id);

		if (projectIds.length > 0) {
			const assigned = await tx
				.select({ id: tasks.id })
				.from(tasks)
				.innerJoin(lists, eq(tasks.listId, lists.id))
				.where(
					and(
						inArray(lists.projectId, projectIds),
						eq(tasks.assigneeId, userId),
						isNull(tasks.deletedAt),
					),
				);

			if (assigned.length > 0) {
				await tx
					.update(tasks)
					.set({ assigneeId: null, updatedAt: now })
					.where(
						inArray(
							tasks.id,
							assigned.map(({ id }) => id),
						),
					);
			}

			await tx
				.delete(projectMembers)
				.where(
					and(
						inArray(projectMembers.projectId, projectIds),
						eq(projectMembers.userId, userId),
					),
				);

			await tx
				.update(projects)
				.set({ updatedAt: now })
				.where(inArray(projects.id, projectIds));
		}

		const [removedMembership] = await tx
			.delete(teamMembers)
			.where(
				and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
			)
			.returning({ userId: teamMembers.userId });

		if (!removedMembership) {
			throw new Error("Team member not found");
		}

		await tx.update(teams).set({ updatedAt: now }).where(eq(teams.id, teamId));
	});
}
