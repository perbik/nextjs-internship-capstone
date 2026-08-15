"use client";

import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ListActionState } from "@/app/(dashboard)/projects/[id]/list-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateListDialogProps {
	projectId: string;
	action: (payload: FormData) => void;
	state: ListActionState;
	isPending: boolean;
}

export function CreateListDialog({
	projectId,
	action,
	state,
	isPending,
}: CreateListDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const formId = useId();

	useEffect(() => {
		if (state.success) setIsOpen(false);
	}, [state]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Add column"
							className="size-10 shrink-0 rounded-full bg-card hover:border-brand hover:bg-card hover:text-brand"
						>
							<Plus size={18} aria-hidden="true" />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Add column</TooltipContent>
			</Tooltip>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add column</DialogTitle>
					<DialogDescription>
						Create another stage for this project's workflow.
					</DialogDescription>
				</DialogHeader>
				<form action={action} className="space-y-5">
					<input type="hidden" name="projectId" value={projectId} />
					<div className="space-y-1.5">
						<Label htmlFor={`${formId}-name`}>Column name</Label>
						<Input
							id={`${formId}-name`}
							name="name"
							required
							maxLength={100}
							placeholder="e.g. Review"
						/>
						<FieldError message={state.errors?.name?.[0]} />
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id={`${formId}-completed`} name="isCompleted" />
						<Label
							htmlFor={`${formId}-completed`}
							className="text-sm font-normal text-muted-foreground"
						>
							Tasks in this column count as completed
						</Label>
					</div>
					{state.message && !state.success && !state.errors?.name && (
						<p className="text-sm text-destructive" role="alert">
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
						<Button type="submit" disabled={isPending}>
							{isPending ? "Adding..." : "Add column"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
