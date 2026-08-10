import { useState, type FormEvent } from "react";
import type { Task, TaskWhen, Subtask } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { Input } from "../../components/Input";
import { TaskRow } from "../../components/TaskRow";
import { ConfirmButton } from "../../components/ConfirmButton";
import { ArrowLeftIcon } from "../../components/icons";
import "./TaskEditor.css";

const whenOptions: { value: TaskWhen; label: string }[] = [
  { value: null, label: "Nenhum" },
  { value: "today", label: "Hoje" },
  { value: "evening", label: "Esta noite" },
  { value: "date", label: "Data" },
  { value: "someday", label: "Algum dia" },
];

const priorityOptions: { value: number; label: string }[] = [
  { value: 0, label: "Nenhuma" },
  { value: 1, label: "Baixa" },
  { value: 2, label: "Média" },
  { value: 3, label: "Alta" },
];

type RecurrenceBucket = "none" | "daily" | "weekly" | "monthly";

const recurrenceBucketOptions: { value: RecurrenceBucket; label: string }[] = [
  { value: "none", label: "Nenhuma" },
  { value: "daily", label: "Diária" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

const recurrenceUnit: Record<Exclude<RecurrenceBucket, "none">, string> = {
  daily: "dias",
  weekly: "semanas",
  monthly: "meses",
};

const weekdayOptions = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const categorySuggestions = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Assinaturas",
  "Educação",
  "Outros",
];

const EMPTY_SUBTASKS: Subtask[] = [];

interface TaskEditorProps {
  task: Task;
  onClose: () => void;
  onBack?: () => void;
}

export function TaskEditor({ task, onClose, onBack }: TaskEditorProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const subtasks = useTaskStore(
    (s) => s.subtasksByTask[task.id] ?? EMPTY_SUBTASKS,
  );
  const areas = useAreaStore((s) => s.areas);
  const projects = useProjectStore((s) => s.projects);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const removeSubtask = useTaskStore((s) => s.removeSubtask);
  const recurrence = useTaskStore((s) => s.recurrencesByTask[task.id]);
  const setRecurrence = useTaskStore((s) => s.setRecurrence);
  const removeRecurrence = useTaskStore((s) => s.removeRecurrence);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  function commitTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      return;
    }
    if (trimmed !== task.title) updateTask(task.id, { title: trimmed });
  }

  function commitNotes() {
    if (notes !== task.notes) updateTask(task.id, { notes });
  }

  const recurrenceBucket: RecurrenceBucket = !recurrence
    ? "none"
    : recurrence.type === "daily"
      ? "daily"
      : recurrence.type === "monthly"
        ? "monthly"
        : "weekly";
  const recurrenceInterval = recurrence?.interval ?? 1;
  const recurrenceWeekdays = recurrence?.weekdays ?? [];

  function selectRecurrenceBucket(bucket: RecurrenceBucket) {
    if (bucket === "none") {
      removeRecurrence(task.id);
      return;
    }
    const weekdays = bucket === "weekly" ? recurrenceWeekdays : [];
    setRecurrence(task.id, {
      type: bucket === "weekly" && weekdays.length > 0 ? "custom" : bucket,
      interval: recurrenceInterval,
      weekdays,
    });
  }

  function changeRecurrenceInterval(value: number) {
    if (recurrenceBucket === "none") return;
    const weekdays = recurrenceBucket === "weekly" ? recurrenceWeekdays : [];
    setRecurrence(task.id, {
      type: recurrenceBucket === "weekly" && weekdays.length > 0 ? "custom" : recurrenceBucket,
      interval: Math.max(1, value),
      weekdays,
    });
  }

  function toggleRecurrenceWeekday(day: number) {
    if (recurrenceBucket !== "weekly") return;
    const next = recurrenceWeekdays.includes(day)
      ? recurrenceWeekdays.filter((d) => d !== day)
      : [...recurrenceWeekdays, day].sort((a, b) => a - b);
    setRecurrence(task.id, {
      type: next.length > 0 ? "custom" : "weekly",
      interval: recurrenceInterval,
      weekdays: next,
    });
  }

  function handleSubtaskSubmit(e: FormEvent) {
    e.preventDefault();
    const subtaskTitle = subtaskDraft.trim();
    if (!subtaskTitle) return;
    addSubtask(task.id, subtaskTitle);
    setSubtaskDraft("");
  }

  return (
    <div className="cerne-task-editor">
      {onBack && (
        <button
          type="button"
          className="cerne-task-editor__back"
          onClick={onBack}
        >
          <ArrowLeftIcon width={14} height={14} />
          Voltar
        </button>
      )}

      <Input
        className="cerne-task-editor__title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        aria-label="Título da tarefa"
      />

      <textarea
        className="cerne-task-editor__notes"
        placeholder="Notas…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={commitNotes}
        rows={2}
      />

      <div className="cerne-task-editor__field">
        <span className="text-caption">Quando</span>
        <div className="cerne-task-editor__segmented">
          {whenOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`cerne-task-editor__segment${
                task.when === opt.value ? " cerne-task-editor__segment--active" : ""
              }`}
              onClick={() => updateTask(task.id, { when: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {task.when === "date" && (
          <input
            type="date"
            className="cerne-task-editor__date"
            value={task.whenDate ?? ""}
            onChange={(e) =>
              updateTask(task.id, { whenDate: e.target.value || null })
            }
          />
        )}
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Prazo</span>
        <input
          type="date"
          className="cerne-task-editor__date"
          value={task.deadline ?? ""}
          onChange={(e) =>
            updateTask(task.id, { deadline: e.target.value || null })
          }
        />
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Recorrência</span>
        <div className="cerne-task-editor__segmented">
          {recurrenceBucketOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`cerne-task-editor__segment${
                recurrenceBucket === opt.value ? " cerne-task-editor__segment--active" : ""
              }`}
              onClick={() => selectRecurrenceBucket(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {recurrenceBucket !== "none" && (
          <div className="cerne-task-editor__recurrence-detail">
            <span>A cada</span>
            <input
              type="number"
              min={1}
              className="cerne-task-editor__recurrence-interval"
              value={recurrenceInterval}
              onChange={(e) => changeRecurrenceInterval(Number(e.target.value))}
            />
            <span>{recurrenceUnit[recurrenceBucket]}</span>
          </div>
        )}
        {recurrenceBucket === "weekly" && (
          <div className="cerne-task-editor__segmented">
            {weekdayOptions.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`cerne-task-editor__segment${
                  recurrenceWeekdays.includes(day.value)
                    ? " cerne-task-editor__segment--active"
                    : ""
                }`}
                onClick={() => toggleRecurrenceWeekday(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Área / Projeto</span>
        <select
          className="cerne-task-editor__select"
          value={task.projectId ? `project:${task.projectId}` : task.areaId ? `area:${task.areaId}` : ""}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              updateTask(task.id, { areaId: null, projectId: null });
            } else if (value.startsWith("area:")) {
              updateTask(task.id, { areaId: value.slice(5), projectId: null });
            } else if (value.startsWith("project:")) {
              updateTask(task.id, { areaId: null, projectId: value.slice(8) });
            }
          }}
        >
          <option value="">Nenhum (Inbox)</option>
          {areas.map((area) => (
            <optgroup key={area.id} label={area.name}>
              <option value={`area:${area.id}`}>{area.name} (direto)</option>
              {projects
                .filter((p) => p.areaId === area.id)
                .map((project) => (
                  <option key={project.id} value={`project:${project.id}`}>
                    {project.name}
                  </option>
                ))}
            </optgroup>
          ))}
          {projects.filter((p) => p.areaId === null).length > 0 && (
            <optgroup label="Sem área">
              {projects
                .filter((p) => p.areaId === null)
                .map((project) => (
                  <option key={project.id} value={`project:${project.id}`}>
                    {project.name}
                  </option>
                ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Prioridade</span>
        <div className="cerne-task-editor__segmented">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`cerne-task-editor__segment${
                task.priority === opt.value
                  ? " cerne-task-editor__segment--active"
                  : ""
              }`}
              onClick={() => updateTask(task.id, { priority: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Tipo</span>
        <div className="cerne-task-editor__segmented">
          <button
            type="button"
            className={`cerne-task-editor__segment${
              task.type === "default" ? " cerne-task-editor__segment--active" : ""
            }`}
            onClick={() => updateTask(task.id, { type: "default" })}
          >
            Tarefa
          </button>
          <button
            type="button"
            className={`cerne-task-editor__segment${
              task.type === "financial" ? " cerne-task-editor__segment--active" : ""
            }`}
            onClick={() => updateTask(task.id, { type: "financial" })}
          >
            Financeiro
          </button>
        </div>
        {task.type === "financial" && (
          <div className="cerne-task-editor__financial">
            <div className="cerne-task-editor__amount">
              <span>R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="cerne-task-editor__amount-input"
                value={task.amount ?? ""}
                onChange={(e) =>
                  updateTask(task.id, {
                    amount: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <input
              list="cerne-category-suggestions"
              placeholder="Categoria…"
              className="cerne-task-editor__category-input"
              value={task.category ?? ""}
              onChange={(e) =>
                updateTask(task.id, { category: e.target.value || undefined })
              }
            />
            <datalist id="cerne-category-suggestions">
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        )}
      </div>

      <div className="cerne-task-editor__field">
        <span className="text-caption">Subtarefas</span>
        {subtasks.length > 0 && (
          <div className="cerne-task-editor__subtasks">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="cerne-task-editor__subtask">
                <TaskRow
                  title={subtask.title}
                  completed={subtask.status === "completed"}
                  onToggleComplete={() => toggleSubtask(task.id, subtask.id)}
                />
                <button
                  type="button"
                  className="cerne-task-editor__subtask-remove"
                  aria-label="Remover subtarefa"
                  onClick={() => removeSubtask(task.id, subtask.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          className="cerne-task-editor__subtask-add"
          onSubmit={handleSubtaskSubmit}
        >
          <Input
            placeholder="Adicionar subtarefa…"
            value={subtaskDraft}
            onChange={(e) => setSubtaskDraft(e.target.value)}
          />
        </form>
      </div>

      <div className="cerne-task-editor__actions">
        <ConfirmButton
          confirmLabel="Confirmar exclusão"
          onConfirm={() => {
            removeTask(task.id);
            onClose();
          }}
        >
          Excluir tarefa
        </ConfirmButton>
      </div>
    </div>
  );
}
