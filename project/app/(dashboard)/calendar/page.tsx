import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCalendarDeadlines } from "@/lib/db/queries";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseMonth(value: string | string[] | undefined) {
	const raw = Array.isArray(value) ? value[0] : value;

	if (raw && /^\d{4}-\d{2}$/.test(raw)) {
		const [year, month] = raw.split("-").map(Number);

		if (month >= 1 && month <= 12) {
			return new Date(Date.UTC(year, month - 1, 1));
		}
	}

	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function monthParam(date: Date) {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const month = parseMonth((await searchParams).month);
	const gridStart = new Date(month);
	gridStart.setUTCDate(1 - month.getUTCDay());
	const gridEnd = new Date(gridStart);
	gridEnd.setUTCDate(gridEnd.getUTCDate() + 42);
	const previousMonth = new Date(
		Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1),
	);
	const nextMonth = new Date(
		Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1),
	);
	const currentMonth = new Date();
	const user = await requireCurrentUser();
	const { projectDeadlines, taskDeadlines } = await getCalendarDeadlines(
		user.id,
		gridStart,
		gridEnd,
	);
	const events = [
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
	const eventsByDate = new Map<string, typeof events>();

	for (const event of events) {
		const key = dateKey(event.dueDate);
		eventsByDate.set(key, [...(eventsByDate.get(key) ?? []), event]);
	}

	const days = Array.from({ length: 42 }, (_, index) => {
		const date = new Date(gridStart);
		date.setUTCDate(gridStart.getUTCDate() + index);
		return date;
	});

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
				<header className="flex flex-wrap items-center justify-between gap-3 border-b border-french_gray-300 p-4 dark:border-paynes_gray-400">
					<div className="flex items-center gap-2">
						<Link
							href={`/calendar?month=${monthParam(previousMonth)}`}
							aria-label="Previous month"
							className="rounded-lg p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
						>
							<ChevronLeft size={20} />
						</Link>
						<h2 className="min-w-44 text-center text-xl font-semibold text-outer_space-500 dark:text-platinum-500">
							{month.toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
								timeZone: "UTC",
							})}
						</h2>
						<Link
							href={`/calendar?month=${monthParam(nextMonth)}`}
							aria-label="Next month"
							className="rounded-lg p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
						>
							<ChevronRight size={20} />
						</Link>
					</div>
					<Link
						href={`/calendar?month=${monthParam(currentMonth)}`}
						className="rounded-lg border border-french_gray-300 px-3 py-2 text-sm hover:bg-platinum-500 dark:border-paynes_gray-400 dark:hover:bg-paynes_gray-400"
					>
						Today
					</Link>
				</header>

				<div className="grid grid-cols-7 border-b border-french_gray-300 dark:border-paynes_gray-400">
					{weekdayLabels.map((weekday) => (
						<div
							key={weekday}
							className="px-2 py-2 text-center text-xs font-medium text-paynes_gray-500 dark:text-french_gray-400"
						>
							{weekday}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7">
					{days.map((date) => {
						const dayEvents = eventsByDate.get(dateKey(date)) ?? [];
						const isCurrentMonth = date.getUTCMonth() === month.getUTCMonth();
						const isToday = dateKey(date) === dateKey(currentMonth);

						return (
							<div
								key={dateKey(date)}
								className="min-h-28 border-r border-b border-french_gray-300 p-1.5 last:border-r-0 sm:min-h-32 sm:p-2 dark:border-paynes_gray-400"
							>
								<span
									className={`inline-flex size-7 items-center justify-center rounded-full text-xs ${
										isToday
											? "bg-blue_munsell-500 font-semibold text-white"
											: isCurrentMonth
												? "text-outer_space-500 dark:text-platinum-500"
												: "text-french_gray-500 dark:text-paynes_gray-300"
									}`}
								>
									{date.getUTCDate()}
								</span>
								<div className="mt-1 space-y-1">
									{dayEvents.slice(0, 3).map((event) => (
										<Link
											key={`${event.type}-${event.id}`}
											href={`/projects/${event.projectId}`}
											title={`${event.title} · ${event.projectName}`}
											className={`block truncate rounded px-1.5 py-1 text-[10px] font-medium sm:text-xs ${
												event.completed
													? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
													: event.type === "project"
														? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
														: "bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300"
											}`}
										>
											{event.type === "project" ? "Project: " : ""}
											{event.title}
										</Link>
									))}
									{dayEvents.length > 3 && (
										<p className="text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
											+{dayEvents.length - 3} more
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
					Deadlines in this calendar view
				</h2>
				{events.length === 0 ? (
					<div className="py-10 text-center text-paynes_gray-500 dark:text-french_gray-400">
						<CalendarDays size={30} className="mx-auto mb-2" />
						<p className="text-sm">
							No project or task deadlines in this view.
						</p>
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
									<p className="truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500">
										{event.title}
									</p>
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
		</div>
	);
}
