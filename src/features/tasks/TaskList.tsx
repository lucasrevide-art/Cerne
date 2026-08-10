import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { TaskListItem } from "./TaskListItem";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  quickAddDefaults?: Partial<Task>;
  hideQuickAdd?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
  /** Mostra a etiqueta de área/projeto em cada linha — para listas que misturam tarefas de vários lugares. */
  showProjectTag?: boolean;
  /** Permite arrastar as linhas para reordenar — só faz sentido em listas cuja ordem é manual (não recalculada por data). */
  reorderable?: boolean;
}

/** Quanto tempo uma tarefa recém-concluída fica visível (riscada) antes de sumir da lente. */
const COMPLETE_HOLD_MS = 650;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Lista genérica orientada por props — não decide sozinha quais tarefas
 * mostrar. Cada view (Inbox, Today, uma Area, um Project…) passa sua própria
 * fatia já filtrada dos mesmos dados (seção 2.1: lentes, não pastas).
 */
export function TaskList({
  tasks,
  quickAddDefaults,
  hideQuickAdd,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  showProjectTag,
  reorderable,
}: TaskListProps) {
  const addTask = useTaskStore((s) => s.addTask);
  const allTasks = useTaskStore((s) => s.tasks);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const [draft, setDraft] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Segura na tela, riscada, a tarefa que acabou de ser concluída e saiu do
  // filtro desta view — em vez de sumir na hora (seção 4, fluxo "Executar").
  const [heldIds, setHeldIds] = useState<string[]>([]);
  const prevTasksRef = useRef<Task[]>(tasks);

  useEffect(() => {
    const currentIds = new Set(tasks.map((t) => t.id));
    // Checa o status ATUAL no store — o objeto em prevTasksRef é um snapshot
    // de antes da mudança e nunca é mutado, então t.status ali sempre reflete
    // o estado antigo (sempre "open"), não serve pra saber se foi concluída.
    const dropped = prevTasksRef.current.filter((t) => {
      if (currentIds.has(t.id)) return false;
      const current = allTasks.find((at) => at.id === t.id);
      return current?.status === "completed";
    });
    if (dropped.length > 0 && !prefersReducedMotion()) {
      setHeldIds((prev) => [...prev, ...dropped.map((t) => t.id)]);
      for (const t of dropped) {
        const id = t.id;
        window.setTimeout(() => {
          setHeldIds((prev) => prev.filter((held) => held !== id));
        }, COMPLETE_HOLD_MS);
      }
    }
    prevTasksRef.current = tasks;
  }, [tasks, allTasks]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    addTask(title, quickAddDefaults);
    setDraft("");
  }

  function handleDragOver(id: string) {
    if (id !== draggedId) setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    const fromId = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;
    const ids = displayTasks.map((t) => t.id);
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, fromId);
    reorderTasks(reordered);
  }

  const heldTasks = heldIds
    .filter((id) => !tasks.some((t) => t.id === id))
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t);

  const displayTasks = [...tasks, ...heldTasks];

  return (
    <div className="cerne-task-list">
      {!hideQuickAdd && (
        <form className="cerne-task-list__quick-add" onSubmit={handleSubmit}>
          <Input
            placeholder="Adicionar tarefa…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Adicionar
          </Button>
        </form>
      )}

      {displayTasks.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="cerne-task-list__rows">
          {displayTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              showProjectTag={showProjectTag}
              reorderable={reorderable}
              isDragging={draggedId === task.id}
              isDragOver={reorderable && dragOverId === task.id && draggedId !== task.id}
              onDragStart={() => setDraggedId(task.id)}
              onDragOverRow={() => handleDragOver(task.id)}
              onDropRow={() => handleDrop(task.id)}
              onDragEndRow={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
