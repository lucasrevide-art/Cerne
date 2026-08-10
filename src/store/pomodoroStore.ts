import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Timer Pomodoro — independente de tarefas, é estado de UI/produtividade
 * geral. Guarda o horário absoluto de término (endAt) em vez de só contar
 * segundos: assim o tempo restante continua correto mesmo se a aba ficar em
 * segundo plano (onde setInterval é sujeito a throttling) ou se a página
 * for recarregada no meio de um ciclo.
 */

export type PomodoroPhase = "focus" | "break";
export type PomodoroStatus = "idle" | "running" | "paused";

export interface PomodoroPreset {
  id: string;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
}

// Pausa proporcional ao bloco de foco (~15-20%), técnica clássica de 25/5
// incluída como opção mais curta — equilíbrio recomendado entre blocos
// longos de atenção e descanso suficiente para evitar fadiga.
export const POMODORO_PRESETS: PomodoroPreset[] = [
  { id: "classic", label: "Clássico", focusMinutes: 25, breakMinutes: 5 },
  { id: "30min", label: "30 min", focusMinutes: 30, breakMinutes: 5 },
  { id: "1h", label: "1 hora", focusMinutes: 60, breakMinutes: 10 },
  { id: "2h", label: "2 horas", focusMinutes: 120, breakMinutes: 20 },
];

interface PomodoroState {
  status: PomodoroStatus;
  phase: PomodoroPhase;
  focusMinutes: number;
  breakMinutes: number;
  endAt: number | null;
  remainingMsAtPause: number | null;
  cyclesCompleted: number;
  isPanelOpen: boolean;
  soundEnabled: boolean;

  setDurations: (focusMinutes: number, breakMinutes: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  completePhase: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  toggleSound: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      status: "idle",
      phase: "focus",
      focusMinutes: 30,
      breakMinutes: 5,
      endAt: null,
      remainingMsAtPause: null,
      cyclesCompleted: 0,
      isPanelOpen: false,
      soundEnabled: true,

      setDurations: (focusMinutes, breakMinutes) => {
        set({ focusMinutes, breakMinutes });
      },

      start: () => {
        const { phase, focusMinutes, breakMinutes } = get();
        const minutes = phase === "focus" ? focusMinutes : breakMinutes;
        set({ status: "running", endAt: Date.now() + minutes * 60_000, remainingMsAtPause: null });
      },

      pause: () => {
        const { status, endAt } = get();
        if (status !== "running" || endAt === null) return;
        set({ status: "paused", remainingMsAtPause: Math.max(0, endAt - Date.now()), endAt: null });
      },

      resume: () => {
        const { status, remainingMsAtPause } = get();
        if (status !== "paused" || remainingMsAtPause === null) return;
        set({ status: "running", endAt: Date.now() + remainingMsAtPause, remainingMsAtPause: null });
      },

      reset: () => {
        set({ status: "idle", phase: "focus", endAt: null, remainingMsAtPause: null });
      },

      skip: () => {
        const { phase, cyclesCompleted } = get();
        const nextPhase: PomodoroPhase = phase === "focus" ? "break" : "focus";
        set({
          phase: nextPhase,
          status: "idle",
          endAt: null,
          remainingMsAtPause: null,
          cyclesCompleted: phase === "focus" ? cyclesCompleted + 1 : cyclesCompleted,
        });
      },

      completePhase: () => {
        const { phase, cyclesCompleted } = get();
        const nextPhase: PomodoroPhase = phase === "focus" ? "break" : "focus";
        set({
          phase: nextPhase,
          status: "idle",
          endAt: null,
          remainingMsAtPause: null,
          cyclesCompleted: phase === "focus" ? cyclesCompleted + 1 : cyclesCompleted,
          isPanelOpen: true,
        });
      },

      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: "cerne-pomodoro",
      partialize: (state) => ({
        status: state.status,
        phase: state.phase,
        focusMinutes: state.focusMinutes,
        breakMinutes: state.breakMinutes,
        endAt: state.endAt,
        remainingMsAtPause: state.remainingMsAtPause,
        cyclesCompleted: state.cyclesCompleted,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
