import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm  bg-control ",
				className,
				"max-md:text-base",
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
