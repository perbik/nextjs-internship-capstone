import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
	futureOptionalDate,
	optionalDate,
	optionalPosition,
	optionalText,
	optionalUuid,
	requiredText,
} from "@/lib/validations";

describe("shared validation", () => {
	// Required text validation
	describe("required text", () => {
		const schema = requiredText("Name", 10);

		test("accepts and trims text", () => {
			expect(schema.parse("  Project  ")).toBe("Project");
		});

		test.each(["", "   ", undefined, 123])(
			"rejects an invalid required value: %s",
			(value) => {
				expect(schema.safeParse(value).success).toBe(false);
			},
		);

		test("rejects text over the maximum length", () => {
			expect(schema.safeParse("a".repeat(11)).success).toBe(false);
		});
	});

	// Optional text validation
	describe("optional text", () => {
		const schema = optionalText("Description", 10);

		test("accepts and trims text", () => {
			expect(schema.parse("  Details  ")).toBe("Details");
		});

		test.each([undefined, "", "   "])(
			"normalizes an empty optional value to undefined: %s",
			(value) => {
				expect(schema.parse(value)).toBeUndefined();
			},
		);

		test("rejects non-string text", () => {
			expect(schema.safeParse({}).success).toBe(false);
		});

		test("rejects text over the maximum length", () => {
			expect(schema.safeParse("a".repeat(11)).success).toBe(false);
		});
	});

	// UUID validation
	describe("optional UUID", () => {
		const schema = optionalUuid("Assignee");
		const validUuid = "550e8400-e29b-41d4-a716-446655440000";

		test("accepts a valid UUID", () => {
			expect(schema.parse(validUuid)).toBe(validUuid);
		});

		test.each([undefined, "", null])(
			"normalizes an empty optional value to undefined: %s",
			(value) => {
				expect(schema.parse(value)).toBeUndefined();
			},
		);

		test("rejects an invalid UUID", () => {
			expect(schema.safeParse("invalid-id").success).toBe(false);
		});
	});

	// Date validation
	describe("optional date", () => {
		const schema = optionalDate("Due date");

		test("coerces a valid date string to a Date", () => {
			const result = schema.parse("2026-08-17");

			expect(result).toBeInstanceOf(Date);
			expect(result?.toISOString()).toBe("2026-08-17T00:00:00.000Z");
		});

		test.each([undefined, "", null])(
			"normalizes an empty optional value to undefined: %s",
			(value) => {
				expect(schema.parse(value)).toBeUndefined();
			},
		);

		test("rejects an invalid date", () => {
			expect(schema.safeParse("not-a-date").success).toBe(false);
		});
	});

	describe("future optional date", () => {
		const schema = futureOptionalDate("Due date");

		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-08-17T12:00:00+08:00"));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		test("accepts today's date", () => {
			expect(schema.safeParse("2026-08-17").success).toBe(true);
		});

		test("accepts a future date", () => {
			expect(schema.safeParse("2026-08-18").success).toBe(true);
		});

		test("rejects a past date", () => {
			expect(schema.safeParse("2026-08-16").success).toBe(false);
		});

		test("accepts an omitted date", () => {
			expect(schema.parse(undefined)).toBeUndefined();
		});
	});

	// Task and list positions
	describe("optional position", () => {
		test.each([0, 3, "3"])("accepts a valid position: %s", (value) => {
			expect(optionalPosition.safeParse(value).success).toBe(true);
		});

		test.each([-1, 1.5, "abc"])("rejects an invalid position: %s", (value) => {
			expect(optionalPosition.safeParse(value).success).toBe(false);
		});

		test.each([undefined, "", null])(
			"normalizes an empty optional value to undefined: %s",
			(value) => {
				expect(optionalPosition.parse(value)).toBeUndefined();
			},
		);
	});
});
