import { Skeleton } from "@/components/ui/skeleton";

const projectCards = ["one", "two", "three"];
const statusTabs = ["all", "active", "hold", "closed"];

export function ProjectsSkeleton() {
	return (
		<div role="status" aria-label="Loading projects" aria-busy="true">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-10 w-44" />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Skeleton className="h-11 w-full rounded-full sm:w-80 lg:w-96" />
					<Skeleton className="h-11 w-36 rounded-full" />
				</div>
			</div>

			<section className="mt-6 rounded-[28px] border border-border bg-card p-5">
				<div className="mb-4 space-y-4">
					<div className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1.5">
						{statusTabs.map((tab) => (
							<Skeleton key={tab} className="h-10 w-full rounded-full" />
						))}
					</div>
					<Skeleton className="h-8 w-44 rounded-full" />
				</div>

				<div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
					{projectCards.map((card) => (
						<Skeleton key={card} className="h-59.75 w-full rounded-[20px]" />
					))}
				</div>
			</section>
		</div>
	);
}
