import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useNavigationStore } from "../../store/navigationStore";
import { TaskRow } from "../../components/TaskRow";
import { RepeatIcon } from "../../components/icons";
import { describeRecurrence } from "../../lib/recurrence/recurrenceEngine";
import { TaskEditor } from "./TaskEditor";
import "./TaskListItem.css";

const priorityLabel: Record<number, string> = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

const whenLabel: Record<string, string> = {
  today: "Hoje",
  evening: "Esta noite",
  someday: "Algum dia",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatMetadataText(task: Task): string | null {
  const parts: string[] = [];
  if (task.when === "date" && task.whenDate) {
    parts.push(task.whenDate);
  } else if (task.when && whenLabel[task.when]) {
    parts.push(whenLabel[task.when]);
  }
  if (task.deadline) parts.push(`Prazo ${task.deadline}`);
  if (task.priority > 0) parts.push(priorityLabel[task.priority]);
  if (task.type === "financial" && task.amount !== undefined) {
    parts.push(
      task.category
        ? `${currencyFormatter.format(task.amount)} · ${task.category}`
        : currencyFormatter.format(task.amount),
    );
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

interface TaskListItemProps {
  task: Task;
}

export function TaskListItem({ task }: TaskListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const recurrence = useTaskStore((s) => s.recurrencesByTask[task.id]);
  const highlightTaskId = useNavigationStore((s) => s.highlightTaskId);
  const clearHighlightTask = useNavigationStore((s) => s.clearHighlightTask);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightTaskId === task.id) {
      setExpanded(true);
      rootRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      clearHighlightTask();
    }
  }, [highlightTaskId, task.id, clearHighlightTask]);

  const metadataText = formatMetadataText(task);
  const metadata =
    metadataText || recurrence ? (
      <span className="cerne-task-item__metadata">
        {recurrence && (
          <RepeatIcon
            width={11}
            height={11}
            className="cerne-task-item__recurrence-icon"
            aria-label={`Repete: ${describeRecurrence(recurrence)}`}
          />
        )}
        {recurrence && <span>{describeRecurrence(recurrence)}</span>}
        {recurrence && metadataText && <span>·</span>}
        {metadataText && <span>{metadataText}</span>}
      </span>
    ) : null;

  return (
    <div className="cerne-task-item" ref={rootRef}>
      <div
        className="cerne-task-item__row"
        onClick={() => setExpanded((v) => !v)}
      >
        <TaskRow
          title={task.title}
          completed={task.status === "completed"}
          metadata={metadata}
          onToggleComplete={() => toggleComplete(task.id)}
        />
      </div>
      {expanded && (
        <TaskEditor task={task} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}
