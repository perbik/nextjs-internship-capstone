import {
	ArrowUpRight,
	Calendar,
	CheckSquare,
	Clock3,
	Users,
} from "lucide-react";
import Link from "next/link";
import { ProjectActions } from "@/components/project-actions";
import type { ProjectSummary } from "@/lib/db/queries";

interface ProjectCardProps {
	summary: ProjectSummary;
}

const statusLabels = {
	active: "Active",
	completed: "Completed",
	on_hold: "On hold",
} as const;

const statusClasses = {
	active:
		"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
	completed:
		"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	on_hold:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
} as const;

const accentClasses = {
	active: "bg-blue_munsell-500",
	completed: "bg-green-500",
	on_hold: "bg-yellow-500",
} as const;

export function ProjectCard({ summary }: ProjectCardProps) {
	const { project, memberCount, taskCount, completedTaskCount, role } = summary;
	const progress =
		taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);
	const isOverdue =
		Boolean(project.dueDate) &&
		project.status !== "completed" &&
		(project.dueDate?.getTime() ?? 0) < Date.now();
	const canManage = role === "owner" || role === "admin";
	const canDelete = role === "owner";

	return (
		<article className="group relative flex h-full min-h-80 flex-col overflow-hidden rounded-xl border border-french_gray-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue_munsell-500 hover:shadow-lg dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<div
				className={`h-1.5 w-full ${isOverdue ? "bg-red-500" : accentClasses[project.status]}`}
			/>

			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[project.status]}`}
						>
							{statusLabels[project.status]}
						</span>
						{isOverdue && (
							<span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
								<Clock3 size={12} />
								Overdue
							</span>
						)}
					</div>
					<ProjectActions
						project={{
							id: project.id,
							name: project.name,
							description: project.description,
							status: project.status,
							dueDate: project.dueDate?.toISOString() ?? null,
						}}
						canManage={canManage}
						canDelete={canDelete}
						variant="compact"
					/>
				</div>

				<Link
					href={`/projects/${project.id}`}
					className="mt-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-500"
				>
					<h2 className="text-lg font-semibold text-outer_space-500 transition-colors group-hover:text-blue_munsell-600 dark:text-platinum-500">
						{project.name}
					</h2>
					<p className="mt-2 line-clamp-2 min-h-10 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						{project.description || "No description provided."}
					</p>
				</Link>

				<div className="mt-5 grid grid-cols-2 gap-3 text-sm text-paynes_gray-500 dark:text-french_gray-400">
					<span className="flex items-center gap-1.5">
						<Users size={16} />
						{memberCount} {memberCount === 1 ? "member" : "members"}
					</span>
					<span className="flex items-center gap-1.5">
						<CheckSquare size={16} />
						{completedTaskCount}/{taskCount} tasks
					</span>
					<span
						className={`col-span-2 flex items-center gap-1.5 ${
							isOverdue ? "font-medium text-red-600 dark:text-red-400" : ""
						}`}
					>
						<Calendar size={16} />
						{project.dueDate
							? `Due ${project.dueDate.toLocaleDateString()}`
							: "No due date"}
					</span>
				</div>

				<div className="mt-auto pt-5">
					<div className="mb-2 flex justify-between text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<span>Progress</span>
						<span className="font-medium">{progress}%</span>
					</div>
					<div
						className="h-2 overflow-hidden rounded-full bg-french_gray-300 dark:bg-paynes_gray-400"
						role="progressbar"
						aria-label={`${project.name} progress`}
						aria-valuenow={progress}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div
							className={`h-full rounded-full transition-all ${
								project.status === "completed"
									? "bg-green-500"
									: "bg-blue_munsell-500"
							}`}
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="mt-4 flex items-center justify-between border-t border-french_gray-200 pt-4 dark:border-paynes_gray-400">
						<span className="text-xs capitalize text-paynes_gray-500 dark:text-french_gray-400">
							{role} access
						</span>
						<Link
							href={`/projects/${project.id}`}
							className="flex items-center gap-1 text-sm font-medium text-blue_munsell-600 hover:underline dark:text-blue_munsell-400"
						>
							Open board
							<ArrowUpRight size={15} />
						</Link>
					</div>
				</div>
			</div>
		</article>
	);
}
