import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface TeamActivityItem {
	id: string;
	actorName: string;
	action: string;
	taskTitle?: string;
	projectId: string;
	projectName: string;
	date: string;
}

export function TeamActivityCard({
	activities,
}: {
	activities: TeamActivityItem[];
}) {
	return (
		<Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,.06)]">
			<div className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
				<h2 className="font-display text-xl font-extrabold text-foreground ">
					Team Activity
				</h2>
				<p className="mt-1 text-sm text-muted-foreground ">
					Five most recent task events
				</p>
			</div>

			{activities.length === 0 ? (
				<p className="px-6 py-12 text-center text-sm text-muted-foreground ">
					No task activity has been recorded yet.
				</p>
			) : (
				<div className="divide-y divide-black/10 px-5 sm:px-6 dark:divide-white/8">
					{activities.map((activity) => (
						<div key={activity.id} className="py-3">
							<div className="flex items-start justify-between gap-4">
								<p className="min-w-0 text-sm font-medium text-foreground ">
									{activity.actorName} {activity.action}
									{activity.taskTitle ? `: ${activity.taskTitle}` : ""}
								</p>
								<time className="shrink-0 text-xs text-muted-foreground ">
									{activity.date}
								</time>
							</div>
							<Link
								href={`/projects/${activity.projectId}`}
								className="mt-0.5 inline-block text-sm font-semibold text-brand hover:underline"
							>
								{activity.projectName}
							</Link>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}
