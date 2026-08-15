import { PageHeadingSkeleton } from "@/components/loading/shared-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const analyticsStats = ["velocity", "efficiency", "active-users", "task-time"];
const analyticsRows = ["first", "second", "third", "fourth", "fifth"];

export function AnalyticsSkeleton() {
	return (
		<div
			className="space-y-5"
			role="status"
			aria-label="Loading analytics"
			aria-busy="true"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<PageHeadingSkeleton />
				<Skeleton className="h-10 w-full rounded-lg sm:w-64" />
			</div>
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{analyticsStats.map((stat) => (
					<div
						key={stat}
						className="min-h-32 space-y-2 rounded-2xl border border-border bg-card p-5"
					>
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-9 w-16" />
						<Skeleton className="h-3 w-32" />
					</div>
				))}
			</div>
			<div className="grid gap-5 lg:grid-cols-2">
				<div className="flex min-h-104 flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
					<Skeleton className="h-6 w-36" />
					<Skeleton className="mt-1 h-4 w-72 max-w-full" />
					<div className="flex flex-1 flex-col items-center justify-center gap-6 py-5 sm:flex-row sm:gap-8">
						<Skeleton className="size-[155px] rounded-full sm:size-[170px]" />
						<div className="w-full max-w-52 space-y-2.5">
							{analyticsRows.slice(0, 3).map((row) => (
								<Skeleton key={row} className="h-9 w-full rounded-sm" />
							))}
						</div>
					</div>
				</div>
				<div className="flex min-h-104 flex-col overflow-hidden rounded-2xl border border-border bg-card">
					<div className="px-5 pb-1.5 pt-5 sm:px-6">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="mt-1 h-4 w-48 max-w-full" />
					</div>
					<div className="flex-1 divide-y divide-border px-5 sm:px-6">
						{analyticsRows.map((row) => (
							<div key={row} className="space-y-1.5 py-2">
								<Skeleton className="h-4 w-full max-w-80" />
								<Skeleton className="h-3 w-32" />
							</div>
						))}
					</div>
					<div className="flex justify-center gap-2 border-t border-border px-5 py-1.5 sm:px-6">
						<Skeleton className="h-9 w-24 rounded-lg" />
						<Skeleton className="size-9 rounded-lg" />
						<Skeleton className="h-9 w-20 rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}
