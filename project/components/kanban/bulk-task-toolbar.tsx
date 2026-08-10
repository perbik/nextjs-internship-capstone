"use client";

import { X } from "lucide-react";
import { useBulkTaskActions } from "@/components/kanban/hooks/use-bulk-task-actions";
import {
	type BulkOperation,
	bulkOperationOptions,
} from "@/components/kanban/utils/bulk-task-utils";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type { TaskMemberOption } from "@/components/task/task-modal-types";
import { FormSelect } from "@/components/ui/form-select";
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
		return null;
	}

	return (
		<div className="w-full space-y-3 rounded-xl border border-white/15 bg-card p-3 text-foreground">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-medium text-outer_space-500 dark:text-platinum-500">
					{bulkActions.selectedTaskCount} selected
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={bulkActions.selectAll}
						className="text-xs text-blue_munsell-700 hover:underline dark:text-blue_munsell-300"
					>
						Select all ({bulkActions.allTaskCount})
					</button>
					<button
						type="button"
						onClick={bulkActions.clearTaskSelection}
						className="text-xs text-paynes_gray-500 hover:underline dark:text-french_gray-400"
					>
						Clear
					</button>
					<button
						type="button"
						onClick={bulkActions.exitBulkMode}
						aria-label="Exit bulk selection"
						className="rounded p-1 hover:bg-card/70 dark:hover:bg-paynes_gray-400"
					>
						<X size={16} />
					</button>
				</div>
			</div>

			<div className="grid gap-2 md:grid-cols-[10rem_minmax(12rem,1fr)_auto]">
				<FormSelect
					value={bulkActions.operation}
					onValueChange={(operation) =>
						bulkActions.setOperation(operation as BulkOperation)
					}
					ariaLabel="Bulk operation"
					options={bulkOperationOptions}
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
				/>

				<button
					type="button"
					onClick={bulkActions.applyBulkOperation}
					disabled={!bulkActions.canApply}
					className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-50"
				>
					{bulkActions.isPending ? "Applying..." : "Apply"}
				</button>
			</div>

			{bulkActions.pendingMoveCount > 0 && (
				<p className="text-xs text-yellow-700 dark:text-yellow-300">
					Wait for board position changes to finish saving.
				</p>
			)}
			{bulkActions.message && (
				<p
					className={
						bulkActions.success
							? "text-xs text-green-700 dark:text-green-400"
							: "text-xs text-red-600 dark:text-red-400"
					}
					role="status"
				>
					{bulkActions.message}
				</p>
			)}
			<p className="text-[11px] text-paynes_gray-500 dark:text-french_gray-400">
				Shortcuts: B toggles bulk mode · Ctrl/Cmd+A selects visible tasks · Esc
				exits
			</p>
		</div>
	);
}
