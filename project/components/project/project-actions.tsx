"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
	type HTMLInputTypeAttribute,
	useActionState,
	useEffect,
	useId,
	useState,
} from "react";
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
import { DatePickerField } from "@/components/ui/date-picker-field";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import type { ProjectStatus } from "@/lib/db/schema";

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
	variant: "compact" | "manage";
	labels?: TaskLabelOption[];
}

const initialState: ProjectActionState = { message: "" };
const PROJECT_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
	{ value: "on_hold", label: "On hold" },
] satisfies Array<{ value: ProjectStatus; label: string }>;

export function ProjectActions({
	project,
	canManage,
	canDelete,
	variant,
	labels,
}: ProjectActionsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const formId = useId();
	const projectFormId = `${formId}-project-form`;
	const [state, formAction, isPending] = useActionState(
		updateProjectAction,
		initialState,
	);

	// Close the dialog after a successful project update
	useEffect(() => {
		if (state.success) {
			setIsOpen(false);
		}
	}, [state.success]);

	if (!canManage && !canDelete) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<div className="flex items-center gap-2">
				{canManage && (
					<Button
						type="button"
						variant={variant === "manage" ? "default" : "outline"}
						size={variant === "compact" ? "icon" : "lg"}
						onClick={() => setIsOpen(true)}
						aria-label={`Edit ${project.name}`}
						className={
							variant === "compact" ? "size-9" : "h-9 rounded-full px-5"
						}
					>
						<Pencil aria-hidden="true" />
						{variant === "manage" && "Manage Project"}
					</Button>
				)}
			</div>

			<DialogContent className="gap-3 p-4 sm:max-w-2xl sm:p-5">
				<DialogHeader>
					<DialogTitle>Manage Project</DialogTitle>
					<DialogDescription>
						Update project details, status, due date, and labels.
					</DialogDescription>
				</DialogHeader>

				<form id={projectFormId} action={formAction} className="space-y-3">
					<input type="hidden" name="projectId" value={project.id} />
					<EditField
						idPrefix={formId}
						label="Name"
						name="name"
						defaultValue={project.name}
						required
						error={state.errors?.name?.[0]}
					/>

					<div className="space-y-1.5">
						<Label htmlFor={`${formId}-edit-description`}>Description</Label>
						<TextareaWithCounter
							id={`${formId}-edit-description`}
							name="description"
							defaultValue={project.description ?? ""}
							rows={3}
							maxLength={500}
						/>
						<FieldError message={state.errors?.description?.[0]} />
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor={`${formId}-edit-status`}>Status</Label>
							<FormSelect
								id={`${formId}-edit-status`}
								name="status"
								defaultValue={project.status}
								options={PROJECT_STATUS_OPTIONS}
							/>
							<FieldError message={state.errors?.status?.[0]} />
						</div>
						<EditField
							idPrefix={formId}
							label="Due date"
							name="dueDate"
							type="date"
							defaultValue={project.dueDate?.slice(0, 10) ?? ""}
							error={state.errors?.dueDate?.[0]}
						/>
					</div>

					{state.message && !state.success && (
						<p className="text-sm text-destructive" role="alert">
							{state.message}
						</p>
					)}
				</form>

				{/* Label creation uses its own form, so it stays outside the project form */}
				{variant === "manage" && labels && (
					<div>
						<ProjectLabels
							projectId={project.id}
							labels={labels}
							canManage={canManage}
						/>
					</div>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</Button>
					<Button type="submit" form={projectFormId} disabled={isPending}>
						{isPending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>

				{/* Project deletion only to authorized owners */}
				{canDelete && variant === "manage" && (
					<div className="border-t border-border pt-3">
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
}: {
	projectId: string;
	projectName: string;
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
				<Button
					type="button"
					variant="ghost"
					disabled={isPending}
					aria-label={`Delete ${projectName}`}
					className="text-destructive hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 size={16} />
					Delete project
				</Button>
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
	type?: HTMLInputTypeAttribute;
	defaultValue: string;
	required?: boolean;
	error?: string;
}) {
	const id = `${idPrefix}-edit-${name}`;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			{type === "date" ? (
				<DatePickerField
					id={id}
					name={name}
					defaultValue={defaultValue}
					required={required}
				/>
			) : (
				<Input
					id={id}
					name={name}
					type={type}
					defaultValue={defaultValue}
					required={required}
				/>
			)}
			<FieldError message={error} />
		</div>
	);
}
