import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	canAccessProject,
	getProjectMembership,
} from "@/lib/db/queries/project-members";
import { lists, projects, tasks } from "@/lib/db/schema";

export async function getProjectBoard(projectId: string, userId: string) {
	if (!(await canAccessProject(projectId, userId))) {
		return null;
	}

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
							where: isNull(tasks.deletedAt),
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
