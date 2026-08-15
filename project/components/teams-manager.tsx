"use client";

import { ChevronDown, Plus, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
	addTeamMemberAction,
	createTeamAction,
	removeTeamMemberAction,
	type TeamActionState,
	updateTeamMemberRoleAction,
} from "@/app/(dashboard)/team/actions";
import { CreateProjectModal } from "@/components/modals/create-project-modal";

interface ManagedTeam {
	id: string;
	name: string;
	description: string | null;
	role: "owner" | "admin" | "member";
	projects: Array<{
		id: string;
		name: string;
		status: "active" | "completed" | "on_hold";
	}>;
	members: Array<{
		id: string;
		name: string;
		email: string;
		role: "owner" | "admin" | "member";
		isCurrentUser: boolean;
	}>;
}

const initialState: TeamActionState = { message: "" };

function Status({ state }: { state: TeamActionState }) {
	if (!state.message) return null;
	return (
		<span
			role="status"
			className={`text-xs ${state.success ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
		>
			{state.message}
		</span>
	);
}

function CreateTeamForm() {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [open, setOpen] = useState(false);
	const [state, action, pending] = useActionState(
		createTeamAction,
		initialState,
	);
	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
			setOpen(false);
			router.refresh();
		}
	}, [router, state.success]);

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-2 rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white"
			>
				<Plus size={16} /> Create team
			</button>
		);
	}
	return (
		<form
			ref={formRef}
			action={action}
			className="grid gap-3 rounded-xl border border-french_gray-300 bg-white p-4 md:grid-cols-[1fr_1.5fr_auto] dark:border-paynes_gray-400 dark:bg-outer_space-500"
		>
			<input
				name="name"
				required
				maxLength={100}
				placeholder="Team name"
				className="rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
			/>
			<input
				name="description"
				maxLength={500}
				placeholder="What does this team work on?"
				className="rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
			/>
			<div className="flex gap-2">
				<button
					type="submit"
					disabled={pending}
					className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm text-white disabled:opacity-60"
				>
					{pending ? "Creating..." : "Create"}
				</button>
				<button
					type="button"
					onClick={() => setOpen(false)}
					className="rounded-lg border border-french_gray-300 px-3 py-2 text-sm dark:border-paynes_gray-400"
				>
					Cancel
				</button>
			</div>
			<div className="md:col-span-full">
				<Status state={state} />
			</div>
		</form>
	);
}

function InviteForm({ team }: { team: Pick<ManagedTeam, "id" | "role"> }) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, pending] = useActionState(
		addTeamMemberAction,
		initialState,
	);
	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
			router.refresh();
		}
	}, [router, state.success]);

	return (
		<form
			ref={formRef}
			action={action}
			className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]"
		>
			<input type="hidden" name="teamId" value={team.id} />
			<input
				type="email"
				name="email"
				required
				placeholder="Registered user email"
				className="rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
			/>
			{team.role === "owner" ? (
				<select
					name="role"
					defaultValue="member"
					className="rounded-lg border border-french_gray-300 bg-white px-2 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
				>
					<option value="member">Member</option>
					<option value="admin">Admin</option>
				</select>
			) : (
				<input type="hidden" name="role" value="member" />
			)}
			<button
				type="submit"
				disabled={pending}
				className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue_munsell-500 px-3 py-2 text-sm text-white disabled:opacity-60"
			>
				<UserPlus size={15} />
				{pending ? "Inviting..." : "Invite member"}
			</button>
			<div className="sm:col-span-full">
				<Status state={state} />
			</div>
		</form>
	);
}

function MemberControls({
	team,
	member,
}: {
	team: Pick<ManagedTeam, "id" | "role">;
	member: ManagedTeam["members"][number];
}) {
	const router = useRouter();
	const [role, setRole] = useState<"admin" | "member">(
		member.role === "admin" ? "admin" : "member",
	);
	const [roleState, roleAction, rolePending] = useActionState(
		updateTeamMemberRoleAction,
		initialState,
	);
	const [removeState, removeAction, removePending] = useActionState(
		removeTeamMemberAction,
		initialState,
	);
	useEffect(() => {
		if (roleState.success || removeState.success) router.refresh();
	}, [removeState.success, roleState.success, router]);

	const canChange = team.role === "owner" && member.role !== "owner";
	const canRemove =
		member.role !== "owner" &&
		(team.role === "owner" || member.role === "member");

	return (
		<div className="flex flex-wrap items-center gap-2">
			{canChange && (
				<form action={roleAction} className="flex items-center gap-2">
					<input type="hidden" name="teamId" value={team.id} />
					<input type="hidden" name="userId" value={member.id} />
					<select
						name="role"
						value={role}
						onChange={(event) =>
							setRole(event.target.value as "admin" | "member")
						}
						disabled={rolePending}
						className="rounded-lg border border-french_gray-300 bg-white px-2 py-1.5 text-xs dark:border-paynes_gray-400 dark:bg-outer_space-400"
					>
						<option value="member">Member</option>
						<option value="admin">Admin</option>
					</select>
					<button
						type="submit"
						disabled={rolePending}
						className="rounded-lg border border-french_gray-300 px-2 py-1.5 text-xs dark:border-paynes_gray-400"
					>
						{rolePending ? "Saving..." : "Save"}
					</button>
					<Status state={roleState} />
				</form>
			)}
			{canRemove && (
				<form action={removeAction} className="flex items-center gap-2">
					<input type="hidden" name="teamId" value={team.id} />
					<input type="hidden" name="userId" value={member.id} />
					<button
						type="submit"
						disabled={removePending}
						className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-600 dark:text-red-400"
					>
						<Trash2 size={14} />
						{removePending ? "Removing..." : "Remove"}
					</button>
					{!removeState.success && <Status state={removeState} />}
				</form>
			)}
		</div>
	);
}

export function TeamsManager({ teams }: { teams: ManagedTeam[] }) {
	return (
		<div className="space-y-5">
			<CreateTeamForm />
			{teams.length === 0 ? (
				<div className="rounded-xl border border-dashed border-french_gray-300 bg-white p-10 text-center dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Users className="mx-auto text-blue_munsell-500" size={30} />
					<h2 className="mt-3 font-semibold">Create your first team</h2>
					<p className="mt-1 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Projects require a team before collaborators can be invited.
					</p>
				</div>
			) : (
				<div className="grid items-start gap-4 xl:grid-cols-2">
					{teams.map((team) => {
						const canManage = team.role === "owner" || team.role === "admin";
						return (
							<details
								key={team.id}
								className="group rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500"
							>
								<summary className="flex cursor-pointer list-none items-center justify-between p-5">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex size-11 items-center justify-center rounded-lg bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900/50 dark:text-blue_munsell-300">
											<Users size={20} />
										</div>
										<div className="min-w-0">
											<h2 className="truncate font-semibold">{team.name}</h2>
											<p className="text-xs capitalize text-paynes_gray-500 dark:text-french_gray-400">
												{team.members.length} members · {team.projects.length}{" "}
												projects · {team.role}
											</p>
										</div>
									</div>
									<ChevronDown
										size={18}
										className="transition group-open:rotate-180"
									/>
								</summary>
								<div className="space-y-4 border-t border-french_gray-300 p-5 dark:border-paynes_gray-400">
									{team.description && (
										<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
											{team.description}
										</p>
									)}
									{canManage && (
										<div className="space-y-3">
											<CreateProjectModal
												teams={[{ id: team.id, name: team.name }]}
												defaultTeamId={team.id}
											/>
											<InviteForm team={team} />
										</div>
									)}
									{team.projects.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{team.projects.map((project) => (
												<Link
													key={project.id}
													href={`/projects/${project.id}`}
													className="rounded-lg bg-platinum-700 px-3 py-2 text-xs dark:bg-outer_space-400"
												>
													{project.name}
												</Link>
											))}
										</div>
									)}
									<div className="divide-y divide-french_gray-300 dark:divide-paynes_gray-400">
										{team.members.map((member) => (
											<div
												key={member.id}
												className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
											>
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{member.name}
														{member.isCurrentUser ? " (You)" : ""}
													</p>
													<p className="truncate text-xs text-paynes_gray-500 dark:text-french_gray-400">
														{member.email} ·{" "}
														<span className="capitalize">{member.role}</span>
													</p>
												</div>
												{canManage && (
													<MemberControls team={team} member={member} />
												)}
											</div>
										))}
									</div>
								</div>
							</details>
						);
					})}
				</div>
			)}
		</div>
	);
}
