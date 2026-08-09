import { create } from "zustand";

export type FixedView =
  | "inbox"
  | "today"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook";

interface NavigationState {
  activeView: FixedView;
  setActiveView: (view: FixedView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: "inbox",
  setActiveView: (view) => set({ activeView: view }),
}));
