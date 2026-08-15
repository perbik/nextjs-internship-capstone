"use client";

import { create } from "zustand";

// Client-side task containing the joined data required by task cards
export interface BoardTask {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	priority: "low" | "medium" | "high";
	dueDate: Date | null;
	assigneeId: string | null;
	assignee: {
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null;
	labels: Array<{
		id: string;
		name: string;
		color: string;
	}>;
}

// Kanban column and its currently visible tasks
export interface BoardList {
	id: string;
	name: string;
	position: number;
	isCompleted: boolean;
	tasks: BoardTask[];
}

// Locally queued task movement waiting for server confirmation - Optimistic
export interface BoardMove {
	id: string;
	taskId: string;
	sourceListId: string;
	targetListId: string;
	targetPosition: number;
}

interface BoardState {
	// Board identity and optimistic persistence state
	projectId: string | null;
	lists: BoardList[];
	// Last server-confirmed snapshot used as the rollback baseline
	confirmedLists: BoardList[];
	isDragging: boolean;
	pendingMoves: BoardMove[];
	moveError: string;

	// Bulk-selection state shared by the board columns and toolbar
	bulkMode: boolean;
	selectedTaskIds: string[];

	// Server synchronization and drag lifecycle actions
	syncBoard: (projectId: string, lists: BoardList[]) => void;
	startDragging: () => void;
	stopDragging: () => void;
	cancelDragging: () => void;

	// Optimistic task and column movement actions
	previewMove: (move: Omit<BoardMove, "id">) => void;
	queueMove: (move: BoardMove) => void;
	reorderLists: (sourceListId: string, targetListId: string) => void;
	confirmListOrder: () => void;
	revertListOrder: () => void;

	// Sync the local snapshot after the server save either succeeds or fails
	confirmSnapshot: (moveIds: string[], savedLists: BoardList[]) => void;
	rejectSnapshot: (moveIds: string[], error: string) => void;
	clearMoveError: () => void;

