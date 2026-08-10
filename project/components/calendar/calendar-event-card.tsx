import Link from "next/link";
import type { CalendarEvent } from "@/lib/calendar/types";

export function CalendarEventCard({
	event,
	compact = false,
}: {
	event: CalendarEvent;
	compact?: boolean;
}) {
	const color = event.completed
		? "bg-green-500/10 text-green-700 dark:text-green-300"
		: event.type === "project" || event.priority === "high"
			? "bg-brand/15 text-brand"
			: event.priority === "medium"
				? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
				: "bg-sky-500/15 text-sky-600 dark:text-sky-300";

	return (
		<Link
			href={`/projects/${event.projectId}`}
			title={`${event.title} · ${event.projectName}`}
			className={`block truncate rounded px-1.5 py-0.5 font-medium ${compact ? "text-[10px] sm:text-[11px]" : "text-sm"} ${color}`}
		>
			{event.type === "project" ? "Project: " : ""}
			{event.title}
			{!compact && (
				<span className="mt-1 block text-xs opacity-75">
					{event.projectName}
				</span>
			)}
		</Link>
	);
}

export function CalendarEventStack({
	events,
	limit,
}: {
	events: CalendarEvent[];
	limit: number;
}) {
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
				<p className="px-1 text-[10px] text-muted-foreground">
					+{events.length - limit} more
				</p>
			)}
		</div>
	);
}
