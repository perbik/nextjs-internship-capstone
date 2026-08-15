"use client";

import { create } from "zustand";

interface UIState {
	activeModalId: string | null;
	openModal: (modalId: string) => void;
	closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
	activeModalId: null,
	openModal: (activeModalId) => set({ activeModalId }),
	closeModal: () => set({ activeModalId: null }),
}));
