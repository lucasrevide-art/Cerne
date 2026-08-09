import { useState, type FormEvent, type ReactNode } from "react";
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
}: TaskListProps) {
  const addTask = useTaskStore((s) => s.addTask);
  const [draft, setDraft] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    addTask(title, quickAddDefaults);
    setDraft("");
  }

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

      {tasks.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="cerne-task-list__rows">
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
