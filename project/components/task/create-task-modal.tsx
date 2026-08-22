"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	forwardRef,
	type ReactNode,
	useActionState,
	useEffect,
} from "react";
import {
	createTaskAction,
	type TaskActionState,
	updateTaskAction,
} from "@/app/(dashboard)/projects/[id]/task-actions";
import { TaskDiscussion } from "@/components/task/task-discussion";
import { TaskForm } from "@/components/task/task-form";
import type {
	EditableTask,
	TaskFormOptions,
	TaskProjectOption,
} from "@/components/task/task-modal-types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/ui-store";

interface TaskModalProps extends TaskFormOptions {
	triggerVariant?: "board" | "columnIcon" | "dashboard";
	trigger?: ReactNode;
	showTrigger?: boolean;
}

const initialState: TaskActionState = { message: "" };

// Board creation already knows the project and target column
export function CreateTaskModal({
	projectId,
	lists,
	members,
	labels,
	canManageLabels,
	initialListId,
	triggerVariant,
}: Omit<TaskModalProps, "task">) {
	return (
		<TaskModal
			projectId={projectId}
			lists={lists}
			members={members}
			labels={labels}
			canManageLabels={canManageLabels}
			initialListId={initialListId}
			triggerVariant={triggerVariant}
		/>
	);
}

// Editing reuses the task form and includes discussion and activity
export function EditTaskModal({
	projectId,
	lists,
	members,
	labels,
	canManageLabels,
	task,
	showTrigger = true,
}: TaskModalProps & { task: EditableTask; showTrigger?: boolean }) {
	return (
		<TaskModal
			projectId={projectId}
			lists={lists}
			members={members}
			labels={labels}
			canManageLabels={canManageLabels}
			task={task}
			showTrigger={showTrigger}
		/>
	);
}

// Dashboard creation lets the user choose the target project first
export function DashboardCreateTaskModal({
	projects,
}: {
	projects: TaskProjectOption[];
}) {
	const firstProject = projects[0];

	return (
		<TaskModal
			projectId={firstProject?.id ?? ""}
			lists={firstProject?.lists ?? []}
			members={firstProject?.members ?? []}
			labels={firstProject?.labels ?? []}
			canManageLabels={firstProject?.canManageLabels}
			projectOptions={projects}
			triggerVariant="dashboard"
		/>
	);
}

export function CalendarCreateTaskModal({
	projects,
	defaultDueDate,
}: {
	projects: TaskProjectOption[];
	defaultDueDate: string;
}) {
	const firstProject = projects[0];

	return (
		<TaskModal
			projectId={firstProject?.id ?? ""}
			lists={firstProject?.lists ?? []}
			members={firstProject?.members ?? []}
			labels={firstProject?.labels ?? []}
			canManageLabels={firstProject?.canManageLabels}
			projectOptions={projects}
			defaultDueDate={defaultDueDate}
			trigger={
				<Button type="button" size="sm" disabled={projects.length === 0}>
					<Plus aria-hidden="true" />
					Add Task
				</Button>
			}
		/>
	);
}

function TaskModal({
	projectId,
	lists,
	members,
	labels,
	canManageLabels = false,
	initialListId,
	defaultDueDate,
	task,
	projectOptions,
	triggerVariant = "board",
	trigger: customTrigger,
	showTrigger = true,
}: TaskModalProps) {
	const isEditing = Boolean(task);
	const modalId = isEditing
		? `edit-task:${task?.id}`
		: projectOptions
			? "create-task:project-picker"
			: `create-task:${initialListId ?? "default"}:${triggerVariant}`;
	const activeModalId = useUIStore((state) => state.activeModalId);
	const openModal = useUIStore((state) => state.openModal);
	const closeModal = useUIStore((state) => state.closeModal);
	const isOpen = activeModalId === modalId;
	const [state, formAction, isPending] = useActionState(
		isEditing ? updateTaskAction : createTaskAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) closeModal();
	}, [closeModal, state]);

	const triggerDisabled = isEditing
		? false
		: projectOptions
			? projectOptions.length === 0
			: lists.length === 0;
	const targetListName =
		lists.find((list) => list.id === initialListId)?.name ?? "column";
	const defaultTrigger = (
		<TaskModalTrigger
			isEditing={isEditing}
			disabled={triggerDisabled}
			triggerVariant={triggerVariant}
			title={task?.title ?? targetListName}
		/>
	);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => (open ? openModal(modalId) : closeModal())}
		>
			{showTrigger &&
				(customTrigger ? (
					<DialogTrigger asChild>{customTrigger}</DialogTrigger>
				) : triggerVariant === "columnIcon" ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
						</TooltipTrigger>
						<TooltipContent>
							Add task to column: {targetListName}
						</TooltipContent>
					</Tooltip>
				) : (
					<DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
				))}

			<DialogContent
				className={`${isEditing ? "max-w-6xl" : "max-h-[calc(100dvh-2rem)] max-w-2xl"} gap-0 overflow-hidden p-0`}
				// Prevent dialog controls from triggering card drag and keyboard handlers
				onPointerDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<DialogHeader className="border-b border-border px-5 py-3 pr-16 sm:px-6">
					<DialogTitle>
						{isEditing ? "Task Details" : "Create Task"}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{isEditing
							? "Update task details and review its discussion and activity."
							: "Create a task and assign its project details."}
					</DialogDescription>
				</DialogHeader>
				<div
					className={
						isEditing
							? "grid max-h-[calc(92vh-69px)] overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]"
							: "max-h-[calc(100dvh-6.5rem)] overflow-y-auto"
					}
				>
					<TaskForm
						formAction={formAction}
						state={state}
						isPending={isPending}
						options={{
							projectId,
							lists,
							members,
							labels,
							canManageLabels,
							initialListId,
							defaultDueDate,
							task,
							projectOptions,
						}}
						onCancel={closeModal}
					/>
					{/* Existing tasks show discussion beside the editable fields */}
					{task && (
						<aside className="min-h-0 overflow-y-auto border-t border-border lg:border-l lg:border-t-0 ">
							<TaskDiscussion taskId={task.id} variant="sidebar" />
						</aside>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

interface TaskModalTriggerProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
	isEditing: boolean;
	triggerVariant: "board" | "columnIcon" | "dashboard";
	title?: string;
}

const TaskModalTrigger = forwardRef<HTMLButtonElement, TaskModalTriggerProps>(
	({ isEditing, disabled, triggerVariant, title, ...triggerProps }, ref) => (
		<button
			ref={ref}
			type="button"
			disabled={disabled}
			aria-label={
				triggerVariant === "columnIcon"
					? `Add task to column: ${title}`
					: undefined
			}
			{...triggerProps}
			className={
				isEditing
					? "flex w-full items-center justify-between text-left"
					: triggerVariant === "dashboard"
						? "flex h-20 w-full items-center gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-left text-sm font-semibold text-foreground hover:border-brand/30 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-brand/10"
						: triggerVariant === "columnIcon"
							? "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand/5 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
							: "flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
			}
		>
			{isEditing ? (
				<>
					<span className="sr-only">Edit {title}</span>
					<MoreHorizontal size={15} className="ml-auto shrink-0" />
				</>
			) : (
				<>
					{triggerVariant === "dashboard" ? (
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
							<Plus size={14} aria-hidden="true" />
						</span>
					) : (
						<Plus size={16} aria-hidden="true" />
					)}
					{triggerVariant === "dashboard"
						? "Create New Task"
						: triggerVariant === "board"
							? "Add Task"
							: null}
				</>
			)}
		</button>
	),
);
TaskModalTrigger.displayName = "TaskModalTrigger";
