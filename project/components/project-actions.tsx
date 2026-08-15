"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
import {
	deleteProjectAction,
	type ProjectActionState,
	updateProjectAction,
} from "@/app/(dashboard)/projects/actions";
import type { ProjectStatus } from "@/types";

interface ProjectActionsProps {
	project: {
		id: string;
		name: string;
		description: string | null;
		status: ProjectStatus;
		dueDate: string | null;
	};
	canManage: boolean;
	canDelete: boolean;
	variant?: "default" | "compact";
}

const initialState: ProjectActionState = { message: "" };

export function ProjectActions({
	project,
	canManage,
	canDelete,
	variant = "default",
}: ProjectActionsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const formId = useId();
	const [state, formAction, isPending] = useActionState(
		updateProjectAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			setIsOpen(false);
		}
	}, [state]);

	if (!canManage && !canDelete) {
		return null;
	}

	return (
		<>
			<div className="flex items-center gap-2">
				{canManage && (
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						aria-label={`Edit ${project.name}`}
						className={
							variant === "compact"
								? "rounded-md border border-french_gray-300 p-2 text-paynes_gray-500 transition-colors hover:border-blue_munsell-500 hover:text-blue_munsell-500 dark:border-paynes_gray-400 dark:text-french_gray-400"
								: "inline-flex items-center rounded-lg border border-french_gray-300 px-3 py-2 text-sm text-outer_space-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400"
						}
					>
						<Pencil size={16} className={variant === "default" ? "mr-2" : ""} />
						{variant === "default" && "Edit"}
					</button>
				)}

				{canDelete && (
					<form
						action={deleteProjectAction}
						onSubmit={(event) => {
							if (
								!window.confirm(
									"Delete this project? This can be restored from the database later.",
								)
							) {
								event.preventDefault();
							}
						}}
					>
						<input type="hidden" name="projectId" value={project.id} />
						<button
							type="submit"
							aria-label={`Delete ${project.name}`}
							className={
								variant === "compact"
									? "rounded-md border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
									: "inline-flex items-center rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
							}
						>
							<Trash2
								size={16}
								className={variant === "default" ? "mr-2" : ""}
							/>
							{variant === "default" && "Delete"}
						</button>
					</form>
				)}
			</div>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-outer_space-500">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500">
								Edit project
							</h2>
							<button
								type="button"
								aria-label="Close edit project dialog"
								onClick={() => setIsOpen(false)}
								className="rounded-md p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<X size={20} />
							</button>
						</div>

						<form action={formAction} className="space-y-4">
							<input type="hidden" name="projectId" value={project.id} />
							<EditField
								idPrefix={formId}
								label="Name"
								name="name"
								defaultValue={project.name}
								required
								error={state.errors?.name?.[0]}
							/>

							<div>
								<label
									htmlFor={`${formId}-edit-description`}
									className="mb-1 block text-sm font-medium"
								>
									Description
								</label>
								<textarea
									id={`${formId}-edit-description`}
									name="description"
									defaultValue={project.description ?? ""}
									rows={4}
									className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
								/>
								<EditError message={state.errors?.description?.[0]} />
							</div>

							<div>
								<label
									htmlFor={`${formId}-edit-status`}
									className="mb-1 block text-sm font-medium"
								>
									Status
								</label>
								<select
									id={`${formId}-edit-status`}
									name="status"
									defaultValue={project.status}
									className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
								>
									<option value="active">Active</option>
									<option value="completed">Completed</option>
									<option value="on_hold">On hold</option>
								</select>
								<EditError message={state.errors?.status?.[0]} />
							</div>

							<EditField
								idPrefix={formId}
								label="Due date"
								name="dueDate"
								type="date"
								defaultValue={project.dueDate?.slice(0, 10) ?? ""}
								error={state.errors?.dueDate?.[0]}
							/>

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
									onClick={() => setIsOpen(false)}
									className="rounded-lg px-4 py-2"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isPending}
									className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-white disabled:opacity-60"
								>
									{isPending ? "Saving..." : "Save changes"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

function EditField({
	idPrefix,
	label,
	name,
	type = "text",
	defaultValue,
	required = false,
	error,
}: {
	idPrefix: string;
	label: string;
	name: string;
	type?: string;
	defaultValue: string;
	required?: boolean;
	error?: string;
}) {
	const id = `${idPrefix}-edit-${name}`;

	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-sm font-medium">
				{label}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				defaultValue={defaultValue}
				required={required}
				className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 dark:border-paynes_gray-400 dark:bg-outer_space-400"
			/>
			<EditError message={error} />
		</div>
	);
}

function EditError({ message }: { message?: string }) {
	return message ? (
		<p className="mt-1 text-sm text-red-600">{message}</p>
	) : null;
}
