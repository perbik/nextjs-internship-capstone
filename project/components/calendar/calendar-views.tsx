import { CalendarDays, ListChecks } from "lucide-react";
import Link from "next/link";
import {
	CalendarEventCard,
	CalendarEventStack,
} from "@/components/calendar/calendar-event-card";
import { addUtcDays, calendarHref, dateKey } from "@/lib/calendar/date";
import type { CalendarEvent } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarViewProps {
	start: Date;
	anchor: Date;
	today: Date;
	eventsByDate: Map<string, CalendarEvent[]>;
}

interface WeekCalendarViewProps {
	start: Date;
	today: Date;
	eventsByDate: Map<string, CalendarEvent[]>;
}

interface DayCalendarViewProps {
	date: Date;
	events: CalendarEvent[];
}

export function MonthCalendarView({
	start,
	anchor,
	today,
	eventsByDate,
}: MonthCalendarViewProps) {
	// Six weeks keep the month grid the same size across every month
	const days = Array.from({ length: 42 }, (_, index) =>
		addUtcDays(start, index),
	);
	const todayKey = dateKey(today);

	return (
		<section
			className="overflow-x-auto px-5 py-2 lg:px-6"
			aria-label={anchor.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
				timeZone: "UTC",
			})}
		>
			<WeekdayHeader />
			<div className="grid min-w-3xl grid-cols-7 auto-rows-15.75 pt-1">
				{days.map((date) => {
					const key = dateKey(date);
					const isToday = key === todayKey;
					const isCurrentMonth =
						date.getUTCMonth() === anchor.getUTCMonth() &&
						date.getUTCFullYear() === anchor.getUTCFullYear();
					return (
						<div key={key} className="min-w-0 rounded-lg p-1">
							<Link
								href={calendarHref("day", date)}
								aria-current={isToday ? "date" : undefined}
								className={cn(
									"mx-auto flex size-7 items-center justify-center rounded-full text-xs font-medium",
									isToday && "bg-brand font-bold text-white",
									!isToday &&
										isCurrentMonth &&
										"text-foreground hover:bg-brand/10",
									!isToday && !isCurrentMonth && "text-muted-foreground",
								)}
							>
								{date.getUTCDate()}
							</Link>
							<CalendarEventStack
								events={eventsByDate.get(key) ?? []}
								limit={1}
								moreHref={calendarHref("day", date)}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}

export function WeekCalendarView({
	start,
	today,
	eventsByDate,
}: WeekCalendarViewProps) {
	const days = Array.from({ length: 7 }, (_, index) =>
		addUtcDays(start, index),
	);

	return (
		<section
			className="overflow-x-auto px-5 py-2 lg:px-6"
			aria-label="Week calendar"
		>
			<WeekdayHeader dates={days} today={today} />
			<div className="grid min-w-3xl grid-cols-7 pt-2">
				{days.map((date) => {
					const key = dateKey(date);
					return (
						<div
							key={key}
							className="min-h-72.5 min-w-0 border-r border-border px-1 last:border-r-0"
						>
							<CalendarEventStack
								events={eventsByDate.get(key) ?? []}
								limit={8}
								moreHref={calendarHref("day", date)}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function WeekdayHeader({ dates, today }: { dates?: Date[]; today?: Date }) {
	return (
		<div className="grid min-w-3xl grid-cols-7 border-b border-border pb-2">
			{WEEKDAY_LABELS.map((weekday, index) => (
				<div
					key={weekday}
					className="text-center text-sm font-semibold text-muted-foreground"
				>
					{weekday}
					{dates && (
						<Link
							href={calendarHref("day", dates[index])}
							aria-current={
								today && dateKey(dates[index]) === dateKey(today)
									? "date"
									: undefined
							}
							className={`mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-xs ${today && dateKey(dates[index]) === dateKey(today) ? "bg-brand text-white" : "text-foreground "}`}
						>
							{dates[index].getUTCDate()}
						</Link>
					)}
				</div>
			))}
		</div>
	);
}

export function DayCalendarView({ date, events }: DayCalendarViewProps) {
	const projects = events.filter((event) => event.type === "project");
	const tasks = events.filter((event) => event.type === "task");

	return (
		<div className="grid gap-3 p-5 md:grid-cols-2 lg:p-6">
			<DaySection
				title="Project deadlines"
				icon="project"
				events={projects}
				emptyMessage="No project deadlines on this day."
			/>
			<DaySection
				title="Task deadlines"
				icon="task"
				events={tasks}
				emptyMessage="No task deadlines on this day."
			/>
			<p className="mt-1 text-xs text-muted-foreground md:col-span-2">
				Showing deadlines for{" "}
				{date.toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
					timeZone: "UTC",
				})}
				.
			</p>
		</div>
	);
}

function DaySection({
	title,
	icon,
	events,
	emptyMessage,
}: {
	title: string;
	icon: "project" | "task";
	events: CalendarEvent[];
	emptyMessage: string;
}) {
	const Icon = icon === "project" ? CalendarDays : ListChecks;
	return (
		<section className="min-h-34.5 rounded-2xl border border-border bg-background p-4  ">
			<h3 className="flex items-center gap-2 text-sm font-bold text-foreground ">
				<Icon size={17} className="text-brand" /> {title}
			</h3>
			{events.length === 0 ? (
				<p className="py-10 text-center text-sm text-muted-foreground">
					{emptyMessage}
				</p>
			) : (
				<div className="mt-3 space-y-2">
					{events.map((event) => (
						<CalendarEventCard
							key={`${event.type}-${event.id}`}
							event={event}
						/>
					))}
				</div>
			)}
		</section>
	);
}
