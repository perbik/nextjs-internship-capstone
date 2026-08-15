import { Skeleton } from "@/components/ui/skeleton";

const projectCards = ["one", "two", "three", "four", "five", "six"];
const statusTabs = ["all", "active", "hold", "closed"];

export function ProjectsSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading projects"
			aria-busy="true"
		>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<Skeleton className="h-10 w-44" />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Skeleton className="h-11 w-full rounded-full sm:w-80 lg:w-96" />
					<Skeleton className="h-11 w-36 rounded-full" />
				</div>
			</div>

			<section className="rounded-[28px] border border-border bg-card p-4">
				<div className="mb-3 space-y-3">
					<div className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1">
						{statusTabs.map((tab) => (
							<Skeleton key={tab} className="h-9 w-full rounded-full" />
						))}
					</div>
					<div className="flex items-center justify-between gap-3">
						<Skeleton className="h-8 w-44 rounded-full" />
						<div className="flex items-center gap-1">
							<Skeleton className="h-8 w-16 rounded-lg" />
							<Skeleton className="size-8 rounded-lg" />
							<Skeleton className="h-8 w-12 rounded-lg" />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
					{projectCards.map((card) => (
						<Skeleton key={card} className="h-52 w-full rounded-[20px]" />
					))}
				</div>
			</section>
		</div>
	);
}
