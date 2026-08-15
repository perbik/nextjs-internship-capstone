import Link from "next/link";
import type { ReactNode } from "react";

interface StatusPageProps {
	code: string;
	description: string;
	icon: ReactNode;
	title: string;
	children: ReactNode;
}

export function StatusPage({
	code,
	description,
	icon,
	title,
	children,
}: StatusPageProps) {
	return (
		<div className="flex min-h-[calc(100svh-5rem)] items-center justify-center bg-background px-4 py-6 sm:px-6">
			<section className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<div className="h-1 bg-brand" />
				<div className="px-6 py-7 sm:px-8 sm:py-8">
					<Link
						href="/"
						className="inline-flex rounded-sm font-display text-xl font-extrabold tracking-[-0.5px] text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						Brix
					</Link>

					<div className="mt-8 flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
						{icon}
					</div>
					<p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand uppercase">
						{code}
					</p>
					<h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-foreground">
						{title}
					</h1>
					<p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
						{description}
					</p>

					<div className="mt-7 flex flex-col gap-3 sm:flex-row">{children}</div>
				</div>
			</section>
		</div>
	);
}
