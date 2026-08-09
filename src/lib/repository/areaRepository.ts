import { db } from "./db";
import type { Area } from "../../types";

function createId(): string {
  return crypto.randomUUID();
}

export const areaRepository = {
  async list(): Promise<Area[]> {
    return db.areas.orderBy("sortOrder").toArray();
  },

  async create(name: string): Promise<Area> {
    const area: Area = {
      id: createId(),
      name,
      color: "",
      icon: "",
      notes: "",
      sortOrder: Date.now(),
    };
    await db.areas.add(area);
    return area;
  },

  async update(id: string, changes: Partial<Area>): Promise<void> {
    await db.areas.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await db.transaction("rw", db.areas, db.projects, db.tasks, async () => {
      const projects = await db.projects.where("areaId").equals(id).toArray();
      await db.projects.where("areaId").equals(id).delete();
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length > 0) {
        await db.tasks.where("projectId").anyOf(projectIds).modify({
          projectId: null,
        });
      }
      await db.tasks.where("areaId").equals(id).modify({ areaId: null });
      await db.areas.delete(id);
    });
  },
};
