import type { Recurrence, RecurrenceType } from "../../types";

const WEEKDAY_ABBR = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Próxima data (YYYY-MM-DD) a partir de uma data-base e uma regra de recorrência. */
export function computeNextDate(
  fromDate: string,
  rule: { type: RecurrenceType; interval: number; weekdays: number[] },
): string {
  const base = toDate(fromDate);
  const interval = Math.max(1, rule.interval);

  if (rule.type === "daily") {
    base.setDate(base.getDate() + interval);
    return toISO(base);
  }

  if (rule.type === "monthly") {
    base.setMonth(base.getMonth() + interval);
    return toISO(base);
  }

  if (rule.type === "custom" && rule.weekdays.length > 0) {
    for (let offset = 1; offset <= 7 * interval + 7; offset++) {
      const candidate = new Date(base);
      candidate.setDate(base.getDate() + offset);
      if (rule.weekdays.includes(candidate.getDay())) {
        return toISO(candidate);
      }
    }
  }

  // weekly (ou custom sem dias específicos escolhidos)
  base.setDate(base.getDate() + 7 * interval);
  return toISO(base);
}

/** Texto curto pra mostrar na linha da tarefa (ex.: "A cada 2 dias", "Seg, Qua, Sex"). */
export function describeRecurrence(rule: Pick<Recurrence, "type" | "interval" | "weekdays">): string {
  if (rule.type === "custom" && rule.weekdays.length > 0) {
    return [...rule.weekdays]
      .sort((a, b) => a - b)
      .map((d) => WEEKDAY_ABBR[d])
      .join(", ");
  }
  const unit = { daily: "dia", weekly: "semana", monthly: "mês", custom: "semana" }[rule.type];
  const unitPlural = { daily: "dias", weekly: "semanas", monthly: "meses", custom: "semanas" }[rule.type];
  return rule.interval === 1 ? `A cada ${unit}` : `A cada ${rule.interval} ${unitPlural}`;
}
