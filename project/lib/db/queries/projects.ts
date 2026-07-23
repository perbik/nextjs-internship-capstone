import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { projectMembers, projects } from "@/lib/db/schema";

export async function getProjectsForUser(userId: string) {
	return db
		.select({ project: projects, role: projectMembers.role })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(and(eq(projectMembers.userId, userId), isNull(projects.deletedAt)))
		.orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: string, userId: string) {
	if (!(await canAccessProject(projectId, userId))) {
		return null;
	}

	const [project] = await db
		.select()
		.from(projects)
		.where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
		.limit(1);

	return project ?? null;
}
