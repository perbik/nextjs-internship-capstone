"use client";

import { create } from "zustand";

// Manages task dialogs opened from different parts of the board
interface UIState {
	// Tracks which create or edit task dialog is currently active
	activeModalId: string | null;
	openModal: (modalId: string) => void;
	closeModal: () => void;
}

// Shared UI-only state that does not persist to the database
export const useUIStore = create<UIState>()((set) => ({
	activeModalId: null,
	openModal: (activeModalId) => set({ activeModalId }),
	closeModal: () => set({ activeModalId: null }),
}));
