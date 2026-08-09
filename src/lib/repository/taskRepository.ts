import { db } from "./db";
import type { Task, Subtask, TaskStatus } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

interface CreateTaskInput {
  title: string;
}

/**
 * Único ponto de acesso a dados de tarefas — a UI nunca fala com o
 * IndexedDB diretamente (seção 9 do documento de produto). Trocar por uma
 * API remota no futuro é reescrever este arquivo, não a aplicação inteira.
 */
export const taskRepository = {
  async list(): Promise<Task[]> {
    return db.tasks.orderBy("sortOrder").reverse().toArray();
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId(),
      title: input.title,
      notes: "",
      when: null,
      whenDate: null,
      deadline: null,
      status: "open",
      priority: 0,
      type: "default",
      projectId: null,
      areaId: null,
      tagIds: [],
      createdAt: now,
      completedAt: null,
      sortOrder: Date.now(),
    };
    await db.tasks.add(task);
    return task;
  },

  async update(id: string, changes: Partial<Task>): Promise<void> {
    await db.tasks.update(id, changes);
  },

  async complete(id: string): Promise<void> {
    await db.tasks.update(id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  },

  async reopen(id: string): Promise<void> {
    await db.tasks.update(id, { status: "open", completedAt: null });
  },

  async remove(id: string): Promise<void> {
    await db.transaction("rw", db.tasks, db.subtasks, async () => {
      await db.subtasks.where("taskId").equals(id).delete();
      await db.tasks.delete(id);
    });
  },

  async listAllSubtasks(): Promise<Subtask[]> {
    return db.subtasks.toArray();
  },

  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const subtask: Subtask = {
      id: createId(),
      taskId,
      title,
      status: "open",
      sortOrder: Date.now(),
    };
    await db.subtasks.add(subtask);
    return subtask;
  },

  async setSubtaskStatus(id: string, status: TaskStatus): Promise<void> {
    await db.subtasks.update(id, { status });
  },

  async removeSubtask(id: string): Promise<void> {
    await db.subtasks.delete(id);
  },
};
