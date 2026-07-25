import { Calendar, CheckSquare, Users } from "lucide-react";
import Link from "next/link";
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

export function ProjectCard({ summary }: ProjectCardProps) {
	const { project, memberCount, taskCount, completedTaskCount, role } = summary;
	const progress =
		taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);

	return (
		<Link
			href={`/projects/${project.id}`}
			className="group flex h-full flex-col rounded-lg border border-french_gray-300 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue_munsell-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-500"
		>
			<div className="mb-4 flex items-start justify-between gap-3">
				<span
					className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[project.status]}`}
				>
					{statusLabels[project.status]}
				</span>
				<span className="text-xs capitalize text-paynes_gray-500 dark:text-french_gray-400">
					{role}
				</span>
			</div>

			<h2 className="text-lg font-semibold text-outer_space-500 group-hover:text-blue_munsell-600 dark:text-platinum-500">
				{project.name}
			</h2>
			<p className="mt-2 line-clamp-2 min-h-10 text-sm text-paynes_gray-500 dark:text-french_gray-400">
				{project.description || "No description provided."}
			</p>

			<div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
				<span className="flex items-center gap-1.5">
					<Users size={16} />
					{memberCount} {memberCount === 1 ? "member" : "members"}
				</span>
				<span className="flex items-center gap-1.5">
					<CheckSquare size={16} />
					{completedTaskCount}/{taskCount} tasks
				</span>
				{project.dueDate && (
					<span className="flex items-center gap-1.5">
						<Calendar size={16} />
						{project.dueDate.toLocaleDateString()}
					</span>
				)}
			</div>

			<div className="mt-auto pt-5">
				<div className="mb-2 flex justify-between text-xs text-paynes_gray-500 dark:text-french_gray-400">
					<span>Progress</span>
					<span>{progress}%</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-french_gray-300 dark:bg-paynes_gray-400">
					<div
						className="h-full rounded-full bg-blue_munsell-500 transition-all"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</Link>
	);
}
