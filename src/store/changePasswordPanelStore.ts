import { create } from "zustand";

interface ChangePasswordPanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useChangePasswordPanelStore = create<ChangePasswordPanelState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
