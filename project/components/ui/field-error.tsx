import { cn } from "@/lib/utils";

interface FieldErrorProps {
	message?: string;
	className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
	if (!message) return null;

	return (
		<p
			role="alert"
			className={cn("mt-1 text-sm text-red-600 dark:text-red-400", className)}
		>
			{message}
		</p>
	);
}
