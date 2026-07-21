"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<button
			type="button"
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="p-2 rounded-lg bg-platinum-500 dark:bg-paynes_gray-500 text-outer_space-500 dark:text-platinum-500 hover:bg-french_gray-500 dark:hover:bg-paynes_gray-400 transition-colors border border-french_gray-300 dark:border-paynes_gray-400"
		>
			{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
		</button>
	);
}
