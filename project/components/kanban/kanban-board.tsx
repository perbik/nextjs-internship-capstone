"use client";

import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import {
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import { useActionState } from "react";
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

const initialState: ListActionState = { message: "" };

export function KanbanBoard({
	projectId,
	lists,
	members,
	labels,
	canManage,
	dragEnabled,
	filterControl,
}: KanbanBoardProps) {
	const [createState, createAction, isCreating] = useActionState(
		createListAction,
		initialState,
	);
	const {
		sensors,
		boardLists,
		pendingMoves,
		moveError,
		listMoveError,
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
					<div className="flex flex-wrap items-center gap-3">
						{filterControl}
						<BulkTaskToolbar
							projectId={projectId}
							lists={boardLists}
							members={members}
							labels={labels}
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
				<BoardStatus
					dragEnabled={dragEnabled}
					isMoving={pendingMoves.length > 0}
					moveError={moveError}
					listMoveError={listMoveError}
				/>
				<div className="kanban-scrollbar flex h-[508px] w-full min-w-0 items-start gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-5">
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
								columnDragDisabled={
									!canManage || bulkMode || pendingMoves.length > 0
								}
							/>
						))}
					</SortableContext>
				</div>
			</div>
			<DragOverlay dropAnimation={null}>
				{activeListId ? (
					<div className="w-80 rounded-2xl border border-brand/40 bg-surface-subtle px-4 py-3 font-display text-sm font-bold text-foreground shadow-2xl">
						{boardLists.find((list) => list.id === activeListId)?.name}
					</div>
				) : activeTaskId ? (
					<div className="w-72 rounded-lg border border-blue_munsell-400 bg-card p-3 text-sm font-medium text-outer_space-500 shadow-xl dark:bg-outer_space-300 dark:text-platinum-500">
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
			{!dragEnabled && (
				<p className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
					Clear task filters to drag and reorder tasks.
				</p>
			)}
			{isMoving && (
				<p className="sr-only" role="status" aria-live="polite">
					Saving task position...
				</p>
			)}
			{moveError && (
				<p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
					{moveError}
				</p>
			)}
			{listMoveError && (
				<p className="mb-4 px-5 text-sm text-red-400" role="alert">
					{listMoveError}
				</p>
			)}
		</>
	);
}
