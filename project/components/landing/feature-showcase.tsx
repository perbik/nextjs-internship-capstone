import { ArrowRight, TrendingUp, UserRound } from "lucide-react";
import Link from "next/link";

const cards = [
	{
		title: "Dashboard & Analytics",
		description:
			"Get a clear view of your projects, tasks, and team performance, so you always know what's moving and what needs attention.",
		preview: <AnalyticsPreview />,
	},
	{
		title: "Kanban Board",
		description:
			"Organize tasks, visualize progress, and move work forward with a flexible Kanban board built for clarity and control.",
		preview: <KanbanPreview />,
	},
	{
		title: "Team",
		description:
			"Bring your team together, manage roles and permissions, and keep collaboration connected across every project.",
		preview: <TeamPreview />,
	},
	{
		title: "Calendar",
		description:
			"Keep deadlines, milestones, and team schedules in view so everyone stays aligned and on time.",
		preview: <CalendarPreview />,
	},
];

export function FeatureShowcase() {
	return (
		<>
			<section id="features" className="bg-surface-section px-4 py-20 sm:px-8">
				<div className="mx-auto max-w-5xl">
					<div className="mb-12 text-center">
						<span className="inline-flex h-8 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-muted-foreground shadow-sm   ">
							Features
						</span>
						<h2 className="mt-8 font-display text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-[55px]">
							Keeps everything in one place
						</h2>
						<p className="mt-3 text-base text-muted-foreground dark:text-muted-foreground">
							Project management without the complexity.
						</p>
					</div>
					<div className="grid gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm   md:grid-cols-2">
						{cards.map((card) => (
							<article
								key={card.title}
								className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm  "
							>
								{card.preview}
								<div className="border-t border-border p-5 ">
									<h3 className="font-display text-base font-bold">
										{card.title}
									</h3>
									<p className="mt-1.5 text-sm leading-[22.75px] text-muted-foreground dark:text-muted-foreground">
										{card.description}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
			<section className="bg-surface-section px-4 py-28 text-center sm:px-8">
				<div className="mx-auto max-w-2xl">
					<h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
						Start Building with Brix Today!
					</h2>
					<p className="mx-auto mt-5 max-w-xl text-lg leading-[29px] text-muted-foreground dark:text-muted-foreground">
						Turn plans into progress, keep your team aligned, and start building
						better projects today.
					</p>
					<Link
						href="/dashboard"
						className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(255,68,0,.35)]"
					>
						Start Managing Projects <ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}

function AnalyticsPreview() {
	return (
		<div className="flex h-44 flex-col justify-end bg-[#f9f5f3] p-5 dark:bg-brand/5">
			<div className="flex h-24 items-end gap-1.5 border-b border-black/5 pb-3 dark:border-white/5">
				{[34, 53, 29, 76, 46, 62, 42].map((height, index) => (
					<span
						key={height}
						className={`flex-1 rounded-t ${index === 3 ? "bg-brand" : index === 5 ? "bg-brand-mid" : "bg-[#e8e0dc] "}`}
						style={{ height: `${height}%` }}
					/>
				))}
			</div>
			<div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
				<span>Project velocity</span>
				<span className="flex items-center gap-1 font-bold text-green-500">
					<TrendingUp size={14} />
					100%
				</span>
			</div>
			<span className="mt-2 text-[11px] text-muted-foreground">Aug 2026</span>
		</div>
	);
}

function KanbanPreview() {
	return (
		<div className="grid h-44 grid-cols-3 gap-2 bg-[#fff8f6] p-4 dark:bg-brand/5">
			{["To Do", "In Progress", "Done"].map((label, index) => (
				<div key={label}>
					<p className="mb-2 flex items-center justify-between text-[10px] font-bold">
						<span>{label}</span>
						<span>{index + 2}</span>
					</p>
					<div className="space-y-2">
						{["first", "second", "third"]
							.slice(0, index === 1 ? 2 : 3)
							.map((task, taskIndex) => (
								<div
									key={`${label}-${task}`}
									className="h-7 rounded border border-black/5 bg-card p-1.5 dark:border-white/5 "
								>
									<span
										className={`block h-1.5 rounded ${taskIndex === 0 ? "w-3/4 bg-brand/70" : "w-1/2 bg-[#e8e0dc] "}`}
									/>
								</div>
							))}
					</div>
				</div>
			))}
		</div>
	);
}

function TeamPreview() {
	return (
		<div className="flex h-44 flex-col justify-center gap-2.5 bg-[#fff8f6] p-4 dark:bg-brand/5">
			{[
				["Alex R.", "Manager"],
				["Sam K.", "Designer"],
				["Jordan T.", "Dev"],
			].map(([name, role], index) => (
				<div
					key={name}
					className="flex items-center gap-2.5 rounded-xl border border-black/7 bg-card px-3 py-2  "
				>
					<span className="flex size-8 items-center justify-center rounded-lg bg-control-muted text-muted-foreground ">
						<UserRound size={15} />
					</span>
					<span className="min-w-0 flex-1">
						<strong className="block text-xs">{name}</strong>
						<small className="block text-[10px] text-muted-foreground">
							{role}
						</small>
					</span>
					{index === 1 && <span className="size-2 rounded-full bg-green-500" />}
				</div>
			))}
		</div>
	);
}

function CalendarPreview() {
	return (
		<div className="flex h-44 flex-col justify-center gap-2.5 bg-[#fff8f6] p-4 dark:bg-brand/5">
			<div className="flex justify-between text-xs font-bold">
				<span>August 2026</span>
				<span className="text-[11px] text-brand">2 events</span>
			</div>
			{[
				["Project", "Website Redesign", "Aug 26"],
				["Meeting", "Project Alignment", "Aug 29"],
			].map(([type, title, date], index) => (
				<div
					key={title}
					className={`flex items-center gap-2.5 rounded-xl border border-black/7 bg-card px-3 py-2.5   ${index ? "opacity-50" : ""}`}
				>
					<span
						className={`h-8 w-0.5 rounded-full ${index ? "bg-brand-mid" : "bg-brand"}`}
					/>
					<span className="min-w-0 flex-1">
						<small className="block text-[10px] text-muted-foreground">
							{type}
						</small>
						<strong className="block truncate text-xs">{title}</strong>
					</span>
					<span className="text-[11px] font-semibold">{date}</span>
				</div>
			))}
		</div>
	);
}
