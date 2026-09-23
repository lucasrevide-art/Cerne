import { supabase } from "../supabase/client";
import { noteFromRow, type NoteRow } from "../supabase/mappers";
import type { Note } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

/**
 * Cada nota é seu próprio registro (id, corpo, datas) — não um campo de
 * texto único por área. list() busca todas as notas do usuário de uma vez
 * (mesmo padrão de tasks/tags); o filtro por área acontece no store/UI.
 */
export const noteRepository = {
  async list(): Promise<Note[]> {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as NoteRow[]).map(noteFromRow);
  },

  async create(areaId: string, body = ""): Promise<Note> {
    const row = { id: createId(), area_id: areaId, body };
    const { data, error } = await supabase.from("notes").insert(row).select().single();
    if (error) throw error;
    return noteFromRow(data as NoteRow);
  },

  async update(id: string, body: string): Promise<void> {
    const { error } = await supabase
      .from("notes")
      .update({ body, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;
  },
};
