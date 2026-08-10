import { activityDescription } from "@/components/task/discussion/activity-description";
import type { TaskActivityItem } from "@/components/task/discussion/types";

export function ActivitySection({
	activities,
	limit,
}: {
	activities: TaskActivityItem[];
	limit: number;
}) {
	return (
		<section>
			<h3 className="mb-3 text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
				Activity
			</h3>
			<div className="max-h-72 space-y-3 overflow-y-auto">
				{activities.length === 0 && (
					<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
						No recorded activity yet.
					</p>
				)}
				{activities.map((activity) => (
					<div key={activity.id} className="flex gap-2 text-xs">
						<span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
						<p className="text-paynes_gray-500 dark:text-french_gray-400">
							<span className="font-medium text-outer_space-500 dark:text-platinum-500">
								{activity.actorName}
							</span>{" "}
							{activityDescription(activity)}
							<br />
							<span className="text-[10px]">
								{new Date(activity.createdAt).toLocaleString()}
							</span>
						</p>
					</div>
				))}
			</div>
			{activities.length >= limit && (
				<p className="mt-2 text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
					Showing the {limit} most recent activity entries.
				</p>
			)}
		</section>
	);
}
