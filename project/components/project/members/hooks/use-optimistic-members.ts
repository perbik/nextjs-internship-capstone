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
	// Apply a temporary role while the server update is pending
	const [optimisticMembers, applyOptimisticRoleChange] = useOptimistic(
		confirmedMembers,
		updateMemberRole,
	);

	// Synchronize local state with the latest server data
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
