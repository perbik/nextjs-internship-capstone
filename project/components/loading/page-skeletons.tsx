import { Skeleton } from "@/components/ui/skeleton";

const dashboardStats = ["active", "completed", "tasks", "done"];
const dashboardRows = ["first", "second", "third", "fourth"];
const projectCards = ["one", "two", "three", "four", "five", "six"];
const boardColumns = [
	{ id: "todo", tasks: ["one", "two", "three"] },
	{ id: "progress", tasks: ["one", "two", "three"] },
	{ id: "done", tasks: ["one", "two", "three"] },
];
const teamCards = ["one", "two", "three", "four", "five", "six"];
const analyticsStats = ["velocity", "efficiency", "active-users", "task-time"];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarDays = Array.from({ length: 42 }, (_, index) => index);

function PageHeadingSkeleton() {
	return (
		<div className="space-y-2">
			<Skeleton className="h-8 w-52" />
			<Skeleton className="h-4 w-80 max-w-full" />
		</div>
	);
}

export function GenericPageSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading page"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-40 w-full rounded-xl" />
			</div>
			<Skeleton className="h-72 w-full rounded-xl" />
		</div>
	);
}

export function DashboardSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading dashboard"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{dashboardStats.map((stat) => (
					<div
						key={stat}
						className="flex items-center gap-4 rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<Skeleton className="size-10 rounded-lg" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-7 w-16" />
						</div>
					</div>
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div className="space-y-4 rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Skeleton className="h-6 w-36" />
					{dashboardRows.slice(0, 3).map((row) => (
						<Skeleton key={row} className="h-24 w-full rounded-lg" />
					))}
				</div>
				<div className="space-y-5 rounded-lg border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-10 w-36" />
					<Skeleton className="h-10 w-36" />
				</div>
			</div>
		</div>
	);
}

export function AnalyticsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading analytics"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{analyticsStats.map((stat) => (
					<div
						key={stat}
						className="space-y-3 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<Skeleton className="size-10 rounded-lg" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-32" />
					</div>
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-5 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Skeleton className="h-6 w-36" />
					<Skeleton className="h-4 w-72 max-w-full" />
					<div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
						<Skeleton className="size-44 rounded-full" />
						<div className="w-full max-w-56 space-y-3">
							{dashboardRows.slice(0, 3).map((row) => (
								<Skeleton key={row} className="h-10 w-full rounded-lg" />
							))}
						</div>
					</div>
				</div>
				<div className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-64 max-w-full" />
					{dashboardRows.map((row) => (
						<Skeleton key={row} className="h-14 w-full rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}

export function CalendarSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading calendar"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<div className="flex items-center justify-between border-b border-french_gray-300 p-4 dark:border-paynes_gray-400">
					<Skeleton className="h-10 w-64 max-w-[70%]" />
					<Skeleton className="h-9 w-16" />
				</div>
				<div className="grid grid-cols-7 gap-px border-b border-french_gray-300 p-2 dark:border-paynes_gray-400">
					{weekdayLabels.map((weekday) => (
						<Skeleton key={weekday} className="mx-auto h-4 w-8" />
					))}
				</div>
				<div className="grid grid-cols-7">
					{calendarDays.map((day) => (
						<div
							key={day}
							className="min-h-28 border-r border-b border-french_gray-300 p-2 sm:min-h-32 dark:border-paynes_gray-400"
						>
							<Skeleton className="size-7 rounded-full" />
							{day % 4 === 0 && (
								<Skeleton className="mt-2 h-6 w-full rounded" />
							)}
						</div>
					))}
				</div>
			</div>
			<div className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<Skeleton className="h-6 w-56" />
				<div className="grid gap-2 md:grid-cols-2">
					{dashboardRows.map((row) => (
						<Skeleton key={row} className="h-16 w-full rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}

export function SettingsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading settings"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(36rem,1.3fr)]">
				<div className="space-y-6">
					<Skeleton className="h-44 w-full rounded-xl" />
					<Skeleton className="h-36 w-full rounded-xl" />
				</div>
				<Skeleton className="h-[38rem] w-full rounded-xl" />
			</div>
		</div>
	);
}

export function ProjectsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading projects"
			aria-busy="true"
		>
			<div className="flex justify-between gap-4 rounded-xl border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<PageHeadingSkeleton />
				<Skeleton className="h-10 w-32" />
			</div>
			<Skeleton className="h-20 w-full rounded-xl" />
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				{projectCards.map((card) => (
					<div
						key={card}
						className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<Skeleton className="h-6 w-2/3" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-2 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				))}
			</div>
		</div>
	);
}

export function BoardSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading project board"
			aria-busy="true"
		>
			<div className="flex justify-between gap-4">
				<PageHeadingSkeleton />
				<Skeleton className="h-10 w-24" />
			</div>
			<Skeleton className="h-16 w-full rounded-xl" />
			<Skeleton className="h-20 w-full rounded-xl" />
			<div className="flex gap-5 overflow-hidden rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				{boardColumns.map((column) => (
					<div
						key={column.id}
						className="w-80 shrink-0 space-y-3 rounded-lg bg-platinum-800 p-4 dark:bg-outer_space-400"
					>
						<Skeleton className="h-6 w-28" />
						{column.tasks.map((task) => (
							<Skeleton
								key={`${column.id}-${task}`}
								className="h-28 w-full bg-white dark:bg-outer_space-300"
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export function TeamSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading team"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{teamCards.map((card) => (
					<div
						key={card}
						className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<div className="flex gap-3">
							<Skeleton className="size-11 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-3 w-44 max-w-full" />
							</div>
						</div>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}
