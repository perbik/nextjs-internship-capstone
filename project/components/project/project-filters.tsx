"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectStatus } from "@/lib/db/schema";

type ProjectRole = "owner" | "admin" | "member";

interface ProjectFiltersProps {
	status?: ProjectStatus;
	role?: ProjectRole;
	pagination?: ReactNode;
}

const statusOptions: Array<{ label: string; value?: ProjectStatus }> = [
	{ label: "All" },
	{ label: "Active", value: "active" },
	{ label: "On Hold", value: "on_hold" },
	// The completed database status is presented as Closed in the interface
	{ label: "Closed", value: "completed" },
];

const roleOptions: Array<{ label: string; value?: ProjectRole }> = [
	{ label: "All Roles" },
	{ label: "Owner", value: "owner" },
	{ label: "Admin", value: "admin" },
	{ label: "Member", value: "member" },
];

export function ProjectFilters({
	status,
	role,
	pagination,
}: ProjectFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
	const selectedRoleLabel =
		roleOptions.find((option) => option.value === role)?.label ?? "All Roles";

	function updateFilter(
		name: "status" | "role",
		value: ProjectStatus | ProjectRole | "",
	) {
		const nextParams = new URLSearchParams(searchParams.toString());
		if (value) {
			nextParams.set(name, value);
		} else {
			nextParams.delete(name);
		}
		nextParams.delete("page");
		const query = nextParams.toString();
		router.replace(query ? `/projects?${query}` : "/projects", {
			scroll: false,
		});
		setIsRoleMenuOpen(false);
	}

	return (
		<div className="mb-3 space-y-3">
			<fieldset className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1">
				<legend className="sr-only">Filter projects by status</legend>
				{statusOptions.map((option) => {
					const isActive =
						status === option.value || (!status && !option.value);
					return (
						<Button
							key={option.label}
							type="button"
							variant="ghost"
							onClick={() => updateFilter("status", option.value ?? "")}
							aria-pressed={isActive}
							className={`h-9 rounded-full font-display text-sm font-semibold transition ${
								isActive
									? "bg-card text-foreground shadow-sm hover:bg-card hover:text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{option.label}
						</Button>
					);
				})}
			</fieldset>

			<div className="flex items-center justify-between gap-2 sm:gap-3">
				<DropdownMenu open={isRoleMenuOpen} onOpenChange={setIsRoleMenuOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="outline"
							aria-label={`Filter projects by role. Current filter: ${selectedRoleLabel}`}
							className="flex h-8 w-36 items-center justify-between rounded-full border-input bg-card px-4 font-display text-[11px] font-semibold uppercase tracking-[0.325px] text-foreground sm:w-44 sm:px-5 sm:text-xs"
						>
							<span>{selectedRoleLabel}</span>
							<ChevronDown
								size={16}
								className={`transition-transform ${isRoleMenuOpen ? "rotate-180" : ""}`}
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						sideOffset={8}
						className="w-[min(10rem,calc(100vw-3rem))] rounded-[22px] border-border bg-popover px-5 py-1.5 text-foreground shadow-[0_14px_35px_rgba(0,0,0,0.14)]"
					>
						<DropdownMenuRadioGroup
							value={role ?? "all"}
							onValueChange={(value) =>
								updateFilter(
									"role",
									value === "all" ? "" : (value as ProjectRole),
								)
							}
						>
							{roleOptions.map((option) => (
								<DropdownMenuRadioItem
									key={option.label}
									value={option.value ?? "all"}
									className="h-10 cursor-pointer rounded-none px-0 font-display text-sm font-semibold focus:bg-transparent focus:text-brand data-[state=checked]:text-brand [&>span]:hidden"
								>
									{option.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				{pagination}
			</div>
		</div>
	);
}
