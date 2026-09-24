/** Geometria e conversões de horário usadas pela grade de horas da Agenda. */

export const HOUR_HEIGHT = 56;
export const MINUTES_PER_DAY = 24 * 60;
export const SNAP_MINUTES = 15;
export const DEFAULT_DURATION_MINUTES = 30;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY, minutes));
  const h = Math.min(23, Math.floor(clamped / 60));
  const m = Math.round(clamped % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function snapMinutes(minutes: number, step = SNAP_MINUTES): number {
  return Math.round(minutes / step) * step;
}

export function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function pxToMinutes(px: number): number {
  return (px / HOUR_HEIGHT) * 60;
}

export function clampMinutes(minutes: number): number {
  return Math.max(0, Math.min(MINUTES_PER_DAY - SNAP_MINUTES, minutes));
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatTimeRange(startTime: string, durationMinutes: number): string {
  const end = minutesToTime(timeToMinutes(startTime) + durationMinutes);
  return `${startTime}–${end}`;
}

export function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export interface TimedBlock<T> {
  item: T;
  startTime: string;
  durationMinutes: number;
}

export interface PositionedBlock<T> {
  item: T;
  top: number;
  height: number;
  /** Percentual (0–100) — blocos que se sobrepõem no tempo dividem a largura da coluna. */
  left: number;
  width: number;
}

/**
 * Posiciona blocos de tempo numa coluna de 24h, dando colunas lado a lado
 * pra quem se sobrepõe (algoritmo guloso — não precisa ser ótimo, só legível).
 */
export function layoutTimedBlocks<T>(blocks: TimedBlock<T>[]): PositionedBlock<T>[] {
  const items = blocks
    .map((block) => {
      const start = timeToMinutes(block.startTime);
      return { block, start, end: start + Math.max(block.durationMinutes, SNAP_MINUTES) };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: PositionedBlock<T>[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -Infinity;

  function flushCluster() {
    if (cluster.length === 0) return;
    const columnEnds: number[] = [];
    const columnOf: number[] = [];
    for (const entry of cluster) {
      let col = columnEnds.findIndex((end) => end <= entry.start);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(entry.end);
      } else {
        columnEnds[col] = entry.end;
      }
      columnOf.push(col);
    }
    const columns = columnEnds.length;
    cluster.forEach((entry, i) => {
      result.push({
        item: entry.block.item,
        top: minutesToPx(entry.start),
        height: Math.max(minutesToPx(entry.end - entry.start), 18),
        left: (columnOf[i] / columns) * 100,
        width: (1 / columns) * 100,
      });
    });
    cluster = [];
    clusterEnd = -Infinity;
  }

  for (const entry of items) {
    if (cluster.length === 0 || entry.start < clusterEnd) {
      cluster.push(entry);
      clusterEnd = Math.max(clusterEnd, entry.end);
    } else {
      flushCluster();
      cluster.push(entry);
      clusterEnd = entry.end;
    }
  }
  flushCluster();

  return result;
}
