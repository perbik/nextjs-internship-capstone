"use client";

import { Pencil, Plus, X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
	createTaskAction,
	type TaskActionState,
	updateTaskAction,
} from "@/app/(dashboard)/projects/[id]/task-actions";
import { useUIStore } from "@/stores/ui-store";

export interface TaskMemberOption {
	id: string;
	name: string;
}

export interface TaskListOption {
	id: string;
	name: string;
}

export interface EditableTask {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	priority: "low" | "medium" | "high";
	dueDate: Date | null;
	assigneeId: string | null;
}

interface TaskModalProps {
	projectId: string;
	lists: TaskListOption[];
	members: TaskMemberOption[];
	initialListId?: string;
	task?: EditableTask;
}

const initialState: TaskActionState = { message: "" };

export function CreateTaskModal({
	projectId,
	lists,
	members,
	initialListId,
}: Omit<TaskModalProps, "task">) {
	return (
		<TaskModal
			projectId={projectId}
			lists={lists}
			members={members}
			initialListId={initialListId}
		/>
	);
}

export function EditTaskModal({
	projectId,
	lists,
	members,
	task,
}: TaskModalProps & { task: EditableTask }) {
	return (
		<TaskModal
			projectId={projectId}
			lists={lists}
			members={members}
			task={task}
		/>
	);
}

function TaskModal({
	projectId,
	lists,
	members,
	initialListId,
	task,
}: TaskModalProps) {
	const isEditing = Boolean(task);
	const modalId = isEditing
		? `edit-task:${task?.id}`
		: `create-task:${initialListId ?? "default"}`;
	const { activeModalId, openModal, closeModal } = useUIStore();
	const isOpen = activeModalId === modalId;
	const [state, formAction, isPending] = useActionState(
		isEditing ? updateTaskAction : createTaskAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			closeModal();
		}
	}, [closeModal, state]);

	return (
		<>
			<button
				type="button"
				onClick={() => openModal(modalId)}
				className={
					isEditing
						? "flex w-full items-center justify-between text-left"
						: "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-french_gray-300 p-3 text-sm text-paynes_gray-500 transition-colors hover:border-blue_munsell-500 hover:text-blue_munsell-500 dark:border-paynes_gray-400 dark:text-french_gray-400"
				}
			>
				{isEditing ? (
					<>
						<span className="sr-only">Edit {task?.title}</span>
						<Pencil size={14} className="ml-auto shrink-0" />
					</>
				) : (
					<>
						<Plus size={16} />
						Add task
					</>
				)}
			</button>

			{isOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-black/55 p-4"
						onPointerDown={(event) => event.stopPropagation()}
					>
						<div
							role="dialog"
							aria-modal="true"
							aria-labelledby="task-dialog-title"
							className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-outer_space-500"
						>
							<div className="mb-5 flex items-center justify-between">
								<h2
									id="task-dialog-title"
									className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500"
								>
									{isEditing ? "Edit task" : "Create task"}
								</h2>
								<button
									type="button"
									onClick={closeModal}
									aria-label="Close task dialog"
									className="rounded p-1 text-paynes_gray-500 hover:bg-platinum-500 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
								>
									<X size={20} />
								</button>
							</div>

							<form action={formAction} className="space-y-4">
								<input type="hidden" name="projectId" value={projectId} />
								{task && <input type="hidden" name="taskId" value={task.id} />}

								<TaskField
									label="Title"
									name="title"
									required
									maxLength={200}
									defaultValue={task?.title}
									error={state.errors?.title?.[0]}
								/>

								<div>
									<label
										htmlFor={`${task?.id ?? "new"}-task-description`}
										className="mb-1 block text-sm font-medium text-outer_space-500 dark:text-platinum-500"
									>
										Description
									</label>
									<textarea
										id={`${task?.id ?? "new"}-task-description`}
										name="description"
										rows={4}
										maxLength={1000}
										defaultValue={task?.description ?? ""}
										className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
									/>
									<FieldError message={state.errors?.description?.[0]} />
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<SelectField
										label="Column"
										name="listId"
										defaultValue={task?.listId ?? initialListId ?? lists[0]?.id}
										options={lists.map((list) => ({
											value: list.id,
											label: list.name,
										}))}
										error={state.errors?.listId?.[0]}
									/>
									<SelectField
										label="Priority"
										name="priority"
										defaultValue={task?.priority ?? "medium"}
										options={[
											{ value: "low", label: "Low" },
											{ value: "medium", label: "Medium" },
											{ value: "high", label: "High" },
										]}
										error={state.errors?.priority?.[0]}
									/>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<SelectField
										label="Assignee"
										name="assigneeId"
										defaultValue={task?.assigneeId ?? ""}
										options={[
											{ value: "", label: "Unassigned" },
											...members.map((member) => ({
												value: member.id,
												label: member.name,
											})),
										]}
										error={state.errors?.assigneeId?.[0]}
									/>
									<TaskField
										label="Due date"
										name="dueDate"
										type="date"
										defaultValue={
											task?.dueDate
												? new Date(task.dueDate).toISOString().slice(0, 10)
												: undefined
										}
										error={state.errors?.dueDate?.[0]}
									/>
								</div>

								{state.message && !state.success && (
									<p
										className="text-sm text-red-600 dark:text-red-400"
										role="alert"
									>
										{state.message}
									</p>
								)}

								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={closeModal}
										className="rounded-lg px-4 py-2 text-sm text-paynes_gray-500 hover:bg-platinum-500 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isPending}
										className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-60"
									>
										{isPending
											? "Saving..."
											: isEditing
												? "Save task"
												: "Create task"}
									</button>
								</div>
							</form>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

function TaskField({
	label,
	name,
	type = "text",
	required,
	maxLength,
	defaultValue,
	error,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	maxLength?: number;
	defaultValue?: string;
	error?: string;
}) {
	const id = `${defaultValue ?? "new"}-task-${name}`;

	return (
		<div>
			<label
				htmlFor={id}
				className="mb-1 block text-sm font-medium text-outer_space-500 dark:text-platinum-500"
			>
				{label}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				required={required}
				maxLength={maxLength}
				defaultValue={defaultValue}
				className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
			/>
			<FieldError message={error} />
		</div>
	);
}

function SelectField({
	label,
	name,
	defaultValue,
	options,
	error,
}: {
	label: string;
	name: string;
	defaultValue?: string;
	options: Array<{ value: string; label: string }>;
	error?: string;
}) {
	const id = `${defaultValue ?? "new"}-task-${name}`;

	return (
		<div>
			<label
				htmlFor={id}
				className="mb-1 block text-sm font-medium text-outer_space-500 dark:text-platinum-500"
			>
				{label}
			</label>
			<select
				id={id}
				name={name}
				defaultValue={defaultValue}
				className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
			>
				{options.map((option) => (
					<option key={option.value || "unassigned"} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<FieldError message={error} />
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	return message ? (
		<p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>
	) : null;
}
