import { Users } from "lucide-react";

interface Collaborator {
	id: string;
	name: string;
	role: "owner" | "admin" | "member";
	isCurrentUser: boolean;
}

interface ProjectCollaboratorsProps {
	members: Collaborator[];
}

function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function ProjectCollaborators({ members }: ProjectCollaboratorsProps) {
	const visibleMembers = members.slice(0, 6);
	const remainingCount = members.length - visibleMembers.length;

	return (
		<section
			aria-label="Project collaborators"
			className="flex flex-col justify-between gap-3 rounded-xl border border-french_gray-300 bg-white px-4 py-3 sm:flex-row sm:items-center dark:border-paynes_gray-400 dark:bg-outer_space-500"
		>
			<div className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
				<Users size={17} className="text-blue_munsell-500" />
				<span>
					{members.length}{" "}
					{members.length === 1 ? "collaborator" : "collaborators"}
				</span>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{visibleMembers.map((member) => (
					<div
						key={member.id}
						title={`${member.name} · ${member.role}${member.isCurrentUser ? " · You" : ""}`}
						className="flex items-center gap-2 rounded-full bg-platinum-700 py-1 pr-2.5 pl-1 text-xs text-outer_space-500 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<span
							aria-hidden="true"
							className="flex size-7 items-center justify-center rounded-full bg-blue_munsell-500 font-semibold text-white"
						>
							{initials(member.name)}
						</span>
						<span className="max-w-36 truncate">
							{member.name}
							{member.isCurrentUser ? " (You)" : ""}
						</span>
						<span className="capitalize text-paynes_gray-400 dark:text-french_gray-500">
							{member.role}
						</span>
					</div>
				))}

				{remainingCount > 0 && (
					<span className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
						+{remainingCount} more
					</span>
				)}
			</div>
		</section>
	);
}
