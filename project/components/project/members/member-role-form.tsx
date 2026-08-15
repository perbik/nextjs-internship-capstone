"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	type MemberActionState,
	updateProjectMemberRoleAction,
} from "@/app/(dashboard)/projects/[id]/member-actions";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import type {
	ManagedProjectMember,
	MutableProjectMemberRole,
	OptimisticRoleChange,
} from "./types";

const INITIAL_MEMBER_STATE: MemberActionState = { message: "" };
const MEMBER_ROLE_OPTIONS = [
	{ value: "member", label: "Member" },
	{ value: "admin", label: "Admin" },
] satisfies Array<{ value: MutableProjectMemberRole; label: string }>;

interface MemberRoleFormProps {
	projectId: string;
	member: ManagedProjectMember;
	onOptimisticRoleChange: (change: OptimisticRoleChange) => void;
	onRoleChangeCommitted: (change: OptimisticRoleChange) => void;
}

function isMutableRole(
	value: FormDataEntryValue | null,
): value is MutableProjectMemberRole {
	return value === "admin" || value === "member";
}

export function MemberRoleForm({
	projectId,
	member,
	onOptimisticRoleChange,
	onRoleChangeCommitted,
}: MemberRoleFormProps) {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<MutableProjectMemberRole>(
		member.role === "admin" ? "admin" : "member",
	);
	const [state, action, isPending] = useActionState(
		async (previous: MemberActionState, formData: FormData) => {
			const role = formData.get("role");

			// Show the new role immediately, then commit it after the server succeeds
			if (isMutableRole(role)) {
				onOptimisticRoleChange({ userId: member.id, role });
			}

			const result = await updateProjectMemberRoleAction(previous, formData);

			if (result.success && isMutableRole(role)) {
				onRoleChangeCommitted({ userId: member.id, role });
				toast.success(result.message);
				router.refresh();
			} else if (!result.success) {
				setSelectedRole(member.role === "admin" ? "admin" : "member");
			}

			return result;
		},
		INITIAL_MEMBER_STATE,
	);

	useEffect(() => {
		if (member.role === "admin" || member.role === "member") {
			setSelectedRole(member.role);
		}
	}, [member.role]);

	return (
		<form action={action} className="flex items-center gap-2">
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="userId" value={member.id} />
			<FormSelect
				name="role"
				value={selectedRole}
				onValueChange={(role) => {
					if (isMutableRole(role)) setSelectedRole(role);
				}}
				disabled={isPending}
				ariaLabel={`Role for ${member.name}`}
				options={MEMBER_ROLE_OPTIONS}
				triggerClassName="h-8 min-w-28 px-2 text-xs"
			/>
			<Button type="submit" variant="outline" size="sm" disabled={isPending}>
				{isPending ? "Saving..." : "Save"}
			</Button>
			{state.message && !state.success && (
				<span className="text-xs text-destructive" role="alert">
					{state.message}
				</span>
			)}
		</form>
	);
}
