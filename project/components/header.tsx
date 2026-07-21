"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./theme-provider";

export function Header() {
	const { theme, setTheme } = useTheme();

	return (
		<header className="border-b border-french_gray-300 dark:border-paynes_gray-400 bg-white/80 dark:bg-outer_space-500/80 backdrop-blur-sm">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<Link href="/" className="text-2xl font-bold text-blue_munsell-500">
							TaskFlow
						</Link>
					</div>

					<nav className="hidden md:flex space-x-8">
						<Link
							href="#features"
							className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
						>
							Features
						</Link>
						<Link
							href="#pricing"
							className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
						>
							Pricing
						</Link>
						<Link
							href="#about"
							className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
						>
							About
						</Link>
					</nav>

					<div className="flex items-center space-x-4">
						<button
							type="button"
							aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							className="p-2 rounded-lg bg-platinum-500 dark:bg-paynes_gray-500 text-outer_space-500 dark:text-platinum-500 hover:bg-french_gray-500 dark:hover:bg-paynes_gray-400 transition-colors"
						>
							{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
						</button>

						<Link
							href="/dashboard"
							className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
						>
							Get Started
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
