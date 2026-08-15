"use client";

import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import {
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import { useActionState, useEffect, useRef } from "react";
import {
	createListAction,
	type ListActionState,
} from "@/app/(dashboard)/projects/[id]/list-actions";
import { BulkTaskToolbar } from "@/components/kanban/bulk-task-toolbar";
import { CreateListDialog } from "@/components/kanban/create-list-dialog";
import { useKanbanDrag } from "@/components/kanban/hooks/use-kanban-drag";
import { ListColumn } from "@/components/kanban/list-column";
import type { KanbanBoardProps } from "@/components/kanban/types";
import { findTaskLocation } from "@/components/kanban/utils/board-utils";
import { useUIStore } from "@/stores/ui-store";

const INITIAL_STATE: ListActionState = { message: "" };

export function KanbanBoard({
	projectId,
	lists,
	members,
	labels,
	canManage,
	dragEnabled,
	initialTaskId,
	filterControl,
}: KanbanBoardProps) {
	const openedTaskId = useRef<string | null>(null);
	const openModal = useUIStore((state) => state.openModal);
	const [createState, createAction, isCreating] = useActionState(
		createListAction,
		INITIAL_STATE,
	);
	const {
		sensors,
		boardLists,
		pendingMoves,
		moveError,
		listMoveError,
		isSavingListMove,
		activeTaskId,
		activeListId,
		bulkMode,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useKanbanDrag({ projectId, lists, dragEnabled });
	const columnBoard = {
		projectId,
		lists: boardLists,
		members,
		labels,
		canManage,
	};
	const isSavingTaskMoves = pendingMoves.length > 0;
	const isSavingBoardPosition = isSavingTaskMoves || isSavingListMove;
	const requestedTaskExists = initialTaskId
		? boardLists.some((list) =>
				list.tasks.some((task) => task.id === initialTaskId),
			)
		: false;

	useEffect(() => {
		if (
			!initialTaskId ||
			!requestedTaskExists ||
			openedTaskId.current === initialTaskId
		) {
			return;
		}

		openedTaskId.current = initialTaskId;
		openModal(`edit-task:${initialTaskId}`);
	}, [initialTaskId, openModal, requestedTaskExists]);

	// Avoid changing column order while task positions are still being saved
	const isColumnDragDisabled = !canManage || bulkMode || isSavingBoardPosition;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-board">
				<div className="flex min-h-17 flex-wrap items-center justify-between gap-3 px-5 py-4">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						{filterControl}
						<BulkTaskToolbar
							projectId={projectId}
							lists={boardLists}
							members={members}
							labels={labels}
						/>
						<BoardStatus
							dragEnabled={dragEnabled}
							isMoving={isSavingBoardPosition}
							moveError={moveError}
							listMoveError={listMoveError}
						/>
					</div>
					{canManage && (
						<CreateListDialog
							projectId={projectId}
							action={createAction}
							state={createState}
							isPending={isCreating}
						/>
					)}
				</div>
				<div className="kanban-scrollbar flex h-127 w-full min-w-0 items-start gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-5">
					<SortableContext
						items={boardLists.map((list) => `list-${list.id}`)}
						strategy={horizontalListSortingStrategy}
					>
						{boardLists.map((list, index) => (
							<ListColumn
								key={list.id}
								board={columnBoard}
								list={list}
								position={{
									index,
									canMoveLeft: index > 0,
									canMoveRight: index < boardLists.length - 1,
								}}
								dragDisabled={!dragEnabled || bulkMode}
								columnDragDisabled={isColumnDragDisabled}
							/>
						))}
					</SortableContext>
				</div>
			</div>
			<DragOverlay dropAnimation={null}>
				{activeListId ? (
					<div
						aria-hidden="true"
						className="w-80 rounded-2xl border border-brand/40 bg-surface-subtle px-4 py-3 font-display text-sm font-bold text-foreground shadow-2xl"
					>
						{boardLists.find((list) => list.id === activeListId)?.name}
					</div>
				) : activeTaskId ? (
					<div
						aria-hidden="true"
						className="w-72 rounded-lg border border-brand/50 bg-card p-3 text-sm font-medium text-card-foreground shadow-xl"
					>
						{findTaskLocation(boardLists, activeTaskId)?.task.title}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

function BoardStatus({
	dragEnabled,
	isMoving,
	moveError,
	listMoveError,
}: {
	dragEnabled: boolean;
	isMoving: boolean;
	moveError: string;
	listMoveError: string;
}) {
	return (
		<>
			{isMoving && (
				<p className="sr-only" role="status" aria-live="polite">
					Saving task position...
				</p>
			)}
			{!dragEnabled && (
				<p className="inline-flex h-8 items-center rounded-full border border-amber-300/60 bg-amber-50 px-3 text-xs font-medium text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
					Clear filters to reorder tasks
				</p>
			)}
			{moveError && (
				<p
					className="inline-flex min-h-8 items-center rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
					role="alert"
				>
					{moveError}
				</p>
			)}
			{listMoveError && (
				<p
					className="inline-flex min-h-8 items-center rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
					role="alert"
				>
					{listMoveError}
				</p>
			)}
		</>
	);
}
