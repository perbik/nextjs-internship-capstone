import {
	BarChart3,
	ClipboardCheck,
	Clock,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getAnalyticsData } from "@/lib/db/queries";

const activityLabels: Record<string, string> = {
	task_created: "created a task",
	task_field_changed: "updated a task",
	task_moved: "moved a task",
	task_reordered: "reordered a task",
	task_label_added: "added a task label",
	task_label_removed: "removed a task label",
	comment_added: "added a comment",
	comment_updated: "edited a comment",
	comment_deleted: "deleted a comment",
};

function actorName(actor: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) {
	return (
		[actor.firstName, actor.lastName].filter(Boolean).join(" ") || actor.email
	);
}

export default async function AnalyticsPage() {
	const user = await requireCurrentUser();
	const { metrics, recentActivity } = await getAnalyticsData(user.id);
	const metricCards = [
		{
			title: "Project Velocity",
			value: metrics.projectVelocity,
			detail: "tasks/week",
			icon: TrendingUp,
			className:
				"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
		},
		{
			title: "Team Efficiency",
			value: `${metrics.completionRate}%`,
			detail: "completion rate",
			icon: BarChart3,
			className:
				"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
		},
		{
			title: "Active Users",
			value: metrics.activeUsersThisWeek,
			detail: "this week",
			icon: Users,
			className:
				"bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
		},
		{
			title: "Avg. Task Time",
			value: metrics.averageTaskTime,
			detail: "days",
			icon: Clock,
			className:
				"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Analytics
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					Live project and task insights from your accessible work.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{metricCards.map((metric) => (
					<article
						key={metric.title}
						className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"
					>
						<div
							className={`flex size-10 items-center justify-center rounded-lg ${metric.className}`}
						>
							<metric.icon size={20} />
						</div>
						<p className="mt-4 text-2xl font-bold text-outer_space-500 dark:text-platinum-500">
							{metric.value}
						</p>
						<h2 className="mt-1 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
							{metric.title}
						</h2>
						<p className="mt-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
							{metric.detail}
						</p>
					</article>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						Project progress
					</h2>
					<p className="mt-1 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Overall completion across tasks in your accessible projects.
					</p>

					<div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
						<div
							className="relative flex size-44 shrink-0 items-center justify-center rounded-full"
							style={{
								background: `conic-gradient(var(--color-blue_munsell-500) ${metrics.completionRate}%, var(--color-french_gray-200) ${metrics.completionRate}% 100%)`,
							}}
							role="img"
							aria-label={`${metrics.completionRate}% of tasks completed`}
						>
							<div className="flex size-32 flex-col items-center justify-center rounded-full bg-white dark:bg-outer_space-500">
								<span className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
									{metrics.completionRate}%
								</span>
								<span className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
									completed
								</span>
							</div>
						</div>

						<div className="w-full max-w-56 space-y-3">
							<div className="flex items-center justify-between rounded-lg bg-platinum-800 px-3 py-2 dark:bg-outer_space-400">
								<span className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
									Completed
								</span>
								<span className="font-semibold text-green-600 dark:text-green-400">
									{metrics.completedTasks}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-platinum-800 px-3 py-2 dark:bg-outer_space-400">
								<span className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
									Remaining
								</span>
								<span className="font-semibold text-outer_space-500 dark:text-platinum-500">
									{metrics.totalTasks - metrics.completedTasks}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-platinum-800 px-3 py-2 dark:bg-outer_space-400">
								<span className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
									Total
								</span>
								<span className="font-semibold text-outer_space-500 dark:text-platinum-500">
									{metrics.totalTasks}
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
					<div className="flex items-center gap-2">
						<ClipboardCheck size={19} className="text-blue_munsell-500" />
						<h2 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Team activity
						</h2>
					</div>
					<p className="mt-1 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						The ten most recent authorized task events.
					</p>

					{recentActivity.length === 0 ? (
						<p className="py-10 text-center text-sm text-paynes_gray-500 dark:text-french_gray-400">
							No task activity has been recorded yet.
						</p>
					) : (
						<div className="mt-4 max-h-80 divide-y divide-french_gray-300 overflow-y-auto dark:divide-paynes_gray-400">
							{recentActivity.map(({ activity, projectName, actor }) => (
								<div
									key={activity.id}
									className="flex items-start justify-between gap-4 py-3"
								>
									<div className="min-w-0">
										<p className="text-sm text-outer_space-500 dark:text-platinum-500">
											<span className="font-medium">
												{actor ? actorName(actor) : "Former member"}
											</span>{" "}
											{activityLabels[activity.action] ?? activity.action}
											{typeof activity.metadata.title === "string"
												? `: ${activity.metadata.title}`
												: ""}
										</p>
										<Link
											href={`/projects/${activity.projectId}`}
											className="text-xs text-blue_munsell-600 hover:underline dark:text-blue_munsell-300"
										>
											{projectName}
										</Link>
									</div>
									<time className="shrink-0 text-[11px] text-paynes_gray-500 dark:text-french_gray-400">
										{activity.createdAt.toLocaleDateString()}
									</time>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
