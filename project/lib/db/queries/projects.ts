import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { canAccessProject } from "@/lib/db/queries/project-members";
import { lists, projectMembers, projects, tasks } from "@/lib/db/schema";
import type { ProjectFilters } from "@/lib/validations";

// Join the same tables for different purposes
const allProjectMembers = alias(projectMembers, "all_project_members");
const projectLists = alias(lists, "project_lists");
const activeTasks = alias(tasks, "active_tasks");

export const PROJECTS_PER_PAGE = 6;

function projectFilterCondition(userId: string, filters: ProjectFilters) {
	const search = filters.q ? `%${filters.q}%` : undefined;

	return and(
		eq(projectMembers.userId, userId),
		isNull(projects.deletedAt),
		filters.status ? eq(projects.status, filters.status) : undefined,
		filters.role ? eq(projectMembers.role, filters.role) : undefined,
		search
			? or(ilike(projects.name, search), ilike(projects.description, search))
			: undefined,
	);
}

// Get the active projects a user belongs to
export async function getProjectsForUser(userId: string) {
	return db
		.select({ project: projects, role: projectMembers.role })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(and(eq(projectMembers.userId, userId), isNull(projects.deletedAt)))
		.orderBy(desc(projects.updatedAt));
}

// Get project cards with member and task totals
export async function getProjectSummariesForUser(
	userId: string,
	filters: ProjectFilters = { page: 1 },
	options: { limit?: number; offset?: number } = {},
) {
	const query = db
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
		.where(projectFilterCondition(userId, filters))
		.groupBy(projects.id, projectMembers.role)
		.orderBy(desc(projects.updatedAt))
		.$dynamic();

	if (options.limit !== undefined) query.limit(options.limit);
	if (options.offset !== undefined) query.offset(options.offset);

	return query;
}

// Return one project page without limiting dashboard or analytics queries
export async function getProjectSummariesPageForUser(
	userId: string,
	filters: ProjectFilters = { page: 1 },
) {
	const [countRow] = await db
		.select({ total: count() })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(projectFilterCondition(userId, filters));
	const total = countRow?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PER_PAGE));
	const page = Math.min(filters.page, totalPages);
	const projectSummaries = await getProjectSummariesForUser(userId, filters, {
		limit: PROJECTS_PER_PAGE,
		offset: (page - 1) * PROJECTS_PER_PAGE,
	});

	return { projects: projectSummaries, page, total, totalPages };
}

// Use the query result as the shared project-card type
export type ProjectSummary = Awaited<
	ReturnType<typeof getProjectSummariesForUser>
>[number];

// Get one active project when the user has access
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
