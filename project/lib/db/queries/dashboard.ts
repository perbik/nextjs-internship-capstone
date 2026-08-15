import { getTeamOverview } from "@/lib/db/queries/project-members";
import { getProjectSummariesForUser } from "@/lib/db/queries/projects";

// Build the dashboard summary for one user
export async function getDashboardData(userId: string) {
	// Load project and team data at the same time
	const [projects, team] = await Promise.all([
		getProjectSummariesForUser(userId),
		getTeamOverview(userId),
	]);

	// Combine task totals from every accessible project
	const totalTasks = projects.reduce(
		(total, project) => total + project.taskCount,
		0,
	);
	const completedTasks = projects.reduce(
		(total, project) => total + project.completedTaskCount,
		0,
	);

	return {
		stats: {
			pendingTasks: Math.max(totalTasks - completedTasks, 0),
			// Count each person once across all projects
			teamMembers: new Set(team.map(({ user }) => user.id)).size,
			completedTasks,
			activeProjects: projects.filter(
				({ project }) => project.status === "active",
			).length,
		},
		recentProjects: projects.slice(0, 3),
	};
}
