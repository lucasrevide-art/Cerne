import type { Task, Subtask, Area, Project, Recurrence, Tag } from "../../types";

/**
 * Conversão entre o formato do banco (snake_case, Postgres) e os tipos de
 * domínio do app (camelCase, src/types/index.ts). Mantém os repositórios
 * enxutos e o resto do app sem precisar saber que o dado vem do Supabase.
 */

export interface AreaRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  notes: string;
  sort_order: number;
}

export function areaFromRow(row: AreaRow): Area {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    notes: row.notes,
    sortOrder: row.sort_order,
  };
}

export function areaToRow(area: Partial<Area>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (area.name !== undefined) row.name = area.name;
  if (area.color !== undefined) row.color = area.color;
  if (area.icon !== undefined) row.icon = area.icon;
  if (area.notes !== undefined) row.notes = area.notes;
  if (area.sortOrder !== undefined) row.sort_order = area.sortOrder;
  return row;
}

export interface ProjectRow {
  id: string;
  name: string;
  notes: string;
  status: string;
  area_id: string | null;
  deadline: string | null;
  sort_order: number;
}

export function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    status: row.status as Project["status"],
    areaId: row.area_id,
    deadline: row.deadline,
    sortOrder: row.sort_order,
  };
}

export function projectToRow(project: Partial<Project>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (project.name !== undefined) row.name = project.name;
  if (project.notes !== undefined) row.notes = project.notes;
  if (project.status !== undefined) row.status = project.status;
  if (project.areaId !== undefined) row.area_id = project.areaId;
  if (project.deadline !== undefined) row.deadline = project.deadline;
  if (project.sortOrder !== undefined) row.sort_order = project.sortOrder;
  return row;
}

export interface TaskRow {
  id: string;
  title: string;
  notes: string;
  when_type: string | null;
  when_date: string | null;
  deadline: string | null;
  status: string;
  priority: number;
  type: string;
  amount: number | null;
  category: string | null;
  project_id: string | null;
  area_id: string | null;
  tag_ids: string[];
  is_focus: boolean;
  created_at: string;
  completed_at: string | null;
  sort_order: number;
}

export function taskFromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    when: (row.when_type as Task["when"]) ?? null,
    whenDate: row.when_date,
    deadline: row.deadline,
    status: row.status as Task["status"],
    priority: row.priority,
    type: row.type as Task["type"],
    amount: row.amount ?? undefined,
    category: row.category ?? undefined,
    projectId: row.project_id,
    areaId: row.area_id,
    tagIds: row.tag_ids ?? [],
    isFocus: row.is_focus ?? false,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    sortOrder: row.sort_order,
  };
}

export function taskToRow(task: Partial<Task>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (task.title !== undefined) row.title = task.title;
  if (task.notes !== undefined) row.notes = task.notes;
  if (task.when !== undefined) row.when_type = task.when;
  if (task.whenDate !== undefined) row.when_date = task.whenDate;
  if (task.deadline !== undefined) row.deadline = task.deadline;
  if (task.status !== undefined) row.status = task.status;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.type !== undefined) row.type = task.type;
  if (task.amount !== undefined) row.amount = task.amount;
  if (task.category !== undefined) row.category = task.category;
  if (task.projectId !== undefined) row.project_id = task.projectId;
  if (task.areaId !== undefined) row.area_id = task.areaId;
  if (task.tagIds !== undefined) row.tag_ids = task.tagIds;
  if (task.isFocus !== undefined) row.is_focus = task.isFocus;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt;
  if (task.sortOrder !== undefined) row.sort_order = task.sortOrder;
  return row;
}

export interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  status: string;
  sort_order: number;
}

export function subtaskFromRow(row: SubtaskRow): Subtask {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    status: row.status as Subtask["status"],
    sortOrder: row.sort_order,
  };
}

export interface RecurrenceRow {
  id: string;
  task_id: string;
  type: string;
  interval_count: number;
  weekdays: number[];
  next_date: string;
}

export function recurrenceFromRow(row: RecurrenceRow): Recurrence {
  return {
    id: row.id,
    taskId: row.task_id,
    type: row.type as Recurrence["type"],
    interval: row.interval_count,
    weekdays: row.weekdays ?? [],
    nextDate: row.next_date,
  };
}

export interface TagRow {
  id: string;
  name: string;
  color: string;
}

export function tagFromRow(row: TagRow): Tag {
  return { id: row.id, name: row.name, color: row.color };
}
