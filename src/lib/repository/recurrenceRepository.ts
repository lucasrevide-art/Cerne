import { db } from "./db";
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
    return db.recurrences.toArray();
  },

  async setForTask(taskId: string, input: UpsertRecurrenceInput): Promise<Recurrence> {
    const existing = await db.recurrences.where("taskId").equals(taskId).first();
    const recurrence: Recurrence = {
      id: existing?.id ?? createId(),
      taskId,
      type: input.type,
      interval: input.interval,
      weekdays: input.weekdays,
      nextDate: input.nextDate,
    };
    await db.recurrences.put(recurrence);
    return recurrence;
  },

  async removeForTask(taskId: string): Promise<void> {
    await db.recurrences.where("taskId").equals(taskId).delete();
  },

  /** Move a regra de um template concluído para a nova ocorrência que nasce. */
  async moveToTask(fromTaskId: string, toTaskId: string, nextDate: string): Promise<void> {
    const existing = await db.recurrences.where("taskId").equals(fromTaskId).first();
    if (!existing) return;
    await db.transaction("rw", db.recurrences, async () => {
      await db.recurrences.delete(existing.id);
      await db.recurrences.add({ ...existing, id: createId(), taskId: toTaskId, nextDate });
    });
  },
};
