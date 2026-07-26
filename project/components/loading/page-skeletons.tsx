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
						className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<Skeleton className="size-10 rounded-lg" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-4 w-28" />
					</div>
				))}
			</div>
			<div className="space-y-4 rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<Skeleton className="h-6 w-36" />
				{dashboardRows.map((row) => (
					<Skeleton key={row} className="h-16 w-full" />
				))}
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
