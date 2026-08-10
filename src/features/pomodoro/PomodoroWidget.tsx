import { useEffect, useRef, useState } from "react";
import { usePomodoroStore, POMODORO_PRESETS } from "../../store/pomodoroStore";
import { requestNotificationPermission, notifyPhaseComplete } from "../../lib/pomodoro/notify";
import { Button } from "../../components/Button";
import { TimerIcon, PlayIcon, PauseIcon, StopIcon, SkipIcon } from "../../components/icons";
import "./PomodoroWidget.css";

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Widget flutuante, independente das tarefas — fica visível em qualquer tela do app. */
export function PomodoroWidget() {
  const status = usePomodoroStore((s) => s.status);
  const phase = usePomodoroStore((s) => s.phase);
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);
  const breakMinutes = usePomodoroStore((s) => s.breakMinutes);
  const endAt = usePomodoroStore((s) => s.endAt);
  const remainingMsAtPause = usePomodoroStore((s) => s.remainingMsAtPause);
  const cyclesCompleted = usePomodoroStore((s) => s.cyclesCompleted);
  const isPanelOpen = usePomodoroStore((s) => s.isPanelOpen);
  const soundEnabled = usePomodoroStore((s) => s.soundEnabled);
  const setDurations = usePomodoroStore((s) => s.setDurations);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const resume = usePomodoroStore((s) => s.resume);
  const reset = usePomodoroStore((s) => s.reset);
  const skip = usePomodoroStore((s) => s.skip);
  const completePhase = usePomodoroStore((s) => s.completePhase);
  const togglePanel = usePomodoroStore((s) => s.togglePanel);
  const closePanel = usePomodoroStore((s) => s.closePanel);
  const toggleSound = usePomodoroStore((s) => s.toggleSound);

  const [, forceTick] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const [customFocus, setCustomFocus] = useState(String(focusMinutes));
  const [customBreak, setCustomBreak] = useState(String(breakMinutes));

  useEffect(() => {
    setCustomFocus(String(focusMinutes));
    setCustomBreak(String(breakMinutes));
  }, [focusMinutes, breakMinutes]);

  useEffect(() => {
    if (status !== "running") return;
    const interval = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "running" || endAt === null) return;
    if (endAt - Date.now() > 0) return;
    const message =
      phase === "focus" ? "Foco concluído — hora de descansar." : "Descanso concluído — vamos voltar ao foco.";
    completePhase();
    if (soundEnabled) notifyPhaseComplete(message);
  });

  useEffect(() => {
    if (!isPanelOpen) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closePanel();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isPanelOpen, closePanel]);

  const remainingMs =
    status === "running" && endAt !== null
      ? endAt - Date.now()
      : status === "paused" && remainingMsAtPause !== null
        ? remainingMsAtPause
        : (phase === "focus" ? focusMinutes : breakMinutes) * 60_000;

  function handleStart() {
    requestNotificationPermission();
    start();
  }

  function applyPreset(presetFocus: number, presetBreak: number) {
    setDurations(presetFocus, presetBreak);
    if (status === "idle") reset();
  }

  function applyCustom() {
    const focus = Math.max(1, Math.round(Number(customFocus)) || focusMinutes);
    const brk = Math.max(1, Math.round(Number(customBreak)) || breakMinutes);
    setDurations(focus, brk);
  }

  const isActive = status !== "idle";

  return (
    <div className="cerne-pomodoro" ref={rootRef}>
      {isPanelOpen && (
        <div className="cerne-pomodoro__panel" role="dialog" aria-label="Pomodoro">
          <div className="cerne-pomodoro__phase">
            {phase === "focus" ? "Foco" : "Descanso"}
            {cyclesCompleted > 0 && (
              <span className="cerne-pomodoro__cycles">· {cyclesCompleted} ciclo{cyclesCompleted > 1 ? "s" : ""}</span>
            )}
          </div>
          <div className="cerne-pomodoro__clock">{formatClock(remainingMs)}</div>

          <div className="cerne-pomodoro__controls">
            {status === "running" ? (
              <Button variant="secondary" icon={<PauseIcon width={16} height={16} />} onClick={pause}>
                Pausar
              </Button>
            ) : status === "paused" ? (
              <Button variant="primary" icon={<PlayIcon width={16} height={16} />} onClick={resume}>
                Retomar
              </Button>
            ) : (
              <Button variant="primary" icon={<PlayIcon width={16} height={16} />} onClick={handleStart}>
                Iniciar {phase === "focus" ? "foco" : "descanso"}
              </Button>
            )}
            {isActive && (
              <Button variant="ghost" icon={<StopIcon width={16} height={16} />} onClick={reset} aria-label="Zerar" />
            )}
            <Button variant="ghost" icon={<SkipIcon width={16} height={16} />} onClick={skip} aria-label="Pular etapa" />
          </div>

          <div className="cerne-pomodoro__section">
            <span className="cerne-pomodoro__label">Predefinições</span>
            <div className="cerne-pomodoro__presets">
              {POMODORO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`cerne-pomodoro__preset${
                    preset.focusMinutes === focusMinutes && preset.breakMinutes === breakMinutes
                      ? " cerne-pomodoro__preset--active"
                      : ""
                  }`}
                  onClick={() => applyPreset(preset.focusMinutes, preset.breakMinutes)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cerne-pomodoro__section">
            <span className="cerne-pomodoro__label">Personalizado (minutos)</span>
            <div className="cerne-pomodoro__custom">
              <label>
                Foco
                <input
                  type="number"
                  min={1}
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  onBlur={applyCustom}
                />
              </label>
              <label>
                Descanso
                <input
                  type="number"
                  min={1}
                  value={customBreak}
                  onChange={(e) => setCustomBreak(e.target.value)}
                  onBlur={applyCustom}
                />
              </label>
            </div>
          </div>

          <label className="cerne-pomodoro__sound">
            <input type="checkbox" checked={soundEnabled} onChange={toggleSound} />
            Avisar com som e notificação
          </label>
        </div>
      )}

      <button
        type="button"
        className={`cerne-pomodoro__trigger${isActive ? " cerne-pomodoro__trigger--active" : ""}`}
        onClick={togglePanel}
        aria-label="Pomodoro"
        aria-expanded={isPanelOpen}
      >
        <TimerIcon width={18} height={18} />
        {isActive && <span className="cerne-pomodoro__trigger-time">{formatClock(remainingMs)}</span>}
      </button>
    </div>
  );
}
