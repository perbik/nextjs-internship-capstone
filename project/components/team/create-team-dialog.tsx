"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { createTeamAction } from "@/app/(dashboard)/team/actions";
import { TeamActionStatus } from "@/components/team/team-action-status";
import { initialTeamActionState } from "@/components/team/utils";
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
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

interface CreateTeamDialogProps {
	description?: string;
	triggerVariant?: "default" | "dashboardOnboarding";
}

export function CreateTeamDialog({
	description = "Create a team for members and their shared projects.",
	triggerVariant = "default",
}: CreateTeamDialogProps = {}) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [open, setOpen] = useState(false);
	const [state, action, pending] = useActionState(
		createTeamAction,
		initialTeamActionState,
	);

	// Clear the form and reload team data after each successful creation
	useEffect(() => {
		if (!state.success) return;
		formRef.current?.reset();
		setOpen(false);
		router.refresh();
	}, [router, state]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className={
						triggerVariant === "dashboardOnboarding"
							? "h-20 w-full justify-start gap-3 rounded-xl border-border bg-surface-subtle px-4 py-3 text-left text-sm text-foreground hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/10"
							: "h-11 px-5"
					}
					variant={
						triggerVariant === "dashboardOnboarding" ? "outline" : "default"
					}
				>
					{triggerVariant === "dashboardOnboarding" ? (
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
							<Plus size={14} />
						</span>
					) : (
						<Plus />
					)}
					{triggerVariant === "dashboardOnboarding"
						? "Create a Team First"
						: "Create Team"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-120">
				<DialogHeader>
					<DialogTitle>Create a team</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<form ref={formRef} action={action} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="team-name">Team name</Label>
						<Input
							id="team-name"
							name="name"
							required
							maxLength={100}
							placeholder="e.g. Product Design"
							className="h-11"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="team-description">Description</Label>
						<TextareaWithCounter
							id="team-description"
							name="description"
							maxLength={500}
							rows={3}
							placeholder="What does this team work on?"
						/>
					</div>
					<TeamActionStatus state={state} />
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending}>
							{pending ? "Creating..." : "Create team"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
