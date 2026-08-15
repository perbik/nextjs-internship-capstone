"use client";

import { Plus } from "lucide-react";
import {
	type HTMLInputTypeAttribute,
	useActionState,
	useEffect,
	useId,
	useState,
} from "react";
import {
	createProjectAction,
	type ProjectActionState,
} from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

interface CreateProjectModalProps {
	teams?: Array<{ id: string; name: string }>;
	defaultTeamId?: string;
	triggerVariant?: "default" | "dashboard" | "pill" | "projectChip";
}

interface CreateProjectFormProps {
	teams: Array<{ id: string; name: string }>;
	defaultTeamId?: string;
	onCancel: () => void;
	onCreated: () => void;
}

const INITIAL_PROJECT_STATE: ProjectActionState = { message: "" };

export function CreateProjectModal({
	teams = [],
	defaultTeamId,
	triggerVariant = "default",
}: CreateProjectModalProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant={triggerVariant === "default" ? "default" : undefined}
					className={
						triggerVariant === "dashboard"
							? "flex h-20 w-full items-center justify-start gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-left text-sm font-semibold text-foreground hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/10"
							: triggerVariant === "pill"
								? "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
								: triggerVariant === "projectChip"
									? "inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-brand bg-card px-4 text-xs font-semibold text-brand transition-colors hover:bg-brand/5"
									: undefined
					}
				>
					{triggerVariant === "dashboard" ? (
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
							<Plus size={14} />
						</span>
					) : (
						<Plus
							size={
								triggerVariant === "pill" || triggerVariant === "projectChip"
									? 16
									: 20
							}
							className={
								triggerVariant === "pill" || triggerVariant === "projectChip"
									? ""
									: "mr-2"
							}
						/>
					)}
					{triggerVariant === "dashboard"
						? "Create New Project"
						: "New Project"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
					<DialogDescription>
						Set up the project details and assign its team.
					</DialogDescription>
				</DialogHeader>

				{/* Mount the form only while open so each session starts with fresh action state */}
				{isOpen && (
					<CreateProjectForm
						teams={teams}
						defaultTeamId={defaultTeamId}
						onCancel={() => setIsOpen(false)}
						onCreated={() => setIsOpen(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function CreateProjectForm({
	teams,
	defaultTeamId,
	onCancel,
	onCreated,
}: CreateProjectFormProps) {
	const formId = useId();
	const [state, formAction, isPending] = useActionState(
		createProjectAction,
		INITIAL_PROJECT_STATE,
	);

	useEffect(() => {
		if (state.success) onCreated();
	}, [onCreated, state]);

	return (
		<form action={formAction} className="space-y-4">
			<ProjectField
				idPrefix={formId}
				label="Name"
				name="name"
				required
				error={state.errors?.name?.[0]}
			/>

			<div className="space-y-2">
				<Label htmlFor={`${formId}-description`}>Description</Label>
				<TextareaWithCounter
					id={`${formId}-description`}
					name="description"
					rows={4}
					maxLength={500}
				/>
				<FieldError message={state.errors?.description?.[0]} />
			</div>

			<ProjectField
				idPrefix={formId}
				label="Due date"
				name="dueDate"
				type="date"
				error={state.errors?.dueDate?.[0]}
			/>

			<div className="space-y-2">
				<Label htmlFor={`${formId}-team`}>Team</Label>
				{/* Only teams managed by the user can own a new project */}
				<FormSelect
					id={`${formId}-team`}
					name="teamId"
					required
					defaultValue={defaultTeamId ?? ""}
					disabled={teams.length === 0}
					placeholder={
						teams.length === 0
							? "Create or administer a team first"
							: "Select a team"
					}
					options={teams.map((team) => ({
						value: team.id,
						label: team.name,
					}))}
				/>
				<FieldError message={state.errors?.teamId?.[0]} />
			</div>

			{state.message && (
				<p className="text-sm text-destructive" role="alert">
					{state.message}
				</p>
			)}

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending || teams.length === 0}>
					{isPending ? "Creating..." : "Create project"}
				</Button>
			</DialogFooter>
		</form>
	);
}

function ProjectField({
	idPrefix,
	label,
	name,
	type = "text",
	required = false,
	error,
}: {
	idPrefix: string;
	label: string;
	name: string;
	type?: HTMLInputTypeAttribute;
	required?: boolean;
	error?: string;
}) {
	const id = `${idPrefix}-${name}`;

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			{type === "date" ? (
				<DatePickerField id={id} name={name} required={required} />
			) : (
				<Input id={id} name={name} type={type} required={required} />
			)}
			<FieldError message={error} />
		</div>
	);
}
