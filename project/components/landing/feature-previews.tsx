import { CalendarDays, FolderKanban, Mail, MoreHorizontal } from "lucide-react";
import { PriorityBadge } from "@/components/task/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TEAM_MEMBERS = [
	{ initials: "AR", name: "Alex Rivera", role: "Owner", projects: 4 },
	{ initials: "SK", name: "Sam Kim", role: "Member", projects: 2 },
];

const CALENDAR_DAYS = ["24", "25", "26", "27", "28", "29", "30"];

export function AnalyticsPreview() {
	return (
		<div className="flex h-44 items-center justify-center bg-brand-light/40 p-4 dark:bg-brand/5">
			<article className="flex w-full max-w-64 flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_8px_rgba(0,0,0,.06)]">
				<p className="text-sm font-semibold text-brand">Team Efficiency</p>
				<div className="mt-2 flex items-end justify-between gap-4">
					<div>
						<p className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground">
							92%
						</p>
						<p className="mt-2 text-xs font-medium text-muted-foreground">
							Completion rate
						</p>
					</div>
				</div>
			</article>
		</div>
	);
}

export function KanbanPreview() {
	return (
		<div className="flex h-44 items-center justify-center bg-brand-light/40 p-4 dark:bg-brand/5">
			<section className="w-full max-w-72 overflow-hidden rounded-lg border border-input bg-surface-column shadow-sm">
				<header className="flex items-center justify-between border-b border-input px-3 py-2">
					<div className="flex items-center gap-2">
						<h4 className="text-xs font-bold text-brand">To Do</h4>
						<Badge className="border-0 bg-brand/10 px-2 py-0 text-[10px] text-brand hover:bg-brand/10">
							1
						</Badge>
					</div>
					<MoreHorizontal size={15} aria-hidden="true" />
				</header>
				<div className="p-2.5">
					<article className="rounded-xl border border-input bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,.06)]">
						<div className="flex items-start justify-between gap-2">
							<h5 className="text-xs font-bold text-foreground">
								Website copy
							</h5>
							<MoreHorizontal size={14} aria-hidden="true" />
						</div>
						<p className="mt-1 text-[10px] text-muted-foreground">
							Prepare the landing-page content.
						</p>
						<div className="mt-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<PriorityBadge priority="high" />
								<span className="flex items-center gap-1 text-[9px] text-muted-foreground">
									<CalendarDays size={10} aria-hidden="true" /> Aug 24
								</span>
							</div>
							<Avatar className="size-6">
								<AvatarFallback className="bg-brand text-[9px] font-bold text-white">
									AR
								</AvatarFallback>
							</Avatar>
						</div>
					</article>
				</div>
			</section>
		</div>
	);
}

export function TeamPreview() {
	return (
		<div className="flex h-44 flex-col justify-center gap-2 bg-brand-light/40 p-4 dark:bg-brand/5">
			{TEAM_MEMBERS.map((member) => (
				<article
					key={member.name}
					className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
				>
					<Avatar className="size-9 shrink-0">
						<AvatarFallback className="bg-brand/10 text-[10px] font-bold text-brand">
							{member.initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<strong className="truncate text-xs">{member.name}</strong>
							<span className="text-[10px] text-muted-foreground">
								{member.role}
							</span>
						</div>
						<p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
							<Mail size={10} aria-hidden="true" />{" "}
							{member.initials.toLowerCase()}@brix.app
						</p>
					</div>
					<span className="flex shrink-0 items-center gap-1 text-[9px] text-muted-foreground">
						<FolderKanban size={10} aria-hidden="true" /> {member.projects}
					</span>
				</article>
			))}
		</div>
	);
}

export function CalendarPreview() {
	return (
		<div className="flex h-44 items-center justify-center bg-brand-light/40 p-4 dark:bg-brand/5">
			<section className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<header className="flex items-center justify-between border-b border-border px-3 py-2">
					<h4 className="text-xs font-bold">August 2026</h4>
					<span className="text-[10px] font-semibold text-brand">
						2 deadlines
					</span>
				</header>
				<div className="grid grid-cols-7 gap-1 px-2 pt-2 text-center">
					{CALENDAR_DAYS.map((day) => (
						<span
							key={day}
							className={`flex size-6 items-center justify-center justify-self-center rounded-full text-[9px] ${day === "26" ? "bg-brand font-bold text-white" : "text-muted-foreground"}`}
						>
							{day}
						</span>
					))}
				</div>
				<div className="space-y-1.5 p-2">
					<div className="rounded bg-brand/15 px-2 py-1 text-[9px] font-semibold text-brand">
						Project: Website Redesign
					</div>
					<div className="rounded bg-sky-500/15 px-2 py-1 text-[9px] font-semibold text-sky-600 dark:text-sky-300">
						Task: Project Alignment
					</div>
				</div>
			</section>
		</div>
	);
}
