"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormSelect } from "@/components/ui/form-select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface TaskFiltersProps {
	projectId: string;
	priority?: "low" | "medium" | "high";
	assignee?: string;
	members: Array<{ id: string; name: string; isCurrentUser?: boolean }>;
}

export function TaskFilters({
	projectId,
	priority,
	assignee,
	members,
}: TaskFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedPriority, setSelectedPriority] = useState(priority ?? "");
	const [selectedAssignee, setSelectedAssignee] = useState(assignee ?? "");
	const hasFilters = Boolean(priority || assignee);

	function applyFilters() {
		const nextParams = new URLSearchParams(searchParams.toString());
		if (selectedPriority) nextParams.set("priority", selectedPriority);
		else nextParams.delete("priority");
		if (selectedAssignee) nextParams.set("assignee", selectedAssignee);
		else nextParams.delete("assignee");
		const query = nextParams.toString();
		router.replace(
			query ? `/projects/${projectId}?${query}` : `/projects/${projectId}`,
			{
				scroll: false,
			},
		);
		setIsOpen(false);
	}

	function clearFilters() {
		setSelectedPriority("");
		setSelectedAssignee("");
		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete("priority");
		nextParams.delete("assignee");
		const query = nextParams.toString();
		router.replace(
			query ? `/projects/${projectId}?${query}` : `/projects/${projectId}`,
			{
				scroll: false,
			},
		);
		setIsOpen(false);
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-expanded={isOpen}
					className="inline-flex h-9 items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
				>
					<SlidersHorizontal size={13} />
					Filter
					{hasFilters && <span className="size-1.5 rounded-full bg-brand" />}
				</button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				sideOffset={12}
				className="w-72 rounded-xl border-border bg-card p-4 text-foreground shadow-xl"
			>
				<div className="mb-3 flex items-center justify-between">
					<p className="font-display text-sm font-bold">Filter tasks</p>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						aria-label="Close task filters"
						className="rounded p-1 hover:bg-black/5"
					>
						<X size={16} />
					</button>
				</div>
				<div className="space-y-3">
					<div>
						<label
							htmlFor="task-filter-priority"
							className="block text-xs font-semibold"
						>
							Priority
						</label>
						<FormSelect
							id="task-filter-priority"
							value={selectedPriority}
							onValueChange={setSelectedPriority}
							options={[
								{ value: "", label: "All priorities" },
								{ value: "low", label: "Low" },
								{ value: "medium", label: "Medium" },
								{ value: "high", label: "High" },
							]}
							triggerClassName="mt-1.5"
						/>
					</div>
					<div>
						<label
							htmlFor="task-filter-assignee"
							className="block text-xs font-semibold"
						>
							Assignee
						</label>
						<FormSelect
							id="task-filter-assignee"
							value={selectedAssignee}
							onValueChange={setSelectedAssignee}
							options={[
								{ value: "", label: "All assignees" },
								{ value: "me", label: "Assigned to me" },
								{ value: "unassigned", label: "Unassigned" },
								...members.map((member) => ({
									value: member.id,
									label: `${member.name}${member.isCurrentUser ? " (You)" : ""}`,
								})),
							]}
							triggerClassName="mt-1.5"
						/>
					</div>
				</div>
				<div className="mt-4 flex justify-end gap-2">
					{hasFilters && (
						<button
							type="button"
							onClick={clearFilters}
							className="px-3 py-2 text-sm text-muted-foreground"
						>
							Clear
						</button>
					)}
					<button
						type="button"
						onClick={applyFilters}
						className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
					>
						Apply filters
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
