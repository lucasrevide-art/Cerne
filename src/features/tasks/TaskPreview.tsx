import type { Task, Subtask } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";
import { TaskRow } from "../../components/TaskRow";
import { PencilIcon, RepeatIcon, StarIcon, StarFilledIcon } from "../../components/icons";
import { describeRecurrence } from "../../lib/recurrence/recurrenceEngine";
import { friendlyDateKey, localDateKey, tomorrowDateKey } from "../../lib/date/localDate";
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
  const areas = useAreaStore((s) => s.areas);
  const projects = useProjectStore((s) => s.projects);
  const area = task.areaId ? areas.find((item) => item.id === task.areaId) : undefined;
  const project = task.projectId
    ? projects.find((item) => item.id === task.projectId)
    : undefined;
  const allTags = useTagStore((s) => s.tags);
  const taskTags = allTags.filter((t) => task.tagIds.includes(t.id));

  const chips: { label: string; danger?: boolean }[] = [];
  const today = localDateKey();
  if (task.when === "date" && task.whenDate) {
    chips.push({ label: friendlyDateKey(task.whenDate), danger: task.whenDate < today });
  } else if (task.when && whenLabel[task.when]) {
    chips.push({ label: whenLabel[task.when] });
  }
  if (task.deadline) {
    chips.push({
      label: `Prazo ${friendlyDateKey(task.deadline).toLocaleLowerCase("pt-BR")}`,
      danger: task.deadline < today,
    });
  }
  if (task.priority > 0) chips.push({ label: priorityLabel[task.priority] });
  if (task.type === "financial" && task.amount !== undefined) {
    chips.push({ label: currencyFormatter.format(task.amount) + (task.category ? ` · ${task.category}` : "") });
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
            <span
              key={chip.label}
              className={`cerne-task-preview__chip${
                chip.danger ? " cerne-task-preview__chip--danger" : ""
              }`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {(task.status === "open" || task.status === "waiting") && (
        <div className="cerne-task-preview__triage" aria-label="Planejar tarefa">
          <span className="text-caption">Planejar</span>
          <div className="cerne-task-preview__triage-actions">
            <button
              type="button"
              className={`cerne-task-preview__triage-button${
                task.status === "waiting" ? " cerne-task-preview__triage-button--waiting" : ""
              }`}
              onClick={() =>
                updateTask(task.id, { status: task.status === "waiting" ? "open" : "waiting" })
              }
            >
              {task.status === "waiting" ? "Retomar" : "Aguardando"}
            </button>
            {task.status === "open" && (
              <>
                <button
                  type="button"
                  className={`cerne-task-preview__triage-button${
                    task.when === "today" ? " cerne-task-preview__triage-button--active" : ""
                  }`}
                  onClick={() => updateTask(task.id, { when: "today", whenDate: null })}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  className="cerne-task-preview__triage-button"
                  onClick={() =>
                    updateTask(task.id, { when: "date", whenDate: tomorrowDateKey() })
                  }
                >
                  Amanhã
                </button>
                <select
                  className="cerne-task-preview__triage-select"
                  aria-label="Mover para área ou projeto"
                  value={task.projectId ? `project:${task.projectId}` : task.areaId ? `area:${task.areaId}` : ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value.startsWith("area:")) {
                      updateTask(task.id, { areaId: value.slice(5), projectId: null });
                    } else if (value.startsWith("project:")) {
                      updateTask(task.id, { areaId: null, projectId: value.slice(8) });
                    }
                  }}
                >
                  <option value="">Organizar em…</option>
                  {areas.map((item) => (
                    <optgroup key={item.id} label={item.name}>
                      <option value={`area:${item.id}`}>{item.name}</option>
                      {projects
                        .filter((candidate) => candidate.areaId === item.id)
                        .map((candidate) => (
                          <option key={candidate.id} value={`project:${candidate.id}`}>
                            {candidate.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </>
            )}
          </div>
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
