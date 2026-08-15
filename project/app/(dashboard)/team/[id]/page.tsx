import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { z } from "zod";
import { TeamDetails } from "@/components/team/team-details";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamForUser } from "@/lib/db/queries";
import { getUserDisplayName } from "@/lib/user-utils";

const teamIdSchema = z.uuid();

export default async function TeamDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, currentUser] = await Promise.all([
		params,
		requireCurrentUser(),
	]);
	const parsedTeamId = teamIdSchema.safeParse(id);
	if (!parsedTeamId.success) notFound();

	// The query returns the team only when the current user is a member
	const result = await getTeamForUser(currentUser.id, parsedTeamId.data);
	if (!result) forbidden();

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
		// Send only the team fields needed by the client
		members: members.map(({ membership, user, projectCount }) => ({
			id: user.id,
			name: getUserDisplayName(user),
			email: user.email,
			role: membership.role,
			isCurrentUser: user.id === currentUser.id,
			projectCount,
		})),
	};

	return (
		<div className="space-y-3">
			<Button
				variant="ghost"
				asChild
				className="-ml-3 rounded-full text-muted-foreground hover:text-brand"
			>
				<Link href="/team">
					<ArrowLeft /> Back to Teams
				</Link>
			</Button>
			<TeamDetails team={managedTeam} />
		</div>
	);
}
