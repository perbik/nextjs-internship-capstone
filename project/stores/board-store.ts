"use client";

import { create } from "zustand";

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

export interface BoardList {
	id: string;
	name: string;
	position: number;
	isCompleted: boolean;
	tasks: BoardTask[];
}

export interface BoardMove {
	id: string;
	taskId: string;
	sourceListId: string;
	targetListId: string;
	targetPosition: number;
}

interface BoardState {
	projectId: string | null;
	lists: BoardList[];
	confirmedLists: BoardList[];
	isDragging: boolean;
	pendingMoves: BoardMove[];
	moveError: string;
	syncBoard: (projectId: string, lists: BoardList[]) => void;
	startDragging: () => void;
	stopDragging: () => void;
	cancelDragging: () => void;
	previewMove: (move: Omit<BoardMove, "id">) => void;
	queueMove: (move: BoardMove) => void;
	confirmSnapshot: (moveIds: string[], savedLists: BoardList[]) => void;
	rejectSnapshot: (moveIds: string[], error: string) => void;
	clearMoveError: () => void;
}

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

function replayMoves(lists: BoardList[], moves: BoardMove[]) {
	return moves.reduce(
		(currentLists, move) => moveTaskBetweenLists(currentLists, move),
		lists,
	);
}

export const useBoardStore = create<BoardState>()((set) => ({
	projectId: null,
	lists: [],
	confirmedLists: [],
	isDragging: false,
	pendingMoves: [],
	moveError: "",

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
			};
		}),

	startDragging: () => set({ isDragging: true }),
	stopDragging: () => set({ isDragging: false }),
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
}));
