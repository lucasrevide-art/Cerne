import type { Task } from "../../types";
import type { Route } from "../../store/navigationStore";

/**
 * As views fixas são lentes de atenção sobre o mesmo conjunto de tarefas,
 * não pastas separadas (seção 2.1 do documento de produto) — uma tarefa
 * pode aparecer em mais de uma lente ao mesmo tempo (ex.: uma tarefa com
 * data aparece tanto no Inbox quanto no Upcoming).
 */

export function isOpen(task: Task): boolean {
  return task.status === "open";
}

/** Capturas ainda não processadas: sem área, projeto ou decisão de quando fazer. */
export function isInboxTask(task: Task): boolean {
  return (
    isOpen(task) &&
    !task.areaId &&
    !task.projectId &&
    !task.when &&
    !task.whenDate &&
    !task.deadline
  );
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Trabalho acionável hoje: marcado para hoje, agendado até hoje ou com prazo vencendo. */
export function isTodayTask(task: Task, today = localDateKey()): boolean {
  if (!isOpen(task)) return false;
  if (task.when === "today") return true;
  if (task.when === "date" && task.whenDate && task.whenDate <= today) return true;
  return Boolean(task.deadline && task.deadline <= today);
}

/** Qualquer tarefa com data (agendada ou prazo) — o que aparece no calendário. */
export function isUpcomingTask(task: Task): boolean {
  if (!isOpen(task)) return false;
  return Boolean((task.when === "date" && task.whenDate) || task.deadline);
}

/** A "Única Coisa": o subconjunto que o usuário decidiu priorizar agora. */
export function isFocusTask(task: Task): boolean {
  return isOpen(task) && task.isFocus;
}

export function isLogbookTask(task: Task): boolean {
  return task.status === "completed";
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
  return { type: "fixed", view: "inbox" };
}
