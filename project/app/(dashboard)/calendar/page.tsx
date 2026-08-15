import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	FolderKanban,
	ListTodo,
} from "lucide-react";
import Link from "next/link";
import { CalendarTaskModal } from "@/components/modals/calendar-task-modal";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	getCalendarDeadlines,
	getCalendarTaskCreationOptions,
} from "@/lib/db/queries";

type CalendarView = "month" | "week" | "day";
type CalendarEvent = {
	id: string;
	title: string;
	dueDate: Date;
	projectId: string;
	projectName: string;
	type: "project" | "task";
	completed: boolean;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const views: Array<{ value: CalendarView; label: string }> = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
	{ value: "day", label: "Day" },
];

function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function dateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function parseDate(value: string | undefined) {
	if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const parsed = new Date(`${value}T00:00:00.000Z`);
		if (!Number.isNaN(parsed.getTime()) && dateKey(parsed) === value) {
			return parsed;
		}
	}
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
}

function addUtcDays(date: Date, amount: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
}

function startOfWeek(date: Date) {
	return addUtcDays(date, -date.getUTCDay());
}

function viewRange(view: CalendarView, anchor: Date) {
	if (view === "day") {
		return { start: anchor, end: addUtcDays(anchor, 1) };
	}
	if (view === "week") {
		const start = startOfWeek(anchor);
		return { start, end: addUtcDays(start, 7) };
	}

	const month = new Date(
		Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
	);
	const start = addUtcDays(month, -month.getUTCDay());
	return { start, end: addUtcDays(start, 42), month };
}

function moveAnchor(view: CalendarView, anchor: Date, direction: -1 | 1) {
	if (view === "day") return addUtcDays(anchor, direction);
	if (view === "week") return addUtcDays(anchor, direction * 7);
	return new Date(
		Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + direction, 1),
	);
}

function calendarHref(view: CalendarView, date: Date) {
	return `/calendar?view=${view}&date=${dateKey(date)}`;
}

