import { create } from "zustand";

export type FixedView =
  | "inbox"
  | "focus"
  | "upcoming"
  | "logbook";

export type Route =
  | { type: "fixed"; view: FixedView }
  | { type: "area"; areaId: string }
  | { type: "project"; projectId: string };

interface NavigationState {
  route: Route;
  /** Setada pela busca — sinaliza qual tarefa expandir/rolar até a view assim que ela renderizar. */
  highlightTaskId: string | null;
  setFixedView: (view: FixedView) => void;
  setArea: (areaId: string) => void;
  setProject: (projectId: string) => void;
  setRoute: (route: Route) => void;
  highlightTask: (taskId: string) => void;
  clearHighlightTask: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  route: { type: "fixed", view: "inbox" },
  highlightTaskId: null,
  setFixedView: (view) => set({ route: { type: "fixed", view } }),
  setArea: (areaId) => set({ route: { type: "area", areaId } }),
  setProject: (projectId) => set({ route: { type: "project", projectId } }),
  setRoute: (route) => set({ route }),
  highlightTask: (taskId) => set({ highlightTaskId: taskId }),
  clearHighlightTask: () => set({ highlightTaskId: null }),
}));
