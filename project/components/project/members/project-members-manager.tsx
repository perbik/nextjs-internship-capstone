"use client";

import { AddMemberForm } from "./add-member-form";
import { useOptimisticMembers } from "./hooks/use-optimistic-members";
import { MemberRoleForm } from "./member-role-form";
import { RemoveMemberForm } from "./remove-member-form";
import type {
	EligibleProjectMember,
	ManagedProjectMember,
	ProjectActorRole,
} from "./types";

interface ProjectMembersManagerProps {
	projectId: string;
	members: ManagedProjectMember[];
	actorRole: ProjectActorRole;
	eligibleMembers: EligibleProjectMember[];
}

export function ProjectMembersManager({
	projectId,
	members,
	actorRole,
	eligibleMembers,
}: ProjectMembersManagerProps) {
	const { optimisticMembers, applyOptimisticRoleChange, commitRoleChange } =
		useOptimisticMembers(members);

	return (
		<section className="space-y-4 rounded-xl border border-border bg-card p-4">
			<div>
				<h2 className="font-display font-bold text-foreground">
					Manage members
				</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					Only members of this project's team can become collaborators.
				</p>
			</div>

			<AddMemberForm
				projectId={projectId}
				actorRole={actorRole}
				eligibleMembers={eligibleMembers}
			/>

			<div className="divide-y divide-black/10 dark:divide-white/10">
				{optimisticMembers.map((member) => {
					const canChangeRole =
						actorRole === "owner" && member.role !== "owner";
					const canRemove =
						member.role !== "owner" &&
						(actorRole === "owner" || member.role === "member");

					return (
						<div
							key={member.id}
							className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-foreground">
									{member.name}
									{member.isCurrentUser ? " (You)" : ""}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{member.email} {" · "}
									<span className="capitalize">{member.role}</span>
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{canChangeRole && (
									<MemberRoleForm
										projectId={projectId}
										member={member}
										onOptimisticRoleChange={applyOptimisticRoleChange}
										onRoleChangeCommitted={commitRoleChange}
									/>
								)}
								{canRemove && (
									<RemoveMemberForm projectId={projectId} member={member} />
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
