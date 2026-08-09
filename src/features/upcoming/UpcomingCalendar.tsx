import { useState } from "react";
import { ChevronRightIcon } from "../../components/icons";
import "./UpcomingCalendar.css";

const WEEKDAY_ABBR = ["D", "S", "T", "Q", "Q", "S", "S"];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface UpcomingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  countsByDate: Map<string, number>;
}

export function UpcomingCalendar({
  selectedDate,
  onSelectDate,
  countsByDate,
}: UpcomingCalendarProps) {
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));

  const todayISO = todayStr();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = capitalize(
    viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="cerne-upcoming-calendar">
      <div className="cerne-upcoming-calendar__header">
        <button
          type="button"
          className="cerne-upcoming-calendar__nav"
          aria-label="Mês anterior"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          <ChevronRightIcon width={14} height={14} className="cerne-upcoming-calendar__nav-icon--prev" />
        </button>
        <span className="cerne-upcoming-calendar__label">{monthLabel}</span>
        <button
          type="button"
          className="cerne-upcoming-calendar__nav"
          aria-label="Próximo mês"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          <ChevronRightIcon width={14} height={14} />
        </button>
        <button
          type="button"
          className="cerne-upcoming-calendar__today-btn"
          onClick={() => {
            setViewDate(startOfMonth(new Date()));
            onSelectDate(null);
          }}
        >
          Hoje
        </button>
      </div>

      <div className="cerne-upcoming-calendar__weekdays">
        {WEEKDAY_ABBR.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      <div className="cerne-upcoming-calendar__grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const iso = toISO(new Date(year, month, day));
          const isToday = iso === todayISO;
          const isSelected = iso === selectedDate;
          const count = countsByDate.get(iso) ?? 0;
          return (
            <button
              key={iso}
              type="button"
              className={`cerne-upcoming-calendar__day${
                isToday ? " cerne-upcoming-calendar__day--today" : ""
              }${isSelected ? " cerne-upcoming-calendar__day--selected" : ""}`}
              onClick={() => onSelectDate(isSelected ? null : iso)}
            >
              <span>{day}</span>
              {count > 0 && <span className="cerne-upcoming-calendar__dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
