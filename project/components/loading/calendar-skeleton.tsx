import { PageHeadingSkeleton } from "@/components/loading/shared-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarDays = Array.from({ length: 42 }, (_, index) => index);
const deadlineRows = ["first", "second", "third", "fourth", "fifth"];

export function CalendarSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading calendar"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="overflow-hidden rounded-2xl border border-border bg-card">
				<div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
					<Skeleton className="h-8 w-64 max-w-full" />
					<Skeleton className="h-9 w-72 max-w-full" />
				</div>
				<div className="overflow-hidden px-5 py-4 lg:px-6">
					<div className="grid min-w-[48rem] grid-cols-7 border-b border-border pb-2">
						{weekdayLabels.map((weekday) => (
							<Skeleton key={weekday} className="mx-auto h-4 w-8" />
						))}
					</div>
					<div className="grid min-w-[48rem] grid-cols-7 auto-rows-[63px] pt-1">
						{calendarDays.map((day) => (
							<div key={day} className="min-h-16 p-1">
								<Skeleton className="mx-auto size-7 rounded-full" />
								{day % 4 === 0 && (
									<Skeleton className="mt-1 h-5 w-full rounded" />
								)}
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="space-y-3">
				<Skeleton className="h-6 w-56" />
				<div className="space-y-2">
					{deadlineRows.map((row) => (
						<Skeleton key={row} className="h-12 w-full rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}
