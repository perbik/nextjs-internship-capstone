"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
	assignProjectTeamAction,
	type ProjectActionState,
} from "@/app/(dashboard)/projects/actions";

const initialState: ProjectActionState = { message: "" };

export function AssignProjectTeamForm({
	projectId,
	teams,
}: {
	projectId: string;
	teams: Array<{ id: string; name: string }>;
}) {
	const router = useRouter();
	const [state, action, pending] = useActionState(
		assignProjectTeamAction,
		initialState,
	);
	useEffect(() => {
		if (state.success) router.refresh();
	}, [router, state.success]);

	return (
		<form
			action={action}
			className="flex flex-col gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 sm:flex-row sm:items-end dark:border-yellow-900 dark:bg-yellow-950/20"
		>
			<input type="hidden" name="projectId" value={projectId} />
			<label className="flex-1 text-sm font-medium">
				Assign this legacy project to a team
				<select
					name="teamId"
					required
					defaultValue=""
					className="mt-1 w-full rounded-lg border border-yellow-300 bg-white px-3 py-2 dark:border-yellow-900 dark:bg-outer_space-400"
				>
					<option value="" disabled>
						Select a team
					</option>
					{teams.map((team) => (
						<option key={team.id} value={team.id}>
							{team.name}
						</option>
					))}
				</select>
			</label>
			<button
				type="submit"
				disabled={pending || teams.length === 0}
				className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
			>
				{pending ? "Assigning..." : "Assign team"}
			</button>
			{state.message && (
				<span
					role="status"
					className={`text-xs ${state.success ? "text-green-700" : "text-red-600"}`}
				>
					{state.message}
				</span>
			)}
		</form>
	);
}
