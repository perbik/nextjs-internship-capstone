"use client";

import { CheckSquare2, Keyboard, X } from "lucide-react";
import { useBulkTaskActions } from "@/components/kanban/hooks/use-bulk-task-actions";
import {
	BULK_OPERATION_OPTIONS,
	type BulkOperation,
} from "@/components/kanban/utils/bulk-task-utils";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type { TaskMemberOption } from "@/components/task/task-modal-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BoardList } from "@/stores/board-store";

interface BulkTaskToolbarProps {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
}

export function BulkTaskToolbar(props: BulkTaskToolbarProps) {
	const bulkActions = useBulkTaskActions(props);

	if (!bulkActions.bulkMode) {
		return (
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={bulkActions.enterBulkMode}
					disabled={bulkActions.allTaskCount === 0}
					className="h-8 rounded-full px-3"
				>
					<CheckSquare2 size={14} aria-hidden="true" />
					Bulk select
				</Button>
				<span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
					<Keyboard size={13} aria-hidden="true" />
					Press{" "}
					<kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-semibold">
						B
					</kbd>
				</span>
			</div>
		);
	}

	return (
		<section
			className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl space-y-2 overflow-y-auto rounded-2xl border border-brand/25 bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur-xl sm:p-4"
			aria-label="Bulk task actions"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<CheckSquare2 className="text-brand" size={17} aria-hidden="true" />
					<p className="text-sm font-semibold">Bulk select</p>
					<Badge
						variant="secondary"
						className="rounded-full border-0 px-2 py-0.5"
					>
						{bulkActions.selectedTaskCount} selected
					</Badge>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={bulkActions.selectAll}
						className="h-8 px-2 text-xs"
					>
						Select all ({bulkActions.allTaskCount})
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={bulkActions.clearTaskSelection}
						disabled={bulkActions.selectedTaskCount === 0}
						className="h-8 px-2 text-xs"
					>
						Clear
					</Button>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={bulkActions.exitBulkMode}
								aria-label="Exit bulk selection"
								className="size-8 rounded-full"
							>
								<X size={16} aria-hidden="true" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Exit bulk selection</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-[10rem_minmax(12rem,1fr)_auto]">
				<FormSelect
					value={bulkActions.operation}
					onValueChange={(operation) =>
						bulkActions.setOperation(operation as BulkOperation)
					}
					ariaLabel="Bulk operation"
					options={BULK_OPERATION_OPTIONS}
					triggerClassName="h-9"
				/>

				<FormSelect
					value={bulkActions.value}
					onValueChange={bulkActions.setValue}
					disabled={bulkActions.needsLabel && props.labels.length === 0}
					ariaLabel="Bulk operation value"
					placeholder={
						bulkActions.needsLabel && props.labels.length === 0
							? "No labels available"
							: "Select a value"
					}
					options={bulkActions.valueOptions}
					triggerClassName="h-9"
				/>

				<Button
					type="button"
					onClick={bulkActions.applyBulkOperation}
					disabled={!bulkActions.canApply}
					className="h-9 sm:col-span-2 md:col-span-1"
				>
					{bulkActions.isPending ? "Applying..." : "Apply"}
				</Button>
			</div>

			{bulkActions.pendingMoveCount > 0 && (
				<p className="text-xs text-warning">
					Wait for board position changes to finish saving.
				</p>
			)}
			{bulkActions.message && (
				<p
					className={`text-xs ${bulkActions.success ? "text-success" : "text-destructive"}`}
					role={bulkActions.success ? "status" : "alert"}
				>
					{bulkActions.message}
				</p>
			)}
			<p className="hidden flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground md:flex">
				<span>Shortcuts:</span>
				<span>B toggles bulk mode</span>
				<span>Ctrl/Cmd+A selects visible tasks</span>
				<span>Esc exits</span>
			</p>
		</section>
	);
}
