import type { Task, Subtask } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";
import { TaskRow } from "../../components/TaskRow";
import { PencilIcon, RepeatIcon, StarIcon, StarFilledIcon } from "../../components/icons";
import { describeRecurrence } from "../../lib/recurrence/recurrenceEngine";
import "./TaskPreview.css";

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

const EMPTY_SUBTASKS: Subtask[] = [];

interface TaskPreviewProps {
  task: Task;
  onEdit: () => void;
}

/** Só as informações essenciais — o formulário completo fica atrás do ícone de editar. */
export function TaskPreview({ task, onEdit }: TaskPreviewProps) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const updateTask = useTaskStore((s) => s.updateTask);
  const subtasks = useTaskStore((s) => s.subtasksByTask[task.id] ?? EMPTY_SUBTASKS);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const recurrence = useTaskStore((s) => s.recurrencesByTask[task.id]);
  const area = useAreaStore((s) => (task.areaId ? s.areas.find((a) => a.id === task.areaId) : undefined));
  const project = useProjectStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined,
  );
  const allTags = useTagStore((s) => s.tags);
  const taskTags = allTags.filter((t) => task.tagIds.includes(t.id));

  const chips: string[] = [];
  if (task.when === "date" && task.whenDate) chips.push(task.whenDate);
  else if (task.when && whenLabel[task.when]) chips.push(whenLabel[task.when]);
  if (task.deadline) chips.push(`Prazo ${task.deadline}`);
  if (task.priority > 0) chips.push(priorityLabel[task.priority]);
  if (task.type === "financial" && task.amount !== undefined) {
    chips.push(currencyFormatter.format(task.amount) + (task.category ? ` · ${task.category}` : ""));
  }

  return (
    <div className="cerne-task-preview">
      <div className="cerne-task-preview__header">
        <button
          type="button"
          className="cerne-task-preview__checkbox"
          role="checkbox"
          aria-checked={task.status === "completed"}
          aria-label={task.status === "completed" ? "Marcar como não concluída" : "Concluir tarefa"}
          onClick={() => toggleComplete(task.id)}
        >
          {task.status === "completed" && "✓"}
        </button>
        <h2
          className={`cerne-task-preview__title${
            task.status === "completed" ? " cerne-task-preview__title--completed" : ""
          }`}
        >
          {task.title}
        </h2>
        <button
          type="button"
          className={`cerne-task-preview__focus${task.isFocus ? " cerne-task-preview__focus--active" : ""}`}
          aria-label={task.isFocus ? "Tirar de A Única Coisa" : "Marcar como A Única Coisa"}
          aria-pressed={task.isFocus}
          onClick={() => updateTask(task.id, { isFocus: !task.isFocus })}
        >
          {task.isFocus ? <StarFilledIcon width={16} height={16} /> : <StarIcon width={16} height={16} />}
        </button>
        <button
          type="button"
          className="cerne-task-preview__edit"
          aria-label="Editar tarefa"
          onClick={onEdit}
        >
          <PencilIcon width={16} height={16} />
        </button>
      </div>

      {(chips.length > 0 || recurrence || area || project || taskTags.length > 0) && (
        <div className="cerne-task-preview__chips">
          {(project || area) && (
            <span className="cerne-task-preview__chip cerne-task-preview__chip--tag">
              {project?.name ?? area?.name}
            </span>
          )}
          {taskTags.map((tag) => (
            <span key={tag.id} className="cerne-task-preview__chip cerne-task-preview__chip--tag">
              {tag.name}
            </span>
          ))}
          {recurrence && (
            <span className="cerne-task-preview__chip">
              <RepeatIcon width={11} height={11} />
              {describeRecurrence(recurrence)}
            </span>
          )}
          {chips.map((chip) => (
            <span key={chip} className="cerne-task-preview__chip">
              {chip}
            </span>
          ))}
        </div>
      )}

      {task.notes && <p className="cerne-task-preview__notes">{task.notes}</p>}

      {subtasks.length > 0 && (
        <div className="cerne-task-preview__subtasks">
          {subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              title={subtask.title}
              completed={subtask.status === "completed"}
              onToggleComplete={() => toggleSubtask(task.id, subtask.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
