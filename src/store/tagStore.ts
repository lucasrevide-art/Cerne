import { create } from "zustand";
import { tagRepository } from "../lib/repository/tagRepository";
import { useTaskStore } from "./taskStore";
import type { Tag } from "../types";

interface TagState {
  tags: Tag[];
  loaded: boolean;
  loadTags: () => Promise<void>;
  addTag: (name: string) => Promise<Tag>;
  removeTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  loaded: false,

  loadTags: async () => {
    const tags = await tagRepository.list();
    set({ tags, loaded: true });
  },

  addTag: async (name) => {
    const trimmed = name.trim();
    const tag = await tagRepository.create(trimmed);
    set((state) => ({ tags: [...state.tags, tag].sort((a, b) => a.name.localeCompare(b.name)) }));
    return tag;
  },

  removeTag: async (id) => {
    await tagRepository.remove(id);
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    // Sem FK entre tagIds e tags — tira a referência solta de cada tarefa que usava essa tag.
    const { tasks, updateTask } = useTaskStore.getState();
    for (const task of tasks) {
      if (task.tagIds.includes(id)) {
        await updateTask(task.id, { tagIds: task.tagIds.filter((t) => t !== id) });
      }
    }
  },
}));
