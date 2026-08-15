"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle, GripVertical } from "lucide-react";
import { ListActionsPopover } from "@/components/kanban/list-actions-popover";
import type { ListColumnProps } from "@/components/kanban/types";
import { CreateTaskModal } from "@/components/task/create-task-modal";
import { TaskCard } from "@/components/task/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoardStore } from "@/stores/board-store";

export function ListColumn({
	board,
	list,
	position,
	dragDisabled,
	columnDragDisabled,
}: ListColumnProps) {
	const { projectId, lists, members, labels, canManage } = board;
	const { index: listIndex, canMoveLeft, canMoveRight } = position;
	const {
		attributes: columnAttributes,
		listeners: columnListeners,
		setNodeRef: setSortableColumnRef,
		transform: columnTransform,
		transition: columnTransition,
		isDragging: isColumnDragging,
	} = useSortable({
		id: `list-${list.id}`,
		data: { kind: "list", listId: list.id, index: listIndex },
		disabled: columnDragDisabled,
	});
	const { setNodeRef: dropRef, isOver: isDropTarget } = useDroppable({
		id: `column-${list.id}`,
		data: {
			kind: "column",
			listId: list.id,
			index: list.tasks.length,
		},
	});
	const bulkMode = useBoardStore((state) => state.bulkMode);
	const selectedTaskIds = useBoardStore((state) => state.selectedTaskIds);
	const toggleTaskSelection = useBoardStore(
		(state) => state.toggleTaskSelection,
	);
	const statusStyle = columnStatusStyle(list.isCompleted);
	const taskCountLabel = `${list.tasks.length} ${list.tasks.length === 1 ? "task" : "tasks"}`;

	return (
		<section
			ref={setSortableColumnRef}
			style={{
				transform: CSS.Transform.toString(columnTransform),
				transition: columnTransition,
			}}
			className={`flex h-122 w-80 min-w-70 shrink-0 flex-col overflow-hidden rounded-md border border-input bg-surface-column ${isColumnDragging ? "opacity-35" : ""}`}
		>
			<header className="border-b border-input px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 items-center gap-1.5">
						{canManage && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={`Drag column: ${list.name}`}
										className="-ml-1 size-6 shrink-0 touch-none rounded text-muted-foreground hover:bg-brand/5 hover:text-brand disabled:cursor-default disabled:opacity-40"
										disabled={columnDragDisabled}
										{...columnAttributes}
										{...columnListeners}
									>
										<GripVertical size={15} aria-hidden="true" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Drag column: {list.name}</TooltipContent>
							</Tooltip>
						)}
						<h2
							className={`flex min-w-0 items-center gap-2 truncate text-sm font-bold ${statusStyle.text}`}
						>
							{list.name}
							{list.isCompleted && (
								<>
									<CheckCircle
										size={15}
										className="shrink-0 text-green-600 dark:text-green-400"
										aria-hidden="true"
									/>
									<span className="sr-only">Completed column</span>
								</>
							)}
						</h2>
						<Badge
							variant="secondary"
							className={`shrink-0 border-0 px-2 py-0.5 text-xs font-bold ${statusStyle.badge}`}
						>
							<span aria-hidden="true">{list.tasks.length}</span>
							<span className="sr-only">{taskCountLabel}</span>
						</Badge>
					</div>

					<div className="flex items-center gap-1">
						{canManage && (
							<ListActionsPopover
								projectId={projectId}
								list={list}
								canMoveLeft={canMoveLeft}
								canMoveRight={canMoveRight}
							/>
						)}
						<CreateTaskModal
							projectId={projectId}
							lists={lists}
							members={members}
							labels={labels}
							canManageLabels={canManage}
							initialListId={list.id}
							triggerVariant="columnIcon"
						/>
					</div>
				</div>
			</header>

			<div
				ref={dropRef}
				className={`kanban-column-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 transition-colors ${
					isDropTarget ? "bg-brand/5 dark:bg-brand/10" : ""
				}`}
			>
				<SortableContext
					items={list.tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					{list.tasks.length > 0 ? (
						list.tasks.map((task, index) => (
							<TaskCard
								key={task.id}
								projectId={projectId}
								index={index}
								dragDisabled={dragDisabled}
								task={task}
								lists={lists}
								members={members}
								labels={labels}
								canManageLabels={canManage}
								bulkMode={bulkMode}
								selected={selectedTaskIds.includes(task.id)}
								onToggleSelection={() => toggleTaskSelection(task.id)}
							/>
						))
					) : (
						<p className="py-8 text-center text-sm text-muted-foreground">
							No tasks in this column
						</p>
					)}
				</SortableContext>
				<CreateTaskModal
					projectId={projectId}
					lists={lists}
					members={members}
					labels={labels}
					canManageLabels={canManage}
					initialListId={list.id}
				/>
			</div>
		</section>
	);
}

function columnStatusStyle(isCompleted: boolean) {
	if (isCompleted) {
		return {
			text: "text-green-600 dark:text-green-400",
			badge:
				"bg-green-500/10 text-green-600 hover:bg-green-500/10 dark:text-green-400",
		};
	}

	return {
		text: "text-brand",
		badge: "bg-brand/10 text-brand hover:bg-brand/10",
	};
}
