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

interface BoardState {
	projectId: string | null;
	lists: BoardList[];
	isDragging: boolean;
	pendingMoves: number;
	moveError: string;
	syncBoard: (projectId: string, lists: BoardList[]) => void;
	startDragging: () => void;
	stopDragging: () => void;
	moveTask: (
		taskId: string,
		sourceListId: string,
		targetListId: string,
		targetPosition: number,
	) => void;
	startSavingMove: () => void;
	finishSavingMove: () => void;
	restoreBoard: (projectId: string, lists: BoardList[], error: string) => void;
	clearMoveError: () => void;
}

function moveTaskBetweenLists(
	currentLists: BoardList[],
	taskId: string,
	sourceListId: string,
	targetListId: string,
	targetPosition: number,
) {
	const sourceList = currentLists.find((list) => list.id === sourceListId);
	const task = sourceList?.tasks.find((item) => item.id === taskId);

	if (!task) {
		return currentLists;
	}

	return currentLists.map((list) => {
		const tasksWithoutMovedTask = list.tasks.filter(
			(item) => item.id !== taskId,
		);

		if (list.id !== targetListId) {
			return list.id === sourceListId
				? { ...list, tasks: tasksWithoutMovedTask }
				: list;
		}

		const nextTasks = [...tasksWithoutMovedTask];
		const nextPosition = Math.min(targetPosition, nextTasks.length);
		nextTasks.splice(nextPosition, 0, { ...task, listId: targetListId });

		return { ...list, tasks: nextTasks };
	});
}

export const useBoardStore = create<BoardState>()((set) => ({
	projectId: null,
	lists: [],
	isDragging: false,
	pendingMoves: 0,
	moveError: "",

	syncBoard: (projectId, lists) =>
		set((state) => {
			if (state.projectId === projectId && state.isDragging) {
				return state;
			}

			return {
				projectId,
				lists,
				isDragging: false,
				moveError: "",
			};
		}),

	startDragging: () => set({ isDragging: true }),
	stopDragging: () => set({ isDragging: false }),

	moveTask: (taskId, sourceListId, targetListId, targetPosition) =>
		set((state) => ({
			lists: moveTaskBetweenLists(
				state.lists,
				taskId,
				sourceListId,
				targetListId,
				targetPosition,
			),
		})),

	startSavingMove: () =>
		set((state) => ({
			pendingMoves: state.pendingMoves + 1,
		})),

	finishSavingMove: () =>
		set((state) => ({
			pendingMoves: Math.max(0, state.pendingMoves - 1),
		})),

	restoreBoard: (projectId, lists, error) =>
		set({
			projectId,
			lists,
			isDragging: false,
			moveError: error,
		}),

	clearMoveError: () => set({ moveError: "" }),
}));
