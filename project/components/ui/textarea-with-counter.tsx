"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextareaWithCounterProps
	extends Omit<React.ComponentProps<typeof Textarea>, "maxLength"> {
	maxLength: number;
	counterClassName?: string;
}

const TextareaWithCounter = React.forwardRef<
	HTMLTextAreaElement,
	TextareaWithCounterProps
>(
	(
		{
			className,
			counterClassName,
			defaultValue,
			onChange,
			"aria-describedby": ariaDescribedBy,
			maxLength,
			...props
		},
		forwardedRef,
	) => {
		const textareaRef = React.useRef<HTMLTextAreaElement>(null);
		const counterId = React.useId();
		const [characterCount, setCharacterCount] = React.useState(
			String(defaultValue ?? "").length,
		);

		function setTextareaRef(node: HTMLTextAreaElement | null) {
			textareaRef.current = node;
			if (typeof forwardedRef === "function") forwardedRef(node);
			else if (forwardedRef) forwardedRef.current = node;
		}

		// Keep the counter aligned when a parent form resets after submission
		React.useEffect(() => {
			const textarea = textareaRef.current;
			const form = textarea?.form;
			if (!textarea || !form) return;
			const mountedTextarea = textarea;

			function handleReset() {
				requestAnimationFrame(() => {
					setCharacterCount(mountedTextarea.value.length);
				});
			}

			form.addEventListener("reset", handleReset);
			return () => form.removeEventListener("reset", handleReset);
		}, []);

		return (
			<div>
				<Textarea
					ref={setTextareaRef}
					maxLength={maxLength}
					defaultValue={defaultValue}
					aria-describedby={
						ariaDescribedBy ? `${ariaDescribedBy} ${counterId}` : counterId
					}
					className={className}
					onChange={(event) => {
						setCharacterCount(event.currentTarget.value.length);
						onChange?.(event);
					}}
					{...props}
				/>
				<p
					id={counterId}
					className={cn(
						"mt-1 text-right text-xs tabular-nums text-muted-foreground",
						counterClassName,
					)}
				>
					{characterCount.toLocaleString()} / {maxLength.toLocaleString()}
				</p>
			</div>
		);
	},
);
TextareaWithCounter.displayName = "TextareaWithCounter";

export { TextareaWithCounter };
