import { supabase } from "../supabase/client";
import { tagFromRow, type TagRow } from "../supabase/mappers";
import type { Tag } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

export const tagRepository = {
  async list(): Promise<Tag[]> {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) throw error;
    return (data as TagRow[]).map(tagFromRow);
  },

  async create(name: string): Promise<Tag> {
    const row = { id: createId(), name, color: "" };
    const { data, error } = await supabase.from("tags").insert(row).select().single();
    if (error) throw error;
    return tagFromRow(data as TagRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw error;
  },
};
