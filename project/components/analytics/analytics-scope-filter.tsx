"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormSelect } from "@/components/ui/form-select";

interface AnalyticsScopeFilterProps {
	value: string;
	teams: Array<{ id: string; name: string }>;
	hasStandaloneProjects: boolean;
}

export function AnalyticsScopeFilter({
	value,
	teams,
	hasStandaloneProjects,
}: AnalyticsScopeFilterProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const options = [
		{ value: "all", label: "All accessible work" },
		...teams.map((team) => ({ value: team.id, label: team.name })),
		...(hasStandaloneProjects
			? [{ value: "standalone", label: "Standalone projects" }]
			: []),
	];

	function changeScope(scope: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("activityPage");
		if (scope === "all") params.delete("team");
		else params.set("team", scope);

		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	return (
		<div className="w-full sm:w-64">
			<label htmlFor="analytics-scope" className="sr-only">
				Analytics scope
			</label>
			<FormSelect
				id="analytics-scope"
				value={value}
				onValueChange={changeScope}
				options={options}
				ariaLabel="Filter analytics by team"
				triggerClassName="w-full"
			/>
		</div>
	);
}
