"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
	const [open, setOpen] = useState(false);

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
						<ThemeToggle />
						<Show when="signed-out">
							<SignInButton mode="redirect">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="rounded-full px-5"
								>
									Sign In
								</Button>
							</SignInButton>
							<SignUpButton mode="redirect">
								<Button type="button" size="sm" className="rounded-full px-6">
									Get Started
								</Button>
							</SignUpButton>
						</Show>
						<Show when="signed-in">
							<Link
								href="/dashboard"
								className="flex h-9 items-center gap-3 rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
							>
								Dashboard
								<ArrowRight size={17} />
							</Link>
							<UserButton />
						</Show>
					</div>
					<div className="flex items-center gap-2 sm:hidden">
						<ThemeToggle />
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
							<Button
								type="button"
								variant="outline"
								className="h-11 rounded-full"
							>
								Sign In
							</Button>
						</SignInButton>
						<SignUpButton mode="redirect">
							<Button type="button" className="h-11 rounded-full">
								Get Started
							</Button>
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
