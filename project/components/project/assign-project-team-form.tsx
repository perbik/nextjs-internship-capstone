"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
	assignProjectTeamAction,
	type ProjectActionState,
} from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";

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
			className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end  "
		>
			<input type="hidden" name="projectId" value={projectId} />
			<div className="flex-1">
				<Label htmlFor="legacy-project-team">Assign project to a team</Label>
				<FormSelect
					id="legacy-project-team"
					name="teamId"
					required
					placeholder="Select a team"
					options={teams.map((team) => ({
						value: team.id,
						label: team.name,
					}))}
					triggerClassName="mt-1"
				/>
			</div>
			<Button type="submit" disabled={pending || teams.length === 0}>
				{pending ? "Assigning..." : "Assign team"}
			</Button>
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
