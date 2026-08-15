import { getProjectSummariesForUser } from "@/lib/db/queries/projects";

export async function getDashboardData(userId: string) {
	const projects = await getProjectSummariesForUser(userId);
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
			activeProjects: projects.filter(
				({ project }) => project.status === "active",
			).length,
			completedProjects: projects.filter(
				({ project }) => project.status === "completed",
			).length,
			totalTasks,
			completedTasks,
		},
		recentProjects: projects.slice(0, 3),
	};
}
