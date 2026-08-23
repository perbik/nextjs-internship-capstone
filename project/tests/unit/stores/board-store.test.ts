import { beforeEach, describe, expect, test } from "vitest";
import {
	type BoardList,
	type BoardMove,
	type BoardTask,
	moveTaskBetweenLists,
	useBoardStore,
} from "@/stores/board-store";

const TODO_LIST_ID = "2e93df62-bbf7-461a-9057-04ff89ba643c";
const DONE_LIST_ID = "7a69ef7d-745d-45a0-94a8-357475cb95d3";
const TASK_1_ID = "27d05a24-63c2-463a-abba-20238478109a";
const TASK_2_ID = "90ddc837-bfd9-4fc6-a9a1-8a883950346f";
const TASK_3_ID = "630ded5a-1b70-4474-a5cd-2f2ecad229a7";
const TASK_4_ID = "86ed44cb-1f13-4970-9420-bad3f5bfbe92";
const MOVE_1_ID = "44718765-c13a-410f-b774-d51d703c19c8";
const MISSING_TASK_ID = "2f50c4de-1559-4290-b00b-f6f270803b68";
const MISSING_LIST_ID = "71451962-bf92-4db8-934b-e2536309607a";

function createTask(id: string, listId: string): BoardTask {
	return {
		id,
		listId,
		title: `Task ${id}`,
		description: null,
		priority: "medium",
		dueDate: null,
		assigneeId: null,
		assignee: null,
		labels: [],
	};
}

function createBoard(): BoardList[] {
	return [
		{
			id: TODO_LIST_ID,
			name: "To Do",
			position: 0,
			isCompleted: false,
			tasks: [
				createTask(TASK_1_ID, TODO_LIST_ID),
				createTask(TASK_2_ID, TODO_LIST_ID),
				createTask(TASK_3_ID, TODO_LIST_ID),
			],
		},
		{
			id: DONE_LIST_ID,
			name: "Done",
			position: 1,
			isCompleted: true,
			tasks: [createTask(TASK_4_ID, DONE_LIST_ID)],
		},
	];
}

function taskIds(lists: BoardList[]) {
	return lists.flatMap((list) => list.tasks.map((task) => task.id));
}

function listTaskIds(lists: BoardList[], listId: string) {
	return lists.find((list) => list.id === listId)?.tasks.map((task) => task.id);
}

function createMove(overrides: Partial<BoardMove> = {}): BoardMove {
	return {
		id: MOVE_1_ID,
		taskId: TASK_1_ID,
		sourceListId: TODO_LIST_ID,
		targetListId: DONE_LIST_ID,
		targetPosition: 1,
		...overrides,
	};
}

describe("moveTaskBetweenLists", () => {
	test("moves a task within the same list and preserves order", () => {
		const result = moveTaskBetweenLists(createBoard(), {
			taskId: TASK_1_ID,
			sourceListId: TODO_LIST_ID,
			targetListId: TODO_LIST_ID,
			targetPosition: 2,
		});

		expect(listTaskIds(result, TODO_LIST_ID)).toEqual([
			TASK_2_ID,
			TASK_3_ID,
			TASK_1_ID,
		]);
	});

	test("moves a task from one list to another", () => {
		const result = moveTaskBetweenLists(createBoard(), createMove());

		expect(listTaskIds(result, TODO_LIST_ID)).toEqual([TASK_2_ID, TASK_3_ID]);
		expect(listTaskIds(result, DONE_LIST_ID)).toEqual([TASK_4_ID, TASK_1_ID]);
		expect(result[1].tasks[1].listId).toBe(DONE_LIST_ID);
	});

	test("source loses one task and destination receives one task", () => {
		const board = createBoard();
		const result = moveTaskBetweenLists(board, createMove());

		expect(result[0].tasks).toHaveLength(board[0].tasks.length - 1);
		expect(result[1].tasks).toHaveLength(board[1].tasks.length + 1);
	});

	test("movement does not duplicate or lose tasks", () => {
		const result = moveTaskBetweenLists(createBoard(), createMove());
		const ids = taskIds(result);

		expect(ids).toHaveLength(4);
		expect(new Set(ids)).toEqual(
			new Set([TASK_1_ID, TASK_2_ID, TASK_3_ID, TASK_4_ID]),
		);
	});

	test("invalid task ID does not corrupt the board", () => {
		const board = createBoard();
		const result = moveTaskBetweenLists(
			board,
			createMove({ taskId: MISSING_TASK_ID }),
		);

		expect(result).toBe(board);
		expect(taskIds(result)).toEqual(taskIds(board));
	});

	test("invalid destination does not corrupt the board", () => {
		const board = createBoard();
		const result = moveTaskBetweenLists(
			board,
			createMove({ targetListId: MISSING_LIST_ID }),
		);

		expect(result).toBe(board);
		expect(taskIds(result)).toEqual(taskIds(board));
	});

	test("moving to the same effective position behaves safely", () => {
		const board = createBoard();
		const result = moveTaskBetweenLists(board, {
			taskId: TASK_2_ID,
			sourceListId: TODO_LIST_ID,
			targetListId: TODO_LIST_ID,
			targetPosition: 1,
		});

		expect(listTaskIds(result, TODO_LIST_ID)).toEqual([
			TASK_1_ID,
			TASK_2_ID,
			TASK_3_ID,
		]);
		expect(taskIds(result)).toHaveLength(4);
	});
});

describe("useBoardStore bulk selection", () => {
	beforeEach(() => {
		useBoardStore.setState({ bulkMode: false, selectedTaskIds: [] });
	});

	test("selects and deselects a task", () => {
		useBoardStore.getState().toggleTaskSelection(TASK_1_ID);
		expect(useBoardStore.getState().selectedTaskIds).toEqual([TASK_1_ID]);

		useBoardStore.getState().toggleTaskSelection(TASK_1_ID);
		expect(useBoardStore.getState().selectedTaskIds).toEqual([]);
	});

	test("selecting the same task twice does not duplicate its ID", () => {
		useBoardStore.getState().selectTasks([TASK_1_ID, TASK_1_ID]);

		expect(useBoardStore.getState().selectedTaskIds).toEqual([TASK_1_ID]);
	});

	test("clears selected tasks", () => {
		useBoardStore.getState().selectTasks([TASK_1_ID, TASK_2_ID]);
		useBoardStore.getState().clearTaskSelection();

		expect(useBoardStore.getState().selectedTaskIds).toEqual([]);
	});

	test("select-all stores each task once", () => {
		const allTaskIds = taskIds(createBoard());
		useBoardStore.getState().selectTasks(allTaskIds);

		expect(useBoardStore.getState().selectedTaskIds).toEqual(allTaskIds);
	});
});
