import { CalendarTaskModal } from "@/components/calendar/calendar-task-modal";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import {
	DayCalendarView,
	MonthCalendarView,
	WeekCalendarView,
} from "@/components/calendar/calendar-views";
import { DeadlineList } from "@/components/calendar/deadline-list";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	calendarRange,
	dateKey,
	firstValue,
	moveCalendarAnchor,
	parseCalendarDate,
} from "@/lib/calendar/date";
import type { CalendarEvent, CalendarView } from "@/lib/calendar/types";
import { getCalendarDeadlines, getTaskCreationOptions } from "@/lib/db/queries";

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const rawView = firstValue(params.view);
	const view: CalendarView =
		rawView === "week" || rawView === "day" ? rawView : "month";
	const anchor = parseCalendarDate(firstValue(params.date));
	const deadlinePage = Number(firstValue(params.deadlinePage)) || 1;
	const range = calendarRange(view, anchor);
	const today = parseCalendarDate(undefined);
	const user = await requireCurrentUser();
	const [{ projectDeadlines, taskDeadlines }, taskCreationProjects] =
		await Promise.all([
			getCalendarDeadlines(user.id, range.start, range.end),
			getTaskCreationOptions(user.id),
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
	const monthEvents = events.filter(
		(event) =>
			event.dueDate.getUTCMonth() === anchor.getUTCMonth() &&
			event.dueDate.getUTCFullYear() === anchor.getUTCFullYear(),
	);

	return (
		<div className="space-y-5">
			<header>
				<h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl ">
					Calendar
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					View project deadlines and team schedules
				</p>
			</header>

			<section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,.06)]  ">
				<CalendarToolbar
					view={view}
					anchor={anchor}
					rangeStart={range.start}
					previous={moveCalendarAnchor(view, anchor, -1)}
					next={moveCalendarAnchor(view, anchor, 1)}
					addEventAction={
						<CalendarTaskModal
							defaultDueDate={dateKey(anchor)}
							projects={taskOptions}
						/>
					}
				/>
				{view === "month" && (
					<MonthCalendarView
						start={range.start}
						anchor={anchor}
						today={today}
						eventsByDate={eventsByDate}
					/>
				)}
				{view === "week" && (
					<WeekCalendarView
						start={range.start}
						today={today}
						eventsByDate={eventsByDate}
					/>
				)}
				{view === "day" && (
					<DayCalendarView
						date={anchor}
						events={eventsByDate.get(dateKey(anchor)) ?? []}
					/>
				)}
			</section>

			{view === "month" && (
				<DeadlineList
					events={monthEvents}
					anchor={anchor}
					page={deadlinePage}
				/>
			)}
		</div>
	);
}
