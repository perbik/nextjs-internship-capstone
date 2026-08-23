"use client";

import { Users } from "lucide-react";
import { useState } from "react";
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
}

export function ProjectCollaboratorsDialog({
	projectId,
	members,
	actorRole,
	eligibleMembers,
}: ProjectCollaboratorsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full rounded-full lg:w-auto"
				>
					<Users size={15} />
					Manage Collaborators
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Manage Collaborators</DialogTitle>
					<DialogDescription>
						Add eligible team members, update roles, or remove project access.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
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
