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
	queueMove: (move: BoardMove) => void;
	confirmMove: (moveId: string) => void;
	rejectMove: (moveId: string, error: string) => void;
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

	queueMove: (move) =>
		set((state) => ({
			lists: moveTaskBetweenLists(state.lists, move),
			pendingMoves: [...state.pendingMoves, move],
		})),

	confirmMove: (moveId) =>
		set((state) => {
			const confirmedMove = state.pendingMoves.find(
				(move) => move.id === moveId,
			);

			if (!confirmedMove) {
				return state;
			}

			const confirmedLists = moveTaskBetweenLists(
				state.confirmedLists,
				confirmedMove,
			);
			const pendingMoves = state.pendingMoves.filter(
				(move) => move.id !== moveId,
			);

			return {
				confirmedLists,
				pendingMoves,
				lists: replayMoves(confirmedLists, pendingMoves),
			};
		}),

	rejectMove: (moveId, error) =>
		set((state) => {
			const pendingMoves = state.pendingMoves.filter(
				(move) => move.id !== moveId,
			);

			return {
				pendingMoves,
				lists: replayMoves(state.confirmedLists, pendingMoves),
				moveError: error,
			};
		}),

	clearMoveError: () => set({ moveError: "" }),
}));
