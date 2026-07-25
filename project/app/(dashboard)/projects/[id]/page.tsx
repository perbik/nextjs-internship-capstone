import { auth } from "@clerk/nextjs/server";
import {
	ArrowLeft,
	Calendar,
	MoreHorizontal,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectActions } from "@/components/project-actions";
import {
	getProjectById,
	getProjectMembership,
	getUserByClerkId,
} from "@/lib/db/queries";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id: projectId }, { userId: clerkId }] = await Promise.all([
		params,
		auth(),
	]);

	if (!clerkId) {
		notFound();
	}

	const user = await getUserByClerkId(clerkId);

	if (!user) {
		throw new Error("Your ProjectFlow account is not synchronized yet");
	}

	const [project, membership] = await Promise.all([
		getProjectById(projectId, user.id),
		getProjectMembership(projectId, user.id),
	]);

	if (!project) {
		notFound();
	}

	const canManage =
		membership?.role === "owner" || membership?.role === "admin";
	const canDelete = project.ownerId === user.id;

	return (
		<div className="space-y-6">
			{/* Project Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link
						href="/projects"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
							{project.name}
						</h1>
						<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-1">
							{project.description || "No project description"}
						</p>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button
						type="button"
						aria-label="Project members"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Users size={20} />
					</button>
					<button
						type="button"
						aria-label="Project calendar"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Calendar size={20} />
					</button>
					<button
						type="button"
						aria-label="Project settings"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Settings size={20} />
					</button>
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
					/>
				</div>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
					🎯 Kanban Board Implementation Tasks
				</h3>
				<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<li>• Task 5.1: Design responsive Kanban board layout</li>
					<li>
						• Task 5.2: Implement drag-and-drop functionality with dnd-kit
					</li>
					<li>
						• Task 5.4: Implement optimistic UI updates for smooth interactions
					</li>
					<li>• Task 5.6: Create task detail modals and editing interfaces</li>
				</ul>
			</div>

			{/* Kanban Board Placeholder */}
			<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
				<div className="flex space-x-6 overflow-x-auto pb-4">
					{["To Do", "In Progress", "Review", "Done"].map((columnTitle) => (
						<div key={columnTitle} className="shrink-0 w-80">
							<div className="bg-platinum-800 dark:bg-outer_space-400 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400">
								<div className="p-4 border-b border-french_gray-300 dark:border-paynes_gray-400">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
											{columnTitle}
											<span className="ml-2 px-2 py-1 text-xs bg-french_gray-300 dark:bg-paynes_gray-400 rounded-full">
												{Math.floor(Math.random() * 5) + 1}
											</span>
										</h3>
										<button
											type="button"
											aria-label={`More actions for ${columnTitle}`}
											className="p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded"
										>
											<MoreHorizontal size={16} />
										</button>
									</div>
								</div>

								<div className="p-4 space-y-3 min-h-100">
									{[1, 2, 3].map((taskIndex) => (
										<div
											key={taskIndex}
											className="p-4 bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 cursor-pointer hover:shadow-md transition-shadow"
										>
											<h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-2">
												Sample Task {taskIndex}
											</h4>
											<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400 mb-3">
												This is a placeholder task description
											</p>
											<div className="flex items-center justify-between">
												<span className="px-2 py-1 text-xs font-medium rounded-full bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300">
													Medium
												</span>
												<div className="w-6 h-6 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
													U
												</div>
											</div>
										</div>
									))}

									<button
										type="button"
										className="w-full p-3 border-2 border-dashed border-french_gray-300 dark:border-paynes_gray-400 rounded-lg text-paynes_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors"
									>
										+ Add task
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Component Implementation Guide */}
			<div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
				<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
					🛠️ Components & Features to Implement
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
					<div>
						<strong className="block mb-2">Core Components:</strong>
						<ul className="space-y-1 list-disc list-inside">
							<li>components/kanban-board.tsx</li>
							<li>components/task-card.tsx</li>
							<li>components/modals/create-task-modal.tsx</li>
							<li>stores/board-store.ts (Zustand)</li>
						</ul>
					</div>
					<div>
						<strong className="block mb-2">Advanced Features:</strong>
						<ul className="space-y-1 list-disc list-inside">
							<li>Drag & drop with @dnd-kit/core</li>
							<li>Real-time updates</li>
							<li>Task assignments & due dates</li>
							<li>Comments & activity history</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
