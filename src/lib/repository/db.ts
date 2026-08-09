import Dexie, { type Table } from "dexie";
import type { Task, Subtask, Area, Project } from "../../types";

export class CerneDatabase extends Dexie {
  tasks!: Table<Task, string>;
  subtasks!: Table<Subtask, string>;
  areas!: Table<Area, string>;
  projects!: Table<Project, string>;

  constructor() {
    super("cerne");
    this.version(1).stores({
      tasks: "id, status, projectId, areaId, sortOrder",
      subtasks: "id, taskId, sortOrder",
    });
    this.version(2).stores({
      tasks: "id, status, projectId, areaId, sortOrder",
      subtasks: "id, taskId, sortOrder",
      areas: "id, sortOrder",
      projects: "id, areaId, sortOrder",
    });
  }
}

export const db = new CerneDatabase();
