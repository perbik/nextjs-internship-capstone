import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { calendarHeading, calendarHref } from "@/lib/calendar/date";
import type { CalendarView } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const CALENDAR_VIEWS: Array<{ value: CalendarView; label: string }> = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
	{ value: "day", label: "Day" },
];

interface CalendarToolbarProps {
	view: CalendarView;
	anchor: Date;
	rangeStart: Date;
	previous: Date;
	next: Date;
	addTaskAction: ReactNode;
}

export function CalendarToolbar({
	view,
	anchor,
	rangeStart,
	previous,
	next,
	addTaskAction,
}: CalendarToolbarProps) {
	const title = calendarHeading(view, anchor, rangeStart);

	return (
		<header className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
			<div className="flex items-center gap-3">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							asChild
							className="size-8 rounded-full border-border bg-card shadow-none dark:bg-transparent"
						>
							<Link
								href={calendarHref(view, previous)}
								aria-label={`Previous ${view}`}
							>
								<ChevronLeft />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Previous {view}</TooltipContent>
				</Tooltip>
				<h2 className="font-display text-xl font-bold tracking-[-0.02em] text-foreground sm:text-2xl">
					{title.primary} <span className="text-brand">{title.accent}</span>
				</h2>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							asChild
							className="size-8 rounded-full border-border bg-card shadow-none dark:bg-transparent"
						>
							<Link href={calendarHref(view, next)} aria-label={`Next ${view}`}>
								<ChevronRight />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Next {view}</TooltipContent>
				</Tooltip>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{addTaskAction}
				<nav
					aria-label="Calendar view"
					className="flex items-center rounded-lg border border-border bg-muted p-1"
				>
					{CALENDAR_VIEWS.map((option) => (
						<Button
							key={option.value}
							variant="ghost"
							size="sm"
							asChild
							className={cn(
								"rounded-md px-3 font-semibold",
								view === option.value
									? "bg-brand text-white hover:bg-brand/90 hover:text-white dark:text-white dark:hover:bg-brand/90"
									: "text-muted-foreground hover:bg-background hover:text-brand",
							)}
						>
							<Link
								href={calendarHref(option.value, anchor)}
								aria-current={view === option.value ? "page" : undefined}
							>
								{option.label}
							</Link>
						</Button>
					))}
				</nav>
			</div>
		</header>
	);
}
