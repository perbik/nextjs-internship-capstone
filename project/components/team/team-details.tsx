import { FolderKanban, Mail, Users } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { InviteForm } from "@/components/team/invite-form";
import { ManageTeamDialog } from "@/components/team/manage-team-dialog";
import { avatarStyles, initials } from "@/components/team/shared";
import type { ManagedTeam } from "@/components/team/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TeamDetails({ team }: { team: ManagedTeam }) {
	const canManage = team.role === "owner" || team.role === "admin";
	const activeProjects = team.projects.filter(
		(project) => project.status === "active",
	).length;

	return (
		<Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.035)] dark:bg-card/[0.025]">
			<div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{team.members.length}{" "}
							{team.members.length === 1 ? "member" : "members"} ·{" "}
							{activeProjects} active · {team.projects.length}{" "}
							{team.projects.length === 1 ? "project" : "projects"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 self-end sm:self-auto">
					{canManage && <ManageTeamDialog team={team} />}
				</div>
			</div>

			<div className="space-y-6 border-t border-black/6 p-5 sm:p-6">
				{team.description && (
					<p className="text-sm text-muted-foreground">{team.description}</p>
				)}
				<div>
					<p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
						Assigned Projects
					</p>
					<div className="flex flex-wrap gap-2">
						{team.projects.map((project) => (
							<Button
								key={project.id}
								variant="secondary"
								asChild
								className="h-9 rounded-full border-0 bg-secondary px-4 text-xs hover:bg-muted"
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

				{canManage && <InviteForm team={team} />}
				<div>
					<h3 className="mb-3 text-base font-extrabold text-foreground dark:text-white">
						Team Members
					</h3>
					<div className="grid gap-3 md:grid-cols-2">
						{team.members.map((member, index) => (
							<MemberCard
								key={member.id}
								member={member}
								projectCount={team.projects.length}
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
	member,
	projectCount,
	index,
}: {
	member: ManagedTeam["members"][number];
	projectCount: number;
	index: number;
}) {
	return (
		<Card className="border-0 bg-background p-4 shadow-none ">
			<div className="flex items-center gap-3">
				<Avatar className="size-10">
					<AvatarFallback className={avatarStyles[index % avatarStyles.length]}>
						{initials(member.name)}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
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
				</div>
			</div>
			<div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
				<Badge className="rounded-full border-0 bg-[#dff6e9] px-2.5 text-[11px] font-semibold text-[#328258] hover:bg-[#dff6e9]">
					<span className="mr-1.5 size-1.5 rounded-full bg-[#36a269]" /> Active
				</Badge>
				<span className="flex items-center gap-1 text-xs text-muted-foreground">
					<FolderKanban size={13} /> {projectCount}{" "}
					{projectCount === 1 ? "project" : "projects"}
				</span>
			</div>
		</Card>
	);
}
