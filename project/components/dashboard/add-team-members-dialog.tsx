"use client";

import { Mail, Plus, UserPlus } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
	addTeamMemberAction,
	type TeamActionState,
} from "@/app/(dashboard)/team/actions";
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

const initialState: TeamActionState = { message: "" };

export function AddTeamMemberDialog({
	teams,
}: {
	teams: ManageableTeamOption[];
}) {
	const [open, setOpen] = useState(false);
	const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
	const [role, setRole] = useState<"admin" | "member">("member");
	const [state, action, pending] = useActionState(
		addTeamMemberAction,
		initialState,
	);
	const selectedTeam = useMemo(
		() => teams.find((team) => team.id === teamId),
		[teamId, teams],
	);

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
	}, [state.success]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					disabled={teams.length === 0}
					className="flex h-16.25 w-full items-center gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-left text-sm font-semibold text-foreground hover:border-brand/30 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-brand/10"
				>
					<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
						<Plus size={14} />
					</span>
					Add Team Member
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Add Team Member</DialogTitle>
					<DialogDescription>
						Add one registered Brix user to a team by email.
					</DialogDescription>
				</DialogHeader>

				<form action={action} className="space-y-5">
					<input type="hidden" name="role" value={role} />

					<div className="space-y-2">
						<Label htmlFor="quick-member-team">Team</Label>
						<FormSelect
							id="quick-member-team"
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
						<Label htmlFor="quick-member-email">Member email</Label>
						<div className="relative">
							<Mail
								size={15}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="quick-member-email"
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
						<Label htmlFor="quick-member-role">Role</Label>
						<FormSelect
							id="quick-member-role"
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

					{state.message && (
						<p
							className={`text-sm font-semibold ${state.success ? "text-green-700" : "text-red-600"}`}
							role="status"
						>
							{state.message}
						</p>
					)}

					<DialogFooter>
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
