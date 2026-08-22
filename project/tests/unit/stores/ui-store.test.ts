import { beforeEach, describe, expect, test } from "vitest";
import { useUIStore } from "@/stores/ui-store";

describe("useUIStore", () => {
	beforeEach(() => {
		useUIStore.setState({ activeModalId: null });
	});

	test("starts with no active modal", () => {
		expect(useUIStore.getState().activeModalId).toBeNull();
	});

	test("openModal() stores the requested modal ID", () => {
		const modalId = "edit-task:287938d4-6009-4f47-b4b8-4439353dede6";

		useUIStore.getState().openModal(modalId);

		expect(useUIStore.getState().activeModalId).toBe(modalId);
	});

	test("opening another modal replaces the previous modal", () => {
		useUIStore.getState().openModal("create-task:project-picker");
		useUIStore
			.getState()
			.openModal("edit-task:287938d4-6009-4f47-b4b8-4439353dede6");

		expect(useUIStore.getState().activeModalId).toBe(
			"edit-task:287938d4-6009-4f47-b4b8-4439353dede6",
		);
	});

	test("closeModal() clears the active modal", () => {
		useUIStore.getState().openModal("create-task:project-picker");
		useUIStore.getState().closeModal();

		expect(useUIStore.getState().activeModalId).toBeNull();
	});

	test("store resets between tests", () => {
		expect(useUIStore.getState().activeModalId).toBeNull();
	});
});
