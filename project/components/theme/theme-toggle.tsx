"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			type="button"
			variant="default"
			size="icon"
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="size-9 shrink-0 rounded-md border-0 bg-brand p-0 text-white shadow-none hover:bg-brand/90 hover:text-white dark:bg-brand-light dark:text-brand dark:hover:bg-brand-light/90 dark:hover:text-brand [&_svg]:size-4"
		>
			{theme === "light" ? <Moon /> : <Sun />}
		</Button>
	);
}
