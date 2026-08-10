import { CalendarDays, ListChecks } from "lucide-react";
import Link from "next/link";
import {
	CalendarEventCard,
	CalendarEventStack,
} from "@/components/calendar/calendar-event-card";
import { addUtcDays, calendarHref, dateKey } from "@/lib/calendar/date";
import type { CalendarEvent } from "@/lib/calendar/types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendarView({
	start,
	anchor,
	today,
	eventsByDate,
}: {
	start: Date;
	anchor: Date;
	today: Date;
	eventsByDate: Map<string, CalendarEvent[]>;
}) {
	const days = Array.from({ length: 42 }, (_, index) =>
		addUtcDays(start, index),
	);

	return (
		<div className="overflow-x-auto px-5 py-4 lg:px-6">
			<WeekdayHeader />
			<div className="grid min-w-[48rem] grid-cols-7 auto-rows-[63px] pt-1">
				{days.map((date) => {
					const isCurrentMonth = date.getUTCMonth() === anchor.getUTCMonth();
					return (
						<div key={dateKey(date)} className="min-w-0 rounded-lg p-1">
							<Link
								href={calendarHref("day", date)}
								className={`mx-auto flex size-7 items-center justify-center rounded-full text-xs font-medium ${dateKey(date) === dateKey(today) ? "bg-brand font-bold text-white" : isCurrentMonth ? "text-foreground hover:bg-brand/10 " : "text-muted-foreground dark:text-muted-foreground"}`}
							>
								{date.getUTCDate()}
							</Link>
							<CalendarEventStack
								events={eventsByDate.get(dateKey(date)) ?? []}
								limit={1}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function WeekCalendarView({
	start,
	today,
	eventsByDate,
}: {
	start: Date;
	today: Date;
	eventsByDate: Map<string, CalendarEvent[]>;
}) {
	const days = Array.from({ length: 7 }, (_, index) =>
		addUtcDays(start, index),
	);

	return (
		<div className="overflow-x-auto px-5 py-4 lg:px-6">
			<WeekdayHeader dates={days} today={today} />
			<div className="grid min-w-[48rem] grid-cols-7 pt-2">
				{days.map((date) => (
					<div
						key={dateKey(date)}
						className="min-h-[290px] min-w-0 border-r border-border px-1 last:border-r-0 "
					>
						<CalendarEventStack
							events={eventsByDate.get(dateKey(date)) ?? []}
							limit={8}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function WeekdayHeader({ dates, today }: { dates?: Date[]; today?: Date }) {
	return (
		<div className="grid min-w-[48rem] grid-cols-7 border-b border-border pb-2 ">
			{weekdayLabels.map((weekday, index) => (
				<div
					key={weekday}
					className="text-center text-sm font-semibold text-muted-foreground"
				>
					{weekday}
					{dates && (
						<Link
							href={calendarHref("day", dates[index])}
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

export function DayCalendarView({
	date,
	events,
}: {
	date: Date;
	events: CalendarEvent[];
}) {
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
		<section className="min-h-[138px] rounded-2xl border border-border bg-background p-4  ">
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
