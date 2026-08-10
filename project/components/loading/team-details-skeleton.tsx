import { Skeleton } from "@/components/ui/skeleton";

export function TeamDetailsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading team details"
			aria-busy="true"
		>
			<div>
				<Skeleton className="mb-3 h-9 w-32 rounded-full" />
				<Skeleton className="h-10 w-72 max-w-full" />
				<Skeleton className="mt-2 h-4 w-96 max-w-full" />
			</div>

			<div className="overflow-hidden rounded-2xl border border-border bg-card">
				<div className="flex items-center justify-between gap-4 p-5 sm:p-6">
					<div className="flex items-center gap-3.5">
						<Skeleton className="size-11 rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
					<Skeleton className="h-9 w-28 rounded-full" />
				</div>

				<div className="space-y-6 border-t border-border p-5 sm:p-6">
					<Skeleton className="h-4 w-3/4" />
					<div className="space-y-3">
						<Skeleton className="h-3 w-32" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-28 rounded-full" />
							<Skeleton className="h-9 w-32 rounded-full" />
						</div>
					</div>
					<Skeleton className="h-28 w-full rounded-xl" />
					<div className="space-y-3">
						<Skeleton className="h-5 w-32" />
						<div className="grid gap-3 md:grid-cols-2">
							<Skeleton className="h-32 w-full rounded-xl" />
							<Skeleton className="h-32 w-full rounded-xl" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
