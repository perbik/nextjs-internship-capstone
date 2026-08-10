"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useActionState, useEffect } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";

export type {
	EditableTask,
	TaskListOption,
	TaskMemberOption,
	TaskProjectOption,
} from "@/components/task/task-modal-types";

interface TaskModalProps extends TaskFormOptions {
	triggerVariant?: "board" | "dashboard";
	showTrigger?: boolean;
}

const initialState: TaskActionState = { message: "" };

export function CreateTaskModal({
	projectId,
	lists,
	members,
	labels,
	canManageLabels,
	initialListId,
}: Omit<TaskModalProps, "task">) {
	return (
		<TaskModal
			projectId={projectId}
			lists={lists}
			members={members}
			labels={labels}
			canManageLabels={canManageLabels}
			initialListId={initialListId}
		/>
	);
}

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

function TaskModal({
	projectId,
	lists,
	members,
	labels,
	canManageLabels = false,
	initialListId,
	task,
	projectOptions,
	triggerVariant = "board",
	showTrigger = true,
}: TaskModalProps) {
	const isEditing = Boolean(task);
	const modalId = isEditing
		? `edit-task:${task?.id}`
		: projectOptions
			? "create-task:dashboard"
			: `create-task:${initialListId ?? "default"}`;
	const { activeModalId, openModal, closeModal } = useUIStore();
	const isOpen = activeModalId === modalId;
	const [state, formAction, isPending] = useActionState(
		isEditing ? updateTaskAction : createTaskAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) closeModal();
	}, [closeModal, state.success]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => (open ? openModal(modalId) : closeModal())}
		>
			{showTrigger && (
				<DialogTrigger asChild>
					<TaskModalTrigger
						isEditing={isEditing}
						disabled={false}
						onOpen={() => openModal(modalId)}
						triggerVariant={triggerVariant}
						title={task?.title}
					/>
				</DialogTrigger>
			)}

			<DialogContent
				className={`${isEditing ? "max-w-6xl" : "max-w-2xl"} gap-0 overflow-hidden p-0`}
				onPointerDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
			>
				<DialogHeader className="border-b border-border px-6 py-4 pr-16">
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
							: "max-h-[calc(92vh-69px)] overflow-y-auto"
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
							task,
							projectOptions,
						}}
						onCancel={closeModal}
					/>
					{task && (
						<aside className="min-h-0 overflow-y-auto border-t border-border lg:border-l lg:border-t-0 ">
							<TaskDiscussion
								projectId={projectId}
								taskId={task.id}
								variant="sidebar"
							/>
						</aside>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function TaskModalTrigger({
	isEditing,
	disabled,
	onOpen,
	triggerVariant,
	title,
}: {
	isEditing: boolean;
	disabled: boolean;
	onOpen: () => void;
	triggerVariant: "board" | "dashboard";
	title?: string;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onOpen}
			className={
				isEditing
					? "flex w-full items-center justify-between text-left"
					: triggerVariant === "dashboard"
						? "flex h-[65px] w-full items-center gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-left text-sm font-semibold text-foreground hover:border-brand/30 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50    dark:hover:bg-brand/10"
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
							<Plus size={14} />
						</span>
					) : (
						<Plus size={16} />
					)}
					{triggerVariant === "dashboard" ? "Create New Task" : "Add Task"}
				</>
			)}
		</button>
	);
}
