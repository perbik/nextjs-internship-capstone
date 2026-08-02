"use client";

import { Plus, X } from "lucide-react";
import { useActionState, useState } from "react";
import {
	createProjectAction,
	type ProjectActionState,
} from "@/app/(dashboard)/projects/actions";

const initialState: ProjectActionState = { message: "" };

export function CreateProjectModal({
	teams = [],
	defaultTeamId,
}: {
	teams?: Array<{ id: string; name: string }>;
	defaultTeamId?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		createProjectAction,
		initialState,
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center rounded-lg bg-blue_munsell-500 px-4 py-2 text-white transition-colors hover:bg-blue_munsell-600"
			>
				<Plus size={20} className="mr-2" />
				New Project
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-outer_space-500">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500">
								Create project
							</h2>
							<button
								type="button"
								aria-label="Close create project dialog"
								onClick={() => setIsOpen(false)}
								className="rounded-md p-1 text-paynes_gray-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<X size={20} />
							</button>
						</div>

						<form action={formAction} className="space-y-4">
							<ProjectField
								label="Name"
								name="name"
								required
								error={state.errors?.name?.[0]}
							/>

							<div>
								<label
									htmlFor="create-project-description"
									className="mb-1 block text-sm font-medium text-outer_space-500 dark:text-platinum-500"
								>
									Description
								</label>
								<textarea
									id="create-project-description"
									name="description"
									rows={4}
									className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
								/>
								<FieldError message={state.errors?.description?.[0]} />
							</div>

							<ProjectField
								label="Due date"
								name="dueDate"
								type="date"
								error={state.errors?.dueDate?.[0]}
							/>

							<div>
								<label
									htmlFor="create-project-team"
									className="mb-1 block text-sm font-medium text-outer_space-500 dark:text-platinum-500"
								>
									Team
								</label>
								<select
									id="create-project-team"
									name="teamId"
									required
									defaultValue={defaultTeamId ?? ""}
									className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-outer_space-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
								>
									<option value="" disabled>
										{teams.length === 0
											? "Create or administer a team first"
											: "Select a team"}
									</option>
									{teams.map((team) => (
										<option key={team.id} value={team.id}>
											{team.name}
										</option>
									))}
								</select>
								<FieldError message={state.errors?.teamId?.[0]} />
							</div>

							{state.message && (
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
									className="rounded-lg px-4 py-2 text-paynes_gray-500 hover:bg-platinum-500 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isPending || teams.length === 0}
									className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-white hover:bg-blue_munsell-600 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isPending ? "Creating..." : "Create project"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
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
				className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
			/>
			<FieldError message={error} />
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	return message ? (
		<p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
	) : null;
}
