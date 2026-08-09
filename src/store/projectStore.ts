import { create } from "zustand";
import { projectRepository } from "../lib/repository/projectRepository";
import type { Project } from "../types";

interface ProjectState {
  projects: Project[];
  loaded: boolean;
  loadProjects: () => Promise<void>;
  addProject: (name: string, areaId?: string | null) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loaded: false,

  loadProjects: async () => {
    const projects = await projectRepository.list();
    set({ projects, loaded: true });
  },

  addProject: async (name, areaId) => {
    const project = await projectRepository.create({ name, areaId });
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  removeProject: async (id) => {
    await projectRepository.remove(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
