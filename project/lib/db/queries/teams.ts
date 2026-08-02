import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	projectMembers,
	projects,
	teamMembers,
	teams,
	users,
} from "@/lib/db/schema";

export async function getTeamsForUser(userId: string) {
	const memberships = await db
		.select({ team: teams, role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(and(eq(teamMembers.userId, userId), isNull(teams.deletedAt)))
		.orderBy(desc(teams.updatedAt));

	if (memberships.length === 0) return [];
	const teamIds = memberships.map(({ team }) => team.id);

	const [members, accessibleProjects] = await Promise.all([
		db
			.select({ membership: teamMembers, user: users })
			.from(teamMembers)
			.innerJoin(users, eq(teamMembers.userId, users.id))
			.where(
				and(inArray(teamMembers.teamId, teamIds), isNull(users.deletedAt)),
			),
		db
			.select({ project: projects })
			.from(projects)
			.innerJoin(
				projectMembers,
				and(
					eq(projectMembers.projectId, projects.id),
					eq(projectMembers.userId, userId),
				),
			)
			.where(
				and(inArray(projects.teamId, teamIds), isNull(projects.deletedAt)),
			),
	]);

	return memberships.map(({ team, role }) => ({
		team,
		role,
		members: members.filter(({ membership }) => membership.teamId === team.id),
		projects: accessibleProjects
			.map(({ project }) => project)
			.filter((project) => project.teamId === team.id),
	}));
}

export async function getManageableTeamsForUser(userId: string) {
	return db
		.select({ id: teams.id, name: teams.name, role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(
			and(
				eq(teamMembers.userId, userId),
				inArray(teamMembers.role, ["owner", "admin"]),
				isNull(teams.deletedAt),
			),
		)
		.orderBy(asc(teams.name));
}
