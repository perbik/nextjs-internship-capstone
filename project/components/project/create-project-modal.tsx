"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import {
	createProjectAction,
	type ProjectActionState,
} from "@/app/(dashboard)/projects/actions";
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

const initialState: ProjectActionState = { message: "" };

export function CreateProjectModal({
	teams = [],
	defaultTeamId,
	dashboardLabel = false,
	triggerVariant = "default",
}: {
	teams?: Array<{ id: string; name: string }>;
	defaultTeamId?: string;
	dashboardLabel?: boolean;
	triggerVariant?: "default" | "pill" | "projectChip";
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		createProjectAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) setIsOpen(false);
	}, [state.success]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className={
						dashboardLabel
							? "flex h-16.25 w-full items-center gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-left text-sm font-semibold text-foreground hover:border-brand/30 hover:bg-brand/5    dark:hover:bg-brand/10"
							: triggerVariant === "pill"
								? "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
								: triggerVariant === "projectChip"
									? "inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-brand bg-card px-4 text-xs font-semibold text-brand transition-colors hover:bg-brand/5"
									: "inline-flex items-center rounded-lg bg-blue_munsell-500 px-4 py-2 text-white transition-colors hover:bg-blue_munsell-600"
					}
				>
					{dashboardLabel ? (
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
					{dashboardLabel ? "Create New Project" : "New Project"}
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
					<DialogDescription>
						Set up the project details and assign its team.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-4">
					<ProjectField
						label="Name"
						name="name"
						required
						error={state.errors?.name?.[0]}
					/>

					<div className="space-y-2">
						<Label htmlFor="create-project-description">Description</Label>
						<Textarea
							id="create-project-description"
							name="description"
							rows={4}
						/>
						<FieldError message={state.errors?.description?.[0]} />
					</div>

					<ProjectField
						label="Due date"
						name="dueDate"
						type="date"
						error={state.errors?.dueDate?.[0]}
					/>

					<div className="space-y-2">
						<Label htmlFor="create-project-team">Team</Label>
						<FormSelect
							id="create-project-team"
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
						<p className="text-sm text-red-600 dark:text-red-400" role="alert">
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
						<Button type="submit" disabled={isPending || teams.length === 0}>
							{isPending ? "Creating..." : "Create project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ProjectField({
	label,
	name,
	type = "text",
	required = false,
	error,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	error?: string;
}) {
	const id = `create-project-${name}`;

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Input id={id} name={name} type={type} required={required} />
			<FieldError message={error} />
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	return message ? (
		<p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
	) : null;
}
