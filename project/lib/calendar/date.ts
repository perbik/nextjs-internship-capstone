import type { CalendarView } from "@/lib/calendar/types";

export function firstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export function dateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

export function parseCalendarDate(value: string | undefined) {
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

export function addUtcDays(date: Date, amount: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
}

export function startOfWeek(date: Date) {
	return addUtcDays(date, -date.getUTCDay());
}

export function calendarRange(view: CalendarView, anchor: Date) {
	if (view === "day") return { start: anchor, end: addUtcDays(anchor, 1) };
	if (view === "week") {
		const start = startOfWeek(anchor);
		return { start, end: addUtcDays(start, 7) };
	}

	const month = new Date(
		Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
	);
	const start = addUtcDays(month, -month.getUTCDay());
	return { start, end: addUtcDays(start, 42) };
}

export function moveCalendarAnchor(
	view: CalendarView,
	anchor: Date,
	direction: -1 | 1,
) {
	if (view === "day") return addUtcDays(anchor, direction);
	if (view === "week") return addUtcDays(anchor, direction * 7);
	return new Date(
		Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + direction, 1),
	);
}

export function calendarHref(
	view: CalendarView,
	date: Date,
	deadlinePage?: number,
) {
	const page =
		deadlinePage && deadlinePage > 1 ? `&deadlinePage=${deadlinePage}` : "";
	return `/calendar?view=${view}&date=${dateKey(date)}${page}`;
}

export function calendarHeading(
	view: CalendarView,
	anchor: Date,
	rangeStart: Date,
) {
	if (view === "month") {
		return {
			primary: anchor.toLocaleDateString("en-US", {
				month: "long",
				timeZone: "UTC",
			}),
			accent: String(anchor.getUTCFullYear()),
		};
	}
	if (view === "day") {
		return {
			primary: `${anchor.toLocaleDateString("en-US", {
				weekday: "short",
				month: "long",
				day: "numeric",
				timeZone: "UTC",
			})},`,
			accent: String(anchor.getUTCFullYear()),
		};
	}

	const end = addUtcDays(rangeStart, 6);
	return {
		primary: `${rangeStart.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		})} – ${end.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		})},`,
		accent: String(end.getUTCFullYear()),
	};
}
