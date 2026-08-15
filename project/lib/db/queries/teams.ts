import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	or,
	sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
	projectMembers,
	projects,
	teamMembers,
	teams,
	users,
} from "@/lib/db/schema";

interface TeamQueryOptions {
	query?: string;
	page?: number;
	pageSize?: number;
}

// Get one team only when the current user belongs to it
export async function getTeamForUser(userId: string, teamId: string) {
	const [membership] = await db
		.select({ team: teams, role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(
			and(
				eq(teamMembers.userId, userId),
				eq(teams.id, teamId),
				isNull(teams.deletedAt),
			),
		)
		.limit(1);

	if (!membership) return null;

	const [members, accessibleProjects, projectCounts] = await Promise.all([
		db
			.select({ membership: teamMembers, user: users })
			.from(teamMembers)
			.innerJoin(users, eq(teamMembers.userId, users.id))
			.where(and(eq(teamMembers.teamId, teamId), isNull(users.deletedAt))),
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
			.where(and(eq(projects.teamId, teamId), isNull(projects.deletedAt))),
		db
			.select({ userId: projectMembers.userId, total: count() })
			.from(projectMembers)
			.innerJoin(projects, eq(projectMembers.projectId, projects.id))
			.where(and(eq(projects.teamId, teamId), isNull(projects.deletedAt)))
			.groupBy(projectMembers.userId),
	]);

	const countByUserId = new Map(
		projectCounts.map(({ userId: memberId, total }) => [memberId, total]),
	);

	return {
		...membership,
		members: members.map((member) => ({
			...member,
			projectCount: countByUserId.get(member.user.id) ?? 0,
		})),
		projects: accessibleProjects.map(({ project }) => project),
	};
}

// Get a page of active teams the user belongs to
export async function getTeamsPageForUser(
	userId: string,
	{ query = "", page = 1, pageSize = 6 }: TeamQueryOptions = {},
) {
	const normalizedQuery = query.trim();
	const searchPattern = `%${normalizedQuery}%`;
	const membershipCondition = and(
		eq(teamMembers.userId, userId),
		isNull(teams.deletedAt),
	);
	const searchCondition = normalizedQuery
		? or(
				ilike(teams.name, searchPattern),
				ilike(teams.description, searchPattern),
				sql`exists (
					select 1 from ${projects}
					inner join ${projectMembers}
						on ${projectMembers.projectId} = ${projects.id}
						and ${projectMembers.userId} = ${userId}
					where ${projects.teamId} = ${teams.id}
						and ${projects.deletedAt} is null
						and ${projects.name} ilike ${searchPattern}
				)`,
				sql`exists (
					select 1 from ${teamMembers} searched_membership
					inner join ${users} searched_user
						on searched_user.id = searched_membership.user_id
					where searched_membership.team_id = ${teams.id}
						and searched_user.deleted_at is null
						and (
							searched_user.email ilike ${searchPattern}
							or concat_ws(' ', searched_user.first_name, searched_user.last_name)
								ilike ${searchPattern}
						)
				)`,
			)
		: undefined;
	const filteredCondition = and(membershipCondition, searchCondition);

	const [filteredCountRows, allCountRows] = await Promise.all([
		db
			.select({ total: count() })
			.from(teamMembers)
			.innerJoin(teams, eq(teamMembers.teamId, teams.id))
			.where(filteredCondition),
		db
			.select({ total: count() })
			.from(teamMembers)
			.innerJoin(teams, eq(teamMembers.teamId, teams.id))
			.where(membershipCondition),
	]);
	const total = filteredCountRows[0]?.total ?? 0;
	const totalTeams = allCountRows[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const memberships = await db
		.select({ team: teams, role: teamMembers.role })
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.where(filteredCondition)
		.orderBy(desc(teams.updatedAt))
		.limit(pageSize)
		.offset((currentPage - 1) * pageSize);

	if (memberships.length === 0) {
		return { teams: [], total, totalTeams, page: currentPage, totalPages };
	}
	const teamIds = memberships.map(({ team }) => team.id);

	// Load team members and accessible projects at the same time
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

	// Group the members and projects under their matching teams
	const result = memberships.map(({ team, role }) => ({
		team,
		role,
		members: members.filter(({ membership }) => membership.teamId === team.id),
		projects: accessibleProjects
			.map(({ project }) => project)
			.filter((project) => project.teamId === team.id),
	}));

	return { teams: result, total, totalTeams, page: currentPage, totalPages };
}

// Load every team for screens that need to locate a specific team
export async function getTeamsForUser(userId: string) {
	const result = await getTeamsPageForUser(userId, { pageSize: 1000 });
	return result.teams;
}

// Get teams the user can manage as an owner or admin
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
