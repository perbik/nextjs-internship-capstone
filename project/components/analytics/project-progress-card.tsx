import { Card } from "@/components/ui/card";

export function ProjectProgressCard({
	completionRate,
	completedTasks,
	totalTasks,
}: {
	completionRate: number;
	completedTasks: number;
	totalTasks: number;
}) {
	const remainingTasks = totalTasks - completedTasks;

	return (
		<Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,.06)] p-6">
			<h2 className="font-display text-xl font-extrabold text-foreground">
				Project Progress
			</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Overall completion across tasks in your accessible projects.
			</p>

			<div className="mt-14 flex flex-col items-center sm:flex-row sm:justify-center gap-10">
				<ProgressRing completionRate={completionRate} />

				<div className="w-full min-w-0 space-y-2.5 sm:max-w-50.75">
					<ProgressCount label="Completed" value={completedTasks} highlight />
					<ProgressCount label="Remaining" value={remainingTasks} />
					<ProgressCount label="Total" value={totalTasks} />
				</div>
			</div>
		</Card>
	);
}

function ProgressRing({ completionRate }: { completionRate: number }) {
	const boundedRate = Math.min(Math.max(completionRate, 0), 100);
	const showCaps = boundedRate > 0 && boundedRate < 100;
	const capBase =
		"absolute left-1/2 top-1/2 z-10 size-[var(--ring-width)] rounded-full bg-brand";

	return (
		<div
			className="relative flex size-(--ring-size) shrink-0 items-center justify-center rounded-full [--ring-radius:calc((var(--ring-size)-var(--ring-width))/2)] [--ring-size:185px] [--ring-width:15px] 2xl:[--ring-size:215px] 2xl:[--ring-width:16px]"
			style={{
				background: `conic-gradient(var(--color-brand) 0 ${boundedRate}%, #ededed ${boundedRate}% 100%)`,
			}}
			role="img"
			aria-label={`${boundedRate}% of tasks completed`}
		>
			{showCaps && (
				<>
					<span
						aria-hidden="true"
						className={capBase}
						style={{
							transform:
								"translate(-50%, -50%) translateY(calc(var(--ring-radius) * -1))",
						}}
					/>
					<span
						aria-hidden="true"
						className={capBase}
						style={{
							transform: `translate(-50%, -50%) rotate(${boundedRate * 3.6}deg) translateY(calc(var(--ring-radius) * -1))`,
						}}
					/>
				</>
			)}
			<div className="relative z-20 flex size-[calc(var(--ring-size)-var(--ring-width)*2)] flex-col items-center justify-center rounded-full bg-card ">
				<span className="font-display text-4xl font-medium leading-none tracking-tighter text-foreground 2xl:text-5xl">
					{boundedRate}%
				</span>
				<span className="mt-1 text-base leading-none text-foreground dark:text-muted-foreground">
					completed
				</span>
			</div>
		</div>
	);
}

function ProgressCount({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: number;
	highlight?: boolean;
}) {
	return (
		<div className="flex h-10 items-center justify-between rounded-sm border border-border bg-card px-4">
			<span className="text-base font-medium text-black dark:text-muted-foreground">
				{label}
			</span>
			<span
				className={`text-base font-medium ${highlight ? "text-[#66c24b]" : "text-black dark:text-muted-foreground"}`}
			>
				{value}
			</span>
		</div>
	);
}
