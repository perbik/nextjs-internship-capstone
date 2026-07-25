import { FolderOpen } from "lucide-react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ProjectGrid } from "@/components/project-grid";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProjectSummariesForUser } from "@/lib/db/queries";

export default async function ProjectsPage() {
	const user = await requireCurrentUser();
	const projects = await getProjectSummariesForUser(user.id);

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Projects
					</h1>
					<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
						{projects.length === 0
							? "Create your first project to start organizing work."
							: `${projects.length} ${projects.length === 1 ? "project" : "projects"} available to you.`}
					</p>
				</div>
				<CreateProjectModal />
			</div>

			{projects.length > 0 ? (
				<ProjectGrid projects={projects} />
			) : (
				<div className="rounded-lg border border-dashed border-french_gray-300 bg-white px-6 py-14 text-center dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<FolderOpen size={40} className="mx-auto text-blue_munsell-500" />
					<h2 className="mt-4 text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						No projects yet
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Your projects will appear here after you create one or join a team
						project.
					</p>
				</div>
			)}
		</div>
	);
}
