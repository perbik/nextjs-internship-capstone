"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
import {
	deleteProjectAction,
	type ProjectActionState,
	updateProjectAction,
} from "@/app/(dashboard)/projects/actions";
import {
	ProjectLabels,
	type TaskLabelOption,
} from "@/components/project/project-labels";
import { Button } from "@/components/ui/button";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
	variant?: "default" | "compact" | "manage";
	labels?: TaskLabelOption[];
}

const initialState: ProjectActionState = { message: "" };

export function ProjectActions({
	project,
	canManage,
	canDelete,
	variant = "default",
	labels,
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
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<div className="flex items-center gap-2">
				{canManage && (
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						aria-label={`Edit ${project.name}`}
						className={
							variant === "compact"
								? "rounded-md border border-french_gray-300 p-2 text-paynes_gray-500 transition-colors hover:border-blue_munsell-500 hover:text-blue_munsell-500 dark:border-paynes_gray-400 dark:text-french_gray-400"
								: variant === "manage"
									? "inline-flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90"
									: "inline-flex items-center rounded-lg border border-french_gray-300 px-3 py-2 text-sm text-outer_space-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400"
						}
					>
						<Pencil size={16} className={variant === "default" ? "mr-2" : ""} />
						{variant === "default" && "Edit"}
						{variant === "manage" && "Manage Project"}
					</button>
				)}

				{canDelete && variant === "default" && (
					<DeleteProjectDialog
						projectId={project.id}
						projectName={project.name}
						compact
					/>
				)}
			</div>

			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Manage Project</DialogTitle>
					<DialogDescription>
						Update project details, status, due date, and labels.
					</DialogDescription>
				</DialogHeader>

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

					<div className="space-y-2">
						<Label htmlFor={`${formId}-edit-description`}>Description</Label>
						<Textarea
							id={`${formId}-edit-description`}
							name="description"
							defaultValue={project.description ?? ""}
							rows={4}
						/>
						<EditError message={state.errors?.description?.[0]} />
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${formId}-edit-status`}>Status</Label>
						<FormSelect
							id={`${formId}-edit-status`}
							name="status"
							defaultValue={project.status}
							options={[
								{ value: "active", label: "Active" },
								{ value: "completed", label: "Completed" },
								{ value: "on_hold", label: "On hold" },
							]}
						/>
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
						<p className="text-sm text-red-600 dark:text-red-400" role="alert">
							{state.message}
						</p>
					)}

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</form>

				{variant === "manage" && labels && (
					<div className="mt-5">
						<ProjectLabels
							projectId={project.id}
							labels={labels}
							canManage={canManage}
						/>
					</div>
				)}

				{canDelete && variant !== "default" && (
					<div className="mt-5 border-t border-border pt-4 ">
						<DeleteProjectDialog
							projectId={project.id}
							projectName={project.name}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function DeleteProjectDialog({
	projectId,
	projectName,
	compact = false,
}: {
	projectId: string;
	projectName: string;
	compact?: boolean;
}) {
	const [state, action, isPending] = useActionState(
		deleteProjectAction,
		initialState,
	);

	return (
		<DestructiveActionDialog
			title={`Delete ${projectName}?`}
			description="This project will be removed from the workspace. Its data remains recoverable from the database."
			action={action}
			fields={[{ name: "projectId", value: projectId }]}
			confirmLabel="Delete project"
			error={state.success ? undefined : state.message}
			trigger={
				<button
					type="button"
					disabled={isPending}
					aria-label={`Delete ${projectName}`}
					className={
						compact
							? "inline-flex items-center rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
							: "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
					}
				>
					<Trash2 size={16} className={compact ? "mr-2" : undefined} />
					{compact ? "Delete" : "Delete project"}
				</button>
			}
		/>
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
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				name={name}
				type={type}
				defaultValue={defaultValue}
				required={required}
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
