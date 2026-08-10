"use client";

import { Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
	removeTeamMemberAction,
	updateTeamMemberRoleAction,
} from "@/app/(dashboard)/team/actions";
import {
	avatarStyles,
	initials,
	initialTeamActionState,
	TeamActionStatus,
} from "@/components/team/shared";
import type { ManagedTeam } from "@/components/team/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ManageTeamDialog({ team }: { team: ManagedTeam }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="h-9 rounded-full border-border bg-card px-4 text-xs"
				>
					<Users /> Manage
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Manage {team.name}</DialogTitle>
					<DialogDescription>
						Update member roles or remove access from this team.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-3 sm:grid-cols-2">
					{team.members.map((member, index) => (
						<Card
							key={member.id}
							className="border-border bg-muted p-4 shadow-none"
						>
							<div className="flex items-center gap-3">
								<Avatar className="size-10">
									<AvatarFallback
										className={avatarStyles[index % avatarStyles.length]}
									>
										{initials(member.name)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate text-sm font-bold">
										{member.name}
										{member.isCurrentUser ? " (You)" : ""}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{member.email}
									</p>
								</div>
							</div>
							<MemberControls team={team} member={member} />
						</Card>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function MemberControls({
	team,
	member,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
	member: ManagedTeam["members"][number];
}) {
	const router = useRouter();
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

	useEffect(() => {
		if (roleState.success || removeState.success) router.refresh();
	}, [removeState.success, roleState.success, router]);

	const canChange = team.role === "owner" && member.role !== "owner";
	const canRemove =
		member.role !== "owner" &&
		(team.role === "owner" || member.role === "member");

	if (!canChange && !canRemove) return null;

	return (
		<div className="mt-3 flex flex-wrap items-center gap-2">
			{canChange && (
				<form action={roleAction} className="flex flex-1 items-center gap-2">
					<input type="hidden" name="teamId" value={team.id} />
					<input type="hidden" name="userId" value={member.id} />
					<input type="hidden" name="role" value={role} />
					<Select
						value={role}
						onValueChange={(value) => setRole(value as typeof role)}
					>
						<SelectTrigger className="h-9 min-w-28 flex-1">
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
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="text-red-600 hover:text-red-700"
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
								<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
								<AlertDialogAction
									type="submit"
									disabled={removePending}
									className="bg-red-600 text-white hover:bg-red-700"
								>
									{removePending ? "Removing..." : "Remove member"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>
			)}
			<div className="w-full">
				<TeamActionStatus state={roleState} />
				<TeamActionStatus state={removeState} />
			</div>
		</div>
	);
}
