"use client";

import { Mail, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { addTeamMemberAction } from "@/app/(dashboard)/team/actions";
import {
	initialTeamActionState,
	TeamActionStatus,
} from "@/components/team/shared";
import type { ManagedTeam } from "@/components/team/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function InviteForm({
	team,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
}) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [role, setRole] = useState<"admin" | "member">("member");
	const [state, action, pending] = useActionState(
		addTeamMemberAction,
		initialTeamActionState,
	);

	useEffect(() => {
		if (!state.success) return;
		formRef.current?.reset();
		setRole("member");
		router.refresh();
	}, [router, state.success]);

	return (
		<form
			ref={formRef}
			action={action}
			className="rounded-xl border border-brand/45 bg-brand/[0.025] p-4 sm:p-5"
		>
			<input type="hidden" name="teamId" value={team.id} />
			<input type="hidden" name="role" value={role} />
			<div className="mb-4 flex items-center gap-2 font-bold text-foreground">
				<UserPlus className="text-brand" size={18} /> Invite New Member
			</div>
			<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_auto]">
				<div className="relative">
					<Mail
						size={16}
						className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="email"
						name="email"
						required
						placeholder="Email address"
						className="h-11 pl-11"
					/>
				</div>
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
					<div className="flex h-11 items-center rounded-lg border border-border bg-card px-3 text-sm">
						Member
					</div>
				)}
				<Button type="submit" disabled={pending} className="h-11 px-5">
					<Mail /> {pending ? "Inviting..." : "Invite Member"}
				</Button>
			</div>
			<div className="mt-2">
				<TeamActionStatus state={state} />
			</div>
		</form>
	);
}
