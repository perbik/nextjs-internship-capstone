"use client";

import { UserProfile } from "@clerk/nextjs";
import { Moon, Palette, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function SettingsContent() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(36rem,1.3fr)]">
			<div className="space-y-6">
				<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<div className="flex items-center gap-2">
						<Palette size={19} className="text-blue_munsell-500" />
						<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Appearance
						</h2>
					</div>
					<p className="mt-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Your theme preference is saved in this browser.
					</p>
					<div className="mt-4 grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => setTheme("light")}
							aria-pressed={theme === "light"}
							className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm ${
								theme === "light"
									? "border-blue_munsell-500 bg-blue_munsell-50 text-blue_munsell-700"
									: "border-french_gray-300 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:hover:bg-paynes_gray-400"
							}`}
						>
							<Sun size={17} />
							Light
						</button>
						<button
							type="button"
							onClick={() => setTheme("dark")}
							aria-pressed={theme === "dark"}
							className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm ${
								theme === "dark"
									? "border-blue_munsell-500 bg-blue_munsell-900/30 text-blue_munsell-300"
									: "border-french_gray-300 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:hover:bg-paynes_gray-400"
							}`}
						>
							<Moon size={17} />
							Dark
						</button>
					</div>
				</section>

				<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<div className="flex items-center gap-2">
						<ShieldCheck size={19} className="text-blue_munsell-500" />
						<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Project roles
						</h2>
					</div>
					<p className="mt-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Owner, admin, and member permissions are assigned separately for
						each project. They are managed from the corresponding project page.
					</p>
				</section>
			</div>

			<section className="overflow-hidden rounded-xl border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<h2 className="sr-only">Account and security</h2>
				<UserProfile routing="hash" />
			</section>
		</div>
	);
}
