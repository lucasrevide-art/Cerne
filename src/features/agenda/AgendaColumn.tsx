import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { Task } from "../../types";
import {
  DEFAULT_DURATION_MINUTES,
  HOUR_HEIGHT,
  SNAP_MINUTES,
  clampMinutes,
  layoutTimedBlocks,
  minutesToPx,
  nowMinutes,
  pxToMinutes,
  snapMinutes,
} from "./agendaTime";
import { AgendaQuickCreate } from "./AgendaQuickCreate";
import "./AgendaColumn.css";

interface DragPreview {
  start: number;
  current: number;
}

interface PendingCreate {
  start: number;
  duration: number;
}

interface AgendaColumnProps {
  dateKey: string;
  isToday: boolean;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onCreateBlock: (dateKey: string, startMinutes: number, durationMinutes: number, title: string) => void;
}

/** Uma coluna de 24h — a unidade que se repete (1x na visão dia, 7x na visão semana). */
export function AgendaColumn({ dateKey, isToday, tasks, onOpenTask, onCreateBlock }: AgendaColumnProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!isToday) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, [isToday]);

  function minutesFromClientY(clientY: number): number {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return clampMinutes(snapMinutes(pxToMinutes(clientY - rect.top)));
  }

  function handleSurfaceMouseDown(e: ReactMouseEvent) {
    if (e.button !== 0 || pendingCreate) return;
    const start = minutesFromClientY(e.clientY);
    setDragPreview({ start, current: start });

    function handleMove(ev: globalThis.MouseEvent) {
      setDragPreview({ start, current: minutesFromClientY(ev.clientY) });
    }
    function handleUp(ev: globalThis.MouseEvent) {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      const current = minutesFromClientY(ev.clientY);
      const lo = Math.min(start, current);
      const hi = Math.max(start, current);
      setDragPreview(null);
      const duration = hi - lo >= SNAP_MINUTES ? hi - lo : DEFAULT_DURATION_MINUTES;
      setPendingCreate({ start: lo, duration });
    }
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  const blocks = layoutTimedBlocks(
    tasks.map((task) => ({
      item: task,
      startTime: task.startTime!,
      durationMinutes: task.durationMinutes ?? DEFAULT_DURATION_MINUTES,
    })),
  );

  const previewTop = dragPreview ? minutesToPx(Math.min(dragPreview.start, dragPreview.current)) : 0;
  const previewHeight = dragPreview
    ? Math.max(minutesToPx(Math.abs(dragPreview.current - dragPreview.start)), 4)
    : 0;

  return (
    <div
      ref={surfaceRef}
      className="cerne-agenda-column"
      style={{ height: 24 * HOUR_HEIGHT }}
      onMouseDown={handleSurfaceMouseDown}
    >
      {isToday && (
        <div className="cerne-agenda-column__now-line" style={{ top: minutesToPx(nowMinutes()) }} />
      )}

      {dragPreview && (
        <div
          className="cerne-agenda-column__drag-preview"
          style={{ top: previewTop, height: previewHeight }}
        />
      )}

      {blocks.map(({ item: task, top, height, left, width }) => (
        <button
          key={task.id}
          type="button"
          className={`cerne-agenda-block${task.status === "completed" ? " cerne-agenda-block--done" : ""}`}
          style={{ top, height, left: `${left}%`, width: `${width}%` }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onOpenTask(task)}
        >
          <span className="cerne-agenda-block__title">{task.title}</span>
          {height > 30 && task.startTime && (
            <span className="cerne-agenda-block__time">{task.startTime}</span>
          )}
        </button>
      ))}

      {pendingCreate && (
        <AgendaQuickCreate
          startMinutes={pendingCreate.start}
          durationMinutes={pendingCreate.duration}
          onConfirm={(title) => {
            onCreateBlock(dateKey, pendingCreate.start, pendingCreate.duration, title);
            setPendingCreate(null);
          }}
          onCancel={() => setPendingCreate(null)}
        />
      )}
    </div>
  );
}
