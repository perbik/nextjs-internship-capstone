"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Calendar,
	FolderKanban,
	LayoutDashboard,
	Menu,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import type { NotificationSummary } from "@/components/notifications/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Projects", href: "/projects", icon: FolderKanban },
	{ name: "Teams", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

function isNavigationItemActive(pathname: string, href: string) {
	return (
		pathname === href ||
		(href !== "/dashboard" && pathname.startsWith(`${href}/`))
	);
}

function SidebarContent({
	pathname,
	onNavigate,
}: {
	pathname: string;
	onNavigate?: () => void;
}) {
	return (
		<>
			<div className="flex h-14 items-center border-b border-border px-4">
				<Link href="/" onClick={onNavigate}>
					<p className="font-display text-xl font-extrabold tracking-[-0.5px]">
						Brix
					</p>
				</Link>
			</div>

			<nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
				{navigation.map((item) => {
					const active = isNavigationItemActive(pathname, item.href);
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={onNavigate}
							aria-current={active ? "page" : undefined}
							className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-brand text-white" : "text-muted-foreground hover:bg-brand-light hover:text-brand dark:hover:bg-brand/10"}`}
						>
							<item.icon size={16} strokeWidth={active ? 2.5 : 2} />
							{item.name}
						</Link>
					);
				})}
			</nav>
		</>
	);
}

export function DashboardLayout({
	children,
	notifications,
}: {
	children: React.ReactNode;
	notifications: NotificationSummary;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const pathname = usePathname();
	const activeItem =
		navigation.find(({ href }) => isNavigationItemActive(pathname, href)) ??
		navigation[0];

	return (
		<div className="flex min-h-screen w-full min-w-0 bg-background text-foreground">
			<aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
				<SidebarContent pathname={pathname} />
			</aside>

			<div className="w-0 min-w-0 flex-1">
				<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
					<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
						<SheetTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Open sidebar"
								aria-controls="mobile-dashboard-navigation"
								aria-expanded={sidebarOpen}
								className="size-9 lg:hidden"
							>
								<Menu size={18} />
							</Button>
						</SheetTrigger>
						<SheetContent
							id="mobile-dashboard-navigation"
							side="left"
							className="flex w-60 flex-col gap-0 border-border bg-card p-0 sm:max-w-60 lg:hidden"
						>
							<SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
							<SidebarContent
								pathname={pathname}
								onNavigate={() => setSidebarOpen(false)}
							/>
						</SheetContent>
					</Sheet>
					<span className="font-display text-base font-semibold">
						{activeItem.name}
					</span>
					<div className="flex items-center gap-2">
						<NotificationCenter summary={notifications} />
						<ThemeToggle />
						<UserButton />
					</div>
				</header>

				<main className="min-w-0 overflow-x-hidden px-4 pb-6 pt-6 sm:px-6">
					<div className="mx-auto w-full min-w-0 max-w-360">{children}</div>
				</main>
			</div>
		</div>
	);
}
