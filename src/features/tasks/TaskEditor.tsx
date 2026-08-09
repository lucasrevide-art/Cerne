import { useState, type FormEvent, type MouseEvent } from "react";
import type { Task, TaskWhen, Subtask } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { TaskRow } from "../../components/TaskRow";
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

const EMPTY_SUBTASKS: Subtask[] = [];

interface TaskEditorProps {
  task: Task;
  onClose: () => void;
}

export function TaskEditor({ task, onClose }: TaskEditorProps) {
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
  const [notes, setNotes] = useState(task.notes);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  function commitNotes() {
    if (notes !== task.notes) updateTask(task.id, { notes });
  }

  function handleSubtaskSubmit(e: FormEvent) {
    e.preventDefault();
    const title = subtaskDraft.trim();
    if (!title) return;
    addSubtask(task.id, title);
    setSubtaskDraft("");
  }

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="cerne-task-editor" onClick={stop}>
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
        <Button
          variant="ghost"
          onClick={() => {
            removeTask(task.id);
            onClose();
          }}
        >
          Excluir tarefa
        </Button>
      </div>
    </div>
  );
}
