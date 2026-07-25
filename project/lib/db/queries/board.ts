import { and, asc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	canAccessProject,
	getProjectMembership,
} from "@/lib/db/queries/project-members";
import { lists, projects, tasks } from "@/lib/db/schema";
import type { TaskFilters } from "@/lib/validations";

export async function getProjectBoard(
	projectId: string,
	userId: string,
	filters: TaskFilters = {},
) {
	if (!(await canAccessProject(projectId, userId))) {
		return null;
	}

	const search = filters.q ? `%${filters.q}%` : undefined;
	const taskConditions = [
		isNull(tasks.deletedAt),
		filters.priority ? eq(tasks.priority, filters.priority) : undefined,
		filters.assignee === "unassigned"
			? isNull(tasks.assigneeId)
			: filters.assignee
				? eq(tasks.assigneeId, filters.assignee)
				: undefined,
		search
			? or(ilike(tasks.title, search), ilike(tasks.description, search))
			: undefined,
	];

	const [project, membership] = await Promise.all([
		db.query.projects.findFirst({
			where: eq(projects.id, projectId),
			with: {
				members: {
					with: { user: true },
				},
				lists: {
					orderBy: asc(lists.position),
					with: {
						tasks: {
							where: and(...taskConditions),
							orderBy: asc(tasks.position),
							with: { assignee: true },
						},
					},
				},
			},
		}),
		getProjectMembership(projectId, userId),
	]);

	if (!project || project.deletedAt) {
		return null;
	}

	return { project, membership };
}
