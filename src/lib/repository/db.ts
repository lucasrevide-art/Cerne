import Dexie, { type Table } from "dexie";
import type { Task, Subtask } from "../../types";

export class CerneDatabase extends Dexie {
  tasks!: Table<Task, string>;
  subtasks!: Table<Subtask, string>;

  constructor() {
    super("cerne");
    this.version(1).stores({
      tasks: "id, status, projectId, areaId, sortOrder",
      subtasks: "id, taskId, sortOrder",
    });
  }
}

export const db = new CerneDatabase();
