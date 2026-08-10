import { db } from "../repository/db";
import type { Task, Subtask, Area, Project, Recurrence } from "../../types";

/**
 * Backup manual — exporta/importa todas as tabelas como um único JSON.
 * Existe porque o banco (IndexedDB) é por origem: mudar de localhost para
 * um domínio publicado começa com um banco vazio, então isso é a ponte
 * para levar os dados de um lugar para o outro.
 */

const BACKUP_VERSION = 1;

interface CerneBackup {
  version: number;
  exportedAt: string;
  tasks: Task[];
  subtasks: Subtask[];
  areas: Area[];
  projects: Project[];
  recurrences: Recurrence[];
}

export async function exportBackup(): Promise<void> {
  const [tasks, subtasks, areas, projects, recurrences] = await Promise.all([
    db.tasks.toArray(),
    db.subtasks.toArray(),
    db.areas.toArray(),
    db.projects.toArray(),
    db.recurrences.toArray(),
  ]);

  const backup: CerneBackup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    subtasks,
    areas,
    projects,
    recurrences,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cerne-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isCerneBackup(value: unknown): value is CerneBackup {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.tasks) &&
    Array.isArray(v.subtasks) &&
    Array.isArray(v.areas) &&
    Array.isArray(v.projects) &&
    Array.isArray(v.recurrences)
  );
}

/** bulkPut: sobrescreve registros com o mesmo id e adiciona os novos — seguro tanto num banco vazio quanto para restaurar por cima. */
export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);
  if (!isCerneBackup(parsed)) {
    throw new Error("Arquivo de backup inválido.");
  }

  await db.transaction(
    "rw",
    [db.tasks, db.subtasks, db.areas, db.projects, db.recurrences],
    async () => {
      if (parsed.areas.length) await db.areas.bulkPut(parsed.areas);
      if (parsed.projects.length) await db.projects.bulkPut(parsed.projects);
      if (parsed.tasks.length) await db.tasks.bulkPut(parsed.tasks);
      if (parsed.subtasks.length) await db.subtasks.bulkPut(parsed.subtasks);
      if (parsed.recurrences.length) await db.recurrences.bulkPut(parsed.recurrences);
    },
  );
}
