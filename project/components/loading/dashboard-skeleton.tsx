import { Skeleton } from "@/components/ui/skeleton";

const dashboardStats = ["active", "members", "completed", "pending"];
const quickActions = ["project", "task", "member"];

export function DashboardSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading dashboard"
			aria-busy="true"
		>
			<header className="space-y-1.5">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-10 w-64 max-w-[80vw]" />
				<Skeleton className="h-4 w-80 max-w-full" />
			</header>

			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{dashboardStats.map((stat) => (
					<div
						key={stat}
						className="min-h-32 space-y-3 rounded-2xl border border-border bg-card p-5"
					>
						<Skeleton className="h-4 w-24 max-w-full" />
						<Skeleton className="h-9 w-14" />
						<Skeleton className="h-5 w-24 max-w-full rounded-full" />
					</div>
				))}
			</div>

			<div className="grid gap-5 lg:grid-cols-2">
				<div className="rounded-2xl border border-border bg-card p-5">
					<Skeleton className="h-7 w-32" />
					<div className="mt-4 grid gap-2.5">
						{quickActions.map((action) => (
							<Skeleton key={action} className="h-16.25 w-full rounded-xl" />
						))}
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-border bg-card">
					<div className="flex items-center justify-between border-b border-border px-6 py-4">
						<Skeleton className="h-7 w-36" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="px-4 pb-2 pt-4">
						<Skeleton className="h-59.25 w-full rounded-[20px]" />
					</div>
					<div className="flex items-center justify-between px-5 py-3">
						<Skeleton className="size-8 rounded-full" />
						<Skeleton className="h-1.5 w-10 rounded-full" />
						<Skeleton className="size-8 rounded-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
