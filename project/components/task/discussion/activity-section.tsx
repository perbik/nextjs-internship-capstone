import { activityDescription } from "@/components/task/discussion/activity-description";
import type { TaskActivityItem } from "@/components/task/discussion/types";

interface ActivitySectionProps {
	activities: TaskActivityItem[];
	limit: number;
}

export function ActivitySection({ activities, limit }: ActivitySectionProps) {
	return (
		<section>
			<h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
			<ol className="max-h-72 space-y-3 overflow-y-auto">
				{activities.length === 0 && (
					<li className="text-xs text-muted-foreground">
						No recorded activity yet.
					</li>
				)}
				{activities.map((activity) => (
					<li key={activity.id} className="flex gap-2 text-xs">
						<span
							aria-hidden="true"
							className="mt-1 size-2 shrink-0 rounded-full bg-brand"
						/>
						<p className="text-muted-foreground">
							<span className="font-medium text-foreground">
								{activity.actorName}
							</span>{" "}
							{activityDescription(activity)}
							<br />
							<time
								dateTime={new Date(activity.createdAt).toISOString()}
								className="text-[10px]"
							>
								{new Date(activity.createdAt).toLocaleString()}
							</time>
						</p>
					</li>
				))}
			</ol>
			{activities.length >= limit && (
				<p className="mt-2 text-[10px] text-muted-foreground">
					Showing the {limit} most recent activity entries.
				</p>
			)}
		</section>
	);
}
