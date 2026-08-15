import { and, asc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	canAccessProject,
	getProjectMembership,
} from "@/lib/db/queries/project-members";
import { labels, lists, projects, tasks } from "@/lib/db/schema";
import type { TaskFilters } from "@/lib/validations";

// Get the complete board for an accessible project
export async function getProjectBoard(
	projectId: string,
	userId: string,
	filters: TaskFilters = {},
) {
	if (!(await canAccessProject(projectId, userId))) {
		const project = await db.query.projects.findFirst({
			columns: { id: true },
			where: and(eq(projects.id, projectId), isNull(projects.deletedAt)),
		});

		return project
			? ({ status: "forbidden" } as const)
			: ({ status: "not_found" } as const);
	}

	// Build optional task filters from the current search controls
	const search = filters.q ? `%${filters.q}%` : undefined;
	const taskConditions = [
		isNull(tasks.deletedAt),
		filters.priority ? eq(tasks.priority, filters.priority) : undefined,
		filters.assignee === "unassigned"
			? isNull(tasks.assigneeId)
			: filters.assignee === "me"
				? eq(tasks.assigneeId, userId)
				: filters.assignee
					? eq(tasks.assigneeId, filters.assignee)
					: undefined,
		search
			? or(ilike(tasks.title, search), ilike(tasks.description, search))
			: undefined,
	];

	// Load the board and the user's project role
	const [project, membership] = await Promise.all([
		db.query.projects.findFirst({
			where: eq(projects.id, projectId),
			with: {
				members: {
					with: { user: true },
				},
				labels: {
					orderBy: asc(labels.name),
				},
				lists: {
					orderBy: asc(lists.position),
					with: {
						tasks: {
							where: and(...taskConditions),
							orderBy: asc(tasks.position),
							with: {
								assignee: true,
								taskLabels: {
									with: { label: true },
								},
							},
						},
					},
				},
			},
		}),
		getProjectMembership(projectId, userId),
	]);

	// Deleted projects
	if (!project || project.deletedAt) {
		return { status: "not_found" } as const;
	}

	return { status: "ok", project, membership } as const;
}
