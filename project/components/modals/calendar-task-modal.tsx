"use client";

import { Plus, X } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	createTaskAction,
	type TaskActionState,
} from "@/app/(dashboard)/projects/[id]/task-actions";

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
		<>
			<button
				type="button"
				disabled={projects.length === 0}
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-2 rounded-lg bg-blue_munsell-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Plus size={16} />
				Add event
			</button>

			{isOpen &&
				createPortal(
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
						<div
							role="dialog"
							aria-modal="true"
							aria-labelledby="calendar-task-title"
							className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-outer_space-500"
						>
							<div className="mb-5 flex items-center justify-between">
								<h2 id="calendar-task-title" className="text-xl font-semibold">
									Add task deadline
								</h2>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									aria-label="Close dialog"
									className="rounded p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
								>
									<X size={20} />
								</button>
							</div>

							<form action={formAction} className="space-y-4">
								<label className="block text-sm font-medium">
									Project
									<select
										name="projectId"
										value={projectId}
										onChange={(event) => setProjectId(event.target.value)}
										required
										className="mt-1 w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
									>
										{projects.map((option) => (
											<option key={option.id} value={option.id}>
												{option.name}
											</option>
										))}
									</select>
								</label>

								<div className="grid gap-4 sm:grid-cols-2">
									<Field label="Title" name="title" required maxLength={200} />
									<label className="block text-sm font-medium">
										Column
										<select
											name="listId"
											required
											className="mt-1 w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
										>
											{project?.lists.map((list) => (
												<option key={list.id} value={list.id}>
													{list.name}
												</option>
											))}
										</select>
									</label>
								</div>

								<label className="block text-sm font-medium">
									Description
									<textarea
										name="description"
										rows={3}
										maxLength={1000}
										className="mt-1 w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
									/>
								</label>

								<div className="grid gap-4 sm:grid-cols-3">
									<Field
										label="Due date"
										name="dueDate"
										type="date"
										required
										defaultValue={defaultDueDate}
									/>
									<Select
										label="Priority"
										name="priority"
										defaultValue="medium"
										options={[
											{ id: "low", name: "Low" },
											{ id: "medium", name: "Medium" },
											{ id: "high", name: "High" },
										]}
									/>
									<Select
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
													<input
														type="checkbox"
														name="labelIds"
														value={label.id}
													/>
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

								<div className="flex justify-end gap-3">
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="rounded-lg px-4 py-2 text-sm hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={
											isPending || !project || project.lists.length === 0
										}
										className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-50"
									>
										{isPending ? "Creating..." : "Create task"}
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
		<label className="block text-sm font-medium">
			{label}
			<input
				name={name}
				type={type}
				required={required}
				maxLength={maxLength}
				defaultValue={defaultValue}
				className="mt-1 w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
			/>
		</label>
	);
}

function Select({
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
	return (
		<label className="block text-sm font-medium">
			{label}
			<select
				name={name}
				defaultValue={defaultValue}
				className="mt-1 w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
			>
				{options.map((option) => (
					<option key={option.id || "empty"} value={option.id}>
						{option.name}
					</option>
				))}
			</select>
		</label>
	);
}
