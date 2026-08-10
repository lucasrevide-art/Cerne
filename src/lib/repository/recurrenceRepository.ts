import { supabase } from "../supabase/client";
import { recurrenceFromRow, type RecurrenceRow } from "../supabase/mappers";
import type { Recurrence, RecurrenceType } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

interface UpsertRecurrenceInput {
  type: RecurrenceType;
  interval: number;
  weekdays: number[];
  nextDate: string;
}

export const recurrenceRepository = {
  async listAll(): Promise<Recurrence[]> {
    const { data, error } = await supabase.from("recurrences").select("*");
    if (error) throw error;
    return (data as RecurrenceRow[]).map(recurrenceFromRow);
  },

  async setForTask(taskId: string, input: UpsertRecurrenceInput): Promise<Recurrence> {
    const row = {
      id: createId(),
      task_id: taskId,
      type: input.type,
      interval_count: input.interval,
      weekdays: input.weekdays,
      next_date: input.nextDate,
    };
    // task_id é UNIQUE no schema — upsert por esse campo cobre tanto criar
    // a regra pela primeira vez quanto substituir a existente.
    const { data, error } = await supabase
      .from("recurrences")
      .upsert(row, { onConflict: "task_id" })
      .select()
      .single();
    if (error) throw error;
    return recurrenceFromRow(data as RecurrenceRow);
  },

  async removeForTask(taskId: string): Promise<void> {
    const { error } = await supabase.from("recurrences").delete().eq("task_id", taskId);
    if (error) throw error;
  },

  /** Move a regra de um template concluído para a nova ocorrência que nasce. */
  async moveToTask(fromTaskId: string, toTaskId: string, nextDate: string): Promise<void> {
    const { error } = await supabase
      .from("recurrences")
      .update({ task_id: toTaskId, next_date: nextDate })
      .eq("task_id", fromTaskId);
    if (error) throw error;
  },
};
