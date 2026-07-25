import { ArrowLeft, RotateCcw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DebouncedSearchInput } from "@/components/debounced-search-input";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectActions } from "@/components/project-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProjectBoard } from "@/lib/db/queries";
import { taskFilterSchema } from "@/lib/validations";

function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const [{ id: projectId }, rawFilters] = await Promise.all([
		params,
		searchParams,
	]);
	const parsedFilters = taskFilterSchema.safeParse({
		q: firstValue(rawFilters.q),
		priority: firstValue(rawFilters.priority),
		assignee: firstValue(rawFilters.assignee),
	});
	const filters = parsedFilters.success ? parsedFilters.data : {};
	const hasFilters = Boolean(filters.q || filters.priority || filters.assignee);
	const hasDropdownFilters = Boolean(filters.priority || filters.assignee);
	const user = await requireCurrentUser();
	const board = await getProjectBoard(projectId, user.id, filters);

	if (!board) {
		notFound();
	}

	const { project, membership } = board;
	const canManage =
		membership?.role === "owner" || membership?.role === "admin";
	const canDelete = project.ownerId === user.id;
	const members = project.members.map(({ user: member }) => ({
		id: member.id,
		name:
			[member.firstName, member.lastName].filter(Boolean).join(" ") ||
			member.email,
	}));
	const matchingTaskCount = project.lists.reduce(
		(total, list) => total + list.tasks.length,
		0,
	);

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

			<form
				action={`/projects/${project.id}`}
				className="grid gap-3 rounded-xl border border-french_gray-300 bg-white p-4 md:grid-cols-[minmax(14rem,1fr)_10rem_13rem_auto] dark:border-paynes_gray-400 dark:bg-outer_space-500"
			>
				<DebouncedSearchInput
					initialValue={filters.q}
					placeholder="Search task title or description"
					maxLength={200}
					accessibleLabel="Search tasks"
				/>

				<label>
					<span className="sr-only">Filter by task priority</span>
					<select
						name="priority"
						defaultValue={filters.priority ?? ""}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<option value="">All priorities</option>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</label>

				<label>
					<span className="sr-only">Filter by task assignee</span>
					<select
						name="assignee"
						defaultValue={filters.assignee ?? ""}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<option value="">All assignees</option>
						<option value="unassigned">Unassigned</option>
						{members.map((member) => (
							<option key={member.id} value={member.id}>
								{member.name}
							</option>
						))}
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
							href={`/projects/${project.id}`}
							className="inline-flex items-center justify-center gap-2 rounded-lg border border-french_gray-300 px-3 text-sm text-paynes_gray-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
						>
							<RotateCcw size={16} />
							Reset filters
						</Link>
					)}
				</div>
			</form>

			{hasFilters && (
				<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
					Showing {matchingTaskCount} matching{" "}
					{matchingTaskCount === 1 ? "task" : "tasks"}
				</p>
			)}

			<KanbanBoard
				projectId={project.id}
				lists={project.lists}
				members={members}
				canManage={canManage}
			/>
		</div>
	);
}
