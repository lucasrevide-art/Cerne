import { create } from "zustand";

export type FixedView =
  | "inbox"
  | "today"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook";

export type Route =
  | { type: "fixed"; view: FixedView }
  | { type: "area"; areaId: string }
  | { type: "project"; projectId: string };

interface NavigationState {
  route: Route;
  setFixedView: (view: FixedView) => void;
  setArea: (areaId: string) => void;
  setProject: (projectId: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  route: { type: "fixed", view: "inbox" },
  setFixedView: (view) => set({ route: { type: "fixed", view } }),
  setArea: (areaId) => set({ route: { type: "area", areaId } }),
  setProject: (projectId) => set({ route: { type: "project", projectId } }),
}));
