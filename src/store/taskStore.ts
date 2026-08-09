import { create } from "zustand";
import { taskRepository } from "../lib/repository/taskRepository";
import type { Task, Subtask } from "../types";

interface TaskState {
  tasks: Task[];
  subtasksByTask: Record<string, Subtask[]>;
  loaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  subtasksByTask: {},
  loaded: false,

  loadTasks: async () => {
    const [tasks, subtasks] = await Promise.all([
      taskRepository.list(),
      taskRepository.listAllSubtasks(),
    ]);
    const subtasksByTask: Record<string, Subtask[]> = {};
    for (const subtask of subtasks) {
      (subtasksByTask[subtask.taskId] ??= []).push(subtask);
    }
    set({ tasks, subtasksByTask, loaded: true });
  },

  addTask: async (title) => {
    const task = await taskRepository.create({ title });
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
    } else {
      const completedAt = new Date().toISOString();
      await taskRepository.complete(id);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: "completed", completedAt } : t,
        ),
      }));
    }
  },

  removeTask: async (id) => {
    await taskRepository.remove(id);
    set((state) => {
      const subtasksByTask = { ...state.subtasksByTask };
      delete subtasksByTask[id];
      return { tasks: state.tasks.filter((t) => t.id !== id), subtasksByTask };
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
}));
