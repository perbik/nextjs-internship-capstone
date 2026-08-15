import { Skeleton } from "@/components/ui/skeleton";

const memberRows = ["first", "second", "third"];

export function TeamDetailsSkeleton() {
	return (
		<div role="status" aria-label="Loading team details" aria-busy="true">
			<Skeleton className="mb-3 h-9 w-32 rounded-full" />

			<div className="overflow-hidden rounded-2xl border border-border bg-card">
				<div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
					<div className="flex min-w-0 items-center gap-3.5">
						<Skeleton className="size-11 shrink-0 rounded-xl" />
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-5 w-16 rounded-full" />
								<Skeleton className="h-3 w-32" />
							</div>
							<Skeleton className="h-4 w-72 max-w-full" />
						</div>
					</div>
					<Skeleton className="h-9 w-32 rounded-full" />
				</div>

				<div className="space-y-6 border-t border-border p-5 sm:p-6">
					<div className="space-y-3">
						<Skeleton className="h-3 w-32" />
						<div className="flex flex-wrap gap-1">
							<Skeleton className="h-9 w-28 rounded-full" />
							<Skeleton className="h-9 w-32 rounded-full" />
						</div>
					</div>

					<div className="space-y-3">
						<Skeleton className="h-5 w-32" />
						{memberRows.map((row) => (
							<div
								key={row}
								className="flex flex-col gap-3 rounded-xl bg-background p-4 sm:flex-row sm:items-center"
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<Skeleton className="size-10 shrink-0 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-40" />
										<Skeleton className="h-3 w-52 max-w-full" />
									</div>
								</div>
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-9 w-24 rounded-lg" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
