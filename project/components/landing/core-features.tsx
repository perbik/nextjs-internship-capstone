import { CheckSquare, Kanban, Users } from "lucide-react";

const CORE_FEATURES = [
	{ label: "Drag & Drop Boards", icon: Kanban },
	{ label: "Team Collaboration", icon: Users },
	{ label: "Task Management", icon: CheckSquare },
];

export function CoreFeatures() {
	return (
		<section
			aria-labelledby="core-features-heading"
			className="bg-surface-section px-4 py-16 sm:px-8 sm:py-20"
		>
			<div className="mx-auto max-w-3xl text-center">
				<span className="inline-flex h-8 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-muted-foreground shadow-sm">
					Core
				</span>
				<h2
					id="core-features-heading"
					className="my-8 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
				>
					Break it down.
					<br />
					Build it up.
				</h2>
				<ul className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-3">
					{CORE_FEATURES.map(({ label, icon: Icon }) => (
						<li
							key={label}
							className="flex flex-col items-center gap-3 border-b border-border px-8 py-8 last:border-0 sm:border-b-0 sm:border-r sm:last:border-0"
						>
							<span className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand">
								<Icon size={23} aria-hidden="true" />
							</span>
							<span className="text-sm font-semibold text-muted-foreground">
								{label}
							</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
