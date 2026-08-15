import { Skeleton } from "@/components/ui/skeleton";

const discussionSections = ["comments", "activity"] as const;

export function TaskDiscussionSkeleton({ className }: { className: string }) {
	return (
		<div className={className}>
			{discussionSections.map((section) => (
				<div key={section} className="space-y-3">
					<Skeleton className="h-5 w-28" />
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			))}
		</div>
	);
}
