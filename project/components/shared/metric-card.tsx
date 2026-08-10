import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
	label: string;
	value: number | string;
	detail?: string;
	trend?: string;
	direction?: "up" | "down";
}

export function MetricCard({
	label,
	value,
	detail,
	trend,
	direction = "up",
}: MetricCardProps) {
	const isPositive = direction === "up";
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;

	return (
		<article className="flex min-h-32 flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_1px_8px_rgba(0,0,0,.06)]  ">
			<p className="text-sm font-semibold leading-5 text-brand">{label}</p>
			<p className="py-2 font-display text-4xl font-extrabold leading-9 tracking-[-0.9px] text-foreground ">
				{value}
			</p>
			{detail ? (
				<p className="text-xs font-medium leading-4 text-muted-foreground ">
					{detail}
				</p>
			) : trend ? (
				<span
					className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold leading-4 ${isPositive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
				>
					<TrendIcon size={12} aria-hidden="true" /> {trend}
				</span>
			) : null}
		</article>
	);
}
