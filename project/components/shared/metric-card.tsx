interface MetricCardProps {
	label: string;
	value: number | string;
	detail: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
	return (
		<article className="flex min-h-32 flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_1px_8px_rgba(0,0,0,.06)]  ">
			<p className="text-sm font-semibold leading-5 text-brand">{label}</p>
			<p className="py-2 font-display text-4xl font-extrabold leading-9 tracking-[-0.9px] text-foreground ">
				{value}
			</p>
			<p className="text-xs font-medium leading-4 text-muted-foreground ">
				{detail}
			</p>
		</article>
	);
}
