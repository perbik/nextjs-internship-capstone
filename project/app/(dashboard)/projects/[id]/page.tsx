import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectActions } from "@/components/project-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProjectBoard } from "@/lib/db/queries";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: projectId } = await params;
	const user = await requireCurrentUser();
	const board = await getProjectBoard(projectId, user.id);

	if (!board) {
		notFound();
	}

	const { project, membership } = board;
	const canManage =
		membership?.role === "owner" || membership?.role === "admin";
	const canDelete = project.ownerId === user.id;

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="flex items-start gap-3">
					<Link
						href="/projects"
						aria-label="Back to projects"
						className="rounded-lg p-2 transition-colors hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
							{project.name}
						</h1>
						<p className="mt-1 text-paynes_gray-500 dark:text-french_gray-500">
							{project.description || "No project description"}
						</p>
					</div>
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
				/>
			</div>

			<KanbanBoard
				projectId={project.id}
				lists={project.lists}
				canManage={canManage}
			/>
		</div>
	);
}
