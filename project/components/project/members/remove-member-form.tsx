"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
	type MemberActionState,
	removeProjectMemberAction,
} from "@/app/(dashboard)/projects/[id]/member-actions";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import type { ManagedProjectMember } from "./types";

const initialState: MemberActionState = { message: "" };

interface RemoveMemberFormProps {
	projectId: string;
	member: ManagedProjectMember;
}

export function RemoveMemberForm({ projectId, member }: RemoveMemberFormProps) {
	const router = useRouter();
	const [state, action, isPending] = useActionState(
		removeProjectMemberAction,
		initialState,
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
				<button
					type="button"
					disabled={isPending}
					aria-label={`Remove ${member.name} from project`}
					className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
				>
					<Trash2 size={14} />
					Remove
				</button>
			}
		/>
	);
}
