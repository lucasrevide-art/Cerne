import assert from "node:assert/strict";
import test from "node:test";
import {
  isDueTodayTask,
  isInboxTask,
  isOverdueTask,
  isTodayTask,
  resolveTaskRoute,
} from "../src/features/tasks/taskFilters.ts";
import type { Task } from "../src/types/index.ts";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Tarefa",
    notes: "",
    when: null,
    whenDate: null,
    deadline: null,
    status: "open",
    priority: 0,
    type: "default",
    projectId: null,
    areaId: null,
    tagIds: [],
    isFocus: false,
    createdAt: "2026-08-28T12:00:00.000Z",
    completedAt: null,
    sortOrder: 0,
    ...overrides,
  };
}

test("Inbox contém somente capturas ainda não processadas", () => {
  assert.equal(isInboxTask(task()), true);
  assert.equal(isInboxTask(task({ areaId: "area-1" })), false);
  assert.equal(isInboxTask(task({ projectId: "project-1" })), false);
  assert.equal(isInboxTask(task({ when: "today" })), false);
  assert.equal(isInboxTask(task({ deadline: "2026-08-28" })), false);
  assert.equal(isInboxTask(task({ status: "completed" })), false);
});

test("Hoje inclui tarefas do dia e atrasadas, mas não tarefas futuras", () => {
  const today = "2026-08-28";
  assert.equal(isTodayTask(task({ when: "today" }), today), true);
  assert.equal(isTodayTask(task({ when: "date", whenDate: "2026-08-27" }), today), true);
  assert.equal(isTodayTask(task({ deadline: "2026-08-28" }), today), true);
  assert.equal(isTodayTask(task({ when: "date", whenDate: "2026-08-29" }), today), false);
  assert.equal(isTodayTask(task({ status: "completed", when: "today" }), today), false);
});

test("Busca encaminha tarefa diária para Hoje antes de Próximas", () => {
  assert.deepEqual(
    resolveTaskRoute(task({ when: "today" })),
    { type: "fixed", view: "today" },
  );
});

test("Hoje separa atrasadas do trabalho previsto para o dia", () => {
  const today = "2026-08-28";
  const overdue = task({ when: "date", whenDate: "2026-08-27" });
  const dueToday = task({ deadline: today });

  assert.equal(isOverdueTask(overdue, today), true);
  assert.equal(isDueTodayTask(overdue, today), false);
  assert.equal(isOverdueTask(dueToday, today), false);
  assert.equal(isDueTodayTask(dueToday, today), true);
});
