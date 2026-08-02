import { FolderOpen, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ProjectGrid } from "@/components/project-grid";
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
	const hasDropdownFilters = Boolean(filters.status || filters.role);
	const user = await requireCurrentUser();
	const [projects, manageableTeams] = await Promise.all([
		getProjectSummariesForUser(user.id, filters),
		getManageableTeamsForUser(user.id),
	]);

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-french_gray-300 bg-white p-5 sm:p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
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
					<CreateProjectModal teams={manageableTeams} />
				</div>
			</div>

			<form
				action="/projects"
				className="grid gap-3 rounded-xl border border-french_gray-300 bg-white p-4 md:grid-cols-[minmax(14rem,1fr)_11rem_11rem_auto] dark:border-paynes_gray-400 dark:bg-outer_space-500"
			>
				<DebouncedSearchInput
					initialValue={filters.q}
					placeholder="Search name or description"
					maxLength={100}
					accessibleLabel="Search projects"
				/>

				<label>
					<span className="sr-only">Filter by project status</span>
					<select
						name="status"
						defaultValue={filters.status ?? ""}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<option value="">All statuses</option>
						<option value="active">Active</option>
						<option value="completed">Completed</option>
						<option value="on_hold">On hold</option>
					</select>
				</label>

				<label>
					<span className="sr-only">Filter by project role</span>
					<select
						name="role"
						defaultValue={filters.role ?? ""}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<option value="">All roles</option>
						<option value="owner">Owner</option>
						<option value="admin">Admin</option>
						<option value="member">Member</option>
					</select>
				</label>

				<div className="flex gap-2">
					<button
						type="submit"
						className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600"
					>
						<SlidersHorizontal size={16} />
						Apply
					</button>
					{hasDropdownFilters && (
						<Link
							href="/projects"
							className="inline-flex items-center justify-center gap-2 rounded-lg border border-french_gray-300 px-3 text-sm text-paynes_gray-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
						>
							<RotateCcw size={16} />
							Reset filters
						</Link>
					)}
				</div>
			</form>

			{projects.length > 0 ? (
				<div className="space-y-3">
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Showing {projects.length} matching{" "}
						{projects.length === 1 ? "project" : "projects"}
					</p>
					<ProjectGrid projects={projects} />
				</div>
			) : (
				<div className="rounded-lg border border-dashed border-french_gray-300 bg-white px-6 py-14 text-center dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<FolderOpen size={40} className="mx-auto text-blue_munsell-500" />
					<h2 className="mt-4 text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						{hasFilters ? "No matching projects" : "No projects yet"}
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm text-paynes_gray-500 dark:text-french_gray-400">
						{hasFilters
							? "Try another search term or clear one of the active filters."
							: "Your projects will appear here after you create one or join a team project."}
					</p>
					{hasFilters && (
						<Link
							href="/projects"
							className="mt-4 inline-flex items-center gap-2 rounded-lg border border-french_gray-300 px-4 py-2 text-sm font-medium text-outer_space-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400"
						>
							<X size={16} />
							Clear filters
						</Link>
					)}
				</div>
			)}
		</div>
	);
}
