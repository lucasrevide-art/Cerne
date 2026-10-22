import { useState, type FormEvent } from "react";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";
import { useTaskStore } from "../../store/taskStore";
import { Overlay } from "../../components/Overlay";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import type { TaskType } from "../../types";
import type { VoiceTaskDraft } from "./voiceContract";
import "./VoiceTaskReview.css";

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

interface VoiceTaskReviewProps {
  draft: VoiceTaskDraft;
  onClose: () => void;
}

/** Mostra o que a IA entendeu do áudio, editável, antes de criar a tarefa de verdade. */
export function VoiceTaskReview({ draft, onClose }: VoiceTaskReviewProps) {
  const areas = useAreaStore((s) => s.areas);
  const projects = useProjectStore((s) => s.projects);
  const tags = useTagStore((s) => s.tags);
  const addTag = useTagStore((s) => s.addTag);
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle] = useState(draft.title);
  const [notes, setNotes] = useState(draft.notes);
  const [whenDate, setWhenDate] = useState(draft.whenDate ?? "");
  const [startTime, setStartTime] = useState(draft.startTime ?? "");
  const [durationMinutes, setDurationMinutes] = useState(draft.durationMinutes ?? 30);
  const [areaId, setAreaId] = useState(draft.areaId);
  const [projectId, setProjectId] = useState(draft.projectId);
  const [tagIds, setTagIds] = useState<string[]>(draft.tagIds);
  const [suggestedTag, setSuggestedTag] = useState(draft.suggestedNewTag);
  const [type, setType] = useState<TaskType>(draft.type);
  const [amount, setAmount] = useState<number | undefined>(draft.amount ?? undefined);
  const [category, setCategory] = useState(draft.category ?? "");
  const [creatingTag, setCreatingTag] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleCreateSuggestedTag() {
    if (!suggestedTag) return;
    setCreatingTag(true);
    try {
      const existing = tags.find((t) => t.name.toLowerCase() === suggestedTag.toLowerCase());
      const tag = existing ?? (await addTag(suggestedTag));
      setTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
      setSuggestedTag(null);
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setBusy(true);
    try {
      await addTask(trimmedTitle, {
        notes,
        when: whenDate ? "date" : null,
        whenDate: whenDate || null,
        startTime: whenDate && startTime ? startTime : null,
        durationMinutes: whenDate && startTime ? durationMinutes : null,
        areaId: projectId ? null : areaId,
        projectId,
        tagIds,
        type,
        amount: type === "financial" ? amount : undefined,
        category: type === "financial" ? category || undefined : undefined,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay onClose={onClose} label="Conferir tarefa criada por voz">
      <form className="cerne-voice-review" onSubmit={handleCreate}>
        <span className="text-h2">Conferir tarefa</span>
        <p className="text-body-small cerne-voice-review__hint">
          Foi isso que entendi do que você falou — ajusta o que precisar antes de criar.
        </p>

        <Input
          className="cerne-voice-review__title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Título da tarefa"
        />

        <textarea
          className="cerne-voice-review__notes"
          placeholder="Notas…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="cerne-voice-review__field">
          <span className="text-caption">Data</span>
          <input
            type="date"
            className="cerne-voice-review__date"
            value={whenDate}
            onChange={(e) => setWhenDate(e.target.value)}
          />
          {whenDate && (
            <div className="cerne-voice-review__time-row">
              <input
                type="time"
                className="cerne-voice-review__time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-label="Horário de início (bloco na Agenda)"
              />
              {startTime && (
                <>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    className="cerne-voice-review__duration"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(5, Number(e.target.value)))}
                    aria-label="Duração em minutos"
                  />
                  <span className="text-caption">min</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="cerne-voice-review__field">
          <span className="text-caption">Área / Projeto</span>
          <select
            className="cerne-voice-review__select"
            value={projectId ? `project:${projectId}` : areaId ? `area:${areaId}` : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setAreaId(null);
                setProjectId(null);
              } else if (value.startsWith("area:")) {
                setAreaId(value.slice(5));
                setProjectId(null);
              } else if (value.startsWith("project:")) {
                setAreaId(null);
                setProjectId(value.slice(8));
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
          </select>
        </div>

        <div className="cerne-voice-review__field">
          <span className="text-caption">Tags</span>
          {tags.length > 0 && (
            <div className="cerne-voice-review__tags">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`cerne-voice-review__tag-chip${
                    tagIds.includes(tag.id) ? " cerne-voice-review__tag-chip--active" : ""
                  }`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          {suggestedTag && (
            <button
              type="button"
              className="cerne-voice-review__suggested-tag"
              disabled={creatingTag}
              onClick={() => void handleCreateSuggestedTag()}
            >
              + Criar e usar tag "{suggestedTag}"
            </button>
          )}
        </div>

        <div className="cerne-voice-review__field">
          <span className="text-caption">Tipo</span>
          <div className="cerne-voice-review__segmented">
            <button
              type="button"
              className={`cerne-voice-review__segment${
                type === "default" ? " cerne-voice-review__segment--active" : ""
              }`}
              onClick={() => setType("default")}
            >
              Tarefa
            </button>
            <button
              type="button"
              className={`cerne-voice-review__segment${
                type === "financial" ? " cerne-voice-review__segment--active" : ""
              }`}
              onClick={() => setType("financial")}
            >
              Financeiro
            </button>
          </div>
          {type === "financial" && (
            <div className="cerne-voice-review__financial">
              <div className="cerne-voice-review__amount">
                <span>R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="cerne-voice-review__amount-input"
                  value={amount ?? ""}
                  onChange={(e) =>
                    setAmount(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </div>
              <input
                list="cerne-voice-category-suggestions"
                placeholder="Categoria…"
                className="cerne-voice-review__category-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="cerne-voice-category-suggestions">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        <div className="cerne-voice-review__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Descartar
          </Button>
          <Button type="submit" variant="primary" disabled={busy || !title.trim()}>
            Criar tarefa
          </Button>
        </div>
      </form>
    </Overlay>
  );
}
