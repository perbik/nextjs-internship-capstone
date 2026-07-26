import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"animate-pulse rounded-md bg-french_gray-200 dark:bg-paynes_gray-400",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
