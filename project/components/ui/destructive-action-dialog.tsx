"use client";

import { AlertTriangle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DestructiveActionDialogProps {
	trigger: ReactNode;
	title: string;
	description: string;
	action: ComponentProps<"form">["action"];
	fields: Array<{ name: string; value: string }>;
	confirmLabel?: string;
	pendingLabel?: string;
	error?: string;
}

export function DestructiveActionDialog({
	trigger,
	title,
	description,
	action,
	fields,
	confirmLabel = "Delete",
	pendingLabel = "Deleting...",
	error,
}: DestructiveActionDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<div className="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
					<AlertTriangle size={20} />
				</div>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<form action={action} className="space-y-4">
					{fields.map((field) => (
						<input
							key={field.name}
							type="hidden"
							name={field.name}
							value={field.value}
						/>
					))}
					{error && (
						<p className="text-sm text-red-600 dark:text-red-400" role="alert">
							{error}
						</p>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
						<DestructiveSubmitButton
							label={confirmLabel}
							pendingLabel={pendingLabel}
						/>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function DestructiveSubmitButton({
	label,
	pendingLabel,
}: {
	label: string;
	pendingLabel: string;
}) {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" variant="destructive" disabled={pending}>
			{pending ? pendingLabel : label}
		</Button>
	);
}
