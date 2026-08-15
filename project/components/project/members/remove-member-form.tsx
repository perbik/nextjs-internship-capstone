"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
	type MemberActionState,
	removeProjectMemberAction,
} from "@/app/(dashboard)/projects/[id]/member-actions";
import { Button } from "@/components/ui/button";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import type { ManagedProjectMember } from "./types";

const INITIAL_MEMBER_STATE: MemberActionState = { message: "" };

interface RemoveMemberFormProps {
	projectId: string;
	member: ManagedProjectMember;
}

export function RemoveMemberForm({ projectId, member }: RemoveMemberFormProps) {
	const router = useRouter();
	const [state, action, isPending] = useActionState(
		removeProjectMemberAction,
		INITIAL_MEMBER_STATE,
	);

	useEffect(() => {
		if (state.success) {
			router.refresh();
		}
	}, [router, state.success]);

	return (
		<DestructiveActionDialog
			title={`Remove ${member.name}?`}
			description="They will lose access to this project. Their account and team membership will not be deleted."
			action={action}
			fields={[
				{ name: "projectId", value: projectId },
				{ name: "userId", value: member.id },
			]}
			confirmLabel="Remove collaborator"
			pendingLabel="Removing..."
			error={state.success ? undefined : state.message}
			trigger={
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={isPending}
					aria-label={`Remove ${member.name} from project`}
					className="text-destructive hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 size={14} />
					Remove
				</Button>
			}
		/>
	);
}
