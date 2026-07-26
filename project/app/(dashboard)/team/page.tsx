import { FolderKanban, Mail, Users } from "lucide-react";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamOverview } from "@/lib/db/queries";

function displayName(user: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
	);
}

function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export default async function TeamPage() {
	const currentUser = await requireCurrentUser();
	const memberships = await getTeamOverview(currentUser.id);
	const collaborators = new Map<
		string,
		{
			user: (typeof memberships)[number]["user"];
			projects: Array<{
				id: string;
				name: string;
				role: "owner" | "admin" | "member";
			}>;
		}
	>();

	for (const membership of memberships) {
		const collaborator = collaborators.get(membership.user.id) ?? {
			user: membership.user,
			projects: [],
		};
		collaborator.projects.push({
			id: membership.projectId,
			name: membership.projectName,
			role: membership.role,
		});
		collaborators.set(membership.user.id, collaborator);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Team
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					People collaborating with you across accessible projects.
				</p>
			</div>

			{collaborators.size === 0 ? (
				<div className="rounded-xl border border-dashed border-french_gray-300 bg-white p-10 text-center dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Users
						size={30}
						className="mx-auto text-blue_munsell-500"
						aria-hidden="true"
					/>
					<p className="mt-3 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						No project collaborators yet.
					</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{Array.from(collaborators.values()).map(({ user, projects }) => {
						const name = displayName(user);

						return (
							<article
								key={user.id}
								className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue_munsell-500 font-semibold text-white">
										{initials(name)}
									</div>
									<div className="min-w-0">
										<h2 className="truncate font-semibold text-outer_space-500 dark:text-platinum-500">
											{name}
											{user.id === currentUser.id ? " (You)" : ""}
										</h2>
										<p className="flex items-center gap-1 truncate text-xs text-paynes_gray-500 dark:text-french_gray-400">
											<Mail size={13} />
											{user.email}
										</p>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									{projects.map((project) => (
										<Link
											key={project.id}
											href={`/projects/${project.id}`}
											className="flex items-center justify-between gap-2 rounded-lg bg-platinum-500/70 px-3 py-2 text-xs hover:bg-platinum-600 dark:bg-outer_space-400 dark:hover:bg-paynes_gray-400"
										>
											<span className="flex min-w-0 items-center gap-2">
												<FolderKanban
													size={14}
													className="shrink-0 text-blue_munsell-500"
												/>
												<span className="truncate">{project.name}</span>
											</span>
											<span className="shrink-0 capitalize text-paynes_gray-500 dark:text-french_gray-400">
												{project.role}
											</span>
										</Link>
									))}
								</div>
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
}
