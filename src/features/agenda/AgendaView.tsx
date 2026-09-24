import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { AgendaGrid } from "./AgendaGrid";
import { TaskDetailOverlay } from "../tasks/TaskDetailOverlay";
import { ChevronRightIcon } from "../../components/icons";
import { addDays, localDateKey, startOfWeekKey } from "../../lib/date/localDate";
import { minutesToTime } from "./agendaTime";
import "./AgendaView.css";

type AgendaMode = "day" | "week";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function keyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayLabel(dateKey: string): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(keyToDate(dateKey));
  return capitalize(label);
}

function formatWeekLabel(startKey: string): string {
  const start = keyToDate(startKey);
  const endKey = addDays(startKey, 6);
  const end = keyToDate(endKey);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    ...(sameMonth ? {} : { month: "short" }),
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(end);
  return `${startLabel} – ${endLabel}`;
}

/** Visão adicional (não substitui "Próximas"): organiza um dia ou semana em blocos de tempo, ao lado das tarefas sem horário marcado. */
export function AgendaView() {
  const addTask = useTaskStore((s) => s.addTask);
  const tasks = useTaskStore((s) => s.tasks);
  const [mode, setMode] = useState<AgendaMode>("day");
  const [anchor, setAnchor] = useState(() => localDateKey());
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const todayKey = localDateKey();
  const weekStart = startOfWeekKey(anchor);
  const dates =
    mode === "day" ? [anchor] : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function goPrev() {
    setAnchor((prev) => addDays(prev, mode === "day" ? -1 : -7));
  }
  function goNext() {
    setAnchor((prev) => addDays(prev, mode === "day" ? 1 : 7));
  }
  function goToday() {
    setAnchor(todayKey);
  }

  function handleCreateBlock(
    dateKey: string,
    startMinutes: number,
    durationMinutes: number,
    title: string,
  ) {
    void addTask(title, {
      when: "date",
      whenDate: dateKey,
      startTime: minutesToTime(startMinutes),
      durationMinutes,
    });
  }

  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) : undefined;

  return (
    <div className="cerne-agenda-view">
      <div className="cerne-agenda-view__toolbar">
        <div className="cerne-agenda-view__nav">
          <button
            type="button"
            className="cerne-agenda-view__nav-btn"
            aria-label="Anterior"
            onClick={goPrev}
          >
            <ChevronRightIcon width={14} height={14} className="cerne-agenda-view__nav-icon--prev" />
          </button>
          <button
            type="button"
            className="cerne-agenda-view__nav-btn"
            aria-label="Próximo"
            onClick={goNext}
          >
            <ChevronRightIcon width={14} height={14} />
          </button>
          <button type="button" className="cerne-agenda-view__today-btn" onClick={goToday}>
            Hoje
          </button>
          <span className="cerne-agenda-view__label">
            {mode === "day" ? formatDayLabel(anchor) : formatWeekLabel(weekStart)}
          </span>
        </div>
        <div className="cerne-agenda-view__segmented">
          <button
            type="button"
            className={`cerne-agenda-view__segment${
              mode === "day" ? " cerne-agenda-view__segment--active" : ""
            }`}
            onClick={() => setMode("day")}
          >
            Dia
          </button>
          <button
            type="button"
            className={`cerne-agenda-view__segment${
              mode === "week" ? " cerne-agenda-view__segment--active" : ""
            }`}
            onClick={() => setMode("week")}
          >
            Semana
          </button>
        </div>
      </div>

      <AgendaGrid
        dates={dates}
        todayKey={todayKey}
        onOpenTask={(task) => setOpenTaskId(task.id)}
        onCreateBlock={handleCreateBlock}
      />

      {openTask && <TaskDetailOverlay task={openTask} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}
