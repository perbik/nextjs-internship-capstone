import Link from "next/link";
import type { CalendarEvent } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

interface CalendarEventCardProps {
	event: CalendarEvent;
	compact?: boolean;
}

interface CalendarEventStackProps {
	events: CalendarEvent[];
	limit: number;
	moreHref: string;
}

function getEventColorClasses(event: CalendarEvent) {
	if (event.completed) {
		return "bg-green-500/10 text-green-700 dark:text-green-300";
	}
	if (event.type === "project" || event.priority === "high") {
		return "bg-brand/15 text-brand";
	}
	if (event.priority === "medium") {
		return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
	}
	return "bg-sky-500/15 text-sky-600 dark:text-sky-300";
}

export function CalendarEventCard({
	event,
	compact = false,
}: CalendarEventCardProps) {
	// Task links open the project and its existing task-details modal
	const href =
		event.type === "task"
			? `/projects/${event.projectId}?task=${event.id}`
			: `/projects/${event.projectId}`;

	return (
		<Link
			href={href}
			title={`${event.title} · ${event.projectName}`}
			aria-label={`${event.title}, ${event.projectName}`}
			className={cn(
				"block rounded px-1.5 py-0.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
				compact ? "text-[10px] sm:text-[11px]" : "text-sm",
				getEventColorClasses(event),
			)}
		>
			<span className="block truncate">
				{event.type === "project" ? "Project: " : ""}
				{event.title}
			</span>
			{!compact && (
				<span className="mt-1 block truncate text-xs opacity-75">
					{event.projectName}
				</span>
			)}
		</Link>
	);
}

export function CalendarEventStack({
	events,
	limit,
	moreHref,
}: CalendarEventStackProps) {
	return (
		<div className="mt-1 space-y-1">
			{events.slice(0, limit).map((event) => (
				<CalendarEventCard
					key={`${event.type}-${event.id}`}
					event={event}
					compact
				/>
			))}
			{events.length > limit && (
				<Link
					href={moreHref}
					className="block rounded px-1 text-[10px] font-medium text-muted-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
				>
					+{events.length - limit} more
				</Link>
			)}
		</div>
	);
}
