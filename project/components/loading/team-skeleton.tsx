import { PageHeadingSkeleton } from "@/components/loading/shared-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const teamCards = ["one", "two", "three", "four", "five", "six"];

export function TeamSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading team"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-11 w-full rounded-full sm:max-w-80" />
				<Skeleton className="h-11 w-36 rounded-full" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{teamCards.map((card) => (
					<div
						key={card}
						className="flex min-h-48 flex-col rounded-2xl border border-border bg-card p-5"
					>
						<div className="flex items-start justify-between">
							<Skeleton className="size-11 rounded-xl" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="mt-4 h-6 w-32" />
						<Skeleton className="mt-2 h-4 w-full" />
						<Skeleton className="mt-1 h-4 w-4/5" />
						<div className="mt-auto flex items-center justify-between pt-5">
							<Skeleton className="h-3 w-36" />
							<Skeleton className="size-5 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
