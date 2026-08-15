import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { lists, projectMembers, projects, tasks } from "@/lib/db/schema";
import type { ProjectFilters } from "@/lib/validations";

const allProjectMembers = alias(projectMembers, "all_project_members");
const projectLists = alias(lists, "project_lists");
const activeTasks = alias(tasks, "active_tasks");

export async function getProjectsForUser(userId: string) {
	return db
		.select({ project: projects, role: projectMembers.role })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(and(eq(projectMembers.userId, userId), isNull(projects.deletedAt)))
		.orderBy(desc(projects.updatedAt));
}

export async function getProjectSummariesForUser(
	userId: string,
	filters: ProjectFilters = {},
) {
	const search = filters.q ? `%${filters.q}%` : undefined;

	return db
		.select({
			project: projects,
			role: projectMembers.role,
			memberCount:
				sql<number>`count(distinct ${allProjectMembers.userId})::int`.mapWith(
					Number,
				),
			taskCount: sql<number>`count(distinct ${activeTasks.id})::int`.mapWith(
				Number,
			),
			completedTaskCount:
				sql<number>`count(distinct case when ${projectLists.isCompleted} then ${activeTasks.id} end)::int`.mapWith(
					Number,
				),
		})
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.leftJoin(allProjectMembers, eq(allProjectMembers.projectId, projects.id))
		.leftJoin(projectLists, eq(projectLists.projectId, projects.id))
		.leftJoin(
			activeTasks,
			and(
				eq(activeTasks.listId, projectLists.id),
				isNull(activeTasks.deletedAt),
			),
		)
		.where(
			and(
				eq(projectMembers.userId, userId),
				isNull(projects.deletedAt),
				filters.status ? eq(projects.status, filters.status) : undefined,
				filters.role ? eq(projectMembers.role, filters.role) : undefined,
				search
					? or(
							ilike(projects.name, search),
							ilike(projects.description, search),
						)
					: undefined,
			),
		)
		.groupBy(projects.id, projectMembers.role)
		.orderBy(desc(projects.updatedAt));
}

export type ProjectSummary = Awaited<
	ReturnType<typeof getProjectSummariesForUser>
>[number];

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
