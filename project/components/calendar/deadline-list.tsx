import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	FolderKanban,
	ListChecks,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calendarHref } from "@/lib/calendar/date";
import type { CalendarEvent } from "@/lib/calendar/types";

const PAGE_SIZE = 5;

export function DeadlineList({
	events,
	anchor,
	page,
}: {
	events: CalendarEvent[];
	anchor: Date;
	page: number;
}) {
	const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
	const currentPage = Math.min(Math.max(page, 1), pageCount);
	const visibleEvents = events.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-bold text-foreground ">
					Deadline this month
				</h2>
				{pageCount > 1 && (
					<div className="flex items-center gap-1">
						<DeadlinePageButton
							direction="previous"
							disabled={currentPage === 1}
							href={calendarHref("month", anchor, currentPage - 1)}
						/>
						<span className="px-2 text-xs text-muted-foreground">
							{currentPage} / {pageCount}
						</span>
						<DeadlinePageButton
							direction="next"
							disabled={currentPage === pageCount}
							href={calendarHref("month", anchor, currentPage + 1)}
						/>
					</div>
				)}
			</div>

			{visibleEvents.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border bg-card py-9 text-center text-muted-foreground  ">
					<CalendarDays size={26} className="mx-auto mb-2" />
					<p className="text-sm">No project or task deadlines this month.</p>
				</div>
			) : (
				<div className="space-y-2">
					{visibleEvents.map((event) => (
						<DeadlineRow key={`${event.type}-${event.id}`} event={event} />
					))}
				</div>
			)}
		</section>
	);
}

function DeadlinePageButton({
	direction,
	disabled,
	href,
}: {
	direction: "previous" | "next";
	disabled: boolean;
	href: string;
}) {
	const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
	const label = `${direction === "previous" ? "Previous" : "Next"} deadline page`;
	if (disabled) {
		return (
			<Button
				variant="outline"
				size="icon"
				disabled
				aria-label={label}
				className="size-8 rounded-full"
			>
				<Icon />
			</Button>
		);
	}

	return (
		<Button
			variant="outline"
			size="icon"
			asChild
			className="size-8 rounded-full"
		>
			<Link href={href} aria-label={label}>
				<Icon />
			</Link>
		</Button>
	);
}

function DeadlineRow({ event }: { event: CalendarEvent }) {
	const EventIcon = event.type === "task" ? ListChecks : FolderKanban;
	return (
		<Link
			href={`/projects/${event.projectId}`}
			className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,.06)] transition-colors hover:border-brand/30  "
		>
			<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
				<EventIcon size={14} />
			</span>
			<span className="rounded-full bg-control-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground  dark:text-muted-foreground">
				{event.type}
			</span>
			<span className="w-24 truncate text-sm font-semibold text-brand">
				{event.projectName}
			</span>
			<span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground ">
				{event.title}
			</span>
			{event.priority && (
				<span className="rounded bg-brand/10 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand">
					{event.priority}
				</span>
			)}
			<time className="w-16 shrink-0 text-right text-xs text-muted-foreground">
				{event.dueDate.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					timeZone: "UTC",
				})}
			</time>
		</Link>
	);
}
