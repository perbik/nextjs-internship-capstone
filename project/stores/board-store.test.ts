import { beforeEach, describe, expect, it } from "vitest";
import { type BoardList, type BoardTask, useBoardStore } from "./board-store";

const task: BoardTask = {
	id: "task-1",
	listId: "list-1",
	title: "Test task",
	description: null,
	priority: "medium",
	dueDate: null,
	assigneeId: null,
	assignee: null,
};

function createLists(): BoardList[] {
	return [
		{
			id: "list-1",
			name: "To Do",
			position: 0,
			isCompleted: false,
			tasks: [task],
		},
		{
			id: "list-2",
			name: "Done",
			position: 1,
			isCompleted: true,
			tasks: [],
		},
	];
}

beforeEach(() => {
	useBoardStore.setState({
		projectId: null,
		lists: [],
		isDragging: false,
		pendingMoves: 0,
		moveError: "",
	});
});

describe("useBoardStore", () => {
	it("moves a task into an empty list optimistically", () => {
		const store = useBoardStore.getState();
		store.syncBoard("project-1", createLists());
		useBoardStore.getState().moveTask("task-1", "list-1", "list-2", 0);

		const lists = useBoardStore.getState().lists;
		expect(lists[0].tasks).toHaveLength(0);
		expect(lists[1].tasks).toEqual([{ ...task, listId: "list-2" }]);
	});

	it("does not replace board state while dragging", () => {
		const store = useBoardStore.getState();
		store.syncBoard("project-1", createLists());
		useBoardStore.getState().startDragging();
		useBoardStore.getState().syncBoard("project-1", []);

		expect(useBoardStore.getState().lists).toHaveLength(2);
	});

	it("tracks overlapping pending movements", () => {
		const store = useBoardStore.getState();
		store.startSavingMove();
		useBoardStore.getState().startSavingMove();
		useBoardStore.getState().finishSavingMove();

		expect(useBoardStore.getState().pendingMoves).toBe(1);
	});
});
