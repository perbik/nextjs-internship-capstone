import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { canManageProject } from "@/lib/db/queries/project-members";
import {
	lists,
	type Project,
	projectMembers,
	projects,
	teamMembers,
	teams,
} from "@/lib/db/schema";
import type { ProjectCreateData } from "@/lib/validations";

const defaultLists = [
	{ name: "To Do", position: 0, isCompleted: false },
	{ name: "In Progress", position: 1, isCompleted: false },
	{ name: "Review", position: 2, isCompleted: false },
	{ name: "Done", position: 3, isCompleted: true },
] as const;

export async function createProject(ownerId: string, data: ProjectCreateData) {
	const [team] = await db
		.select({ role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(
			and(
				eq(teamMembers.teamId, data.teamId),
				eq(teamMembers.userId, ownerId),
				isNull(teams.deletedAt),
			),
		)
		.limit(1);
	if (!team || (team.role !== "owner" && team.role !== "admin")) {
		throw new Error(
			"Only a team owner or administrator can create projects for this team",
		);
	}

	const projectId = crypto.randomUUID();

	await db.batch([
		db.insert(projects).values({
			id: projectId,
			ownerId,
			teamId: data.teamId,
			name: data.name,
			description: data.description,
			dueDate: data.dueDate,
		}),
		db.insert(projectMembers).values({
			projectId,
			userId: ownerId,
			role: "owner",
		}),
		db.insert(lists).values(
			defaultLists.map((list) => ({
				id: crypto.randomUUID(),
				projectId,
				...list,
			})),
		),
	]);

	return projectId;
}

type ProjectUpdate = Partial<
	Pick<Project, "name" | "description" | "status" | "dueDate">
>;

export async function updateProject(
	projectId: string,
	userId: string,
	data: ProjectUpdate,
) {
	if (!(await canManageProject(projectId, userId))) {
		throw new Error("You do not have permission to update this project");
	}

	const [project] = await db
		.update(projects)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
		.returning();

	if (!project) {
		throw new Error("Project not found");
	}

	return project;
}

export async function softDeleteProject(projectId: string, userId: string) {
	const [project] = await db
		.select({ ownerId: projects.ownerId })
		.from(projects)
		.where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
		.limit(1);

	if (!project) {
		throw new Error("Project not found");
	}

	if (project.ownerId !== userId) {
		throw new Error("Only the project owner can delete this project");
	}

	const now = new Date();

	await db
		.update(projects)
		.set({ deletedAt: now, updatedAt: now })
		.where(eq(projects.id, projectId));
}

export async function assignProjectToTeam(
	projectId: string,
	ownerId: string,
	teamId: string,
) {
	const [project] = await db
		.select({ ownerId: projects.ownerId, teamId: projects.teamId })
		.from(projects)
		.where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
		.limit(1);
	if (!project || project.ownerId !== ownerId) {
		throw new Error("Only the project owner can assign its team");
	}
	if (project.teamId) {
		throw new Error("This project is already assigned to a team");
	}

	const [membership] = await db
		.select({ role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(
			and(
				eq(teamMembers.teamId, teamId),
				eq(teamMembers.userId, ownerId),
				isNull(teams.deletedAt),
			),
		)
		.limit(1);
	if (
		!membership ||
		(membership.role !== "owner" && membership.role !== "admin")
	) {
		throw new Error("You must own or administer the selected team");
	}

	await db
		.update(projects)
		.set({ teamId, updatedAt: new Date() })
		.where(eq(projects.id, projectId));
}
