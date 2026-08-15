"use client";

import { Mail, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { addTeamMemberAction } from "@/app/(dashboard)/team/actions";
import { TeamActionStatus } from "@/components/team/team-action-status";
import type { ManagedTeam } from "@/components/team/types";
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
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function InviteMemberDialog({
	team,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
}) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	// The dialog and selected role are controlled so they can reset after success
	const [open, setOpen] = useState(false);
	const [role, setRole] = useState<"admin" | "member">("member");
	const [state, action, pending] = useActionState(
		addTeamMemberAction,
		initialTeamActionState,
	);

	// Reset the form and reload team data after each successful addition
	useEffect(() => {
		if (!state.success) return;
		formRef.current?.reset();
		setRole("member");
		setOpen(false);
		router.refresh();
	}, [router, state]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="h-9 rounded-full px-4 text-xs">
					<UserPlus /> Invite Member
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Invite a team member</DialogTitle>
					<DialogDescription>
						Add one registered user to this team by email address.
					</DialogDescription>
				</DialogHeader>
				<form ref={formRef} action={action} className="space-y-4">
					{/* The action directly adds an existing registered user */}
					<input type="hidden" name="teamId" value={team.id} />
					<input type="hidden" name="role" value={role} />
					<div className="space-y-2">
						<Label htmlFor="team-member-email">Email address</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="team-member-email"
								type="email"
								name="email"
								required
								placeholder="member@example.com"
								className="h-11 pl-10"
							/>
						</div>
						<FieldError message={state.errors?.email?.[0]} />
					</div>
					<div className="space-y-2">
						<Label>Role</Label>
						{/* Only the team owner can add another administrator */}
						{team.role === "owner" ? (
							<Select
								value={role}
								onValueChange={(value) => setRole(value as typeof role)}
							>
								<SelectTrigger className="h-11">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						) : (
							<div className="flex h-11 items-center rounded-lg border border-border bg-muted px-3 text-sm">
								Member
							</div>
						)}
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
							{pending ? "Inviting..." : "Invite Member"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
