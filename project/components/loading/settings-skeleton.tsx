import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
	return (
		<div
			className="mx-auto w-full max-w-6xl space-y-5"
			role="status"
			aria-label="Loading settings"
			aria-busy="true"
		>
			<div className="space-y-2">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-5 w-80 max-w-[75vw]" />
			</div>
			<div className="grid overflow-hidden rounded-2xl border border-border bg-card md:h-[34rem] md:grid-cols-[15rem_minmax(0,1fr)]">
				<div className="flex min-h-36 flex-col gap-3 border-b border-border bg-muted p-5 md:border-r md:border-b-0">
					<Skeleton className="h-7 w-28" />
					<Skeleton className="h-4 w-40" />
					<div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-1">
						<Skeleton className="h-10 w-full rounded-xl" />
						<Skeleton className="h-10 w-full rounded-xl" />
					</div>
					<Skeleton className="mt-auto hidden h-4 w-28 md:block" />
				</div>
				<div className="space-y-5 p-5 sm:p-8">
					<Skeleton className="h-6 w-32" />
					{["profile", "name", "email", "account"].map((row) => (
						<Skeleton key={row} className="h-16 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}
