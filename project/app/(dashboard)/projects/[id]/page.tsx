import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ProjectActions } from "@/components/project/project-actions";
import { ProjectCollaborators } from "@/components/project/project-collaborators";
import { ProjectCollaboratorsDialog } from "@/components/project/project-collaborators-dialog";
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input";
import { TaskFilters } from "@/components/task/task-filters";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getEligibleTeamMembersForProject,
	getManageableTeamsForUser,
	getProjectBoard,
} from "@/lib/db/queries";
import { taskFilterSchema } from "@/lib/validations";

function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

const statusDetails = {
	active: { label: "Active", classes: "bg-[#2986ff] text-white" },
	completed: { label: "Completed", classes: "bg-[#66c24b] text-white" },
	on_hold: { label: "On Hold", classes: "bg-[#ffbb00] text-[#51421a]" },
} as const;

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
	const user = await requireCurrentUser();
	const board = await getProjectBoard(projectId, user.id, filters);

	if (!board) notFound();

	const { project, membership } = board;
	const canManage =
		membership?.role === "owner" || membership?.role === "admin";
	const canDelete = project.ownerId === user.id;
	const manageableTeams =
		canDelete && !project.teamId
			? await getManageableTeamsForUser(user.id)
			: [];
	const members = project.members.map(({ user: member, role }) => ({
		id: member.id,
		name:
			[member.firstName, member.lastName].filter(Boolean).join(" ") ||
			member.email,
		email: member.email,
		role,
		isCurrentUser: member.id === user.id,
	}));
	const eligibleTeamMembers = canManage
		? await getEligibleTeamMembersForProject(project.id, user.id)
		: [];
	const projectMemberIds = new Set(members.map(({ id }) => id));
	const availableTeamMembers = eligibleTeamMembers
		.filter(({ user: eligibleUser }) => !projectMemberIds.has(eligibleUser.id))
		.map(({ user: eligibleUser }) => ({
			id: eligibleUser.id,
			name:
				[eligibleUser.firstName, eligibleUser.lastName]
					.filter(Boolean)
					.join(" ") || eligibleUser.email,
			email: eligibleUser.email,
		}));
	const labels = project.labels.map((label) => ({
		id: label.id,
		name: label.name,
		color: label.color,
	}));
	const boardLists = project.lists.map((list) => ({
		...list,
		tasks: list.tasks.map((task) => ({
			...task,
			labels: task.taskLabels.map(({ label }) => ({
				id: label.id,
				name: label.name,
				color: label.color,
			})),
		})),
	}));
	const matchingTaskCount = boardLists.reduce(
		(total, list) => total + list.tasks.length,
		0,
	);
	const status = statusDetails[project.status];
	const formattedDate = project.dueDate?.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
	const dateLabel = project.dueDate
		? project.status === "completed"
			? `Completed on ${formattedDate}`
			: project.status === "on_hold"
				? `Paused until ${formattedDate}`
				: `Due on ${formattedDate}`
		: "No due date";

	return (
		<div className="min-w-0 max-w-full space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="min-w-0 flex-1">
					<DebouncedSearchInput
						initialValue={filters.q}
						placeholder="Search task title or description"
						maxLength={200}
						accessibleLabel="Search tasks"
						variant="pill"
					/>
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
					variant="manage"
					labels={labels}
				/>
			</div>

			<section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,0.06)]  ">
				<div className="flex items-center justify-between border-b border-border px-4 py-2.5 ">
					<Link
						href="/projects"
						className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted px-3 text-sm font-semibold text-muted-foreground hover:text-brand  dark:bg-card/5"
					>
						<ArrowLeft size={14} />
						Back
					</Link>
					<span
						className={`rounded-full px-4 py-1.5 text-sm font-bold ${status.classes}`}
					>
						{status.label}
					</span>
				</div>

				<div className="px-5 py-4">
					<h1 className="font-display text-3xl font-extrabold tracking-[-0.75px] text-foreground ">
						{project.name}
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						{project.description || "No project description"}
					</p>
				</div>

				<div className="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center ">
					<ProjectCollaborators members={members} variant="stack" />
					{canManage && membership && (
						<ProjectCollaboratorsDialog
							projectId={project.id}
							members={members}
							actorRole={membership.role as "owner" | "admin"}
							eligibleMembers={availableTeamMembers}
							manageableTeams={manageableTeams}
							showTeamAssignment={canDelete && !project.teamId}
						/>
					)}
					<span className="rounded-full bg-[#4c99ff]/13 px-4 py-2 text-sm font-semibold text-[#1a4fa0]">
						{dateLabel}
					</span>
				</div>
			</section>

			{hasFilters && (
				<p className="text-sm text-muted-foreground">
					Showing {matchingTaskCount} matching{" "}
					{matchingTaskCount === 1 ? "task" : "tasks"}
				</p>
			)}

			<KanbanBoard
				projectId={project.id}
				lists={boardLists}
				members={members}
				labels={labels}
				canManage={canManage}
				dragEnabled={!hasFilters}
				filterControl={
					<TaskFilters
						key="project-task-filters"
						projectId={project.id}
						priority={filters.priority}
						assignee={filters.assignee}
						members={members}
					/>
				}
			/>
		</div>
	);
}
