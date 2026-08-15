import type { TeamActionState } from "@/app/(dashboard)/team/actions";

// Show form feedback
export function TeamActionStatus({ state }: { state: TeamActionState }) {
	if (!state.message) return null;

	return (
		<p
			role={state.success ? "status" : "alert"}
			className={`text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}
		>
			{state.message}
		</p>
	);
}
