import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatTimeRange, minutesToPx, minutesToTime } from "./agendaTime";
import "./AgendaQuickCreate.css";

interface AgendaQuickCreateProps {
  startMinutes: number;
  durationMinutes: number;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

/** Popover que aparece depois de arrastar um intervalo vazio na grade — só pede o título. */
export function AgendaQuickCreate({
  startMinutes,
  durationMinutes,
  onConfirm,
  onCancel,
}: AgendaQuickCreateProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function commit() {
    const trimmed = title.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    onConfirm(trimmed);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    commit();
  }

  const startTime = minutesToTime(startMinutes);

  return (
    <div
      className="cerne-agenda-quick-create"
      style={{ top: minutesToPx(startMinutes), height: minutesToPx(durationMinutes) }}
    >
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="cerne-agenda-quick-create__input"
          placeholder="Título…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
          onBlur={commit}
        />
      </form>
      <span className="cerne-agenda-quick-create__time">
        {formatTimeRange(startTime, durationMinutes)}
      </span>
    </div>
  );
}
