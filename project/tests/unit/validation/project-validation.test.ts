import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
	PROJECT_STATUSES,
	projectCreateSchema,
	projectFilterSchema,
	projectSchema,
	projectUpdateSchema,
} from "@/lib/validations";

describe("projectSchema validation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-17T12:00:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("accepts a valid project name", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
		});

		expect(result.success).toBe(true);
	});

	test("accepts complete valid project data", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
			description: "This is a test project.",
			dueDate: "2027-12-31",
		});

		expect(result.success).toBe(true);
	});

	test("accepts a valid project due date", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
			dueDate: "2026-09-18",
		});

		expect(result.success).toBe(true);
	});

	test("rejects a past project due date", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
			dueDate: "2026-08-16",
		});

		expect(result.success).toBe(false);
	});

	test("accepts a project name that reaches the maximum length", () => {
		const result = projectSchema.safeParse({
			name: "a".repeat(100),
		});

		expect(result.success).toBe(true);
	});

	test("rejects a project name that exceeds the maximum length", () => {
		const result = projectSchema.safeParse({
			name: "a".repeat(101),
		});

		expect(result.success).toBe(false);
	});

	test("accepts a project description that reaches the maximum length", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
			description: "a".repeat(500),
		});

		expect(result.success).toBe(true);
	});

	test("rejects a project description that exceeds the maximum length", () => {
		const result = projectSchema.safeParse({
			name: "Test Project",
			description: "a".repeat(501),
		});

		expect(result.success).toBe(false);
	});
});

describe("projectCreateSchema validation", () => {
	test("accepts valid project creation data", () => {
		const result = projectCreateSchema.safeParse({
			name: "Test Project",
			teamId: "550e8400-e29b-41d4-a716-446655440000",
		});

		expect(result.success).toBe(true);
	});

	test("rejects missing required fields in project creation data", () => {
		const result = projectCreateSchema.safeParse({
			description: "This is a test project.",
		});

		expect(result.success).toBe(false);
	});

	test("rejects missing teamId in project creation data", () => {
		const result = projectCreateSchema.safeParse({
			name: "Test Project",
		});

		expect(result.success).toBe(false);
	});

	test("rejects a malformed teamId in project creation data", () => {
		const result = projectCreateSchema.safeParse({
			name: "Test Project",
			teamId: "invalid-id",
		});

		expect(result.success).toBe(false);
	});
});

describe("projectUpdateSchema validation", () => {
	test("accepts valid partial project updates", () => {
		const result = projectUpdateSchema.safeParse({
			name: "Updated Project Name",
		});

		expect(result.success).toBe(true);
	});

	test("accepts valid partial project updates with description", () => {
		const result = projectUpdateSchema.safeParse({
			description: "Updated project description.",
		});

		expect(result.success).toBe(true);
	});

	test.each(PROJECT_STATUSES)(
		"accepts valid partial project update with status: %s",
		(status) => {
			const result = projectUpdateSchema.safeParse({
				status,
			});

			expect(result.success).toBe(true);
		},
	);

	test("accepts valid partial project updates with due date", () => {
		const result = projectUpdateSchema.safeParse({
			dueDate: "2026-09-18",
		});

		expect(result.success).toBe(true);
	});

	test("rejects an empty update", () => {
		const result = projectUpdateSchema.safeParse({});

		expect(result.success).toBe(false);
	});
});

describe("projectFilterSchema validation", () => {
	test("accepts valid search text length", () => {
		const result = projectFilterSchema.safeParse({
			q: "a".repeat(100),
		});

		expect(result.success).toBe(true);
	});

	test("handles search text that exceeds the maximum length", () => {
		const result = projectFilterSchema.safeParse({
			q: "a".repeat(101),
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.q).toBeUndefined();
		}
	});

	test("handles an empty search string", () => {
		const result = projectFilterSchema.safeParse({
			q: "",
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.q).toBeUndefined();
		}
	});

	test.each(PROJECT_STATUSES)("accepts valid project status: %s", (status) => {
		const result = projectFilterSchema.safeParse({
			status,
		});

		expect(result.success).toBe(true);
	});

	test("accepts a valid page number", () => {
		const result = projectFilterSchema.parse({
			page: 2,
		});

		expect(result.page).toBe(2);
	});

	test.each([0, -1, "invalid"])(
		"defaults an invalid page value to 1: %s",
		(page) => {
			const result = projectFilterSchema.parse({
				page,
			});

			expect(result.page).toBe(1);
		},
	);
});
