import { beforeEach, describe, expect, it } from "vitest";
import { useUIStore } from "./ui-store";

beforeEach(() => {
	useUIStore.setState({ activeModalId: null });
});

describe("useUIStore", () => {
	it("opens one modal at a time and closes it", () => {
		const store = useUIStore.getState();
		store.openModal("create-task:list-1");
		expect(useUIStore.getState().activeModalId).toBe("create-task:list-1");

		useUIStore.getState().openModal("edit-task:task-1");
		expect(useUIStore.getState().activeModalId).toBe("edit-task:task-1");

		useUIStore.getState().closeModal();
		expect(useUIStore.getState().activeModalId).toBeNull();
	});
});
