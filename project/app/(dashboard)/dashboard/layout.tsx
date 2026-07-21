"use client";

import {
	BarChart3,
	Bell,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Search,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Suspense, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home, current: true },
	{ name: "Projects", href: "/projects", icon: FolderOpen, current: false },
	{ name: "Team", href: "/team", icon: Users, current: false },
	{ name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
	{ name: "Calendar", href: "/calendar", icon: Calendar, current: false },
	{ name: "Settings", href: "/settings", icon: Settings, current: false },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

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
					<div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
						<p className="text-xs text-yellow-800 dark:text-yellow-200">
							📋 <strong>Task 2.6:</strong> Create protected dashboard layout
						</p>
					</div>

					<ul className="space-y-1">
						{navigation.map((item) => (
							<li key={item.name}>
								<Link
									href={item.href}
									className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
										item.current
											? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300"
											: "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
									}`}
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
						{/* Search bar placeholder */}
						<div className="flex flex-1 items-center">
							<div className="relative flex-1 max-w-md">
								<Search
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-paynes_gray-500 dark:text-french_gray-400"
									size={16}
								/>
								<input
									type="text"
									placeholder="Search projects, tasks..."
									className="w-full pl-10 pr-4 py-2 bg-platinum-500 dark:bg-paynes_gray-400 border border-french_gray-300 dark:border-paynes_gray-300 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-paynes_gray-500 dark:placeholder-french_gray-400 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
								/>
							</div>
						</div>

						<div className="flex items-center gap-x-4 lg:gap-x-6">
							<button
								type="button"
								aria-label="Notifications"
								className="p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<Bell size={20} />
							</button>

							<ThemeToggle />

							<div className="w-8 h-8 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white font-semibold">
								U
							</div>
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="py-8 px-4 sm:px-6 lg:px-8">
					<Suspense>{children}</Suspense>
				</main>
			</div>
		</div>
	);
}
