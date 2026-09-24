/** Formata uma data no calendário local, evitando deslocamentos causados por UTC. */
export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function tomorrowDateKey(date = new Date()): string {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return localDateKey(tomorrow);
}

export function dateFromKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Soma (ou subtrai, com dias negativos) dias a uma data no formato YYYY-MM-DD. */
export function addDays(dateKey: string, days: number): string {
  const date = dateFromKey(dateKey) ?? new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

/** Início da semana (domingo) que contém a data — usado pela view Agenda. */
export function startOfWeekKey(dateKey: string): string {
  const date = dateFromKey(dateKey) ?? new Date();
  return addDays(dateKey, -date.getDay());
}

/** Rótulo curto e humano para datas persistidas no formato YYYY-MM-DD. */
export function friendlyDateKey(dateKey: string, reference = new Date()): string {
  const date = dateFromKey(dateKey);
  if (!date) return dateKey;

  const today = localDateKey(reference);
  if (dateKey === today) return "Hoje";
  if (dateKey === tomorrowDateKey(reference)) return "Amanhã";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== reference.getFullYear() ? { year: "numeric" } : {}),
  })
    .format(date)
    .replace(" de ", " ")
    .replace(/\.$/, "");
}