	// Bulk selection and optimistic task removal actions
	setBulkMode: (enabled: boolean) => void;
	toggleTaskSelection: (taskId: string) => void;
	selectTasks: (taskIds: string[]) => void;
	clearTaskSelection: () => void;
	removeTask: (taskId: string) => void;
}

// Pure immutable move helper used for previews, final drops, and replaying moves
export function moveTaskBetweenLists(
	currentLists: BoardList[],
	move: Omit<BoardMove, "id">,
) {
	const { taskId, sourceListId, targetListId, targetPosition } = move;
	const sourceList =
		currentLists.find(
			(list) =>
				list.id === sourceListId &&
				list.tasks.some((item) => item.id === taskId),
		) ??
		currentLists.find((list) => list.tasks.some((item) => item.id === taskId));

	if (!sourceList) {
		return currentLists;
	}

	const task = sourceList.tasks.find((item) => item.id === taskId);

	if (!task) {
		return currentLists;
	}

	return currentLists.map((list) => {
		const tasksWithoutMovedTask = list.tasks.filter(
			(item) => item.id !== taskId,
		);

		if (list.id !== targetListId) {
			return list.id === sourceList.id
				? { ...list, tasks: tasksWithoutMovedTask }
				: list;
		}

		const nextTasks = [...tasksWithoutMovedTask];
		const nextPosition = Math.min(targetPosition, nextTasks.length);
		nextTasks.splice(nextPosition, 0, { ...task, listId: targetListId });

		return { ...list, tasks: nextTasks };
	});
}

// Reapplies newer unsaved moves on top of a confirmed server snapshot
function replayMoves(lists: BoardList[], moves: BoardMove[]) {
	return moves.reduce(
		(currentLists, move) => moveTaskBetweenLists(currentLists, move),
		lists,
	);
}

// Shared client store for optimistic board state and bulk task selection
export const useBoardStore = create<BoardState>()((set) => ({
	projectId: null,
	lists: [],
	confirmedLists: [],
	isDragging: false,
	pendingMoves: [],
	moveError: "",
	bulkMode: false,
	selectedTaskIds: [],

	// Avoid replacing an active optimistic board with stale server-rendered props
	syncBoard: (projectId, lists) =>
		set((state) => {
			if (
				state.projectId === projectId &&
				(state.isDragging || state.pendingMoves.length > 0)
			) {
				return state;
			}

			return {
				projectId,
				lists,
				confirmedLists: lists,
				isDragging: false,
				pendingMoves: [],
				moveError: "",
				bulkMode: state.projectId === projectId ? state.bulkMode : false,
				selectedTaskIds:
					state.projectId === projectId
						? state.selectedTaskIds.filter((taskId) =>
								lists.some((list) =>
									list.tasks.some((task) => task.id === taskId),
								),
							)
						: [],
			};
		}),

	startDragging: () => set({ isDragging: true }),
	stopDragging: () => set({ isDragging: false }),
	// Remove the temporary preview while retaining moves already queued for saving
	cancelDragging: () =>
		set((state) => ({
			isDragging: false,
			lists: replayMoves(state.confirmedLists, state.pendingMoves),
		})),

	previewMove: (move) =>
		set((state) => ({
			lists: moveTaskBetweenLists(state.lists, move),
		})),

	queueMove: (move) =>
		set((state) => ({
			lists: moveTaskBetweenLists(state.lists, move),
			pendingMoves: [...state.pendingMoves, move],
		})),

	reorderLists: (sourceListId, targetListId) =>
		set((state) => {
			const sourceIndex = state.lists.findIndex(
				(list) => list.id === sourceListId,
			);
			const targetIndex = state.lists.findIndex(
				(list) => list.id === targetListId,
			);

			if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
				return state;
			}

			const nextLists = [...state.lists];
			const [movedList] = nextLists.splice(sourceIndex, 1);
			nextLists.splice(targetIndex, 0, movedList);

			return {
				lists: nextLists.map((list, position) => ({ ...list, position })),
			};
		}),

	confirmListOrder: () => set((state) => ({ confirmedLists: state.lists })),

	revertListOrder: () => set((state) => ({ lists: state.confirmedLists })),

	// Confirm captured moves without discarding newer moves made during the request
	confirmSnapshot: (moveIds, savedLists) =>
		set((state) => {
			const confirmedIds = new Set(moveIds);
			const pendingMoves = state.pendingMoves.filter(
				(move) => !confirmedIds.has(move.id),
			);

			return {
				confirmedLists: savedLists,
				pendingMoves,
				lists: replayMoves(savedLists, pendingMoves),
			};
		}),

	// Roll back rejected moves and preserve any unrelated moves still pending
	rejectSnapshot: (moveIds, error) =>
		set((state) => {
			const rejectedIds = new Set(moveIds);
			const pendingMoves = state.pendingMoves.filter(
				(move) => !rejectedIds.has(move.id),
			);

			return {
				pendingMoves,
				lists: replayMoves(state.confirmedLists, pendingMoves),
				moveError: error,
			};
		}),

	clearMoveError: () => set({ moveError: "" }),
	setBulkMode: (enabled) =>
		set({
			bulkMode: enabled,
			selectedTaskIds: [],
		}),
	toggleTaskSelection: (taskId) =>
		set((state) => ({
			selectedTaskIds: state.selectedTaskIds.includes(taskId)
				? state.selectedTaskIds.filter((id) => id !== taskId)
				: [...state.selectedTaskIds, taskId],
		})),
	selectTasks: (taskIds) => set({ selectedTaskIds: [...new Set(taskIds)] }),
	clearTaskSelection: () => set({ selectedTaskIds: [] }),
	removeTask: (taskId) =>
		set((state) => ({
			lists: state.lists.map((list) => ({
				...list,
				tasks: list.tasks.filter((task) => task.id !== taskId),
			})),
			confirmedLists: state.confirmedLists.map((list) => ({
				...list,
				tasks: list.tasks.filter((task) => task.id !== taskId),
			})),
			pendingMoves: state.pendingMoves.filter((move) => move.taskId !== taskId),
			selectedTaskIds: state.selectedTaskIds.filter((id) => id !== taskId),
		})),
}));
