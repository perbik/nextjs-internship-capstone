"use client";

import { Tag, X } from "lucide-react";
import { useActionState } from "react";
import {
	deleteLabelAction,
	type LabelActionState,
} from "@/app/(dashboard)/projects/[id]/label-actions";
import { InlineNewLabelForm } from "@/components/project/new-label-dialog";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";

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

export function ProjectLabels({
	projectId,
	labels,
	canManage,
}: ProjectLabelsProps) {
	return (
		<section className="rounded-xl border border-border bg-surface-muted px-4 py-3  ">
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="flex items-center gap-2 font-display text-sm font-bold text-foreground ">
						<Tag size={16} className="text-brand" />
						Project labels
					</span>
					{labels.length === 0 && (
						<span className="text-xs text-muted-foreground">No labels yet</span>
					)}
					{labels.map((label) => (
						<span
							key={label.id}
							className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
							style={{ backgroundColor: label.color }}
						>
							{label.name}
							{canManage && (
								<DeleteLabelDialog projectId={projectId} label={label} />
							)}
						</span>
					))}
				</div>

				{canManage && (
					<div className="w-full">
						<InlineNewLabelForm projectId={projectId} />
					</div>
				)}
			</div>
		</section>
	);
}

function DeleteLabelDialog({
	projectId,
	label,
}: {
	projectId: string;
	label: TaskLabelOption;
}) {
	const [state, action, isPending] = useActionState(
		deleteLabelAction,
		initialState,
	);

	return (
		<DestructiveActionDialog
			title={`Delete ${label.name}?`}
			description="This label will be removed from the project and from every task currently using it."
			action={action}
			fields={[
				{ name: "projectId", value: projectId },
				{ name: "labelId", value: label.id },
			]}
			confirmLabel="Delete label"
			error={state.success ? undefined : state.message}
			trigger={
				<button
					type="button"
					disabled={isPending}
					aria-label={`Delete ${label.name} label`}
					className="rounded-full p-0.5 hover:bg-black/20"
				>
					<X size={11} />
				</button>
			}
		/>
	);
}
