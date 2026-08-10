"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
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

const initialState: MemberActionState = { message: "" };

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

			if (isMutableRole(role)) {
				onOptimisticRoleChange({ userId: member.id, role });
			}

			const result = await updateProjectMemberRoleAction(previous, formData);

			if (result.success && isMutableRole(role)) {
				onRoleChangeCommitted({ userId: member.id, role });
				router.refresh();
			}

			return result;
		},
		initialState,
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
				onValueChange={(role) =>
					setSelectedRole(role as MutableProjectMemberRole)
				}
				disabled={isPending}
				ariaLabel={`Role for ${member.name}`}
				options={[
					{ value: "member", label: "Member" },
					{ value: "admin", label: "Admin" },
				]}
				triggerClassName="h-8 min-w-28 px-2 text-xs"
			/>
			<Button type="submit" variant="outline" size="sm" disabled={isPending}>
				{isPending ? "Saving..." : "Save"}
			</Button>
			{state.message && (
				<span
					className={
						state.success
							? "text-xs text-green-700 dark:text-green-400"
							: "text-xs text-red-600 dark:text-red-400"
					}
				>
					{state.message}
				</span>
			)}
		</form>
	);
}
