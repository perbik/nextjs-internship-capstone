import { Show, SignUpButton } from "@clerk/nextjs";
import { CheckSquare, Kanban, Users } from "lucide-react";
import Link from "next/link";

const coreFeatures = [
	{ label: "Drag & Drop Boards", icon: Kanban },
	{ label: "Team Collaboration", icon: Users },
	{ label: "Task Management", icon: CheckSquare },
];

export function LandingHero() {
	return (
		<>
			<section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 sm:px-8 lg:grid-cols-2 lg:gap-16">
				<div>
					<h1 className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-7xl">
						Brix
					</h1>
					<p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground dark:text-muted-foreground sm:text-lg">
						Bring structure to every project. Organize tasks, collaborate with
						your team, and keep progress moving with intuitive drag-and-drop
						Kanban boards.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Show when="signed-in">
							<Link
								href="/dashboard"
								className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(255,68,0,.35)]"
							>
								Start Managing Projects
							</Link>
						</Show>
						<Show when="signed-out">
							<SignUpButton mode="redirect">
								<button
									type="button"
									className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(255,68,0,.35)]"
								>
									Start Managing Projects
								</button>
							</SignUpButton>
						</Show>
						<a
							href="#features"
							className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-medium hover:border-brand/40 hover:bg-brand/5 "
						>
							See how it works
						</a>
					</div>
				</div>
				<div aria-hidden="true" />
			</section>

			<section className="bg-surface-section px-4 py-16 sm:px-8 sm:py-20">
				<div className="mx-auto max-w-3xl text-center">
					<span className="inline-flex h-8 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-muted-foreground shadow-sm  ">
						Core
					</span>
					<h2 className="my-8 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
						Break it down.
						<br />
						Build it up.
					</h2>
					<div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm   sm:grid-cols-3">
						{coreFeatures.map(({ label, icon: Icon }) => (
							<div
								key={label}
								className="flex flex-col items-center gap-3 border-b border-border px-8 py-8 last:border-0  sm:border-b-0 sm:border-r sm:last:border-0"
							>
								<span className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand">
									<Icon size={23} />
								</span>
								<span className="text-sm font-semibold text-muted-foreground ">
									{label}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
