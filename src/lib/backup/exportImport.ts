import { db } from "../repository/db";
import { supabase } from "../supabase/client";
import type { Task, Subtask, Area, Project, Recurrence } from "../../types";

/**
 * Backup — agora contra o Supabase (a fonte de verdade depois da migração
 * pra nuvem). `migrateLocalToCloud` é a ponte única com o banco local
 * antigo (IndexedDB/Dexie), usada só uma vez por navegador pra levar dados
 * criados antes da sincronização.
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

function downloadJson(backup: CerneBackup) {
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

// ---------------------------------------------------------------------
// Backup na nuvem (Supabase) — uso corrente, depois da migração.
// ---------------------------------------------------------------------

export async function exportBackup(): Promise<void> {
  const [tasksRes, subtasksRes, areasRes, projectsRes, recurrencesRes] = await Promise.all([
    supabase.from("tasks").select("*"),
    supabase.from("subtasks").select("*"),
    supabase.from("areas").select("*"),
    supabase.from("projects").select("*"),
    supabase.from("recurrences").select("*"),
  ]);
  for (const res of [tasksRes, subtasksRes, areasRes, projectsRes, recurrencesRes]) {
    if (res.error) throw res.error;
  }

  downloadJson({
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: (tasksRes.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      notes: row.notes,
      when: row.when_type,
      whenDate: row.when_date,
      deadline: row.deadline,
      status: row.status,
      priority: row.priority,
      type: row.type,
      amount: row.amount ?? undefined,
      category: row.category ?? undefined,
      projectId: row.project_id,
      areaId: row.area_id,
      tagIds: row.tag_ids ?? [],
      createdAt: row.created_at,
      completedAt: row.completed_at,
      sortOrder: row.sort_order,
    })),
    subtasks: (subtasksRes.data ?? []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      title: row.title,
      status: row.status,
      sortOrder: row.sort_order,
    })),
    areas: (areasRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      notes: row.notes,
      sortOrder: row.sort_order,
    })),
    projects: (projectsRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      notes: row.notes,
      status: row.status,
      areaId: row.area_id,
      deadline: row.deadline,
      sortOrder: row.sort_order,
    })),
    recurrences: (recurrencesRes.data ?? []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      type: row.type,
      interval: row.interval_count,
      weekdays: row.weekdays ?? [],
      nextDate: row.next_date,
    })),
  });
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);
  if (!isCerneBackup(parsed)) {
    throw new Error("Arquivo de backup inválido.");
  }

  // Ordem importa por causa das foreign keys: áreas → projetos → tarefas → resto.
  if (parsed.areas.length) {
    const { error } = await supabase.from("areas").upsert(
      parsed.areas.map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        icon: a.icon,
        notes: a.notes,
        sort_order: a.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (parsed.projects.length) {
    const { error } = await supabase.from("projects").upsert(
      parsed.projects.map((p) => ({
        id: p.id,
        name: p.name,
        notes: p.notes,
        status: p.status,
        area_id: p.areaId,
        deadline: p.deadline,
        sort_order: p.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (parsed.tasks.length) {
    const { error } = await supabase.from("tasks").upsert(
      parsed.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        notes: t.notes,
        when_type: t.when,
        when_date: t.whenDate,
        deadline: t.deadline,
        status: t.status,
        priority: t.priority,
        type: t.type,
        amount: t.amount ?? null,
        category: t.category ?? null,
        project_id: t.projectId,
        area_id: t.areaId,
        tag_ids: t.tagIds,
        created_at: t.createdAt,
        completed_at: t.completedAt,
        sort_order: t.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (parsed.subtasks.length) {
    const { error } = await supabase.from("subtasks").upsert(
      parsed.subtasks.map((s) => ({
        id: s.id,
        task_id: s.taskId,
        title: s.title,
        status: s.status,
        sort_order: s.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (parsed.recurrences.length) {
    const { error } = await supabase.from("recurrences").upsert(
      parsed.recurrences.map((r) => ({
        id: r.id,
        task_id: r.taskId,
        type: r.type,
        interval_count: r.interval,
        weekdays: r.weekdays,
        next_date: r.nextDate,
      })),
    );
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------
// Migração única: dados antigos do IndexedDB local → Supabase.
// ---------------------------------------------------------------------

export interface MigrationResult {
  areas: number;
  projects: number;
  tasks: number;
  subtasks: number;
  recurrences: number;
}

export async function migrateLocalToCloud(): Promise<MigrationResult> {
  const [tasks, subtasks, areas, projects, recurrences] = await Promise.all([
    db.tasks.toArray(),
    db.subtasks.toArray(),
    db.areas.toArray(),
    db.projects.toArray(),
    db.recurrences.toArray(),
  ]);

  if (areas.length) {
    const { error } = await supabase.from("areas").upsert(
      areas.map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        icon: a.icon,
        notes: a.notes,
        sort_order: a.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (projects.length) {
    const { error } = await supabase.from("projects").upsert(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        notes: p.notes,
        status: p.status,
        area_id: p.areaId,
        deadline: p.deadline,
        sort_order: p.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (tasks.length) {
    const { error } = await supabase.from("tasks").upsert(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        notes: t.notes,
        when_type: t.when,
        when_date: t.whenDate,
        deadline: t.deadline,
        status: t.status,
        priority: t.priority,
        type: t.type,
        amount: t.amount ?? null,
        category: t.category ?? null,
        project_id: t.projectId,
        area_id: t.areaId,
        tag_ids: t.tagIds,
        created_at: t.createdAt,
        completed_at: t.completedAt,
        sort_order: t.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (subtasks.length) {
    const { error } = await supabase.from("subtasks").upsert(
      subtasks.map((s) => ({
        id: s.id,
        task_id: s.taskId,
        title: s.title,
        status: s.status,
        sort_order: s.sortOrder,
      })),
    );
    if (error) throw error;
  }
  if (recurrences.length) {
    const { error } = await supabase.from("recurrences").upsert(
      recurrences.map((r) => ({
        id: r.id,
        task_id: r.taskId,
        type: r.type,
        interval_count: r.interval,
        weekdays: r.weekdays,
        next_date: r.nextDate,
      })),
    );
    if (error) throw error;
  }

  return {
    areas: areas.length,
    projects: projects.length,
    tasks: tasks.length,
    subtasks: subtasks.length,
    recurrences: recurrences.length,
  };
}
