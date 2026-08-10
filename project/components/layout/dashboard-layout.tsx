"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Calendar,
	FolderKanban,
	LayoutDashboard,
	Menu,
	Moon,
	Settings,
	Sun,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Projects", href: "/projects", icon: FolderKanban },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const activeItem =
		navigation.find(({ href }) =>
			href === "/dashboard" ? pathname === href : pathname.startsWith(href),
		) ?? navigation[0];

	return (
		<div className="flex min-h-screen w-full min-w-0 bg-background text-foreground dark:bg-background ">
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Close sidebar"
					className="fixed inset-0 z-40 bg-black/45 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
			>
				<div className="flex h-14 items-start justify-between border-b border-border p-4">
					<Link href="/" onClick={() => setSidebarOpen(false)}>
						<p className="font-display text-xl font-extrabold tracking-[-0.5px]">
							Brix
						</p>
					</Link>
					<button
						type="button"
						aria-label="Close sidebar"
						className="rounded-lg p-1.5 text-muted-foreground hover:bg-black/5 lg:hidden"
						onClick={() => setSidebarOpen(false)}
					>
						<X size={16} />
					</button>
				</div>

				<nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
					{navigation.map((item) => {
						const active = item.name === activeItem.name;
						return (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => setSidebarOpen(false)}
								className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-brand text-white" : "text-muted-foreground hover:bg-brand-light hover:text-brand dark:text-muted-foreground dark:hover:bg-brand/10"}`}
							>
								<item.icon size={16} strokeWidth={active ? 2.5 : 2} />
								{item.name}
							</Link>
						);
					})}
				</nav>
			</aside>

			<div className="w-0 min-w-0 flex-1">
				<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
					<button
						type="button"
						aria-label="Open sidebar"
						onClick={() => setSidebarOpen(true)}
						className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden "
					>
						<Menu size={18} />
					</button>
					<span className="font-display text-base font-semibold">
						{activeItem.name}
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							className="flex size-9 items-center justify-center rounded-md bg-brand text-white hover:bg-brand-dark"
						>
							{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
						</button>
						<UserButton />
					</div>
				</header>

				<main className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6">
					<div className="mx-auto w-full min-w-0 max-w-6xl">{children}</div>
				</main>
			</div>
		</div>
	);
}
