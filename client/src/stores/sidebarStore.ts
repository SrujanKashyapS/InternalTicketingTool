import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isCopilotOpen: boolean;
  toggle: () => void;
  toggleCopilot: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCopilotOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleCopilot: () => set((s) => ({ isCopilotOpen: !s.isCopilotOpen })),
  close: () => set({ isOpen: false }),
}));
