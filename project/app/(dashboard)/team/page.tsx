import { TeamsManager } from "@/components/teams-manager";
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
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Teams
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					Invite registered users into teams, then grant selected team members
					access to individual projects.
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
