import { FolderOpen, X } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { ProjectFilters } from "@/components/project/project-filters";
import { ProjectGrid } from "@/components/project/project-grid";
import { ProjectPagination } from "@/components/project/project-pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getManageableTeamsForUser,
	getProjectSummariesPageForUser,
} from "@/lib/db/queries";
import { projectFilterSchema } from "@/lib/validations";

// Use the first value when a URL parameter is repeated
function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

// Start from page one after changing the search
const PROJECT_SEARCH_RESET_PARAMS = ["page"];

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	// Validate URL filters before using them in database queries
	const rawFilters = await searchParams;
	const parsedFilters = projectFilterSchema.safeParse({
		q: firstValue(rawFilters.q),
		status: firstValue(rawFilters.status),
		role: firstValue(rawFilters.role),
		page: firstValue(rawFilters.page),
	});
	const filters = parsedFilters.success ? parsedFilters.data : { page: 1 };
	const hasFilters = Boolean(filters.q || filters.status || filters.role);
	const user = await requireCurrentUser();

	// Load project results and available teams at the same time
	const [projectPage, manageableTeams] = await Promise.all([
		getProjectSummariesPageForUser(user.id, filters),
		getManageableTeamsForUser(user.id),
	]);
	const { projects, page, totalPages } = projectPage;

	return (
		<div className="space-y-6">
			{/* Page heading and project actions */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="font-display text-3xl font-extrabold tracking-[-0.9px] text-foreground sm:text-4xl">
					Projects
				</h1>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="w-full sm:w-80 lg:w-96">
						<SearchBar
							initialValue={filters.q}
							placeholder="Search project name or description"
							maxLength={100}
							accessibleLabel="Search projects"
							variant="pill"
							resetParams={PROJECT_SEARCH_RESET_PARAMS}
						/>
					</div>
					<CreateProjectModal teams={manageableTeams} triggerVariant="pill" />
				</div>
			</div>

			{/* Project filters and paginated results */}
			<section className="rounded-[28px] border border-border bg-card p-4">
				<ProjectFilters
					status={filters.status}
					role={filters.role}
					pagination={
						<ProjectPagination
							filters={filters}
							page={page}
							totalPages={totalPages}
						/>
					}
				/>

				{projects.length > 0 ? (
					<ProjectGrid projects={projects} />
				) : (
					<div className="rounded-2xl border border-dashed border-input px-6 py-14 text-center">
						<FolderOpen size={40} className="mx-auto text-brand" />
						<h2 className="mt-4 font-display text-lg font-bold text-foreground">
							{hasFilters ? "No matching projects" : "No projects yet"}
						</h2>
						<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
							{hasFilters
								? "Try another search term or clear one of the active filters."
								: "Your projects will appear here after you create one or join a team project."}
						</p>
						{hasFilters && (
							<Button asChild variant="outline" className="mt-4 rounded-full">
								<Link href="/projects">
									<X size={16} />
									Clear filters
								</Link>
							</Button>
						)}
					</div>
				)}
			</section>
		</div>
	);
}
