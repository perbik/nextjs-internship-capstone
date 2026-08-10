import { TeamsManager } from "@/components/team/teams-manager";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamsForUser } from "@/lib/db/queries";

function nameOf(user: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
	);
}

export default async function TeamPage() {
	const currentUser = await requireCurrentUser();
	const teams = await getTeamsForUser(currentUser.id);

	return (
		<div className="space-y-7">
			<div>
				<h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl dark:text-white">
					Teams
				</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					Manage your teams, members, project access, and permissions
				</p>
			</div>
			<TeamsManager
				teams={teams.map(({ team, role, members, projects }) => ({
					id: team.id,
					name: team.name,
					description: team.description,
					role,
					projects: projects.map((project) => ({
						id: project.id,
						name: project.name,
						status: project.status,
					})),
					members: members.map(({ membership, user }) => ({
						id: user.id,
						name: nameOf(user),
						email: user.email,
						role: membership.role,
						isCurrentUser: user.id === currentUser.id,
					})),
				}))}
			/>
		</div>
	);
}
