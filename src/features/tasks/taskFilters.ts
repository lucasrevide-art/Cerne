import type { Task } from "../../types";
import type { Route } from "../../store/navigationStore";

/**
 * As views fixas são lentes de tempo/atenção sobre o mesmo conjunto de
 * tarefas, não pastas separadas (seção 2.1 do documento de produto) — uma
 * tarefa pode aparecer em mais de uma lente ao mesmo tempo (ex.: uma tarefa
 * ainda não classificada mas com prazo vencido aparece na Inbox e no Today).
 */

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDue(task: Task, today: string): boolean {
  if (task.when === "date" && task.whenDate && task.whenDate <= today) return true;
  if (task.deadline && task.deadline <= today) return true;
  return false;
}

function isFutureDated(task: Task, today: string): boolean {
  if (task.when === "date" && task.whenDate && task.whenDate > today) return true;
  if (task.deadline && task.deadline > today) return true;
  return false;
}

export function isOpen(task: Task): boolean {
  return task.status === "open";
}

export function isInboxTask(task: Task): boolean {
  return (
    isOpen(task) &&
    task.when === null &&
    task.projectId === null &&
    task.areaId === null
  );
}

export function isTodayTask(task: Task, today = todayStr()): boolean {
  if (!isOpen(task)) return false;
  return (
    task.when === "today" ||
    task.when === "evening" ||
    isDue(task, today)
  );
}

export function isUpcomingTask(task: Task, today = todayStr()): boolean {
  if (!isOpen(task)) return false;
  if (isTodayTask(task, today)) return false;
  return isFutureDated(task, today);
}

export function isSomedayTask(task: Task, today = todayStr()): boolean {
  if (!isOpen(task)) return false;
  if (isTodayTask(task, today) || isUpcomingTask(task, today)) return false;
  return task.when === "someday";
}

export function isAnytimeTask(task: Task, today = todayStr()): boolean {
  if (!isOpen(task)) return false;
  if (isTodayTask(task, today)) return false;
  if (isUpcomingTask(task, today)) return false;
  if (isSomedayTask(task, today)) return false;
  return true;
}

export function isLogbookTask(task: Task): boolean {
  return task.status === "completed";
}

const TODAY_SORT_WEIGHT = { overdue: 0, today: 1, evening: 2 } as const;

function todaySortWeight(task: Task, today: string): number {
  if (isDue(task, today) && task.when !== "today" && task.when !== "evening") {
    return TODAY_SORT_WEIGHT.overdue;
  }
  if (task.when === "evening") return TODAY_SORT_WEIGHT.evening;
  return TODAY_SORT_WEIGHT.today;
}

/** Atrasadas → hoje → esta noite (seção 4, fluxo "Executar"). */
export function sortTodayTasks(tasks: Task[], today = todayStr()): Task[] {
  return [...tasks].sort(
    (a, b) => todaySortWeight(a, today) - todaySortWeight(b, today),
  );
}

function upcomingDateKey(task: Task): string {
  const dates = [task.whenDate, task.deadline].filter((d): d is string => !!d);
  return dates.sort()[0] ?? "";
}

export function sortUpcomingTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => upcomingDateKey(a).localeCompare(upcomingDateKey(b)));
}

export interface LogbookGroup {
  date: string;
  tasks: Task[];
}

/** Agrupa concluídas por dia, dia mais recente primeiro (seção 3, "Logbook"). */
export function groupLogbookTasks(tasks: Task[]): LogbookGroup[] {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const day = (task.completedAt ?? task.createdAt).slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(task);
    groups.set(day, list);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, dayTasks]) => ({
      date,
      tasks: dayTasks.sort((a, b) =>
        (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
      ),
    }));
}

/** Pra onde navegar ao selecionar uma tarefa na busca — a lente mais específica que a contém. */
export function resolveTaskRoute(task: Task): Route {
  if (task.projectId) return { type: "project", projectId: task.projectId };
  if (task.areaId) return { type: "area", areaId: task.areaId };
  if (task.status === "completed") return { type: "fixed", view: "logbook" };
  if (isTodayTask(task)) return { type: "fixed", view: "today" };
  if (isUpcomingTask(task)) return { type: "fixed", view: "upcoming" };
  if (isSomedayTask(task)) return { type: "fixed", view: "someday" };
  if (isAnytimeTask(task)) return { type: "fixed", view: "anytime" };
  return { type: "fixed", view: "inbox" };
}
