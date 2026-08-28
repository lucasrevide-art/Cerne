/**
 * Modelo de dados — documento de produto, seção 8.
 * Apenas os tipos; a Fase 1 não implementa o repositório/persistência ainda.
 */

export type TaskStatus = "open" | "waiting" | "completed" | "canceled";

export type TaskWhen = "today" | "evening" | "date" | "someday" | null;

export type TaskType = "default" | "financial";

export interface Task {
  id: string;
  title: string;
  notes: string;
  when: TaskWhen;
  whenDate: string | null;
  deadline: string | null;
  status: TaskStatus;
  priority: number;
  type: TaskType;
  amount?: number;
  category?: string;
  projectId: string | null;
  areaId: string | null;
  tagIds: string[];
  /** Marca a tarefa como "A Única Coisa" — o subconjunto priorizado agora, independente de área/projeto. */
  isFocus: boolean;
  createdAt: string;
  completedAt: string | null;
  sortOrder: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  sortOrder: number;
}

export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  notes: string;
  status: ProjectStatus;
  areaId: string | null;
  deadline: string | null;
  sortOrder: number;
}

export interface Heading {
  id: string;
  projectId: string;
  title: string;
  sortOrder: number;
}

export interface Area {
  id: string;
  name: string;
  color: string;
  icon: string;
  notes: string;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type RecurrenceType = "daily" | "weekly" | "monthly" | "custom";

export interface Recurrence {
  id: string;
  taskId: string;
  type: RecurrenceType;
  interval: number;
  weekdays: number[];
  nextDate: string;
}

export interface Reminder {
  id: string;
  taskId: string | null;
  fireAt: string;
  message: string;
  dismissed: boolean;
}

export interface Note {
  id: string;
  taskId: string | null;
  projectId: string | null;
  body: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  firstDayOfWeek: 0 | 1;
}

export interface User {
  id: string;
  name: string;
  preferences: UserPreferences;
}
