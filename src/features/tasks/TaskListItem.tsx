import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";
import { useNavigationStore } from "../../store/navigationStore";
import { TaskRow } from "../../components/TaskRow";
import { RepeatIcon, GripIcon, StarFilledIcon } from "../../components/icons";
import { describeRecurrence } from "../../lib/recurrence/recurrenceEngine";
import { friendlyDateKey } from "../../lib/date/localDate";
import { isOverdueTask } from "./taskFilters";
import "./TaskListItem.css";

const TaskDetailOverlay = lazy(() =>
  import("./TaskDetailOverlay").then((module) => ({ default: module.TaskDetailOverlay })),
);

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
    parts.push(friendlyDateKey(task.whenDate));
  } else if (task.when && whenLabel[task.when]) {
    parts.push(whenLabel[task.when]);
  }
  if (task.deadline) parts.push(`Prazo ${friendlyDateKey(task.deadline).toLocaleLowerCase("pt-BR")}`);
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
  /** Mostra a etiqueta de área/projeto na linha — útil em listas que misturam tarefas de vários lugares. */
  showProjectTag?: boolean;
  /** Habilita arrastar-para-reordenar nesta linha. */
  reorderable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragOverRow?: () => void;
  onDropRow?: () => void;
  onDragEndRow?: () => void;
}

export function TaskListItem({
  task,
  showProjectTag,
  reorderable,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOverRow,
  onDropRow,
  onDragEndRow,
}: TaskListItemProps) {
  const [open, setOpen] = useState(false);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const recurrence = useTaskStore((s) => s.recurrencesByTask[task.id]);
  const area = useAreaStore((s) =>
    showProjectTag && task.areaId ? s.areas.find((a) => a.id === task.areaId) : undefined,
  );
  const project = useProjectStore((s) =>
    showProjectTag && task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined,
  );
  const allTags = useTagStore((s) => s.tags);
  const taskTags = task.tagIds.length > 0 ? allTags.filter((t) => task.tagIds.includes(t.id)) : [];
  const highlightTaskId = useNavigationStore((s) => s.highlightTaskId);
  const clearHighlightTask = useNavigationStore((s) => s.clearHighlightTask);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightTaskId === task.id) {
      setOpen(true);
      rootRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      clearHighlightTask();
    }
  }, [highlightTaskId, task.id, clearHighlightTask]);

  const tagLabel = project?.name ?? area?.name;
  const metadataText = formatMetadataText(task);
  const overdue = isOverdueTask(task);
  const metadata =
    metadataText || recurrence || tagLabel || taskTags.length > 0 ? (
      <span className={`cerne-task-item__metadata${overdue ? " cerne-task-item__metadata--overdue" : ""}`}>
        {tagLabel && <span className="cerne-task-item__tag">{tagLabel}</span>}
        {taskTags.map((tag) => (
          <span key={tag.id} className="cerne-task-item__tag cerne-task-item__tag--custom">
            {tag.name}
          </span>
        ))}
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
        {overdue && <span className="cerne-task-item__overdue-label">Atrasada</span>}
        {overdue && metadataText && <span>·</span>}
        {metadataText && <span>{metadataText}</span>}
      </span>
    ) : null;

  const itemClassName = [
    "cerne-task-item",
    isDragging && "cerne-task-item--dragging",
    isDragOver && "cerne-task-item--drag-over",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={itemClassName}
      ref={rootRef}
      draggable={reorderable}
      onDragStart={reorderable ? onDragStart : undefined}
      onDragOver={
        reorderable
          ? (e) => {
              e.preventDefault();
              onDragOverRow?.();
            }
          : undefined
      }
      onDrop={
        reorderable
          ? (e) => {
              e.preventDefault();
              onDropRow?.();
            }
          : undefined
      }
      onDragEnd={reorderable ? onDragEndRow : undefined}
    >
      {reorderable && (
        <span className="cerne-task-item__grip" aria-hidden="true">
          <GripIcon width={14} height={14} />
        </span>
      )}
      <div
        className="cerne-task-item__row"
        tabIndex={0}
        aria-label={`${task.title}${task.status === "completed" ? ", concluída" : ""}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            toggleComplete(task.id);
          } else if (e.key === "Enter") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <TaskRow
          title={task.title}
          completed={task.status === "completed"}
          metadata={metadata}
          leading={
            task.isFocus ? (
              <StarFilledIcon width={13} height={13} aria-label="A Única Coisa" />
            ) : undefined
          }
          onToggleComplete={() => toggleComplete(task.id)}
        />
      </div>
      {open && (
        <Suspense fallback={null}>
          <TaskDetailOverlay task={task} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
