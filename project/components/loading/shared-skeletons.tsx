import { Skeleton } from "@/components/ui/skeleton";

export function PageHeadingSkeleton() {
	return (
		<div className="space-y-2">
			<Skeleton className="h-8 w-52" />
			<Skeleton className="h-4 w-80 max-w-full" />
		</div>
	);
}

export function GenericPageSkeleton() {
	return (
		<div
			className="space-y-6"
			role="status"
			aria-label="Loading page"
			aria-busy="true"
		>
			<PageHeadingSkeleton />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-40 w-full rounded-xl" />
			</div>
			<Skeleton className="h-72 w-full rounded-xl" />
		</div>
	);
}
