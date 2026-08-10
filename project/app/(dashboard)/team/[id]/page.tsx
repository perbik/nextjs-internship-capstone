import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamDetails } from "@/components/team/team-details";
import { Button } from "@/components/ui/button";
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

export default async function TeamDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, currentUser] = await Promise.all([
		params,
		requireCurrentUser(),
	]);
	const teams = await getTeamsForUser(currentUser.id);
	const result = teams.find(({ team }) => team.id === id);
	if (!result) notFound();

	const { team, role, members, projects } = result;
	const managedTeam = {
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
	};

	return (
		<div className="space-y-6">
			<div>
				<Button
					variant="ghost"
					asChild
					className="-ml-3 mb-3 rounded-full text-muted-foreground hover:text-brand"
				>
					<Link href="/team">
						<ArrowLeft /> Back to Teams
					</Link>
				</Button>
				<h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl dark:text-white">
					{team.name}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					Manage projects, members, access, and permissions for this team
				</p>
			</div>
			<TeamDetails team={managedTeam} />
		</div>
	);
}
