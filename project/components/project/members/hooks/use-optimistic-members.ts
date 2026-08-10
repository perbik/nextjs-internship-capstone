"use client";

import { useEffect, useOptimistic, useState } from "react";
import type { ManagedProjectMember, OptimisticRoleChange } from "../types";

function updateMemberRole(
	members: ManagedProjectMember[],
	change: OptimisticRoleChange,
): ManagedProjectMember[] {
	return members.map((member) =>
		member.id === change.userId ? { ...member, role: change.role } : member,
	);
}

export function useOptimisticMembers(members: ManagedProjectMember[]) {
	const [confirmedMembers, setConfirmedMembers] = useState(members);
	const [optimisticMembers, applyOptimisticRoleChange] = useOptimistic(
		confirmedMembers,
		updateMemberRole,
	);

	useEffect(() => {
		setConfirmedMembers(members);
	}, [members]);

	function commitRoleChange(change: OptimisticRoleChange): void {
		setConfirmedMembers((currentMembers) =>
			updateMemberRole(currentMembers, change),
		);
	}

	return {
		optimisticMembers,
		applyOptimisticRoleChange,
		commitRoleChange,
	};
}
