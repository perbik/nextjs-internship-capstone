import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
	AnalyticsPreview,
	CalendarPreview,
	KanbanPreview,
	TeamPreview,
} from "@/components/landing/feature-previews";
import { Button } from "@/components/ui/button";

const FEATURE_CARDS = [
	{
		title: "Dashboard & Analytics",
		description:
			"Get a clear view of your projects, tasks, and team performance, so you always know what's moving and what needs attention.",
		preview: AnalyticsPreview,
	},
	{
		title: "Kanban Board",
		description:
			"Organize tasks, visualize progress, and move work forward with a flexible Kanban board built for clarity and control.",
		preview: KanbanPreview,
	},
	{
		title: "Team",
		description:
			"Bring your team together, manage roles and permissions, and keep collaboration connected across every project.",
		preview: TeamPreview,
	},
	{
		title: "Calendar",
		description:
			"Keep deadlines, milestones, and team schedules in view so everyone stays aligned and on time.",
		preview: CalendarPreview,
	},
];

export function FeatureShowcase() {
	return (
		<>
			<section
				id="features"
				aria-labelledby="features-heading"
				className="bg-surface-section px-4 py-20 sm:px-8"
			>
				<div className="mx-auto max-w-5xl">
					<div className="mb-12 text-center">
						<span className="inline-flex h-8 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-muted-foreground shadow-sm">
							Features
						</span>
						<h2
							id="features-heading"
							className="mt-8 font-display text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-13.75"
						>
							Keeps everything in one place
						</h2>
						<p className="mt-3 text-base text-muted-foreground">
							Project management without the complexity.
						</p>
					</div>
					<div className="grid gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm md:grid-cols-2">
						{FEATURE_CARDS.map(({ title, description, preview: Preview }) => (
							<article
								key={title}
								className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
							>
								<Preview />
								<div className="border-t border-border p-5">
									<h3 className="font-display text-base font-bold">{title}</h3>
									<p className="mt-1.5 text-sm leading-[22.75px] text-muted-foreground">
										{description}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
			<section
				aria-labelledby="landing-cta-heading"
				className="bg-surface-section px-4 py-28 text-center sm:px-8"
			>
				<div className="mx-auto max-w-2xl">
					<h2
						id="landing-cta-heading"
						className="font-display text-3xl font-bold tracking-tight sm:text-5xl"
					>
						Start Building with Brix Today!
					</h2>
					<p className="mx-auto mt-5 max-w-xl text-lg leading-7.25 text-muted-foreground">
						Turn plans into progress, keep your team aligned, and start building
						better projects today.
					</p>
					<Button
						asChild
						size="lg"
						className="mt-10 h-14 rounded-full px-8 text-base hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(255,68,0,.35)]"
					>
						<Link href="/dashboard">
							Start Managing Projects
							<ArrowRight size={17} aria-hidden="true" />
						</Link>
					</Button>
				</div>
			</section>
		</>
	);
}
