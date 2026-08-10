import { supabase } from "../supabase/client";
import { areaFromRow, type AreaRow } from "../supabase/mappers";
import type { Area } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

export const areaRepository = {
  async list(): Promise<Area[]> {
    const { data, error } = await supabase.from("areas").select("*").order("sort_order");
    if (error) throw error;
    return (data as AreaRow[]).map(areaFromRow);
  },

  async create(name: string): Promise<Area> {
    const row = { id: createId(), name, color: "", icon: "", notes: "", sort_order: Date.now() };
    const { data, error } = await supabase.from("areas").insert(row).select().single();
    if (error) throw error;
    return areaFromRow(data as AreaRow);
  },

  async update(id: string, changes: Partial<Area>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (changes.name !== undefined) row.name = changes.name;
    if (changes.color !== undefined) row.color = changes.color;
    if (changes.icon !== undefined) row.icon = changes.icon;
    if (changes.notes !== undefined) row.notes = changes.notes;
    if (changes.sortOrder !== undefined) row.sort_order = changes.sortOrder;
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from("areas").update(row).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    // O schema cuida do resto via FK: projects.area_id é "on delete cascade"
    // (apaga os projetos da área junto), e tasks.area_id / tasks.project_id
    // são "on delete set null" (as tarefas ficam soltas, voltam pro Inbox).
    const { error } = await supabase.from("areas").delete().eq("id", id);
    if (error) throw error;
  },
};
