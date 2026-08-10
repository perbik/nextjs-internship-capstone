"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
	createTaskAction,
	type TaskActionState,
} from "@/app/(dashboard)/projects/[id]/task-actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CalendarProjectOption {
	id: string;
	name: string;
	lists: Array<{ id: string; name: string }>;
	members: Array<{ id: string; name: string; isCurrentUser: boolean }>;
	labels: Array<{ id: string; name: string; color: string }>;
}

const initialState: TaskActionState = { message: "" };

export function CalendarTaskModal({
	projects,
	defaultDueDate,
}: {
	projects: CalendarProjectOption[];
	defaultDueDate: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
	const [state, formAction, isPending] = useActionState(
		createTaskAction,
		initialState,
	);
	const project = useMemo(
		() => projects.find((option) => option.id === projectId),
		[projectId, projects],
	);

	useEffect(() => {
		if (state.success) setIsOpen(false);
	}, [state.success]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button type="button" size="sm" disabled={projects.length === 0}>
					<Plus size={16} />
					Add Event
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add task deadline</DialogTitle>
					<DialogDescription>
						Create a task and place its deadline on the calendar.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-5">
					<div>
						<Label htmlFor="calendar-task-project">Project</Label>
						<FormSelect
							id="calendar-task-project"
							name="projectId"
							value={projectId}
							onValueChange={setProjectId}
							required
							options={projects.map((option) => ({
								value: option.id,
								label: option.name,
							}))}
							triggerClassName="mt-1"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Title" name="title" required maxLength={200} />
						<div>
							<Label htmlFor="calendar-task-column">Column</Label>
							<FormSelect
								key={projectId}
								id="calendar-task-column"
								name="listId"
								required
								defaultValue={project?.lists[0]?.id}
								placeholder="Select a column"
								options={
									project?.lists.map((list) => ({
										value: list.id,
										label: list.name,
									})) ?? []
								}
								triggerClassName="mt-1"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="calendar-task-description">Description</Label>
						<Textarea
							id="calendar-task-description"
							name="description"
							rows={3}
							maxLength={1000}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
						<Field
							label="Due date"
							name="dueDate"
							type="date"
							required
							defaultValue={defaultDueDate}
						/>
						<SelectField
							label="Priority"
							name="priority"
							defaultValue="medium"
							options={[
								{ id: "low", name: "Low" },
								{ id: "medium", name: "Medium" },
								{ id: "high", name: "High" },
							]}
						/>
						<SelectField
							label="Assignee"
							name="assigneeId"
							options={[
								{ id: "", name: "Unassigned" },
								...(project?.members.map((member) => ({
									id: member.id,
									name: `${member.name}${member.isCurrentUser ? " (You)" : ""}`,
								})) ?? []),
							]}
						/>
					</div>

					{project && project.labels.length > 0 && (
						<fieldset>
							<legend className="mb-2 text-sm font-medium">Labels</legend>
							<div className="flex flex-wrap gap-2">
								{project.labels.map((label) => (
									<label
										key={label.id}
										className="flex items-center gap-2 rounded-full border border-french_gray-300 px-2.5 py-1.5 text-xs dark:border-paynes_gray-400"
									>
										<input type="checkbox" name="labelIds" value={label.id} />
										<span
											className="size-2.5 rounded-full"
											style={{ backgroundColor: label.color }}
										/>
										{label.name}
									</label>
								))}
							</div>
						</fieldset>
					)}

					{state.message && !state.success && (
						<p role="alert" className="text-sm text-red-600">
							{state.message}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending || !project || project.lists.length === 0}
						>
							{isPending ? "Creating..." : "Create task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	label,
	name,
	type = "text",
	required,
	maxLength,
	defaultValue,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	maxLength?: number;
	defaultValue?: string;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={`calendar-task-${name}`}>{label}</Label>
			<Input
				id={`calendar-task-${name}`}
				name={name}
				type={type}
				required={required}
				maxLength={maxLength}
				defaultValue={defaultValue}
			/>
		</div>
	);
}

function SelectField({
	label,
	name,
	options,
	defaultValue,
}: {
	label: string;
	name: string;
	options: Array<{ id: string; name: string }>;
	defaultValue?: string;
}) {
	const id = `calendar-task-${name}`;

	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<FormSelect
				id={id}
				name={name}
				defaultValue={defaultValue}
				options={options.map((option) => ({
					value: option.id,
					label: option.name,
				}))}
				triggerClassName="mt-1"
			/>
		</div>
	);
}
