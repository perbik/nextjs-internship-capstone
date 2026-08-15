import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getProjectSummariesForUser } from "@/lib/db/queries/projects";
import {
	activityLogs,
	projectMembers,
	projects,
	tasks,
	teamMembers,
	teams,
	users,
} from "@/lib/db/schema";

export interface AnalyticsScope {
	teamId?: string;
	standalone?: boolean;
}

const ACTIVITY_PAGE_SIZE = 5;

export async function getAnalyticsScopeOptions(userId: string) {
	const [teamOptions, standaloneProjects] = await Promise.all([
		db
			.select({ id: teams.id, name: teams.name })
			.from(teamMembers)
			.innerJoin(teams, eq(teamMembers.teamId, teams.id))
			.where(and(eq(teamMembers.userId, userId), isNull(teams.deletedAt)))
			.orderBy(teams.name),
		db
			.select({ id: projects.id })
			.from(projectMembers)
			.innerJoin(projects, eq(projectMembers.projectId, projects.id))
			.where(
				and(
					eq(projectMembers.userId, userId),
					isNull(projects.teamId),
					isNull(projects.deletedAt),
				),
			)
			.limit(1),
	]);

	return {
		teams: teamOptions,
		hasStandaloneProjects: standaloneProjects.length > 0,
	};
}

function analyticsScopeCondition(scope: AnalyticsScope) {
	if (scope.teamId) return eq(projects.teamId, scope.teamId);
	if (scope.standalone) return isNull(projects.teamId);
	return undefined;
}

// Build analytics across every project the user can access
export async function getAnalyticsData(
	userId: string,
	scope: AnalyticsScope = {},
	activityPage = 1,
) {
	const scopeCondition = analyticsScopeCondition(scope);
	const requestedActivityPage = Math.max(1, Math.trunc(activityPage));
	// A task is completed when activity shows it entered a completed list
	const completionEvent = sql<boolean>`
		coalesce(
			(${activityLogs.metadata} ->> 'toListCompleted')::boolean,
			(${activityLogs.metadata} ->> 'listCompleted')::boolean,
			false
		)
	`;
	const recentActivityQuery = (page: number) =>
		db
			.select({
				activity: activityLogs,
				projectName: projects.name,
				teamName: teams.name,
				actor: users,
			})
			.from(activityLogs)
			.innerJoin(
				projectMembers,
				and(
					eq(projectMembers.projectId, activityLogs.projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.innerJoin(projects, eq(activityLogs.projectId, projects.id))
			.leftJoin(teams, eq(projects.teamId, teams.id))
			.leftJoin(users, eq(activityLogs.actorId, users.id))
			.where(and(isNull(projects.deletedAt), scopeCondition))
			.orderBy(desc(activityLogs.createdAt))
			.limit(ACTIVITY_PAGE_SIZE)
			.offset((page - 1) * ACTIVITY_PAGE_SIZE);

	// Load summaries, metrics, completions, and recent activity together
	const [
		allProjectSummaries,
		activityCount,
		activityMetrics,
		completionRows,
		requestedActivity,
	] = await Promise.all([
		getProjectSummariesForUser(userId),
		db
			.select({
				total: sql<number>`count(*)::int`.mapWith(Number),
			})
			.from(activityLogs)
			.innerJoin(
				projectMembers,
				and(
					eq(projectMembers.projectId, activityLogs.projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.innerJoin(projects, eq(activityLogs.projectId, projects.id))
			.where(and(isNull(projects.deletedAt), scopeCondition)),
		db
			.select({
				activeUsersThisWeek:
					sql<number>`count(distinct ${activityLogs.actorId}) filter (
							where ${activityLogs.createdAt} >= now() - interval '7 days'
							and ${activityLogs.actorId} is not null
						)::int`.mapWith(Number),
			})
			.from(activityLogs)
			.innerJoin(
				projectMembers,
				and(
					eq(projectMembers.projectId, activityLogs.projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.innerJoin(projects, eq(activityLogs.projectId, projects.id))
			.where(and(isNull(projects.deletedAt), scopeCondition)),
		db
			.select({
				taskId: activityLogs.taskId,
				taskCreatedAt: tasks.createdAt,
				completedAt: sql<Date>`min(${activityLogs.createdAt})`.mapWith(
					activityLogs.createdAt,
				),
			})
			.from(activityLogs)
			.innerJoin(tasks, eq(activityLogs.taskId, tasks.id))
			.innerJoin(
				projectMembers,
				and(
					eq(projectMembers.projectId, activityLogs.projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.innerJoin(projects, eq(activityLogs.projectId, projects.id))
			.where(
				and(
					isNull(projects.deletedAt),
					isNull(tasks.deletedAt),
					scopeCondition,
					completionEvent,
				),
			)
			.groupBy(activityLogs.taskId, tasks.createdAt),
		recentActivityQuery(requestedActivityPage),
	]);
	const totalActivityPages = Math.max(
		1,
		Math.ceil((activityCount[0]?.total ?? 0) / ACTIVITY_PAGE_SIZE),
	);
	const currentActivityPage = Math.min(
		requestedActivityPage,
		totalActivityPages,
	);
	const recentActivity =
		currentActivityPage === requestedActivityPage
			? requestedActivity
			: await recentActivityQuery(currentActivityPage);
	const projectSummaries = allProjectSummaries.filter(({ project }) => {
		if (scope.teamId) return project.teamId === scope.teamId;
		if (scope.standalone) return project.teamId === null;
		return true;
	});

	// Combine current task totals from all accessible projects
	const totalTasks = projectSummaries.reduce(
		(total, summary) => total + summary.taskCount,
		0,
	);
	const completedTasks = projectSummaries.reduce(
		(total, summary) => total + summary.completedTaskCount,
		0,
	);

	// Velocity counts tasks first completed during the last seven days
	const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const projectVelocity = completionRows.filter(
		({ completedAt }) => completedAt.getTime() >= oneWeekAgo,
	).length;

	// Task time measures days from creation to first completion
	const completionDurations = completionRows.map(
		({ taskCreatedAt, completedAt }) =>
			Math.max(completedAt.getTime() - taskCreatedAt.getTime(), 0) /
			(24 * 60 * 60 * 1000),
	);
	const averageTaskTime =
		completionDurations.length === 0
			? 0
			: completionDurations.reduce((total, duration) => total + duration, 0) /
				completionDurations.length;

	// Team efficiency uses the current task completion rate
	return {
		metrics: {
			projectVelocity,
			activeUsersThisWeek: activityMetrics[0]?.activeUsersThisWeek ?? 0,
			averageTaskTime: Math.round(averageTaskTime * 10) / 10,
			totalTasks,
			completedTasks,
			completionRate:
				totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
		},
		recentActivity,
		activityPagination: {
			page: currentActivityPage,
			totalPages: totalActivityPages,
		},
	};
}
