import { describe, expect, test } from "vitest";
import {
	findTaskLocation,
	getDropLocation,
} from "@/components/kanban/utils/board-utils";
import type { BoardList, BoardTask } from "@/stores/board-store";

const TODO_LIST_ID = "2e93df62-bbf7-461a-9057-04ff89ba643c";
const DONE_LIST_ID = "7a69ef7d-745d-45a0-94a8-357475cb95d3";
const TASK_ID = "27d05a24-63c2-463a-abba-20238478109a";
const SECOND_TASK_ID = "90ddc837-bfd9-4fc6-a9a1-8a883950346f";
const MISSING_TASK_ID = "2f50c4de-1559-4290-b00b-f6f270803b68";

const task: BoardTask = {
	id: TASK_ID,
	listId: TODO_LIST_ID,
	title: "First task",
	description: null,
	priority: "medium",
	dueDate: null,
	assigneeId: null,
	assignee: null,
	labels: [],
};

const secondTask: BoardTask = {
	...task,
	id: SECOND_TASK_ID,
	title: "Second task",
};

const board: BoardList[] = [
	{
		id: TODO_LIST_ID,
		name: "To Do",
		position: 0,
		isCompleted: false,
		tasks: [task, secondTask],
	},
	{
		id: DONE_LIST_ID,
		name: "Done",
		position: 1,
		isCompleted: true,
		tasks: [],
	},
];

describe("findTaskLocation", () => {
	test("finds a task in the correct list", () => {
		expect(findTaskLocation(board, TASK_ID)).toEqual({
			listId: TODO_LIST_ID,
			position: 0,
			task,
		});
	});

	test("returns the correct task index", () => {
		expect(findTaskLocation(board, SECOND_TASK_ID)?.position).toBe(1);
	});

	test("returns null for a nonexistent task", () => {
		expect(findTaskLocation(board, MISSING_TASK_ID)).toBeNull();
	});

	test("handles empty lists", () => {
		expect(findTaskLocation([], TASK_ID)).toBeNull();
		expect(findTaskLocation([{ ...board[0], tasks: [] }], TASK_ID)).toBeNull();
	});
});

describe("getDropLocation", () => {
	test("returns a valid task destination from dnd metadata", () => {
		expect(
			getDropLocation({ kind: "task", listId: TODO_LIST_ID, index: 1 }),
		).toEqual({ listId: TODO_LIST_ID, position: 1 });
	});

	test("returns a valid column destination", () => {
		expect(
			getDropLocation({ kind: "column", listId: DONE_LIST_ID, index: 0 }),
		).toEqual({ listId: DONE_LIST_ID, position: 0 });
	});

	test.each([
		undefined,
		{},
		{ kind: "unknown", listId: TODO_LIST_ID, index: 0 },
		{ kind: "task", index: 0 },
		{ kind: "task", listId: TODO_LIST_ID, index: "0" },
	])("rejects invalid drop metadata: %j", (metadata) => {
		expect(getDropLocation(metadata)).toBeNull();
	});

	test("rejects a negative index", () => {
		expect(
			getDropLocation({ kind: "task", listId: TODO_LIST_ID, index: -1 }),
		).toBeNull();
	});

	test("rejects a decimal index", () => {
		expect(
			getDropLocation({ kind: "task", listId: TODO_LIST_ID, index: 1.5 }),
		).toBeNull();
	});
});
