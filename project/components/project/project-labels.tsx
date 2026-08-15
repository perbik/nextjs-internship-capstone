"use client";

import { Tag, X } from "lucide-react";
import { useActionState } from "react";
import {
	deleteLabelAction,
	type LabelActionState,
} from "@/app/(dashboard)/projects/[id]/label-actions";
import { InlineNewLabelForm } from "@/components/project/new-label-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
		<section className="rounded-xl border border-border bg-surface-muted px-3 py-2.5">
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<span className="flex items-center gap-2 font-display text-sm font-bold text-foreground ">
						<Tag size={16} className="text-brand" />
						Task labels
					</span>
					{labels.length === 0 && (
						<span className="text-xs text-muted-foreground">
							No project labels yet
						</span>
					)}
					{labels.map((label) => (
						<Badge
							key={label.id}
							className="gap-1 border-0 px-2 py-1 text-xs font-medium text-white hover:opacity-90"
							// Label colors come from the database, so they use an inline style
							style={{ backgroundColor: label.color }}
						>
							{label.name}
							{canManage && <DeleteLabelDialog label={label} />}
						</Badge>
					))}
				</div>

				{/* Only project managers can create or remove labels */}
				{canManage && (
					<div className="w-full">
						<InlineNewLabelForm projectId={projectId} />
					</div>
				)}
			</div>
		</section>
	);
}

function DeleteLabelDialog({ label }: { label: TaskLabelOption }) {
	const [state, action, isPending] = useActionState(
		deleteLabelAction,
		initialState,
	);

	return (
		<DestructiveActionDialog
			title={`Delete ${label.name}?`}
			description="This label will be removed from the project and from every task currently using it."
			action={action}
			fields={[{ name: "labelId", value: label.id }]}
			confirmLabel="Delete label"
			error={state.success ? undefined : state.message}
			trigger={
				<Button
					type="button"
					variant="ghost"
					size="icon"
					disabled={isPending}
					aria-label={`Delete ${label.name} label`}
					className="size-4 rounded-full text-white hover:bg-black/20 hover:text-white"
				>
					<X size={11} />
				</Button>
			}
		/>
	);
}
