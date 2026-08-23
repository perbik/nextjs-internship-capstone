import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { z } from "zod";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { formatProjectDate } from "@/components/project/card/utils/project-card-utils";
import { ProjectActions } from "@/components/project/project-actions";
import { ProjectCollaborators } from "@/components/project/project-collaborators";
import { ProjectCollaboratorsDialog } from "@/components/project/project-collaborators-dialog";
import { TaskFilters } from "@/components/task/task-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getEligibleTeamMembersForProject,
	getProjectBoard,
} from "@/lib/db/queries";
import { taskFilterSchema } from "@/lib/validations";

const PROJECT_ID_SCHEMA = z.uuid();

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

	// Validate route and filter values before using them in database queries
	const parsedProjectId = PROJECT_ID_SCHEMA.safeParse(projectId);
	if (!parsedProjectId.success) notFound();

	const parsedFilters = taskFilterSchema.safeParse({
		q: firstValue(rawFilters.q),
		priority: firstValue(rawFilters.priority),
		assignee: firstValue(rawFilters.assignee),
	});
	const filters = parsedFilters.success ? parsedFilters.data : {};
	const hasFilters = Boolean(filters.q || filters.priority || filters.assignee);
	const user = await requireCurrentUser();
	const boardResult = await getProjectBoard(
		parsedProjectId.data,
		user.id,
		filters,
	);

	if (boardResult.status === "not_found") notFound();
	if (boardResult.status === "forbidden") forbidden();

	const { project, membership } = boardResult;
	// Derive permissions from the authenticated user's project membership
	const actorRole =
		membership?.role === "owner" || membership?.role === "admin"
			? membership.role
			: null;
	const canManage = Boolean(actorRole);
	const canDelete = project.ownerId === user.id;
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
	// Convert relational task labels into the shape expected by the board
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
	const formattedDate = project.dueDate
		? formatProjectDate(project.dueDate)
		: null;
	const dateLabel = project.dueDate ? `Due on ${formattedDate}` : "No due date";

	return (
		<div className="min-w-0 max-w-full space-y-3">
			<section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<Button
							asChild
							size="icon"
							className="size-8 shrink-0 rounded-full border-border"
						>
							<Link href="/projects" aria-label="Back to projects">
								<ArrowLeft aria-hidden="true" />
							</Link>
						</Button>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="truncate font-display text-xl font-extrabold tracking-[-0.03em] text-foreground sm:text-2xl">
									{project.name}
								</h1>
								<Badge
									className={`shrink-0 border-0 px-2.5 py-0.5 text-[11px] font-bold ${status.classes}`}
								>
									{status.label}
								</Badge>
							</div>
							<p className="mt-0.5 max-w-2xl truncate text-sm text-muted-foreground">
								{project.description || "No project description"}
							</p>
						</div>
					</div>
					<div className="border-t border-border pt-3 lg:flex lg:items-center lg:gap-2 lg:border-0 lg:pt-0">
						<div className="mb-2 flex items-center gap-2 lg:mb-0">
							<ProjectCollaborators members={members} />
							<Badge
								variant="outline"
								className="gap-1.5 rounded-full border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground"
							>
								<CalendarDays
									className="size-3.5 text-brand"
									aria-hidden="true"
								/>
								{dateLabel}
							</Badge>
						</div>
						<div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
							{actorRole && (
								<ProjectCollaboratorsDialog
									projectId={project.id}
									members={members}
									actorRole={actorRole}
									eligibleMembers={availableTeamMembers}
								/>
							)}
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
					</div>
				</div>
			</section>

			<KanbanBoard
				projectId={project.id}
				lists={boardLists}
				members={members}
				labels={labels}
				canManage={canManage}
				dragEnabled={!hasFilters}
				initialTaskId={firstValue(rawFilters.task)}
				filterControl={
					<>
						<TaskFilters
							key="project-task-filters"
							projectId={project.id}
							query={filters.q}
							priority={filters.priority}
							assignee={filters.assignee}
							members={members}
						/>
						{hasFilters && (
							<p className="text-xs text-muted-foreground" aria-live="polite">
								Showing {matchingTaskCount} matching{" "}
								{matchingTaskCount === 1 ? "task" : "tasks"}
							</p>
						)}
					</>
				}
			/>
		</div>
	);
}
