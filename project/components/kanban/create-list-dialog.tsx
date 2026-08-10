"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { ListActionState } from "@/app/(dashboard)/projects/[id]/list-actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

	useEffect(() => {
		if (state.success) setIsOpen(false);
	}, [state.success]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label="Add column"
					className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-card text-foreground transition hover:border-brand hover:text-brand"
				>
					<Plus size={18} />
				</button>
			</DialogTrigger>

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
						<Label htmlFor="new-column-name">Column name</Label>
						<Input
							id="new-column-name"
							name="name"
							required
							maxLength={100}
							placeholder="e.g. Review"
						/>
					</div>
					<label className="flex items-center gap-2 text-sm text-muted-foreground">
						<input
							type="checkbox"
							name="isCompleted"
							className="size-4 accent-brand"
						/>
						Tasks here count as completed
					</label>
					{state.message && !state.success && (
						<p className="text-sm text-red-600" role="alert">
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
