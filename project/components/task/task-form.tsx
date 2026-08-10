"use client";

import { useMemo, useState } from "react";
import type { TaskActionState } from "@/app/(dashboard)/projects/[id]/task-actions";
import { InlineNewLabelForm } from "@/components/project/new-label-dialog";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type {
	EditableTask,
	TaskFormOptions,
} from "@/components/task/task-modal-types";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormProps {
	formAction: (payload: FormData) => void;
	state: TaskActionState;
	isPending: boolean;
	options: TaskFormOptions;
	onCancel: () => void;
}

export function TaskForm({
	formAction,
	state,
	isPending,
	options,
	onCancel,
}: TaskFormProps) {
	const {
		projectId,
		lists,
		members,
		labels,
		canManageLabels = false,
		initialListId,
		task,
		projectOptions,
	} = options;
	const [selectedProjectId, setSelectedProjectId] = useState(projectId);
	const selectedProject = useMemo(
		() => projectOptions?.find((project) => project.id === selectedProjectId),
		[projectOptions, selectedProjectId],
	);
	const activeProjectId = projectOptions ? selectedProjectId : projectId;
	const activeLists = selectedProject?.lists ?? lists;
	const activeMembers = selectedProject?.members ?? members;
	const activeLabels = selectedProject?.labels ?? labels;
	const canManageActiveLabels =
		selectedProject?.canManageLabels ?? canManageLabels;
	const isEditing = Boolean(task);

	return (
		<form action={formAction} className="space-y-4 overflow-y-auto p-6">
			{projectOptions ? (
				<div>
					<Label htmlFor="dashboard-task-project">Project</Label>
					<FormSelect
						id="dashboard-task-project"
						name="projectId"
						value={selectedProjectId}
						onValueChange={setSelectedProjectId}
						options={projectOptions.map((project) => ({
							value: project.id,
							label: project.name,
						}))}
						required
					/>
				</div>
			) : (
				<input type="hidden" name="projectId" value={projectId} />
			)}
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
				<Label htmlFor={`${task?.id ?? "new"}-task-description`}>
					Description
				</Label>
				<Textarea
					id={`${task?.id ?? "new"}-task-description`}
					name="description"
					rows={4}
					maxLength={1000}
					defaultValue={task?.description ?? ""}
					className="mt-1.5"
				/>
				<FieldError message={state.errors?.description?.[0]} />
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<SelectField
					key={`${activeProjectId}-column`}
					label="Column"
					name="listId"
					defaultValue={task?.listId ?? initialListId ?? activeLists[0]?.id}
					options={activeLists.map((list) => ({
						value: list.id,
						label: list.name,
					}))}
					placeholder="No columns available"
					disabled={activeLists.length === 0}
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
					key={`${activeProjectId}-assignee`}
					label="Assignee"
					name="assigneeId"
					defaultValue={task?.assigneeId ?? ""}
					options={[
						{ value: "", label: "Unassigned" },
						...activeMembers.map((member) => ({
							value: member.id,
							label: `${member.name}${member.isCurrentUser ? " (You)" : ""}`,
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

			<TaskLabelPicker labels={activeLabels} task={task} />
			{canManageActiveLabels && activeProjectId && (
				<InlineNewLabelForm projectId={activeProjectId} />
			)}

			{state.message && !state.success && (
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{state.message}
				</p>
			)}

			<DialogFooter className="pt-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isPending || !activeProjectId || activeLists.length === 0}
				>
					{isPending ? "Saving..." : isEditing ? "Save task" : "Create task"}
				</Button>
			</DialogFooter>
		</form>
	);
}

function TaskLabelPicker({
	labels,
	task,
}: {
	labels: TaskLabelOption[];
	task?: EditableTask;
}) {
	return (
		<fieldset>
			<legend className="mb-2 text-sm font-medium">Labels</legend>
			{labels.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{labels.map((label) => (
						<label
							key={label.id}
							className="flex cursor-pointer items-center gap-2 rounded-full border border-input px-2.5 py-1.5 text-xs "
						>
							<input
								type="checkbox"
								name="labelIds"
								value={label.id}
								defaultChecked={task?.labels.some(
									(taskLabel) => taskLabel.id === label.id,
								)}
								className="size-3.5 accent-brand"
							/>
							<span
								aria-hidden="true"
								className="size-2.5 rounded-full"
								style={{ backgroundColor: label.color }}
							/>
							{label.name}
						</label>
					))}
				</div>
			) : (
				<p className="text-xs text-muted-foreground">
					No project labels are available yet.
				</p>
			)}
		</fieldset>
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
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				name={name}
				type={type}
				required={required}
				maxLength={maxLength}
				defaultValue={defaultValue}
				className="mt-1.5"
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
	placeholder,
	disabled,
	error,
}: {
	label: string;
	name: string;
	defaultValue?: string;
	options: Array<{ value: string; label: string }>;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
}) {
	const id = `${defaultValue ?? "new"}-task-${name}`;

	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<FormSelect
				id={id}
				name={name}
				defaultValue={defaultValue}
				options={options}
				placeholder={placeholder}
				disabled={disabled}
				triggerClassName="mt-1.5"
			/>
			<FieldError message={error} />
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	return message ? (
		<p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>
	) : null;
}
