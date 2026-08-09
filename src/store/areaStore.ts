import { create } from "zustand";
import { areaRepository } from "../lib/repository/areaRepository";
import type { Area } from "../types";

interface AreaState {
  areas: Area[];
  loaded: boolean;
  loadAreas: () => Promise<void>;
  addArea: (name: string) => Promise<Area>;
  updateArea: (id: string, changes: Partial<Area>) => Promise<void>;
  removeArea: (id: string) => Promise<void>;
}

export const useAreaStore = create<AreaState>((set) => ({
  areas: [],
  loaded: false,

  loadAreas: async () => {
    const areas = await areaRepository.list();
    set({ areas, loaded: true });
  },

  addArea: async (name) => {
    const area = await areaRepository.create(name);
    set((state) => ({ areas: [...state.areas, area] }));
    return area;
  },

  updateArea: async (id, changes) => {
    await areaRepository.update(id, changes);
    set((state) => ({
      areas: state.areas.map((a) => (a.id === id ? { ...a, ...changes } : a)),
    }));
  },

  removeArea: async (id) => {
    await areaRepository.remove(id);
    set((state) => ({ areas: state.areas.filter((a) => a.id !== id) }));
  },
}));
