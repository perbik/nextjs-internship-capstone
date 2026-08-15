"use client";

import { type ReactNode, useId, useMemo, useState } from "react";
import type { TaskActionState } from "@/app/(dashboard)/projects/[id]/task-actions";
import { NewLabelDialog } from "@/components/project/new-label-dialog";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type {
	EditableTask,
	TaskFormOptions,
} from "@/components/task/task-modal-types";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { dateKey } from "@/lib/calendar/date";

const TASK_PRIORITY_OPTIONS = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

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
		defaultDueDate,
		task,
		projectOptions,
	} = options;
	const [selectedProjectId, setSelectedProjectId] = useState(projectId);
	const descriptionId = `${useId()}-task-description`;
	const selectedProject = useMemo(
		() => projectOptions?.find((project) => project.id === selectedProjectId),
		[projectOptions, selectedProjectId],
	);
	// Dashboard forms follow the selected project; board forms stay on one project
	const activeProjectId = projectOptions ? selectedProjectId : projectId;
	// Project selection controls the available columns, members, and labels
	const activeLists = selectedProject?.lists ?? lists;
	const activeMembers = selectedProject?.members ?? members;
	const activeLabels = selectedProject?.labels ?? labels;
	const canManageActiveLabels =
		selectedProject?.canManageLabels ?? canManageLabels;
	const isEditing = Boolean(task);

	return (
		<form action={formAction} className="space-y-3 overflow-y-auto p-5 sm:p-6">
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
				// Board forms already know their project, so submit it without another field
				<input type="hidden" name="projectId" value={projectId} />
			)}
			{/* Editing requires the existing task ID for the update action */}
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
				<Label htmlFor={descriptionId}>Description</Label>
				<TextareaWithCounter
					id={descriptionId}
					name="description"
					rows={3}
					maxLength={1000}
					defaultValue={task?.description ?? ""}
					className="mt-1.5"
				/>
				<FieldError
					message={state.errors?.description?.[0]}
					className="text-xs"
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{/* Keys reset project-specific selections when the project changes */}
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
					options={TASK_PRIORITY_OPTIONS}
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
						task?.dueDate ? dateKey(new Date(task.dueDate)) : defaultDueDate
					}
					error={state.errors?.dueDate?.[0]}
				/>
			</div>

			<TaskLabelPicker
				labels={activeLabels}
				task={task}
				action={
					canManageActiveLabels && activeProjectId ? (
						<NewLabelDialog
							projectId={activeProjectId}
							trigger={
								<Button type="button" variant="outline" size="sm">
									Create a new label
								</Button>
							}
						/>
					) : null
				}
			/>

			{state.message && !state.success && (
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{state.message}
				</p>
			)}

			<DialogFooter className="pt-1">
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
	action,
}: {
	labels: TaskLabelOption[];
	task?: EditableTask;
	action?: ReactNode;
}) {
	return (
		<fieldset>
			<legend className="mb-2 w-full">
				<span className="flex items-center justify-between gap-3">
					<span className="text-sm font-medium">Labels</span>
					{/* Label creation opens in a portal to avoid nesting forms */}
					{action}
				</span>
			</legend>
			{labels.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{labels.map((label) => (
						<label
							key={label.id}
							className="flex cursor-pointer items-center gap-2 rounded-full border border-input px-2.5 py-1.5 text-xs "
						>
							{/* Repeated labelIds entries become an array in FormData */}
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
	const generatedId = useId();
	const id = `${generatedId}-task-${name}`;

	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			{type === "date" ? (
				<DatePickerField
					id={id}
					name={name}
					required={required}
					defaultValue={defaultValue}
					className="mt-1.5"
				/>
			) : (
				<Input
					id={id}
					name={name}
					type={type}
					required={required}
					maxLength={maxLength}
					defaultValue={defaultValue}
					className="mt-1.5"
				/>
			)}
			<FieldError message={error} className="text-xs" />
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
	const generatedId = useId();
	const id = `${generatedId}-task-${name}`;

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
			<FieldError message={error} className="text-xs" />
		</div>
	);
}
