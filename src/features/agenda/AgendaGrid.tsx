import { useEffect, useRef } from "react";
import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { dateFromKey } from "../../lib/date/localDate";
import { AgendaColumn } from "./AgendaColumn";
import { HOUR_HEIGHT, formatHourLabel, minutesToPx, nowMinutes } from "./agendaTime";
import "./AgendaGrid.css";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const VISIBLE_STATUSES = new Set<Task["status"]>(["open", "completed"]);

interface AgendaGridProps {
  dates: string[];
  todayKey: string;
  onOpenTask: (task: Task) => void;
  onCreateBlock: (dateKey: string, startMinutes: number, durationMinutes: number, title: string) => void;
}

export function AgendaGrid({ dates, todayKey, onOpenTask, onCreateBlock }: AgendaGridProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrolledOnceRef = useRef(false);

  useEffect(() => {
    if (scrolledOnceRef.current || !bodyRef.current) return;
    scrolledOnceRef.current = true;
    bodyRef.current.scrollTop = Math.max(0, minutesToPx(nowMinutes() - 90));
  }, []);

  const dateSet = new Set(dates);
  const relevant = tasks.filter(
    (t) => VISIBLE_STATUSES.has(t.status) && t.when === "date" && t.whenDate && dateSet.has(t.whenDate),
  );
  const timedByDate = new Map<string, Task[]>();
  const allDayByDate = new Map<string, Task[]>();
  for (const task of relevant) {
    const bucket = task.startTime ? timedByDate : allDayByDate;
    const list = bucket.get(task.whenDate!) ?? [];
    list.push(task);
    bucket.set(task.whenDate!, list);
  }
  const hasAllDay = allDayByDate.size > 0;

  return (
    <div className="cerne-agenda-grid">
      <div className="cerne-agenda-grid__header">
        <div className="cerne-agenda-grid__gutter-spacer" />
        {dates.map((dateKey) => {
          const date = dateFromKey(dateKey);
          const isToday = dateKey === todayKey;
          return (
            <div
              key={dateKey}
              className={`cerne-agenda-grid__header-col${isToday ? " cerne-agenda-grid__header-col--today" : ""}`}
            >
              <span className="cerne-agenda-grid__header-weekday">
                {date ? WEEKDAY_SHORT[date.getDay()] : ""}
              </span>
              <span className="cerne-agenda-grid__header-day">{date ? date.getDate() : ""}</span>
            </div>
          );
        })}
      </div>

      {hasAllDay && (
        <div className="cerne-agenda-grid__allday">
          <div className="cerne-agenda-grid__gutter-spacer" />
          {dates.map((dateKey) => (
            <div key={dateKey} className="cerne-agenda-grid__allday-col">
              {(allDayByDate.get(dateKey) ?? []).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={`cerne-agenda-grid__allday-chip${
                    task.status === "completed" ? " cerne-agenda-grid__allday-chip--done" : ""
                  }`}
                  onClick={() => onOpenTask(task)}
                >
                  {task.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="cerne-agenda-grid__body" ref={bodyRef}>
        <div className="cerne-agenda-grid__gutter" style={{ height: 24 * HOUR_HEIGHT }}>
          {HOURS.map((hour) => (
            <div key={hour} className="cerne-agenda-grid__hour-label" style={{ top: minutesToPx(hour * 60) }}>
              {hour > 0 && formatHourLabel(hour)}
            </div>
          ))}
        </div>
        <div className="cerne-agenda-grid__columns">
          {dates.map((dateKey) => (
            <AgendaColumn
              key={dateKey}
              dateKey={dateKey}
              isToday={dateKey === todayKey}
              tasks={timedByDate.get(dateKey) ?? []}
              onOpenTask={onOpenTask}
              onCreateBlock={onCreateBlock}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
