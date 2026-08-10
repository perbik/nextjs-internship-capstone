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
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 dark:bg-background sm:px-6">
			<div
				aria-hidden="true"
				className="absolute -top-36 -right-28 size-96 rounded-full bg-brand/10 blur-3xl dark:bg-brand/8"
			/>
			<div
				aria-hidden="true"
				className="absolute -bottom-44 -left-24 size-[28rem] rounded-full bg-brand/8 blur-3xl dark:bg-brand/5"
			/>

			<section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.08)]   dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
				<div className="h-1.5 bg-brand" />
				<div className="px-6 py-8 sm:px-10 sm:py-10">
					<a
						href="/"
						className="inline-flex font-display text-xl font-extrabold tracking-[-0.5px] text-foreground "
					>
						Brix
					</a>

					<div className="mt-12 flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
						{icon}
					</div>
					<p className="mt-6 text-sm font-bold tracking-[0.16em] text-brand uppercase">
						{code}
					</p>
					<h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl ">
						{title}
					</h1>
					<p className="mt-4 max-w-md text-base leading-7 text-muted-foreground ">
						{description}
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
				</div>
			</section>
		</main>
	);
}
