import { describe, expect, test } from "vitest";

import {
	TASK_PRIORITIES,
	taskCreateSchema,
	taskFilterSchema,
	taskSchema,
	taskUpdateSchema,
} from "@/lib/validations";

describe("taskSchema validation", () => {
	test("accepts a valid task title", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(true);
	});

	test("accepts a title that reaches the maximum length", () => {
		const result = taskSchema.safeParse({
			title: "a".repeat(200),
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(true);
	});

	test("rejects a title that exceeds the maximum length", () => {
		const result = taskSchema.safeParse({
			title: "a".repeat(201),
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(false);
	});

	test("accepts a description that reaches the maximum length", () => {
		const result = taskSchema.safeParse({
			title: "Test Project",
			description: "a".repeat(1000),
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(true);
	});

	test("rejects a description that exceeds the maximum length", () => {
		const result = taskSchema.safeParse({
			title: "Test Project",
			description: "a".repeat(1001),
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(false);
	});

	test.each(TASK_PRIORITIES)(
		"accepts a valid task priority: %s",
		(priority) => {
			const result = taskSchema.safeParse({
				title: "Test Task",
				priority,
			});

			expect(result.success).toBe(true);
		},
	);

	test.each(["invalid", "", undefined])(
		"rejects an invalid task priority: %s",
		(priority) => {
			const result = taskSchema.safeParse({
				title: "Test Task",
				priority,
			});

			expect(result.success).toBe(false);
		},
	);

	test("accepts valid assigneeId", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			assigneeId: "550e8400-e29b-41d4-a716-446655440000",
		});

		expect(result.success).toBe(true);
	});

	test("rejects invalid assigneeId", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			assigneeId: "invalid-id",
		});

		expect(result.success).toBe(false);
	});

	test("accepts valid labelIds", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			labelIds: [
				"550e8400-e29b-41d4-a716-446655440000",
				"550e8400-e29b-41d4-a716-446655440001",
			],
		});

		expect(result.success).toBe(true);
	});

	test("rejects invalid labelIds", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			labelIds: ["invalid-id"],
		});

		expect(result.success).toBe(false);
	});

	test("rejects more than 5 labelIds", () => {
		const result = taskSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			labelIds: [
				"550e8400-e29b-41d4-a716-446655440000",
				"550e8400-e29b-41d4-a716-446655440001",
				"550e8400-e29b-41d4-a716-446655440002",
				"550e8400-e29b-41d4-a716-446655440003",
				"550e8400-e29b-41d4-a716-446655440004",
				"550e8400-e29b-41d4-a716-446655440005",
			],
		});

		expect(result.success).toBe(false);
	});
});

describe("taskCreateSchema validation", () => {
	test("accepts valid task creation data", () => {
		const result = taskCreateSchema.safeParse({
			title: "Test Task",
			listId: "550e8400-e29b-41d4-a716-446655440000",
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(true);
	});

	test("rejects missing listId", () => {
		const result = taskCreateSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
		});

		expect(result.success).toBe(false);
	});

	test("rejects an invalid listId", () => {
		const result = taskCreateSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			listId: "invalid-id",
		});

		expect(result.success).toBe(false);
	});

	test.each([0, 1, 2, "3"])("accepts a valid position: %s", (position) => {
		const result = taskCreateSchema.safeParse({
			title: "Test Task",
			priority: TASK_PRIORITIES[0],
			listId: "550e8400-e29b-41d4-a716-446655440000",
			position,
		});

		expect(result.success).toBe(true);
	});

	test.each([-1, 1.5, "invalid"])(
		"rejects an invalid position: %s",
		(position) => {
			const result = taskCreateSchema.safeParse({
				title: "Test Task",
				priority: TASK_PRIORITIES[0],
				listId: "550e8400-e29b-41d4-a716-446655440000",
				position,
			});

			expect(result.success).toBe(false);
		},
	);
});

describe("taskUpdateSchema validation", () => {
	test("accepts valid partial task updates", () => {
		const result = taskUpdateSchema.safeParse({
			title: "Updated Task Title",
		});

		expect(result.success).toBe(true);
	});

	test("accepts valid partial task updates with multiple fields", () => {
		const result = taskUpdateSchema.safeParse({
			title: "Updated Task Title",
			description: "Updated description",
			priority: TASK_PRIORITIES[1],
		});

		expect(result.success).toBe(true);
	});

	test("accepts valid partial task updates with assigneeId", () => {
		const result = taskUpdateSchema.safeParse({
			assigneeId: "550e8400-e29b-41d4-a716-446655440000",
		});

		expect(result.success).toBe(true);
	});

	test("accepts valid partial task updates with labelIds", () => {
		const result = taskUpdateSchema.safeParse({
			labelIds: ["550e8400-e29b-41d4-a716-446655440000"],
		});

		expect(result.success).toBe(true);
	});

	test("rejects an empty update", () => {
		const result = taskUpdateSchema.safeParse({});

		expect(result.success).toBe(false);
	});
});

describe("taskFilterSchema validation", () => {
	test("accepts valid filter with search query", () => {
		const result = taskFilterSchema.safeParse({
			q: "a".repeat(200),
		});

		expect(result.success).toBe(true);
	});

	test("handles search text that exceeds the maximum length", () => {
		const result = taskFilterSchema.safeParse({
			q: "a".repeat(201),
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.q).toBeUndefined();
		}
	});

	test("handles an empty search string", () => {
		const result = taskFilterSchema.safeParse({
			q: "",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.q).toBeUndefined();
		}
	});

	test.each(TASK_PRIORITIES)("accepts valid task priority: %s", (priority) => {
		const result = taskFilterSchema.safeParse({
			priority,
		});

		expect(result.success).toBe(true);
	});

	test("handles an invalid task priority", () => {
		const result = taskFilterSchema.safeParse({
			priority: "invalid",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.priority).toBeUndefined();
		}
	});

	test("handles an empty task priority", () => {
		const result = taskFilterSchema.safeParse({
			priority: "",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.priority).toBeUndefined();
		}
	});

	test.each(["550e8400-e29b-41d4-a716-446655440000", "me", "unassigned"])(
		"accepts valid assignee filter: %s",
		(assignee) => {
			const result = taskFilterSchema.safeParse({
				assignee,
			});

			expect(result.success).toBe(true);

			if (result.success) {
				expect(result.data.assignee).toBe(assignee);
			}
		},
	);

	test("handles an invalid assignee filter", () => {
		const result = taskFilterSchema.safeParse({
			assignee: "invalid",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.assignee).toBeUndefined();
		}
	});

	test("handles an empty assignee filter", () => {
		const result = taskFilterSchema.safeParse({
			assignee: "",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.assignee).toBeUndefined();
		}
	});
});
