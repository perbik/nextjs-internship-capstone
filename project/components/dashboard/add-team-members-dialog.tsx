"use client";

import { Mail, Plus, UserPlus } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
import { addTeamMemberAction } from "@/app/(dashboard)/team/actions";
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
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManageableTeamOption {
	id: string;
	name: string;
	role: "owner" | "admin" | "member";
}

interface AddTeamMemberDialogProps {
	teams: ManageableTeamOption[];
}

export function AddTeamMemberDialog({ teams }: AddTeamMemberDialogProps) {
	const formId = useId();
	const [open, setOpen] = useState(false);
	const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
	const [role, setRole] = useState<"admin" | "member">("member");
	const [state, action, pending] = useActionState(
		addTeamMemberAction,
		initialTeamActionState,
	);
	const selectedTeam = teams.find((team) => team.id === teamId);

	useEffect(() => {
		if (selectedTeam?.role !== "owner" && role === "admin") {
			setRole("member");
		}
	}, [role, selectedTeam?.role]);

	useEffect(() => {
		if (state.success) {
			setOpen(false);
			setRole("member");
		}
	}, [state]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					disabled={teams.length === 0}
					className="h-20 w-full justify-start gap-3 rounded-xl border-border bg-surface-subtle px-4 py-3 text-left text-sm text-foreground hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/10"
				>
					<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
						<Plus size={14} />
					</span>
					Add Team Member
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-5 sm:max-w-xl sm:p-6">
				<DialogHeader>
					<DialogTitle>Add Team Member</DialogTitle>
					<DialogDescription>
						Add one registered Brix user to a team by email.
					</DialogDescription>
				</DialogHeader>

				<form action={action} className="space-y-4 sm:space-y-5">
					<input type="hidden" name="role" value={role} />

					<div className="space-y-2">
						<Label htmlFor={`${formId}-team`}>Team</Label>
						<FormSelect
							id={`${formId}-team`}
							name="teamId"
							value={teamId}
							onValueChange={setTeamId}
							options={teams.map((team) => ({
								value: team.id,
								label: team.name,
							}))}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${formId}-email`}>Member email</Label>
						<div className="relative">
							<Mail
								size={15}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id={`${formId}-email`}
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="name@example.com"
								className="pl-9"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${formId}-role`}>Role</Label>
						<FormSelect
							id={`${formId}-role`}
							value={role}
							onValueChange={(value) => setRole(value as "admin" | "member")}
							options={[
								{ value: "member", label: "Member" },
								{
									value: "admin",
									label: "Admin",
									disabled: selectedTeam?.role !== "owner",
								},
							]}
						/>
						{selectedTeam?.role !== "owner" && (
							<p className="text-xs text-muted-foreground">
								Only the team owner can add administrators.
							</p>
						)}
					</div>

					<TeamActionStatus state={state} />

					<DialogFooter className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending || !teamId}>
							<UserPlus />
							{pending ? "Adding..." : "Add member"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
