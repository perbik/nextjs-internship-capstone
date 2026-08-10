"use client";

import { ArrowRight, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CreateTeamDialog } from "@/components/team/create-team-dialog";
import type { ManagedTeam } from "@/components/team/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TeamsManager({ teams }: { teams: ManagedTeam[] }) {
	const [query, setQuery] = useState("");
	const filteredTeams = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return teams;
		return teams.filter((team) =>
			[
				team.name,
				team.description ?? "",
				...team.projects.map((project) => project.name),
				...team.members.flatMap((member) => [member.name, member.email]),
			].some((value) => value.toLowerCase().includes(normalizedQuery)),
		);
	}, [query, teams]);

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-80">
					<Search
						size={17}
						className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search teams"
						aria-label="Search teams"
						className="h-11 rounded-full border-border bg-card pl-11 shadow-none"
					/>
				</div>
				<CreateTeamDialog />
			</div>

			{teams.length === 0 ? (
				<Card className="rounded-2xl border-dashed border-input bg-card p-10 text-center shadow-none">
					<Users className="mx-auto text-brand" size={30} />
					<h2 className="mt-3 font-bold">Create your first team</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Projects require a team before collaborators can be invited.
					</p>
				</Card>
			) : filteredTeams.length === 0 ? (
				<Card className="rounded-2xl border-border bg-card p-10 text-center shadow-none">
					<Search className="mx-auto text-muted-foreground" size={28} />
					<p className="mt-3 text-sm font-semibold">No teams match “{query}”</p>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{filteredTeams.map((team) => (
						<TeamSummaryCard key={team.id} team={team} />
					))}
				</div>
			)}
		</div>
	);
}

function TeamSummaryCard({ team }: { team: ManagedTeam }) {
	const activeProjects = team.projects.filter(
		(project) => project.status === "active",
	).length;

	return (
		<Link href={`/team/${team.id}`} className="group block h-full">
			<Card className="flex h-full min-h-48 flex-col rounded-2xl border-border bg-card p-5 shadow-[0_1px_8px_rgba(0,0,0,.04)] transition-all group-hover:-translate-y-0.5 group-hover:border-brand/30 group-hover:shadow-[0_10px_25px_rgba(0,0,0,.08)]  ">
				<div className="flex items-start justify-between gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<Users size={20} />
					</div>
					<Badge className="rounded-full border-0 bg-brand/10 px-2.5 text-[10px] font-bold capitalize text-brand hover:bg-brand/10">
						{team.role}
					</Badge>
				</div>
				<h2 className="mt-4 truncate font-display text-lg font-extrabold text-foreground dark:text-white">
					{team.name}
				</h2>
				<p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
					{team.description || "A shared workspace for your team and projects."}
				</p>
				<div className="mt-auto flex items-end justify-between gap-3 pt-5">
					<p className="text-xs text-muted-foreground">
						{team.members.length}{" "}
						{team.members.length === 1 ? "member" : "members"} ·{" "}
						{activeProjects} active · {team.projects.length}{" "}
						{team.projects.length === 1 ? "project" : "projects"}
					</p>
					<ArrowRight
						className="shrink-0 text-brand transition-transform group-hover:translate-x-1"
						size={18}
					/>
				</div>
			</Card>
		</Link>
	);
}
