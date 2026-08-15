import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/avatar-utils";

interface Collaborator {
	id: string;
	name: string;
	role: "owner" | "admin" | "member";
	isCurrentUser: boolean;
}

interface ProjectCollaboratorsProps {
	members: Collaborator[];
}

export function ProjectCollaborators({ members }: ProjectCollaboratorsProps) {
	const visibleMembers = members.slice(0, 3);
	const remainingCount = members.length - visibleMembers.length;

	return (
		<ul
			className="flex items-center"
			aria-label={`${members.length} project collaborators`}
		>
			{visibleMembers.map((member, index) => {
				const memberLabel = `${member.name}, ${member.role}${member.isCurrentUser ? ", you" : ""}`;

				return (
					<li key={member.id} className={index > 0 ? "-ml-4" : undefined}>
						<Avatar
							aria-label={memberLabel}
							title={memberLabel}
							className="size-9 border-2 border-card"
						>
							<AvatarFallback className="bg-brand text-[11px] font-bold text-white">
								{getInitials(member.name)}
							</AvatarFallback>
						</Avatar>
					</li>
				);
			})}

			{remainingCount > 0 && (
				<li
					aria-label={`${remainingCount} more collaborators`}
					className="-ml-1 flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-bold text-muted-foreground"
				>
					+{remainingCount}
				</li>
			)}
		</ul>
	);
}
