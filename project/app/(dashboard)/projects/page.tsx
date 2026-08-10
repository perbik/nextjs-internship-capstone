import { FolderOpen, X } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { ProjectFilters } from "@/components/project/project-filters";
import { ProjectGrid } from "@/components/project/project-grid";
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getManageableTeamsForUser,
	getProjectSummariesForUser,
} from "@/lib/db/queries";
import { projectFilterSchema } from "@/lib/validations";

function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const rawFilters = await searchParams;
	const parsedFilters = projectFilterSchema.safeParse({
		q: firstValue(rawFilters.q),
		status: firstValue(rawFilters.status),
		role: firstValue(rawFilters.role),
	});
	const filters = parsedFilters.success ? parsedFilters.data : {};
	const hasFilters = Boolean(filters.q || filters.status || filters.role);
	const user = await requireCurrentUser();
	const [projects, manageableTeams] = await Promise.all([
		getProjectSummariesForUser(user.id, filters),
		getManageableTeamsForUser(user.id),
	]);

	return (
		<div>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="font-display text-4xl font-extrabold tracking-[-0.9px] text-foreground ">
					Projects
				</h1>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="w-full sm:w-80 lg:w-96">
						<DebouncedSearchInput
							initialValue={filters.q}
							placeholder="Search project name or description"
							maxLength={100}
							accessibleLabel="Search projects"
							variant="pill"
						/>
					</div>
					<CreateProjectModal teams={manageableTeams} triggerVariant="pill" />
				</div>
			</div>

			<section className="mt-6 rounded-[28px] border border-border bg-card p-5  ">
				<ProjectFilters status={filters.status} role={filters.role} />

				{projects.length > 0 ? (
					<ProjectGrid projects={projects} />
				) : (
					<div className="rounded-2xl border border-dashed border-input px-6 py-14 text-center ">
						<FolderOpen size={40} className="mx-auto text-brand" />
						<h2 className="mt-4 font-display text-lg font-bold text-foreground ">
							{hasFilters ? "No matching projects" : "No projects yet"}
						</h2>
						<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground ">
							{hasFilters
								? "Try another search term or clear one of the active filters."
								: "Your projects will appear here after you create one or join a team project."}
						</p>
						{hasFilters && (
							<Link
								href="/projects"
								className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background dark:border-white/20  dark:hover:bg-card/5"
							>
								<X size={16} />
								Clear filters
							</Link>
						)}
					</div>
				)}
			</section>
		</div>
	);
}
