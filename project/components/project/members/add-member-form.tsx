"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
	addProjectMemberAction,
	type MemberActionState,
} from "@/app/(dashboard)/projects/[id]/member-actions";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import type { EligibleProjectMember, ProjectActorRole } from "./types";

const initialState: MemberActionState = { message: "" };

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
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, isPending] = useActionState(
		addProjectMemberAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
			router.refresh();
		}
	}, [router, state.success]);

	return (
		<form
			ref={formRef}
			action={action}
			className="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_9rem_auto]"
		>
			<input type="hidden" name="projectId" value={projectId} />
			<div>
				<FormSelect
					key={eligibleMembers.map((member) => member.id).join("-")}
					name="email"
					required
					disabled={eligibleMembers.length === 0}
					ariaLabel="Eligible team member"
					placeholder={
						eligibleMembers.length === 0
							? "No eligible team members"
							: "Select a team member"
					}
					options={eligibleMembers.map((member) => ({
						value: member.email,
						label: `${member.name} (${member.email})`,
					}))}
				/>
			</div>
			{actorRole === "owner" ? (
				<div>
					<FormSelect
						name="role"
						defaultValue="member"
						ariaLabel="New member role"
						options={[
							{ value: "member", label: "Member" },
							{ value: "admin", label: "Admin" },
						]}
					/>
				</div>
			) : (
				<input type="hidden" name="role" value="member" />
			)}
			<Button
				type="submit"
				disabled={isPending || eligibleMembers.length === 0}
			>
				<UserPlus size={16} />
				{isPending ? "Adding..." : "Add member"}
			</Button>
			{state.errors?.email?.[0] && (
				<p className="text-xs text-red-600 md:col-span-full dark:text-red-400">
					{state.errors.email[0]}
				</p>
			)}
			{state.message && (
				<p
					className={`text-xs md:col-span-full ${
						state.success
							? "text-green-700 dark:text-green-400"
							: "text-red-600 dark:text-red-400"
					}`}
					role="status"
				>
					{state.message}
				</p>
			)}
		</form>
	);
}
