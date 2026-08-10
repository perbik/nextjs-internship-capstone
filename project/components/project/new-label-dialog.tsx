"use client";

import { ChevronDown, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import {
	createLabelAction,
	type LabelActionState,
} from "@/app/(dashboard)/projects/[id]/label-actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewLabelDialogProps {
	projectId: string;
	trigger?: ReactNode;
}

const initialState: LabelActionState = { message: "" };
const initialColor = "#c650bc";
const labelColors = [
	initialColor,
	"#2389a8",
	"#22c55e",
	"#eab308",
	"#f97316",
	"#ef4444",
	"#8b5cf6",
] as const;

export function NewLabelDialog({ projectId, trigger }: NewLabelDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button type="button" variant="outline" size="sm">
						<Plus />
						New label
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>New Label</DialogTitle>
					<DialogDescription>
						Create a reusable label for this project.
					</DialogDescription>
				</DialogHeader>
				<NewLabelForm
					projectId={projectId}
					onCancel={() => setOpen(false)}
					onCreated={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

export function InlineNewLabelForm({ projectId }: { projectId: string }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="rounded-xl border border-border bg-surface-muted  ">
			<button
				type="button"
				onClick={() => setExpanded((current) => !current)}
				aria-expanded={expanded}
				className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground hover:text-brand "
			>
				<span className="flex items-center gap-2">
					<span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-brand">
						<Plus size={14} />
					</span>
					Create a new label
				</span>
				<ChevronDown
					size={16}
					className={`transition-transform ${expanded ? "rotate-180" : ""}`}
				/>
			</button>
			{expanded && (
				<div className="border-t border-border p-4 ">
					<NewLabelForm
						projectId={projectId}
						onCancel={() => setExpanded(false)}
						onCreated={() => setExpanded(false)}
						compact
					/>
				</div>
			)}
		</div>
	);
}

function NewLabelForm({
	projectId,
	onCancel,
	onCreated,
	compact = false,
}: {
	projectId: string;
	onCancel: () => void;
	onCreated: () => void;
	compact?: boolean;
}) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [color, setColor] = useState(initialColor);
	const [state, action, isPending] = useActionState(
		createLabelAction,
		initialState,
	);
	const previewColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : initialColor;

	useEffect(() => {
		if (!state.success) return;

		setName("");
		setColor(initialColor);
		onCreated();
		router.refresh();
	}, [onCreated, router, state.success]);

	function chooseNextColor() {
		const currentIndex = labelColors.findIndex(
			(labelColor) => labelColor.toLowerCase() === color.toLowerCase(),
		);
		setColor(labelColors[(currentIndex + 1) % labelColors.length]);
	}

	return (
		<form action={action} className="space-y-4">
			<input type="hidden" name="projectId" value={projectId} />

			<div
				className={`${compact ? "min-h-16" : "min-h-20"} flex items-center justify-center rounded-xl bg-muted px-4 dark:bg-control`}
			>
				<span
					className="max-w-full truncate rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
					style={{ backgroundColor: previewColor }}
				>
					{name.trim() || "Label preview"}
				</span>
			</div>

			<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
				<div className="space-y-2">
					<Label htmlFor={`${projectId}-label-name`}>Name</Label>
					<Input
						id={`${projectId}-label-name`}
						name="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Label name"
						maxLength={50}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`${projectId}-label-color`}>Color</Label>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							size="icon"
							onClick={chooseNextColor}
							aria-label="Choose another label color"
							className="shrink-0 text-white hover:opacity-90"
							style={{ backgroundColor: previewColor }}
						>
							<RefreshCw />
						</Button>
						<Input
							id={`${projectId}-label-color`}
							name="color"
							value={color}
							onChange={(event) => setColor(event.target.value)}
							placeholder="#c650bc"
							pattern="#[0-9a-fA-F]{6}"
							maxLength={7}
							required
							className="font-mono"
						/>
					</div>
				</div>
			</div>

			{state.message && !state.success && (
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{state.message}
				</p>
			)}

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Creating..." : "Create label"}
				</Button>
			</div>
		</form>
	);
}
