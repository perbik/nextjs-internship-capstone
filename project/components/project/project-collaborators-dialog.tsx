"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { AssignProjectTeamForm } from "@/components/project/assign-project-team-form";
import {
	type EligibleProjectMember,
	type ManagedProjectMember,
	ProjectMembersManager,
} from "@/components/project/members";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectCollaboratorsDialogProps {
	projectId: string;
	members: ManagedProjectMember[];
	actorRole: "owner" | "admin";
	eligibleMembers: EligibleProjectMember[];
	manageableTeams: Array<{ id: string; name: string }>;
	showTeamAssignment: boolean;
}

export function ProjectCollaboratorsDialog({
	projectId,
	members,
	actorRole,
	eligibleMembers,
	manageableTeams,
	showTeamAssignment,
}: ProjectCollaboratorsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-full"
				>
					<Users size={15} />
					Manage Collaborators
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Manage Collaborators</DialogTitle>
					<DialogDescription>
						Add collaborators, update roles, or remove access.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{showTeamAssignment && (
						<AssignProjectTeamForm
							projectId={projectId}
							teams={manageableTeams}
						/>
					)}
					<ProjectMembersManager
						projectId={projectId}
						members={members}
						actorRole={actorRole}
						eligibleMembers={eligibleMembers}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
