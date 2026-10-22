import type { TaskType } from "../../types";

/**
 * Contrato entre o widget de voz (cliente) e a serverless function
 * (api/voice-task.ts) — importado dos dois lados pra não duplicar os tipos
 * na borda do request/response.
 */

export interface VoiceTaskContext {
  /** Data de hoje (YYYY-MM-DD), pra resolver datas relativas ditas em voz. */
  today: string;
  areas: { id: string; name: string }[];
  projects: { id: string; name: string; areaId: string | null }[];
  /** Tags já existentes — geralmente nomes de clientes ou rótulos curtos. */
  tags: { id: string; name: string }[];
}

export interface VoiceTaskDraft {
  title: string;
  notes: string;
  whenDate: string | null;
  startTime: string | null;
  durationMinutes: number | null;
  areaId: string | null;
  projectId: string | null;
  tagIds: string[];
  /** Nome de cliente/rótulo mencionado que não bateu com nenhuma tag existente. */
  suggestedNewTag: string | null;
  type: TaskType;
  amount: number | null;
  category: string | null;
}
