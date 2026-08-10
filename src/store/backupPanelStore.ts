import { create } from "zustand";

interface BackupPanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useBackupPanelStore = create<BackupPanelState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