function heading(view: CalendarView, anchor: Date, rangeStart: Date) {
	if (view === "month") {
		return anchor.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
			timeZone: "UTC",
		});
	}
	if (view === "day") {
		return anchor.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
			timeZone: "UTC",
		});
	}

	const end = addUtcDays(rangeStart, 6);
	const startLabel = rangeStart.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
	const endLabel = end.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
	return `${startLabel} – ${endLabel}`;
}

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const rawView = firstValue(params.view);
	const view: CalendarView =
		rawView === "week" || rawView === "day" ? rawView : "month";
	const anchor = parseDate(firstValue(params.date));
	const range = viewRange(view, anchor);
	const previous = moveAnchor(view, anchor, -1);
	const next = moveAnchor(view, anchor, 1);
	const today = parseDate(undefined);
	const user = await requireCurrentUser();
	const [{ projectDeadlines, taskDeadlines }, taskCreationProjects] =
		await Promise.all([
			getCalendarDeadlines(user.id, range.start, range.end),
			getCalendarTaskCreationOptions(user.id),
		]);
	const events: CalendarEvent[] = [
		...projectDeadlines.map((deadline) => ({
			...deadline,
			type: "project" as const,
			completed: deadline.status === "completed",
		})),
		...taskDeadlines.map((deadline) => ({
			...deadline,
			type: "task" as const,
			completed: deadline.isCompleted,
		})),
	].sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime());
	const eventsByDate = new Map<string, CalendarEvent[]>();

	for (const event of events) {
		const key = dateKey(event.dueDate);
		eventsByDate.set(key, [...(eventsByDate.get(key) ?? []), event]);
	}

	const taskOptions = taskCreationProjects.map((project) => ({
		id: project.id,
		name: project.name,
		lists: project.lists.map((list) => ({ id: list.id, name: list.name })),
		members: project.members
			.filter(({ user: member }) => !member.deletedAt)
			.map(({ user: member }) => ({
				id: member.id,
				name:
					[member.firstName, member.lastName].filter(Boolean).join(" ") ||
					member.email,
				isCurrentUser: member.id === user.id,
			})),
		labels: project.labels.map((label) => ({
			id: label.id,
			name: label.name,
			color: label.color,
		})),
	}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Calendar
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					Project and task deadlines across your accessible projects.
				</p>
			</div>

			<section className="overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<header className="space-y-3 border-b border-french_gray-300 p-4 dark:border-paynes_gray-400">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<Link
								href={calendarHref(view, previous)}
								aria-label={`Previous ${view}`}
								className="rounded-lg p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<ChevronLeft size={20} />
							</Link>
							<h2 className="min-w-48 text-center text-lg font-semibold text-outer_space-500 sm:text-xl dark:text-platinum-500">
								{heading(view, anchor, range.start)}
							</h2>
							<Link
								href={calendarHref(view, next)}
								aria-label={`Next ${view}`}
								className="rounded-lg p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<ChevronRight size={20} />
							</Link>
						</div>
						<div className="flex items-center gap-2">
							<Link
								href={calendarHref(view, today)}
								className="rounded-lg border border-french_gray-300 px-3 py-2 text-sm hover:bg-platinum-500 dark:border-paynes_gray-400 dark:hover:bg-paynes_gray-400"
							>
								Today
							</Link>
							<CalendarTaskModal
								defaultDueDate={dateKey(anchor)}
								projects={taskOptions}
							/>
						</div>
					</div>

					<nav
						aria-label="Calendar view"
						className="flex w-fit rounded-lg bg-platinum-800 p-1 dark:bg-outer_space-400"
					>
						{views.map((option) => (
							<Link
								key={option.value}
								href={calendarHref(option.value, anchor)}
								aria-current={view === option.value ? "page" : undefined}
								className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
									view === option.value
										? "bg-white text-blue_munsell-600 shadow-sm dark:bg-paynes_gray-400 dark:text-platinum-500"
										: "text-paynes_gray-500 hover:text-outer_space-500 dark:text-french_gray-400 dark:hover:text-platinum-500"
								}`}
							>
								{option.label}
							</Link>
						))}
					</nav>
				</header>

				{view === "month" && (
					<MonthView
						start={range.start}
						anchor={anchor}
						today={today}
						eventsByDate={eventsByDate}
					/>
				)}
				{view === "week" && (
					<WeekView
						start={range.start}
						today={today}
						eventsByDate={eventsByDate}
					/>
				)}
				{view === "day" && (
					<DayView
						date={anchor}
						events={eventsByDate.get(dateKey(anchor)) ?? []}
					/>
				)}
			</section>

			<DeadlineList events={events} view={view} />
		</div>
	);
}

function MonthView({
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
		<div className="overflow-x-auto">
			<WeekdayHeader />
			<div className="grid min-w-[48rem] grid-cols-7">
				{days.map((date) => {
					const dayEvents = eventsByDate.get(dateKey(date)) ?? [];
					const isCurrentMonth = date.getUTCMonth() === anchor.getUTCMonth();
					return (
						<div
							key={dateKey(date)}
							className="min-h-28 border-r border-b border-french_gray-300 p-1.5 sm:min-h-32 sm:p-2 dark:border-paynes_gray-400"
						>
							<Link
								href={calendarHref("day", date)}
								className={`inline-flex size-7 items-center justify-center rounded-full text-xs hover:ring-2 hover:ring-blue_munsell-300 ${
									dateKey(date) === dateKey(today)
										? "bg-blue_munsell-500 font-semibold text-white"
										: isCurrentMonth
											? "text-outer_space-500 dark:text-platinum-500"
											: "text-french_gray-500 dark:text-paynes_gray-300"
								}`}
							>
								{date.getUTCDate()}
							</Link>
							<EventStack events={dayEvents} limit={3} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

function WeekView({
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
		<div className="overflow-x-auto">
			<WeekdayHeader />
			<div className="grid min-w-[48rem] grid-cols-7">
				{days.map((date) => (
					<div
						key={dateKey(date)}
						className="min-h-[28rem] border-r border-french_gray-300 p-3 dark:border-paynes_gray-400"
					>
						<Link
							href={calendarHref("day", date)}
							className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm font-medium ${
								dateKey(date) === dateKey(today)
									? "bg-blue_munsell-500 text-white"
									: "hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							}`}
						>
							{date.getUTCDate()}
						</Link>
						<EventStack
							events={eventsByDate.get(dateKey(date)) ?? []}
							limit={8}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function WeekdayHeader() {
	return (
		<div className="grid min-w-[48rem] grid-cols-7 border-b border-french_gray-300 dark:border-paynes_gray-400">
			{weekdayLabels.map((weekday) => (
				<div
					key={weekday}
					className="px-2 py-2 text-center text-xs font-medium text-paynes_gray-500 dark:text-french_gray-400"
				>
					{weekday}
				</div>
			))}
		</div>
	);
}

function DayView({ date, events }: { date: Date; events: CalendarEvent[] }) {
	const projects = events.filter((event) => event.type === "project");
	const tasks = events.filter((event) => event.type === "task");

	return (
		<div className="grid gap-6 p-5 lg:grid-cols-2">
			<DaySection
				title="Project deadlines"
				icon={FolderKanban}
				events={projects}
				emptyMessage="No project deadlines on this day."
			/>
			<DaySection
				title="Task deadlines"
				icon={ListTodo}
				events={tasks}
				emptyMessage="No task deadlines on this day."
			/>
			<p className="text-xs text-paynes_gray-500 lg:col-span-2 dark:text-french_gray-400">
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
	icon: Icon,
	events,
	emptyMessage,
}: {
	title: string;
	icon: typeof FolderKanban;
	events: CalendarEvent[];
	emptyMessage: string;
}) {
	return (
		<section className="rounded-xl bg-platinum-800 p-4 dark:bg-outer_space-400">
			<h3 className="flex items-center gap-2 font-semibold">
				<Icon size={18} className="text-blue_munsell-500" />
				{title}
			</h3>
			{events.length === 0 ? (
				<p className="py-8 text-center text-sm text-paynes_gray-500 dark:text-french_gray-400">
					{emptyMessage}
				</p>
			) : (
				<div className="mt-3 space-y-2">
					{events.map((event) => (
						<EventCard key={`${event.type}-${event.id}`} event={event} />
					))}
				</div>
			)}
		</section>
	);
}

function EventStack({
	events,
	limit,
}: {
	events: CalendarEvent[];
	limit: number;
}) {
	return (
		<div className="mt-2 space-y-1">
			{events.slice(0, limit).map((event) => (
				<EventCard key={`${event.type}-${event.id}`} event={event} compact />
			))}
			{events.length > limit && (
				<p className="text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
					+{events.length - limit} more
				</p>
			)}
		</div>
	);
}

function EventCard({
	event,
	compact = false,
}: {
	event: CalendarEvent;
	compact?: boolean;
}) {
	return (
		<Link
			href={`/projects/${event.projectId}`}
			title={`${event.title} · ${event.projectName}`}
			className={`block rounded px-2 py-1.5 ${
				compact ? "truncate text-[10px] sm:text-xs" : "text-sm"
			} ${
				event.completed
					? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
					: event.type === "project"
						? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
						: "bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300"
			}`}
		>
			{event.type === "project" ? "Project: " : ""}
			{event.title}
			{!compact && (
				<span className="mt-0.5 block text-xs opacity-75">
					{event.projectName}
				</span>
			)}
		</Link>
	);
}

function DeadlineList({
	events,
	view,
}: {
	events: CalendarEvent[];
	view: CalendarView;
}) {
	return (
		<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
				Deadlines in this {view}
			</h2>
			{events.length === 0 ? (
				<div className="py-10 text-center text-paynes_gray-500 dark:text-french_gray-400">
					<CalendarDays size={30} className="mx-auto mb-2" />
					<p className="text-sm">No project or task deadlines in this view.</p>
				</div>
			) : (
				<div className="mt-4 grid gap-2 md:grid-cols-2">
					{events.map((event) => (
						<Link
							key={`deadline-${event.type}-${event.id}`}
							href={`/projects/${event.projectId}`}
							className="flex items-center justify-between gap-3 rounded-lg bg-platinum-800 p-3 hover:bg-platinum-600 dark:bg-outer_space-400 dark:hover:bg-paynes_gray-400"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{event.title}</p>
								<p className="truncate text-xs text-paynes_gray-500 dark:text-french_gray-400">
									{event.type === "project" ? "Project" : "Task"} ·{" "}
									{event.projectName}
								</p>
							</div>
							<time className="shrink-0 text-xs text-paynes_gray-500 dark:text-french_gray-400">
								{event.dueDate.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									timeZone: "UTC",
								})}
							</time>
						</Link>
					))}
				</div>
			)}
		</section>
	);
}
