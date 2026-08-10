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
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Skeleton className="h-11 min-w-0 flex-1 rounded-full" />
				<Skeleton className="h-11 w-full rounded-full sm:w-44" />
			</div>

			<section className="overflow-hidden rounded-2xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border px-4 py-2.5">
					<Skeleton className="h-8 w-24 rounded-lg" />
					<Skeleton className="h-8 w-20 rounded-full" />
				</div>
				<div className="space-y-2 px-5 py-4">
					<Skeleton className="h-9 w-52 max-w-full" />
					<Skeleton className="h-4 w-80 max-w-full" />
				</div>
				<div className="flex items-center gap-3 border-t border-border px-5 py-3">
					<Skeleton className="h-9 w-32 rounded-full" />
					<Skeleton className="ml-auto h-9 w-32 rounded-full" />
				</div>
			</section>

			<div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-board">
				<div className="flex min-h-17 items-center justify-between gap-3 px-5 py-4">
					<div className="flex gap-3">
						<Skeleton className="h-10 w-28 rounded-full" />
						<Skeleton className="h-10 w-28 rounded-full" />
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
