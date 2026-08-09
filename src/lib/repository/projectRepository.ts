import { db } from "./db";
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
    return db.projects.orderBy("sortOrder").toArray();
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = {
      id: createId(),
      name: input.name,
      notes: "",
      status: "active",
      areaId: input.areaId ?? null,
      deadline: null,
      sortOrder: Date.now(),
    };
    await db.projects.add(project);
    return project;
  },

  async update(id: string, changes: Partial<Project>): Promise<void> {
    await db.projects.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await db.transaction("rw", db.projects, db.tasks, async () => {
      await db.tasks.where("projectId").equals(id).modify({ projectId: null });
      await db.projects.delete(id);
    });
  },
};
