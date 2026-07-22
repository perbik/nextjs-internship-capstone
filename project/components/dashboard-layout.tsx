"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Moon,
	Settings,
	Sun,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { useTheme } from "./theme-provider";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Projects", href: "/projects", icon: FolderOpen },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	return (
		<div className="min-h-screen bg-platinum-900 dark:bg-outer_space-600">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Close sidebar"
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-outer_space-500 border-r border-french_gray-300 dark:border-paynes_gray-400 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex items-center justify-between h-16 px-6 border-b border-french_gray-300 dark:border-paynes_gray-400">
					<Link href="/" className="text-2xl font-bold text-blue_munsell-500">
						ProjectFlow
					</Link>
					<button
						type="button"
						aria-label="Close sidebar"
						onClick={() => setSidebarOpen(false)}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="mt-6 px-3">
					<ul className="space-y-1">
						{navigation.map((item) => (
							<li key={item.name}>
								<Link
									href={item.href}
									className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 transition-colors"
								>
									<item.icon className="mr-3" size={20} />
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar */}
				<div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-french_gray-300 dark:border-paynes_gray-400 bg-white dark:bg-outer_space-500 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
					<button
						type="button"
						aria-label="Open sidebar"
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
					>
						<Menu size={20} />
					</button>

					<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						<div className="flex flex-1"></div>
						<div className="flex items-center gap-x-4 lg:gap-x-6">
							<button
								type="button"
								aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
								onClick={() => setTheme(theme === "light" ? "dark" : "light")}
								className="p-2 rounded-lg bg-platinum-500 dark:bg-paynes_gray-500 text-outer_space-500 dark:text-platinum-500 hover:bg-french_gray-500 dark:hover:bg-paynes_gray-400 transition-colors"
							>
								{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
							</button>

							<UserButton />
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
