import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/db/mutations/notifications";
import {
	lists,
	projectMembers,
	projects,
	tasks,
	teamMembers,
} from "@/lib/db/schema";
import { withTransaction } from "@/lib/db/transaction";

// Roles that can be assigned other than owner
type ManageableRole = "admin" | "member";

// Require the current user to be a project owner or admin
async function requireManagementContext(projectId: string, actorId: string) {
	const [context] = await db
		.select({
			ownerId: projects.ownerId,
			teamId: projects.teamId,
			projectName: projects.name,
			actorRole: projectMembers.role,
		})
		.from(projects)
		.innerJoin(
			projectMembers,
			and(
				eq(projectMembers.projectId, projects.id),
				eq(projectMembers.userId, actorId),
			),
		)
		.where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
		.limit(1);

	if (
		!context ||
		(context.actorRole !== "owner" && context.actorRole !== "admin")
	) {
		throw new Error("You do not have permission to manage project members");
	}

	return context;
}

// Add a registered team member as a project collaborator
export async function addProjectMember(
	projectId: string,
	actorId: string,
	userId: string,
	role: ManageableRole,
) {
	const context = await requireManagementContext(projectId, actorId);

	if (context.actorRole === "admin" && role !== "member") {
		throw new Error("Only the project owner can add administrators");
	}

	if (!context.teamId) {
		throw new Error(
			"Assign this project to a team before adding collaborators",
		);
	}
	const [teamMembership] = await db
		.select({ userId: teamMembers.userId })
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.teamId, context.teamId),
				eq(teamMembers.userId, userId),
			),
		)
		.limit(1);
	if (!teamMembership) {
		throw new Error(
			"Invite this user to the team before adding them to the project",
		);
	}

	const [existing] = await db
		.select({ userId: projectMembers.userId })
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.limit(1);

	if (existing) {
		throw new Error("This user is already a project member");
	}

	await withTransaction(async (tx) => {
		await tx.insert(projectMembers).values({ projectId, userId, role });
		await createNotification(
			{
				recipientId: userId,
				actorId,
				type: "project_member_added",
				projectId,
				message: `added you to ${context.projectName}`,
			},
			tx,
		);
		await tx
			.update(projects)
			.set({ updatedAt: new Date() })
			.where(eq(projects.id, projectId));
	});

	return userId;
}

// Change a project member's role as the project owner
export async function updateProjectMemberRole(
	projectId: string,
	actorId: string,
	userId: string,
	role: ManageableRole,
) {
	const context = await requireManagementContext(projectId, actorId);

	if (context.actorRole !== "owner") {
		throw new Error("Only the project owner can change member roles");
	}

	if (userId === context.ownerId) {
		throw new Error("The project owner's role cannot be changed");
	}

	const [membership] = await db
		.update(projectMembers)
		.set({ role })
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.returning();

	if (!membership) {
		throw new Error("Project member not found");
	}

	return membership;
}

// Remove a collaborator and unassign their project tasks
export async function removeProjectMember(
	projectId: string,
	actorId: string,
	userId: string,
) {
	const context = await requireManagementContext(projectId, actorId);

	if (userId === context.ownerId) {
		throw new Error("The project owner cannot be removed");
	}

	const [target] = await db
		.select({ role: projectMembers.role })
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.limit(1);

	if (!target) {
		throw new Error("Project member not found");
	}

	if (context.actorRole === "admin" && target.role !== "member") {
		throw new Error("Administrators can only remove regular members");
	}

	await withTransaction(async (tx) => {
		const now = new Date();
		const projectTaskIds = await tx
			.select({ id: tasks.id })
			.from(tasks)
			.innerJoin(lists, eq(tasks.listId, lists.id))
			.where(
				and(
					eq(lists.projectId, projectId),
					eq(tasks.assigneeId, userId),
					isNull(tasks.deletedAt),
				),
			);

		if (projectTaskIds.length > 0) {
			await tx
				.update(tasks)
				.set({ assigneeId: null, updatedAt: now })
				.where(
					inArray(
						tasks.id,
						projectTaskIds.map(({ id }) => id),
					),
				);
		}

		const [removedMembership] = await tx
			.delete(projectMembers)
			.where(
				and(
					eq(projectMembers.projectId, projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.returning({ userId: projectMembers.userId });

		if (!removedMembership) {
			throw new Error("Project member not found");
		}

		await tx
			.update(projects)
			.set({ updatedAt: now })
			.where(eq(projects.id, projectId));
	});
}
