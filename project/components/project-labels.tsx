"use client";

import { Plus, Tag, X } from "lucide-react";
import { useActionState } from "react";
import {
	createLabelAction,
	deleteLabelAction,
	type LabelActionState,
} from "@/app/(dashboard)/projects/[id]/label-actions";

export interface TaskLabelOption {
	id: string;
	name: string;
	color: string;
}

interface ProjectLabelsProps {
	projectId: string;
	labels: TaskLabelOption[];
	canManage: boolean;
}

const initialState: LabelActionState = { message: "" };

const labelColors = [
	{ name: "Blue", value: "#2389A8" },
	{ name: "Green", value: "#22C55E" },
	{ name: "Yellow", value: "#EAB308" },
	{ name: "Orange", value: "#F97316" },
	{ name: "Red", value: "#EF4444" },
	{ name: "Purple", value: "#A855F7" },
] as const;

export function ProjectLabels({
	projectId,
	labels,
	canManage,
}: ProjectLabelsProps) {
	const [state, action, isPending] = useActionState(
		createLabelAction,
		initialState,
	);

	return (
		<section className="rounded-xl border border-french_gray-300 bg-white px-4 py-3 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<div className="flex flex-wrap items-center gap-2">
					<span className="flex items-center gap-2 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						<Tag size={16} className="text-blue_munsell-500" />
						Project labels
					</span>
					{labels.length === 0 && (
						<span className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
							No labels yet
						</span>
					)}
					{labels.map((label) => (
						<span
							key={label.id}
							className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
							style={{ backgroundColor: label.color }}
						>
							{label.name}
							{canManage && (
								<form action={deleteLabelAction}>
									<input type="hidden" name="projectId" value={projectId} />
									<input type="hidden" name="labelId" value={label.id} />
									<button
										type="submit"
										aria-label={`Delete ${label.name} label`}
										className="rounded-full p-0.5 hover:bg-black/20"
									>
										<X size={11} />
									</button>
								</form>
							)}
						</span>
					))}
				</div>

				{canManage && (
					<form action={action} className="flex flex-wrap items-center gap-2">
						<input type="hidden" name="projectId" value={projectId} />
						<input
							name="name"
							required
							maxLength={50}
							placeholder="Label name"
							className="w-36 rounded-md border border-french_gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
						/>
						<select
							name="color"
							aria-label="Label color"
							defaultValue={labelColors[0].value}
							className="rounded-md border border-french_gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
						>
							{labelColors.map((color) => (
								<option key={color.value} value={color.value}>
									{color.name}
								</option>
							))}
						</select>
						<button
							type="submit"
							disabled={isPending}
							className="inline-flex items-center gap-1 rounded-md bg-blue_munsell-500 px-2.5 py-1.5 text-sm font-medium text-white disabled:opacity-60"
						>
							<Plus size={14} />
							{isPending ? "Adding..." : "Add"}
						</button>
					</form>
				)}
			</div>

			{state.message && (
				<p
					className={`mt-2 text-xs ${
						state.success
							? "text-green-600 dark:text-green-400"
							: "text-red-600 dark:text-red-400"
					}`}
					role="status"
				>
					{state.message}
				</p>
			)}
		</section>
	);
}
