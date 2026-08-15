import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	FolderKanban,
	ListChecks,
} from "lucide-react";
import Link from "next/link";
import { PriorityBadge } from "@/components/task/priority-badge";
import { Badge } from "@/components/ui/badge";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from "@/components/ui/pagination";
import { calendarHref, dateKey } from "@/lib/calendar/date";
import type { CalendarEvent } from "@/lib/calendar/types";

const DEADLINES_PER_PAGE = 4;

interface DeadlineListProps {
	events: CalendarEvent[];
	anchor: Date;
	page: number;
}

interface DeadlineRowProps {
	event: CalendarEvent;
}

export function DeadlineList({ events, anchor, page }: DeadlineListProps) {
	const requestedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
	const pageCount = Math.max(1, Math.ceil(events.length / DEADLINES_PER_PAGE));
	const currentPage = Math.min(Math.max(requestedPage, 1), pageCount);
	const visibleEvents = events.slice(
		(currentPage - 1) * DEADLINES_PER_PAGE,
		currentPage * DEADLINES_PER_PAGE,
	);

	return (
		<section
			className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_4px_rgba(0,0,0,.06)] sm:p-5"
			aria-labelledby="monthly-deadlines-heading"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<h2
						id="monthly-deadlines-heading"
						className="font-display text-lg font-extrabold text-foreground"
					>
						Deadlines this month
					</h2>
					<Badge
						variant="secondary"
						className="border-0 bg-brand/10 text-brand hover:bg-brand/10"
					>
						{events.length}
					</Badge>
				</div>
				{pageCount > 1 && (
					<Pagination
						aria-label="Deadline pages"
						className="mx-0 w-auto justify-end"
					>
						<PaginationContent>
							<PaginationItem>
								<PaginationLink
									href={calendarHref("month", anchor, currentPage - 1)}
									disabled={currentPage === 1}
									size="icon"
									aria-label="Previous deadline page"
									className="size-8 rounded-full border border-border bg-card"
								>
									<ChevronLeft aria-hidden="true" />
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<span className="flex min-w-12 justify-center text-xs font-semibold text-muted-foreground">
									{currentPage} / {pageCount}
								</span>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href={calendarHref("month", anchor, currentPage + 1)}
									disabled={currentPage === pageCount}
									size="icon"
									aria-label="Next deadline page"
									className="size-8 rounded-full border border-border bg-card"
								>
									<ChevronRight aria-hidden="true" />
								</PaginationLink>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>

			{visibleEvents.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border bg-card py-9 text-center text-muted-foreground">
					<CalendarDays
						aria-hidden="true"
						size={26}
						className="mx-auto mb-2 text-brand"
					/>
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

function DeadlineRow({ event }: DeadlineRowProps) {
	const EventIcon = event.type === "task" ? ListChecks : FolderKanban;
	const href =
		event.type === "task"
			? `/projects/${event.projectId}?task=${event.id}`
			: `/projects/${event.projectId}`;

	return (
		<Link
			href={href}
			className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,.06)] transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_8px_20px_rgba(0,0,0,.07)]"
		>
			<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
				<EventIcon aria-hidden="true" size={14} />
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate text-xs font-semibold text-brand">
						{event.projectName}
					</span>
				</div>
				<p className="mt-1 truncate text-sm font-semibold text-foreground">
					{event.title}
				</p>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
				<Badge
					variant="secondary"
					className="border-0 bg-control-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-control-muted"
				>
					{event.type}
				</Badge>
				{event.priority && <PriorityBadge priority={event.priority} />}
				<time
					dateTime={dateKey(event.dueDate)}
					className="text-xs font-medium text-muted-foreground"
				>
					{event.dueDate.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						timeZone: "UTC",
					})}
				</time>
			</div>
		</Link>
	);
}
