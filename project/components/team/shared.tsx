import type { TeamActionState } from "@/app/(dashboard)/team/actions";

export const initialTeamActionState: TeamActionState = { message: "" };

export const avatarStyles = [
	"bg-[#ffe1d6] text-[#eb5d2a]",
	"bg-[#dcecff] text-[#3975bd]",
	"bg-[#e8ddff] text-[#7b54bd]",
	"bg-[#d9f5e5] text-[#34845b]",
];

export function initials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

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
