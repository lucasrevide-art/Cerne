import { useState } from "react";
import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { TaskRow } from "../../components/TaskRow";
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

function formatMetadata(task: Task): string | null {
  const parts: string[] = [];
  if (task.when === "date" && task.whenDate) {
    parts.push(task.whenDate);
  } else if (task.when && whenLabel[task.when]) {
    parts.push(whenLabel[task.when]);
  }
  if (task.deadline) parts.push(`Prazo ${task.deadline}`);
  if (task.priority > 0) parts.push(priorityLabel[task.priority]);
  return parts.length > 0 ? parts.join(" · ") : null;
}

interface TaskListItemProps {
  task: Task;
}

export function TaskListItem({ task }: TaskListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  return (
    <div className="cerne-task-item">
      <div
        className="cerne-task-item__row"
        onClick={() => setExpanded((v) => !v)}
      >
        <TaskRow
          title={task.title}
          completed={task.status === "completed"}
          metadata={formatMetadata(task)}
          onToggleComplete={() => toggleComplete(task.id)}
        />
      </div>
      {expanded && (
        <TaskEditor task={task} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}
