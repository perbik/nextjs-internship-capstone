"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { createTeamAction } from "@/app/(dashboard)/team/actions";
import {
	initialTeamActionState,
	TeamActionStatus,
} from "@/components/team/shared";
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

export function CreateTeamDialog() {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [open, setOpen] = useState(false);
	const [state, action, pending] = useActionState(
		createTeamAction,
		initialTeamActionState,
	);

	useEffect(() => {
		if (!state.success) return;
		formRef.current?.reset();
		setOpen(false);
		router.refresh();
	}, [router, state.success]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="h-11 px-5">
					<Plus /> Create Team
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Create a team</DialogTitle>
					<DialogDescription>
						Create a workspace for members and their shared projects.
					</DialogDescription>
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
						<Input
							id="team-description"
							name="description"
							maxLength={500}
							placeholder="What does this team work on?"
							className="h-11"
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
