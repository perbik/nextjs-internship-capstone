"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	removeTeamMemberAction,
	updateTeamMemberRoleAction,
} from "@/app/(dashboard)/team/actions";
import { TeamActionStatus } from "@/components/team/team-action-status";
import type { ManagedTeam } from "@/components/team/types";
import { initialTeamActionState } from "@/components/team/utils";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function TeamMemberControls({
	team,
	member,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
	member: ManagedTeam["members"][number];
}) {
	const router = useRouter();
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [role, setRole] = useState<"admin" | "member">(
		member.role === "admin" ? "admin" : "member",
	);

	const [roleState, roleAction, rolePending] = useActionState(
		updateTeamMemberRoleAction,
		initialTeamActionState,
	);
	const [removeState, removeAction, removePending] = useActionState(
		removeTeamMemberAction,
		initialTeamActionState,
	);

	// Keep the select aligned with refreshed server data
	useEffect(() => {
		setRole(member.role === "admin" ? "admin" : "member");
	}, [member.role]);

	// Handle each new server action result
	useEffect(() => {
		if (!roleState.success) return;

		toast.success(roleState.message);
		router.refresh();
	}, [roleState, router]);

	useEffect(() => {
		if (!removeState.success) return;

		setRemoveDialogOpen(false);
		router.refresh();
	}, [removeState, router]);

	// Owners manage roles; owners and admins can remove allowed members
	const canChange = team.role === "owner" && member.role !== "owner";
	const canRemove =
		member.role !== "owner" &&
		(team.role === "owner" ||
			(team.role === "admin" && member.role === "member"));

	if (!canChange && !canRemove) return null;

	return (
		<div className="shrink-0 space-y-2">
			<div className="flex flex-wrap items-center gap-2">
				{canChange && (
					<form action={roleAction} className="flex items-center gap-2">
						<input type="hidden" name="teamId" value={team.id} />
						<input type="hidden" name="userId" value={member.id} />
						<input type="hidden" name="role" value={role} />
						<Select
							value={role}
							onValueChange={(value) => setRole(value as typeof role)}
						>
							<SelectTrigger className="h-9 w-28">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
						<Button
							type="submit"
							variant="outline"
							size="sm"
							disabled={rolePending}
						>
							{rolePending ? "Saving..." : "Save"}
						</Button>
					</form>
				)}
				{canRemove && (
					<AlertDialog
						open={removeDialogOpen}
						onOpenChange={setRemoveDialogOpen}
					>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
							>
								<Trash2 /> Remove
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
								<AlertDialogDescription>
									They will lose access to this team and its projects.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<form action={removeAction}>
								<input type="hidden" name="teamId" value={team.id} />
								<input type="hidden" name="userId" value={member.id} />
								<AlertDialogFooter>
									<AlertDialogCancel type="button" disabled={removePending}>
										Cancel
									</AlertDialogCancel>
									<Button
										type="submit"
										disabled={removePending}
										className="bg-destructive text-white hover:bg-destructive/90"
									>
										{removePending ? "Removing..." : "Remove member"}
									</Button>
								</AlertDialogFooter>
								<TeamActionStatus state={removeState} />
							</form>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>
			{!roleState.success && <TeamActionStatus state={roleState} />}
		</div>
	);
}
