"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectStatus = "active" | "completed" | "on_hold";
type ProjectRole = "owner" | "admin" | "member";

interface ProjectFiltersProps {
	status?: ProjectStatus;
	role?: ProjectRole;
}

const statusOptions: Array<{ label: string; value?: ProjectStatus }> = [
	{ label: "All" },
	{ label: "Active", value: "active" },
	{ label: "On Hold", value: "on_hold" },
	{ label: "Closed", value: "completed" },
];

const roleOptions: Array<{ label: string; value?: ProjectRole }> = [
	{ label: "All Roles" },
	{ label: "Owner", value: "owner" },
	{ label: "Admin", value: "admin" },
	{ label: "Member", value: "member" },
];

export function ProjectFilters({ status, role }: ProjectFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
	const selectedRoleLabel =
		roleOptions.find((option) => option.value === role)?.label ?? "All Roles";

	function updateFilter(name: "status" | "role", value: string) {
		const nextParams = new URLSearchParams(searchParams.toString());
		if (value) {
			nextParams.set(name, value);
		} else {
			nextParams.delete(name);
		}
		const query = nextParams.toString();
		router.replace(query ? `/projects?${query}` : "/projects", {
			scroll: false,
		});
		setIsRoleMenuOpen(false);
	}

	return (
		<div className="mb-4 space-y-4">
			<div className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1.5 ">
				{statusOptions.map((option) => {
					const isActive =
						status === option.value || (!status && !option.value);
					return (
						<button
							key={option.label}
							type="button"
							onClick={() => updateFilter("status", option.value ?? "")}
							aria-pressed={isActive}
							className={`h-10 rounded-full font-display text-sm font-semibold transition ${
								isActive
									? "bg-card text-foreground shadow-sm dark:text-white"
									: "text-muted-foreground hover:text-foreground  dark:hover:text-white"
							}`}
						>
							{option.label}
						</button>
					);
				})}
			</div>

			<DropdownMenu open={isRoleMenuOpen} onOpenChange={setIsRoleMenuOpen}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex h-8 w-44 items-center justify-between rounded-full border border-foreground bg-card px-5 font-display text-xs font-semibold uppercase tracking-[0.325px] text-foreground outline-none transition focus:ring-2 focus:ring-brand/30 dark:text-white"
					>
						<span>{selectedRoleLabel}</span>
						<ChevronDown
							size={16}
							className={`transition-transform ${isRoleMenuOpen ? "rotate-180" : ""}`}
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					sideOffset={8}
					className="w-[min(10rem,calc(100vw-3rem))] rounded-[22px] border-border px-5 py-1.5 text-foreground shadow-[0_14px_35px_rgba(0,0,0,0.14)] bg-popover "
				>
					<DropdownMenuRadioGroup
						value={role ?? "all"}
						onValueChange={(value) =>
							updateFilter("role", value === "all" ? "" : value)
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
		</div>
	);
}
