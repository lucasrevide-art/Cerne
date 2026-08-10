import { supabase } from "../supabase/client";
import { projectFromRow, type ProjectRow } from "../supabase/mappers";
import type { Project } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

interface CreateProjectInput {
  name: string;
  areaId?: string | null;
}

export const projectRepository = {
  async list(): Promise<Project[]> {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order");
    if (error) throw error;
    return (data as ProjectRow[]).map(projectFromRow);
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const row = {
      id: createId(),
      name: input.name,
      notes: "",
      status: "active",
      area_id: input.areaId ?? null,
      deadline: null,
      sort_order: Date.now(),
    };
    const { data, error } = await supabase.from("projects").insert(row).select().single();
    if (error) throw error;
    return projectFromRow(data as ProjectRow);
  },

  async update(id: string, changes: Partial<Project>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (changes.name !== undefined) row.name = changes.name;
    if (changes.notes !== undefined) row.notes = changes.notes;
    if (changes.status !== undefined) row.status = changes.status;
    if (changes.areaId !== undefined) row.area_id = changes.areaId;
    if (changes.deadline !== undefined) row.deadline = changes.deadline;
    if (changes.sortOrder !== undefined) row.sort_order = changes.sortOrder;
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    // tasks.project_id é "on delete set null" no schema — apagar o projeto
    // já solta as tarefas dele de volta pro Inbox.
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },
};
