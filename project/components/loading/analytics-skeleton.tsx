import { PageHeadingSkeleton } from "@/components/loading/shared-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const analyticsStats = ["velocity", "efficiency", "active-users", "task-time"];
const analyticsRows = ["first", "second", "third", "fourth", "fifth"];

export function AnalyticsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading analytics"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
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
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-5 rounded-2xl border border-border bg-card p-6">
					<Skeleton className="h-6 w-36" />
					<Skeleton className="h-4 w-72 max-w-full" />
					<div className="mt-14 flex flex-col items-center gap-10 sm:flex-row sm:justify-center">
						<Skeleton className="size-[185px] rounded-full" />
						<div className="w-full max-w-56 space-y-3">
							{analyticsRows.slice(0, 3).map((row) => (
								<Skeleton key={row} className="h-10 w-full rounded-lg" />
							))}
						</div>
					</div>
				</div>
				<div className="space-y-4 rounded-2xl border border-border bg-card p-6">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-64 max-w-full" />
					{analyticsRows.map((row) => (
						<Skeleton key={row} className="h-14 w-full rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}
