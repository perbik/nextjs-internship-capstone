import { FolderKanban, Mail, Users } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { TeamMemberControls } from "@/components/team/team-member-controls";
import type { ManagedTeam } from "@/components/team/types";
import { avatarStyles } from "@/components/team/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/avatar-utils";

export function TeamDetails({ team }: { team: ManagedTeam }) {
	// Owners and admins can invite members and create projects for this team
	const canManage = team.role === "owner" || team.role === "admin";

	return (
		<Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.035)] dark:bg-card/2.5">
			<div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
				<div className="flex min-w-0 items-center gap-3.5">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<Users size={20} />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="truncate text-lg font-extrabold text-foreground dark:text-white">
								{team.name}
							</h2>
							<Badge className="rounded-full border-0 bg-brand/10 px-2.5 text-[10px] font-bold capitalize text-brand hover:bg-brand/10">
								{team.role}
							</Badge>
							<p className="mt-1 text-xs text-muted-foreground">
								{team.members.length}{" "}
								{team.members.length === 1 ? "member" : "members"} ·{" "}
								{team.projects.length}{" "}
								{team.projects.length === 1 ? "project" : "projects"}
							</p>
						</div>
						{team.description && (
							<p className="mt-1 text-sm text-muted-foreground">
								{team.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 self-end sm:self-auto">
					{canManage && <InviteMemberDialog team={team} />}
				</div>
			</div>

			<div className="space-y-6 border-t border-black/6 p-5 sm:p-6">
				<div>
					<p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
						Assigned Projects
					</p>
					<div className="flex flex-wrap gap-1">
						{/* Project creation stays scoped to the current team */}
						{team.projects.map((project) => (
							<Button
								key={project.id}
								variant="secondary"
								asChild
								className="h-9 rounded-full bg-primary text-white px-4 text-xs hover:bg-accent-foreground"
							>
								<Link href={`/projects/${project.id}`}>{project.name}</Link>
							</Button>
						))}
						{canManage && (
							<CreateProjectModal
								teams={[{ id: team.id, name: team.name }]}
								defaultTeamId={team.id}
								triggerVariant="projectChip"
							/>
						)}
					</div>
				</div>

				<div>
					<h3 className="mb-3 text-base font-extrabold text-foreground dark:text-white">
						Team Members
					</h3>
					<div className="space-y-3">
						{team.members.map((member, index) => (
							<MemberCard
								key={member.id}
								member={member}
								team={team}
								projectCount={member.projectCount ?? 0}
								index={index}
							/>
						))}
					</div>
				</div>
			</div>
		</Card>
	);
}

function MemberCard({
	team,
	member,
	projectCount,
	index,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
	member: ManagedTeam["members"][number];
	projectCount: number;
	index: number;
}) {
	return (
		<Card className="border-0 bg-background p-3 shadow-none sm:p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<Avatar className="size-10 shrink-0">
						{/* Cycle fallback colors when a user has no profile image */}
						<AvatarFallback
							className={avatarStyles[index % avatarStyles.length]}
						>
							{getInitials(member.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<p className="truncate text-sm font-bold text-foreground dark:text-white">
								{member.name}
								{member.isCurrentUser ? " (You)" : ""}
							</p>
							<span className="text-xs capitalize text-muted-foreground">
								{member.role}
							</span>
						</div>
						<p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
							<Mail size={12} /> {member.email}
						</p>
						<p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
							<FolderKanban size={13} /> {projectCount}{" "}
							{projectCount === 1 ? "project" : "projects"}
						</p>
					</div>
				</div>
				<span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
					<FolderKanban size={13} /> {projectCount}{" "}
					{projectCount === 1 ? "project" : "projects"}
				</span>
				<TeamMemberControls team={team} member={member} />
			</div>
		</Card>
	);
}
