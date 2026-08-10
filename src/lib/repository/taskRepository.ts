import { supabase } from "../supabase/client";
import { taskFromRow, taskToRow, subtaskFromRow, type TaskRow, type SubtaskRow } from "../supabase/mappers";
import type { Task, Subtask, TaskStatus } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

interface CreateTaskInput extends Partial<Task> {
  title: string;
}

/**
 * Único ponto de acesso a dados de tarefas — a UI nunca fala com o
 * Supabase diretamente (seção 9 do documento de produto). O id é gerado
 * aqui mesmo (crypto.randomUUID()) pra devolver o objeto criado sem
 * precisar de uma segunda viagem ao banco.
 */
export const taskRepository = {
  async list(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("sort_order", { ascending: false });
    if (error) throw error;
    return (data as TaskRow[]).map(taskFromRow);
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const row = {
      id: createId(),
      title: input.title,
      notes: input.notes ?? "",
      when_type: input.when ?? null,
      when_date: input.whenDate ?? null,
      deadline: input.deadline ?? null,
      status: "open",
      priority: input.priority ?? 0,
      type: input.type ?? "default",
      amount: input.amount ?? null,
      category: input.category ?? null,
      project_id: input.projectId ?? null,
      area_id: input.areaId ?? null,
      tag_ids: input.tagIds ?? [],
      sort_order: Date.now(),
    };
    const { data, error } = await supabase.from("tasks").insert(row).select().single();
    if (error) throw error;
    return taskFromRow(data as TaskRow);
  },

  async update(id: string, changes: Partial<Task>): Promise<void> {
    const row = taskToRow(changes);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from("tasks").update(row).eq("id", id);
    if (error) throw error;
  },

  async complete(id: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async reopen(id: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "open", completed_at: null })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    // subtasks e recurrences têm "on delete cascade" no schema — apagar a
    // tarefa já leva o resto junto.
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async listAllSubtasks(): Promise<Subtask[]> {
    const { data, error } = await supabase.from("subtasks").select("*");
    if (error) throw error;
    return (data as SubtaskRow[]).map(subtaskFromRow);
  },

  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const row = { id: createId(), task_id: taskId, title, status: "open", sort_order: Date.now() };
    const { data, error } = await supabase.from("subtasks").insert(row).select().single();
    if (error) throw error;
    return subtaskFromRow(data as SubtaskRow);
  },

  async setSubtaskStatus(id: string, status: TaskStatus): Promise<void> {
    const { error } = await supabase.from("subtasks").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async removeSubtask(id: string): Promise<void> {
    const { error } = await supabase.from("subtasks").delete().eq("id", id);
    if (error) throw error;
  },
};
