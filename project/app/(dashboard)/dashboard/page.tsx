import {
	CheckCircle,
	ClipboardCheck,
	FolderKanban,
	ListTodo,
} from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getDashboardData } from "@/lib/db/queries";

export default async function DashboardPage() {
	const user = await requireCurrentUser();
	const { stats, recentProjects } = await getDashboardData(user.id);
	const statCards = [
		{
			name: "Active Projects",
			value: stats.activeProjects,
			icon: FolderKanban,
		},
		{
			name: "Completed Projects",
			value: stats.completedProjects,
			icon: CheckCircle,
		},
		{ name: "Total Tasks", value: stats.totalTasks, icon: ListTodo },
		{
			name: "Completed Tasks",
			value: stats.completedTasks,
			icon: ClipboardCheck,
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Dashboard
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					Welcome back. Here is the latest overview of your work.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
				{statCards.map((stat) => (
					<div
						key={stat.name}
						className="rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue_munsell-100 dark:bg-blue_munsell-900">
								<stat.icon className="text-blue_munsell-500" size={20} />
							</div>
							<div>
								<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
									{stat.name}
								</p>
								<p className="text-2xl font-semibold text-outer_space-500 dark:text-platinum-500">
									{stat.value}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
				<section className="rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Recent Projects
						</h2>
						<Link
							href="/projects"
							className="text-sm font-medium text-blue_munsell-600 hover:underline dark:text-blue_munsell-400"
						>
							View all
						</Link>
					</div>

					{recentProjects.length > 0 ? (
						<div className="space-y-3">
							{recentProjects.map(
								({ project, taskCount, completedTaskCount }) => {
									const progress =
										taskCount === 0
											? 0
											: Math.round((completedTaskCount / taskCount) * 100);

									return (
										<Link
											key={project.id}
											href={`/projects/${project.id}`}
											className="block rounded-lg bg-platinum-800 p-4 transition-colors hover:bg-platinum-600 dark:bg-outer_space-400 dark:hover:bg-paynes_gray-400"
										>
											<div className="flex items-center justify-between gap-4">
												<div className="min-w-0">
													<p className="truncate font-medium text-outer_space-500 dark:text-platinum-500">
														{project.name}
													</p>
													<p className="mt-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
														Updated {project.updatedAt.toLocaleDateString()}
													</p>
												</div>
												<span className="shrink-0 text-sm font-medium text-blue_munsell-600 dark:text-blue_munsell-400">
													{progress}%
												</span>
											</div>
										</Link>
									);
								},
							)}
						</div>
					) : (
						<p className="rounded-lg border border-dashed border-french_gray-300 p-8 text-center text-sm text-paynes_gray-500 dark:border-paynes_gray-400 dark:text-french_gray-400">
							No projects to show yet.
						</p>
					)}
				</section>

				<section className="rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<h2 className="mb-2 text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						Quick Actions
					</h2>
					<p className="mb-5 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Start a new workspace or continue managing your existing projects.
					</p>
					<div className="flex flex-col items-start gap-3">
						<CreateProjectModal />
						<Link
							href="/projects"
							className="rounded-lg border border-french_gray-300 px-4 py-2 text-sm font-medium text-outer_space-500 transition-colors hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400"
						>
							Manage projects
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
