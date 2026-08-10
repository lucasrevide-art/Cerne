import { create } from "zustand";
import { taskRepository } from "../lib/repository/taskRepository";
import { recurrenceRepository } from "../lib/repository/recurrenceRepository";
import { computeNextDate } from "../lib/recurrence/recurrenceEngine";
import type { Task, Subtask, Recurrence, RecurrenceType } from "../types";

interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  weekdays: number[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function baseDateForRecurrence(task: Task): string {
  return task.whenDate ?? task.deadline ?? todayStr();
}

interface TaskState {
  tasks: Task[];
  subtasksByTask: Record<string, Subtask[]>;
  recurrencesByTask: Record<string, Recurrence>;
  loaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (title: string, overrides?: Partial<Task>) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  setRecurrence: (taskId: string, rule: RecurrenceRule) => Promise<void>;
  removeRecurrence: (taskId: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  subtasksByTask: {},
  recurrencesByTask: {},
  loaded: false,

  loadTasks: async () => {
    const [tasks, subtasks, recurrences] = await Promise.all([
      taskRepository.list(),
      taskRepository.listAllSubtasks(),
      recurrenceRepository.listAll(),
    ]);
    const subtasksByTask: Record<string, Subtask[]> = {};
    for (const subtask of subtasks) {
      (subtasksByTask[subtask.taskId] ??= []).push(subtask);
    }
    const recurrencesByTask: Record<string, Recurrence> = {};
    for (const recurrence of recurrences) {
      recurrencesByTask[recurrence.taskId] = recurrence;
    }
    set({ tasks, subtasksByTask, recurrencesByTask, loaded: true });
  },

  addTask: async (title, overrides) => {
    const task = await taskRepository.create({ title, ...overrides });
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  updateTask: async (id, changes) => {
    await taskRepository.update(id, changes);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    }));
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === "completed") {
      await taskRepository.reopen(id);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: "open", completedAt: null } : t,
        ),
      }));
      return;
    }

    const completedAt = new Date().toISOString();
    await taskRepository.complete(id);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "completed", completedAt } : t,
      ),
    }));

    const recurrence = get().recurrencesByTask[id];
    if (!recurrence) return;

    const nextDate = computeNextDate(baseDateForRecurrence(task), recurrence);
    const nextTask = await taskRepository.create({
      title: task.title,
      notes: task.notes,
      when: "date",
      whenDate: nextDate,
      deadline: null,
      priority: task.priority,
      type: task.type,
      amount: task.amount,
      projectId: task.projectId,
      areaId: task.areaId,
      tagIds: task.tagIds,
    });
    await recurrenceRepository.moveToTask(id, nextTask.id, nextDate);
    set((state) => {
      const recurrencesByTask = { ...state.recurrencesByTask };
      delete recurrencesByTask[id];
      recurrencesByTask[nextTask.id] = { ...recurrence, taskId: nextTask.id, nextDate };
      return { tasks: [nextTask, ...state.tasks], recurrencesByTask };
    });
  },

  removeTask: async (id) => {
    await taskRepository.remove(id);
    await recurrenceRepository.removeForTask(id);
    set((state) => {
      const subtasksByTask = { ...state.subtasksByTask };
      delete subtasksByTask[id];
      const recurrencesByTask = { ...state.recurrencesByTask };
      delete recurrencesByTask[id];
      return {
        tasks: state.tasks.filter((t) => t.id !== id),
        subtasksByTask,
        recurrencesByTask,
      };
    });
  },

  addSubtask: async (taskId, title) => {
    const subtask = await taskRepository.createSubtask(taskId, title);
    set((state) => ({
      subtasksByTask: {
        ...state.subtasksByTask,
        [taskId]: [...(state.subtasksByTask[taskId] ?? []), subtask],
      },
    }));
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const subtask = get().subtasksByTask[taskId]?.find((s) => s.id === subtaskId);
    if (!subtask) return;
    const nextStatus = subtask.status === "completed" ? "open" : "completed";
    await taskRepository.setSubtaskStatus(subtaskId, nextStatus);
    set((state) => ({
      subtasksByTask: {
        ...state.subtasksByTask,
        [taskId]: state.subtasksByTask[taskId].map((s) =>
          s.id === subtaskId ? { ...s, status: nextStatus } : s,
        ),
      },
    }));
  },

  removeSubtask: async (taskId, subtaskId) => {
    await taskRepository.removeSubtask(subtaskId);
    set((state) => ({
      subtasksByTask: {
        ...state.subtasksByTask,
        [taskId]: state.subtasksByTask[taskId].filter((s) => s.id !== subtaskId),
      },
    }));
  },

  setRecurrence: async (taskId, rule) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextDate = computeNextDate(baseDateForRecurrence(task), rule);
    const recurrence = await recurrenceRepository.setForTask(taskId, {
      ...rule,
      nextDate,
    });
    set((state) => ({
      recurrencesByTask: { ...state.recurrencesByTask, [taskId]: recurrence },
    }));
  },

  removeRecurrence: async (taskId) => {
    await recurrenceRepository.removeForTask(taskId);
    set((state) => {
      const recurrencesByTask = { ...state.recurrencesByTask };
      delete recurrencesByTask[taskId];
      return { recurrencesByTask };
    });
  },

  // Reordenação manual (arrastar e soltar). orderedIds é a nova ordem
  // desejada para o subconjunto arrastado; os novos sortOrder ficam dentro
  // da mesma faixa [min, max] que essas tarefas já ocupavam, então tarefas
  // de fora do subconjunto não são afetadas. O array `tasks` em si é
  // reordenado por sortOrder desc pra ficar consistente com a ordem que
  // taskRepository.list() já usa.
  reorderTasks: async (orderedIds) => {
    const { tasks } = get();
    const involved = orderedIds
      .map((id) => tasks.find((t) => t.id === id))
      .filter((t): t is Task => !!t);
    if (involved.length < 2) return;

    const sortOrders = involved.map((t) => t.sortOrder).sort((a, b) => b - a);
    const max = sortOrders[0];
    const min = sortOrders[sortOrders.length - 1];
    const step = (max - min) / (involved.length - 1 || 1);

    const nextSortOrderById = new Map(
      orderedIds.map((id, index) => [id, Math.round(max - index * step)]),
    );

    await Promise.all(
      orderedIds.map((id) =>
        taskRepository.update(id, { sortOrder: nextSortOrderById.get(id)! }),
      ),
    );

    set((state) => {
      const nextTasks = state.tasks.map((t) =>
        nextSortOrderById.has(t.id) ? { ...t, sortOrder: nextSortOrderById.get(t.id)! } : t,
      );
      nextTasks.sort((a, b) => b.sortOrder - a.sortOrder);
      return { tasks: nextTasks };
    });
  },
}));
