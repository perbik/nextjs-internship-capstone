import { Skeleton } from "@/components/ui/skeleton";

const boardColumns = ["todo", "review", "done"];

export function BoardSkeleton() {
	return (
		<div
			className="min-w-0 max-w-full space-y-4"
			role="status"
			aria-label="Loading project board"
			aria-busy="true"
		>
			<section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<Skeleton className="size-8 shrink-0 rounded-full" />
						<div className="min-w-0 space-y-1.5">
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-7 w-44" />
								<Skeleton className="h-6 w-16 rounded-full" />
								<Skeleton className="h-7 w-28 rounded-full" />
							</div>
							<Skeleton className="h-4 w-80 max-w-full" />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-24 rounded-full" />
						<Skeleton className="h-8 w-36 rounded-full" />
						<Skeleton className="h-8 w-28 rounded-full" />
					</div>
				</div>
			</section>

			<div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-board">
				<div className="flex min-h-17 items-center justify-between gap-3 px-5 py-4">
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-8 w-24 rounded-full" />
						<Skeleton className="h-8 w-44 rounded-full" />
					</div>
					<Skeleton className="size-10 rounded-full" />
				</div>
				<div className="flex h-[508px] items-start gap-4 overflow-hidden px-5 pb-5">
					{boardColumns.map((column) => (
						<div
							key={column}
							className="h-[488px] w-80 min-w-70 shrink-0 overflow-hidden rounded-2xl border border-input bg-surface-column"
						>
							<div className="border-b border-input px-4 py-3">
								<Skeleton className="h-6 w-28" />
							</div>
							<div className="space-y-3 p-4">
								<Skeleton className="h-28 w-full rounded-xl" />
								<Skeleton className="h-28 w-full rounded-xl" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
