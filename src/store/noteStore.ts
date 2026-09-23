import { create } from "zustand";
import { noteRepository } from "../lib/repository/noteRepository";
import type { Note } from "../types";

interface NoteState {
  notes: Note[];
  loaded: boolean;
  loadNotes: () => Promise<void>;
  addNote: (areaId: string, body?: string) => Promise<Note>;
  updateNote: (id: string, body: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loaded: false,

  loadNotes: async () => {
    const notes = await noteRepository.list();
    set({ notes, loaded: true });
  },

  addNote: async (areaId, body = "") => {
    const note = await noteRepository.create(areaId, body);
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateNote: async (id, body) => {
    await noteRepository.update(id, body);
    const updatedAt = new Date().toISOString();
    set((state) => ({
      notes: state.notes
        .map((n) => (n.id === id ? { ...n, body, updatedAt } : n))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    }));
  },

  removeNote: async (id) => {
    await noteRepository.remove(id);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },
}));
