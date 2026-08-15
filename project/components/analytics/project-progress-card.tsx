import { Card } from "@/components/ui/card";

interface ProjectProgressCardProps {
	completionRate: number;
	completedTasks: number;
	totalTasks: number;
}

interface ProgressRingProps {
	completionRate: number;
}

interface ProgressCountProps {
	label: string;
	value: number;
	highlight?: boolean;
}

export function ProjectProgressCard({
	completionRate,
	completedTasks,
	totalTasks,
}: ProjectProgressCardProps) {
	const remainingTasks = Math.max(totalTasks - completedTasks, 0);

	return (
		<Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card p-5 shadow-[0_1px_6px_rgba(0,0,0,.06)] sm:p-6">
			<h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
				Project Progress
			</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Overall completion across tasks in your accessible projects.
			</p>

			<div className="flex flex-1 flex-col items-center justify-center gap-6 py-5 sm:flex-row sm:gap-8">
				<ProgressRing completionRate={completionRate} />

				<div className="w-full min-w-0 space-y-2.5 sm:max-w-52">
					<ProgressCount label="Completed" value={completedTasks} highlight />
					<ProgressCount label="Remaining" value={remainingTasks} />
					<ProgressCount label="Total" value={totalTasks} />
				</div>
			</div>
		</Card>
	);
}

function ProgressRing({ completionRate }: ProgressRingProps) {
	const boundedRate = Math.min(Math.max(completionRate, 0), 100);
	const showCaps = boundedRate > 0 && boundedRate < 100;
	const capBase =
		"absolute left-1/2 top-1/2 z-10 size-[var(--ring-width)] rounded-full bg-brand";

	return (
		<div
			className="relative flex size-(--ring-size) shrink-0 items-center justify-center rounded-full [--ring-radius:calc((var(--ring-size)-var(--ring-width))/2)] [--ring-size:155px] [--ring-width:13px] sm:[--ring-size:170px] sm:[--ring-width:14px]"
			style={{
				background: `conic-gradient(var(--color-brand) 0 ${boundedRate}%, var(--muted) ${boundedRate}% 100%)`,
			}}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={boundedRate}
			aria-valuetext={`${boundedRate}% of tasks completed`}
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
				<span className="font-display text-3xl font-medium leading-none tracking-tighter text-foreground sm:text-4xl">
					{boundedRate}%
				</span>
				<span className="mt-1 text-sm leading-none text-foreground dark:text-muted-foreground">
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
}: ProgressCountProps) {
	return (
		<div className="flex h-9 items-center justify-between rounded-sm border border-border bg-card px-3.5">
			<span className="text-sm font-medium text-foreground">{label}</span>
			<span
				className={`text-sm font-medium ${highlight ? "text-success" : "text-foreground"}`}
			>
				{value}
			</span>
		</div>
	);
}
