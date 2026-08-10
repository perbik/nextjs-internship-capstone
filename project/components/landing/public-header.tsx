"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";

export function PublicHeader() {
	const [open, setOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	return (
		<>
			<header className="sticky top-0 z-50 border-b border-border bg-card/92 backdrop-blur-xl  dark:bg-background/92">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-8">
					<Link
						href="/"
						className="font-display text-xl font-extrabold tracking-[-0.5px]"
					>
						Brix
					</Link>
					<div className="hidden items-center gap-2 sm:flex">
						<ThemeButton
							theme={theme}
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						/>
						<Show when="signed-out">
							<SignInButton mode="redirect">
								<button
									type="button"
									className="h-9 rounded-full border border-border px-4 text-sm font-medium hover:border-brand/40 hover:bg-brand/5 "
								>
									Sign In
								</button>
							</SignInButton>
							<SignUpButton mode="redirect">
								<button
									type="button"
									className="h-9 rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
								>
									Get Started
								</button>
							</SignUpButton>
						</Show>
						<Show when="signed-in">
							<Link
								href="/dashboard"
								className="flex h-11 items-center gap-3 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
							>
								Dashboard
								<ArrowRight size={17} />
							</Link>
							<UserButton />
						</Show>
					</div>
					<div className="flex items-center gap-2 sm:hidden">
						<ThemeButton
							theme={theme}
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						/>
						<button
							type="button"
							aria-label="Toggle navigation"
							onClick={() => setOpen(!open)}
							className="flex size-9 items-center justify-center rounded-lg border border-border "
						>
							{open ? <X size={17} /> : <Menu size={17} />}
						</button>
					</div>
				</div>
			</header>
			{open && (
				<div className="fixed inset-x-0 top-14 z-40 flex flex-col gap-2 border-b border-border bg-card p-4 shadow-lg  dark:bg-background sm:hidden">
					<Show when="signed-out">
						<SignInButton mode="redirect">
							<button
								type="button"
								className="h-11 rounded-full border border-border text-sm font-medium "
							>
								Sign In
							</button>
						</SignInButton>
						<SignUpButton mode="redirect">
							<button
								type="button"
								className="h-11 rounded-full bg-brand text-sm font-semibold text-white"
							>
								Get Started
							</button>
						</SignUpButton>
					</Show>
					<Show when="signed-in">
						<Link
							href="/dashboard"
							className="rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
						>
							Dashboard
						</Link>
					</Show>
				</div>
			)}
		</>
	);
}

function ThemeButton({
	theme,
	onClick,
}: {
	theme: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label="Toggle theme"
			onClick={onClick}
			className="flex size-11 items-center justify-center rounded-lg border border-brand bg-brand text-white transition-colors hover:bg-brand-dark dark:text-white"
		>
			{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
		</button>
	);
}
