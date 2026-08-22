import { describe, expect, test } from "vitest";

import {
	boardLayoutSchema,
	bulkTaskOperationSchema,
	TASK_PRIORITIES,
} from "@/lib/validations";

describe("boardLayoutSchema validation", () => {
	test("accepts a valid board layout", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			lists: [
				{
					id: "550e8400-e29b-41d4-a716-446655440001",
					taskIds: ["550e8400-e29b-41d4-a716-446655440002"],
				},
			],
		});

		expect(result.success).toBe(true);
	});

	test("rejects a board with invalid projectId", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "invalid-id",
			lists: [
				{
					id: "550e8400-e29b-41d4-a716-446655440001",
					taskIds: ["550e8400-e29b-41d4-a716-446655440002"],
				},
			],
		});

		expect(result.success).toBe(false);
	});

	test("rejects a board with no lists", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			lists: [],
		});

		expect(result.success).toBe(false);
	});

	test("rejects a board with invalid listId", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			lists: [
				{
					id: "invalid-id",
					taskIds: ["550e8400-e29b-41d4-a716-446655440002"],
				},
			],
		});

		expect(result.success).toBe(false);
	});

	test("accepts a board with no taskIds", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			lists: [
				{
					id: "550e8400-e29b-41d4-a716-446655440001",
					taskIds: [],
				},
			],
		});

		expect(result.success).toBe(true);
	});

	test("rejects a board with an invalid taskId", () => {
		const result = boardLayoutSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			lists: [
				{
					id: "550e8400-e29b-41d4-a716-446655440001",
					taskIds: ["invalid-id"],
				},
			],
		});

		expect(result.success).toBe(false);
	});
});

describe("bulkTaskOperationSchema validation", () => {
	test("accepts a valid move operation", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "move",
			value: "550e8400-e29b-41d4-a716-446655440002",
		});

		expect(result.success).toBe(true);
	});

	test.each(["550e8400-e29b-41d4-a716-446655440002", "unassigned"])(
		"accepts a valid assign value: %s",
		(value) => {
			const result = bulkTaskOperationSchema.safeParse({
				projectId: "550e8400-e29b-41d4-a716-446655440000",
				taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
				operation: "assign",
				value,
			});

			expect(result.success).toBe(true);
		},
	);

	test.each(TASK_PRIORITIES)("accepts a valid priority value: %s", (value) => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "priority",
			value,
		});

		expect(result.success).toBe(true);
	});

	test.each(["add_label", "remove_label"] as const)(
		"accepts a valid %s operation",
		(operation) => {
			const result = bulkTaskOperationSchema.safeParse({
				projectId: "550e8400-e29b-41d4-a716-446655440000",
				taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
				operation,
				value: "550e8400-e29b-41d4-a716-446655440002",
			});

			expect(result.success).toBe(true);
		},
	);

	test("rejects an invalid projectId", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "invalid-id",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "move",
			value: "550e8400-e29b-41d4-a716-446655440002",
		});

		expect(result.success).toBe(false);
	});

	test("rejects an empty taskIds array", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: [],
			operation: "move",
			value: "550e8400-e29b-41d4-a716-446655440002",
		});

		expect(result.success).toBe(false);
	});

	test("rejects more than 100 taskIds", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: Array(101).fill("550e8400-e29b-41d4-a716-446655440001"),
			operation: "move",
			value: "550e8400-e29b-41d4-a716-446655440002",
		});

		expect(result.success).toBe(false);
	});

	test("rejects an invalid move value", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "move",
			value: "invalid-id",
		});

		expect(result.success).toBe(false);
	});

	test("rejects an invalid assign value", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "assign",
			value: "invalid",
		});

		expect(result.success).toBe(false);
	});

	test("rejects an invalid priority value", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "priority",
			value: "invalid",
		});

		expect(result.success).toBe(false);
	});

	test.each(["add_label", "remove_label"] as const)(
		"rejects an invalid value for %s",
		(operation) => {
			const result = bulkTaskOperationSchema.safeParse({
				projectId: "550e8400-e29b-41d4-a716-446655440000",
				taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
				operation,
				value: "invalid-id",
			});

			expect(result.success).toBe(false);
		},
	);

	test("rejects an invalid operation", () => {
		const result = bulkTaskOperationSchema.safeParse({
			projectId: "550e8400-e29b-41d4-a716-446655440000",
			taskIds: ["550e8400-e29b-41d4-a716-446655440001"],
			operation: "invalid",
			value: "550e8400-e29b-41d4-a716-446655440002",
		});

		expect(result.success).toBe(false);
	});
});
