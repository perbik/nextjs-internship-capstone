"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	addProjectMemberAction,
	type MemberActionState,
} from "@/app/(dashboard)/projects/[id]/member-actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import type {
	EligibleProjectMember,
	MutableProjectMemberRole,
	ProjectActorRole,
} from "./types";

const INITIAL_MEMBER_STATE: MemberActionState = { message: "" };
const MEMBER_ROLE_OPTIONS = [
	{ value: "member", label: "Member" },
	{ value: "admin", label: "Admin" },
] satisfies Array<{ value: MutableProjectMemberRole; label: string }>;

interface AddMemberFormProps {
	projectId: string;
	actorRole: ProjectActorRole;
	eligibleMembers: EligibleProjectMember[];
}

export function AddMemberForm({
	projectId,
	actorRole,
	eligibleMembers,
}: AddMemberFormProps) {
	const router = useRouter();
	const [selectedUserId, setSelectedUserId] = useState("");
	const [selectedRole, setSelectedRole] =
		useState<MutableProjectMemberRole>("member");
	const [state, action, isPending] = useActionState(
		addProjectMemberAction,
		INITIAL_MEMBER_STATE,
	);

	useEffect(() => {
		if (state.success) {
			// Clear the selections after the member has been added
			setSelectedUserId("");
			setSelectedRole("member");
			toast.success(state.message);
			router.refresh();
		}
	}, [router, state]);

	return (
		<form
			action={action}
			className="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_9rem_auto]"
		>
			<input type="hidden" name="projectId" value={projectId} />
			<div>
				<FormSelect
					name="userId"
					value={selectedUserId}
					onValueChange={setSelectedUserId}
					required
					disabled={eligibleMembers.length === 0}
					ariaLabel="Eligible team member"
					placeholder={
						eligibleMembers.length === 0
							? "No eligible team members"
							: "Select a team member"
					}
					options={eligibleMembers.map((member) => ({
						value: member.id,
						label: `${member.name} (${member.email})`,
					}))}
				/>
			</div>
			{actorRole === "owner" ? (
				<div>
					<FormSelect
						name="role"
						value={selectedRole}
						onValueChange={(role) => {
							if (role === "admin" || role === "member") {
								setSelectedRole(role);
							}
						}}
						ariaLabel="New member role"
						options={MEMBER_ROLE_OPTIONS}
					/>
				</div>
			) : (
				// Administrators can only add regular project members
				<input type="hidden" name="role" value="member" />
			)}
			<Button
				type="submit"
				disabled={isPending || eligibleMembers.length === 0}
			>
				<UserPlus size={16} />
				{isPending ? "Adding..." : "Add member"}
			</Button>
			<FieldError
				message={state.errors?.userId?.[0]}
				className="md:col-span-full"
			/>
			{state.message && !state.success && (
				<p className="text-xs text-destructive md:col-span-full" role="alert">
					{state.message}
				</p>
			)}
		</form>
	);
}
