import { TeamsManager } from "@/components/team/teams-manager";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamsPageForUser } from "@/lib/db/queries";
import { getUserDisplayName } from "@/lib/user-utils";

function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default async function TeamPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const rawParams = await searchParams;
	const query = firstValue(rawParams.q)?.trim().slice(0, 200) ?? "";
	const parsedPage = Number.parseInt(firstValue(rawParams.page) ?? "1", 10);
	const currentUser = await requireCurrentUser();
	const result = await getTeamsPageForUser(currentUser.id, {
		query,
		page: Number.isFinite(parsedPage) ? parsedPage : 1,
	});

	return (
		<div className="space-y-7">
			<div>
				<h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
					Teams
				</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					Manage your teams, members, project access, and permissions
				</p>
			</div>
			<TeamsManager
				query={query}
				page={result.page}
				totalPages={result.totalPages}
				totalTeams={result.totalTeams}
				// Send only the team fields needed by the client
				teams={result.teams.map(({ team, role, members, projects }) => ({
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
						name: getUserDisplayName(user),
						email: user.email,
						role: membership.role,
						isCurrentUser: user.id === currentUser.id,
					})),
				}))}
			/>
		</div>
	);
}
