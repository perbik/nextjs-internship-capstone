import { and, eq, ilike, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { lists, projectMembers, projects, tasks, users } from "@/lib/db/schema";

type ManageableRole = "admin" | "member";

async function requireManagementContext(projectId: string, actorId: string) {
	const [context] = await db
		.select({
			ownerId: projects.ownerId,
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

export async function addProjectMember(
	projectId: string,
	actorId: string,
	email: string,
	role: ManageableRole,
) {
	const context = await requireManagementContext(projectId, actorId);

	if (context.actorRole === "admin" && role !== "member") {
		throw new Error("Only the project owner can add administrators");
	}

	const [user] = await db
		.select({ id: users.id })
		.from(users)
		.where(and(ilike(users.email, email), isNull(users.deletedAt)))
		.limit(1);

	if (!user) {
		throw new Error("No registered ProjectFlow user was found with that email");
	}

	const [existing] = await db
		.select({ userId: projectMembers.userId })
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, user.id),
			),
		)
		.limit(1);

	if (existing) {
		throw new Error("This user is already a project member");
	}

	await db.insert(projectMembers).values({ projectId, userId: user.id, role });
	await db
		.update(projects)
		.set({ updatedAt: new Date() })
		.where(eq(projects.id, projectId));

	return user.id;
}

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

	const projectTaskIds = await db
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
		await db
			.update(tasks)
			.set({ assigneeId: null, updatedAt: new Date() })
			.where(
				inArray(
					tasks.id,
					projectTaskIds.map(({ id }) => id),
				),
			);
	}

	await db
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		);
	await db
		.update(projects)
		.set({ updatedAt: new Date() })
		.where(eq(projects.id, projectId));
}
