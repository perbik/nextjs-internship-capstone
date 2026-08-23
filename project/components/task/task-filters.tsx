"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/shared/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface TaskFiltersProps {
	projectId: string;
	query?: string;
	priority?: "low" | "medium" | "high";
	assignee?: string;
	members: Array<{ id: string; name: string; isCurrentUser?: boolean }>;
}

const PRIORITY_FILTER_OPTIONS = [
	{ value: "", label: "All priorities" },
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

export function TaskFilters({
	projectId,
	query,
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

	// Keep draft selections aligned with the applied URL filters
	useEffect(() => {
		setSelectedPriority(priority ?? "");
		setSelectedAssignee(assignee ?? "");
	}, [priority, assignee]);

	// Preserve search and unrelated parameters when filters change
	function replaceFilters(nextParams: URLSearchParams) {
		const nextQuery = nextParams.toString();
		router.replace(
			nextQuery
				? `/projects/${projectId}?${nextQuery}`
				: `/projects/${projectId}`,
			{ scroll: false },
		);
	}

	function applyFilters() {
		// Selections only become active after Apply is clicked
		const nextParams = new URLSearchParams(searchParams.toString());
		if (selectedPriority) nextParams.set("priority", selectedPriority);
		else nextParams.delete("priority");
		if (selectedAssignee) nextParams.set("assignee", selectedAssignee);
		else nextParams.delete("assignee");
		replaceFilters(nextParams);
		setIsOpen(false);
	}

	function clearFilters() {
		setSelectedPriority("");
		setSelectedAssignee("");
		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete("priority");
		nextParams.delete("assignee");
		replaceFilters(nextParams);
		setIsOpen(false);
	}

	function removeFilter(filter: "priority" | "assignee") {
		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete(filter);

		if (filter === "priority") setSelectedPriority("");
		else setSelectedAssignee("");

		replaceFilters(nextParams);
	}

	const assigneeLabel = assignee
		? assignee === "me"
			? "Assigned to me"
			: assignee === "unassigned"
				? "Unassigned"
				: members.find((member) => member.id === assignee)?.name || "Assignee"
		: null;

	return (
		<div className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-1 sm:flex-wrap">
			<div className="min-w-0 [&_input]:h-8 [&_input]:py-1 sm:w-72 lg:w-80">
				<SearchBar
					initialValue={query}
					placeholder="Search tasks"
					maxLength={200}
					accessibleLabel="Search tasks"
					variant="pill"
				/>
			</div>

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						aria-expanded={isOpen}
						className="h-7 rounded-full bg-card px-4 text-xs"
					>
						<SlidersHorizontal size={13} />
						Filter
						{hasFilters && <span className="size-1.5 rounded-full bg-brand" />}
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={12}
					className="w-72 rounded-xl border-border bg-card p-4 text-foreground shadow-xl"
				>
					<div className="mb-3 flex items-center justify-between">
						<p className="font-display text-sm font-bold">Filter tasks</p>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setIsOpen(false)}
							aria-label="Close task filters"
							className="size-7"
						>
							<X size={16} />
						</Button>
					</div>
					<div className="space-y-3">
						<div>
							<p className="block text-xs font-semibold">Priority</p>
							<FilterDropdown
								label="Priority"
								value={selectedPriority}
								onValueChange={setSelectedPriority}
								options={PRIORITY_FILTER_OPTIONS}
							/>
						</div>
						<div>
							<p className="block text-xs font-semibold">Assignee</p>
							<FilterDropdown
								label="Assignee"
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
							/>
						</div>
					</div>
					<div className="mt-4 flex justify-end gap-2">
						{hasFilters && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="text-muted-foreground"
							>
								Clear
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							onClick={applyFilters}
							className="rounded-full px-4"
						>
							Apply filters
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{priority && (
				<FilterBadge
					label={`${priority[0].toUpperCase()}${priority.slice(1)} priority`}
					onRemove={() => removeFilter("priority")}
				/>
			)}
			{assigneeLabel && (
				<FilterBadge
					label={assigneeLabel}
					onRemove={() => removeFilter("assignee")}
				/>
			)}
		</div>
	);
}

const EMPTY_FILTER_VALUE = "__all__";

function FilterDropdown({
	label,
	value,
	onValueChange,
	options,
}: {
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	options: Array<{ value: string; label: string }>;
}) {
	const selectedLabel =
		options.find((option) => option.value === value)?.label ??
		options[0]?.label;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={`Select ${label.toLowerCase()}`}
					className="mt-1.5 flex h-10 w-full items-center justify-between rounded-lg border border-input bg-control px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/20"
				>
					<span className="truncate">{selectedLabel}</span>
					<ChevronDown
						className="size-4 shrink-0 opacity-50"
						aria-hidden="true"
					/>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-border bg-control"
			>
				<DropdownMenuRadioGroup
					value={value || EMPTY_FILTER_VALUE}
					onValueChange={(nextValue) =>
						onValueChange(nextValue === EMPTY_FILTER_VALUE ? "" : nextValue)
					}
				>
					{options.map((option) => (
						<DropdownMenuRadioItem
							key={option.value || EMPTY_FILTER_VALUE}
							value={option.value || EMPTY_FILTER_VALUE}
							className="rounded-lg focus:bg-brand/10 focus:text-brand"
						>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function FilterBadge({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<Badge
			variant="secondary"
			className="h-8 gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 text-xs font-semibold text-brand"
		>
			{label}
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Remove ${label} filter`}
				className="rounded-full p-0.5 hover:bg-brand/15"
			>
				<X className="size-3" aria-hidden="true" />
			</button>
		</Badge>
	);
}
