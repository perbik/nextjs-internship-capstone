"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useActionState,
	useEffect,
	useOptimistic,
	useRef,
	useState,
} from "react";
import {
	addProjectMemberAction,
	type MemberActionState,
	removeProjectMemberAction,
	updateProjectMemberRoleAction,
} from "@/app/(dashboard)/projects/[id]/member-actions";

interface ManagedMember {
	id: string;
	name: string;
	email: string;
	role: "owner" | "admin" | "member";
	isCurrentUser: boolean;
}

interface OptimisticRoleChange {
	userId: string;
	role: "admin" | "member";
}

const initialState: MemberActionState = { message: "" };

function AddMemberForm({
	projectId,
	actorRole,
}: {
	projectId: string;
	actorRole: "owner" | "admin";
}) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, isPending] = useActionState(
		addProjectMemberAction,
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
			className="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_9rem_auto]"
		>
			<input type="hidden" name="projectId" value={projectId} />
			<label>
				<span className="sr-only">Registered user email</span>
				<input
					type="email"
					name="email"
					required
					placeholder="Registered user email"
					className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
				/>
			</label>
			{actorRole === "owner" ? (
				<label>
					<span className="sr-only">New member role</span>
					<select
						name="role"
						defaultValue="member"
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
					>
						<option value="member">Member</option>
						<option value="admin">Admin</option>
					</select>
				</label>
			) : (
				<input type="hidden" name="role" value="member" />
			)}
			<button
				type="submit"
				disabled={isPending}
				className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-60"
			>
				<UserPlus size={16} />
				{isPending ? "Adding..." : "Add member"}
			</button>
			{state.errors?.email?.[0] && (
				<p className="text-xs text-red-600 md:col-span-full dark:text-red-400">
					{state.errors.email[0]}
				</p>
			)}
			{state.message && (
				<p
					className={`text-xs md:col-span-full ${
						state.success
							? "text-green-700 dark:text-green-400"
							: "text-red-600 dark:text-red-400"
					}`}
					role="status"
				>
					{state.message}
				</p>
			)}
		</form>
	);
}

function RoleForm({
	projectId,
	member,
	onOptimisticRoleChange,
	onRoleChangeCommitted,
}: {
	projectId: string;
	member: ManagedMember;
	onOptimisticRoleChange: (change: OptimisticRoleChange) => void;
	onRoleChangeCommitted: (change: OptimisticRoleChange) => void;
}) {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<"admin" | "member">(
		member.role === "admin" ? "admin" : "member",
	);
	const [state, action, isPending] = useActionState(
		async (previous: MemberActionState, formData: FormData) => {
			const role = formData.get("role");

			if (role === "admin" || role === "member") {
				onOptimisticRoleChange({ userId: member.id, role });
			}

			const result = await updateProjectMemberRoleAction(previous, formData);

			if (result.success) {
				if (role === "admin" || role === "member") {
					onRoleChangeCommitted({ userId: member.id, role });
				}
				router.refresh();
			}

			return result;
		},
		initialState,
	);

	useEffect(() => {
		if (member.role === "admin" || member.role === "member") {
			setSelectedRole(member.role);
		}
	}, [member.role]);

	return (
		<form action={action} className="flex items-center gap-2">
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="userId" value={member.id} />
			<select
				name="role"
				value={selectedRole}
				onChange={(event) =>
					setSelectedRole(event.target.value as "admin" | "member")
				}
				disabled={isPending}
				aria-label={`Role for ${member.name}`}
				className="rounded-lg border border-french_gray-300 bg-white px-2 py-1.5 text-xs capitalize text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
			>
				<option value="member">Member</option>
				<option value="admin">Admin</option>
			</select>
			<button
				type="submit"
				disabled={isPending}
				className="rounded-lg border border-french_gray-300 px-2 py-1.5 text-xs hover:bg-platinum-500 disabled:opacity-60 dark:border-paynes_gray-400 dark:hover:bg-paynes_gray-400"
			>
				{isPending ? "Saving..." : "Save"}
			</button>
			{state.message && (
				<span
					className={
						state.success
							? "text-xs text-green-700 dark:text-green-400"
							: "text-xs text-red-600 dark:text-red-400"
					}
				>
					{state.message}
				</span>
			)}
		</form>
	);
}

function RemoveMemberForm({
	projectId,
	member,
}: {
	projectId: string;
	member: ManagedMember;
}) {
	const router = useRouter();
	const [state, action, isPending] = useActionState(
		removeProjectMemberAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			router.refresh();
		}
	}, [router, state.success]);

	return (
		<form action={action} className="flex items-center gap-2">
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="userId" value={member.id} />
			<button
				type="submit"
				disabled={isPending}
				aria-label={`Remove ${member.name} from project`}
				className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
			>
				<Trash2 size={14} />
				{isPending ? "Removing..." : "Remove"}
			</button>
			{state.message && !state.success && (
				<span className="text-xs text-red-600 dark:text-red-400">
					{state.message}
				</span>
			)}
		</form>
	);
}

export function ProjectMembersManager({
	projectId,
	members,
	actorRole,
}: {
	projectId: string;
	members: ManagedMember[];
	actorRole: "owner" | "admin";
}) {
	const [confirmedMembers, setConfirmedMembers] = useState(members);
	const [optimisticMembers, applyOptimisticRoleChange] = useOptimistic(
		confirmedMembers,
		(currentMembers, change: OptimisticRoleChange) =>
			currentMembers.map((member) =>
				member.id === change.userId ? { ...member, role: change.role } : member,
			),
	);

	useEffect(() => {
		setConfirmedMembers(members);
	}, [members]);

	function commitRoleChange(change: OptimisticRoleChange) {
		setConfirmedMembers((currentMembers) =>
			currentMembers.map((member) =>
				member.id === change.userId ? { ...member, role: change.role } : member,
			),
		);
	}

	return (
		<section className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-4 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<div>
				<h2 className="font-semibold text-outer_space-500 dark:text-platinum-500">
					Manage members
				</h2>
				<p className="mt-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					Add an existing ProjectFlow user by their account email.
				</p>
			</div>

			<AddMemberForm projectId={projectId} actorRole={actorRole} />

			<div className="divide-y divide-french_gray-300 dark:divide-paynes_gray-400">
				{optimisticMembers.map((member) => {
					const canChangeRole =
						actorRole === "owner" && member.role !== "owner";
					const canRemove =
						member.role !== "owner" &&
						(actorRole === "owner" || member.role === "member");

					return (
						<div
							key={member.id}
							className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500">
									{member.name}
									{member.isCurrentUser ? " (You)" : ""}
								</p>
								<p className="truncate text-xs text-paynes_gray-500 dark:text-french_gray-400">
									{member.email} ·{" "}
									<span className="capitalize">{member.role}</span>
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{canChangeRole && (
									<RoleForm
										projectId={projectId}
										member={member}
										onOptimisticRoleChange={applyOptimisticRoleChange}
										onRoleChangeCommitted={commitRoleChange}
									/>
								)}
								{canRemove && (
									<RemoveMemberForm projectId={projectId} member={member} />
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
