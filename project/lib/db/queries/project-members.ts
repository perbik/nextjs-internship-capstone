import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { projectMembers, projects, users } from "@/lib/db/schema";

export async function canAccessProject(projectId: string, userId: string) {
	const [project] = await db
		.select({ id: projects.id })
		.from(projects)
		.leftJoin(
			projectMembers,
			and(
				eq(projectMembers.projectId, projects.id),
				eq(projectMembers.userId, userId),
			),
		)
		.where(
			and(
				eq(projects.id, projectId),
				isNull(projects.deletedAt),
				or(eq(projects.ownerId, userId), isNotNull(projectMembers.userId)),
			),
		)
		.limit(1);

	return Boolean(project);
}

export async function getProjectMembership(projectId: string, userId: string) {
	const [membership] = await db
		.select()
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.limit(1);

	return membership ?? null;
}

export async function canManageProject(projectId: string, userId: string) {
	if (!(await canAccessProject(projectId, userId))) {
		return false;
	}

	const membership = await getProjectMembership(projectId, userId);

	return membership?.role === "owner" || membership?.role === "admin";
}

export async function getProjectMembers(
	projectId: string,
	requestingUserId: string,
) {
	if (!(await canAccessProject(projectId, requestingUserId))) {
		return [];
	}

	return db
		.select({ membership: projectMembers, user: users })
		.from(projectMembers)
		.innerJoin(users, eq(projectMembers.userId, users.id))
		.where(
			and(eq(projectMembers.projectId, projectId), isNull(users.deletedAt)),
		);
}
