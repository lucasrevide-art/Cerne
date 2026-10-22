import { useEffect, useRef, useState } from "react";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";
import { startWavRecording, type WavRecorder } from "./wavRecorder";
import { requestVoiceTaskDraft } from "./voiceApi";
import { VoiceTaskReview } from "./VoiceTaskReview";
import { MicIcon, StopIcon } from "../../components/icons";
import type { VoiceTaskDraft } from "./voiceContract";
import "./VoiceWidget.css";

const MAX_RECORDING_MS = 30_000;

type Phase = "idle" | "recording" | "processing" | "error" | "review";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Widget flutuante: fala o que precisa, confere o rascunho, cria a tarefa — sem abrir formulário do zero. */
export function VoiceWidget() {
  const areas = useAreaStore((s) => s.areas);
  const projects = useProjectStore((s) => s.projects);
  const tags = useTagStore((s) => s.tags);

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<VoiceTaskDraft | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const recorderRef = useRef<WavRecorder | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (phase !== "recording") return;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= MAX_RECORDING_MS) void handleStop();
    }, 200);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function handleStart() {
    setErrorMessage(null);
    try {
      const recorder = await startWavRecording();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setPhase("recording");
    } catch (err) {
      setPhase("error");
      setErrorMessage(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Permissão de microfone negada — libera o acesso nas configurações do navegador."
          : "Não consegui acessar o microfone.",
      );
    }
  }

  async function handleStop() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    setPhase("processing");
    try {
      const audioBlob = await recorder.stop();
      const result = await requestVoiceTaskDraft(audioBlob, {
        today: todayKey(),
        areas: areas.map((a) => ({ id: a.id, name: a.name })),
        projects: projects.map((p) => ({ id: p.id, name: p.name, areaId: p.areaId })),
        tags: tags.map((t) => ({ id: t.id, name: t.name })),
      });
      setDraft(result);
      setPhase("review");
    } catch (err) {
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "Não consegui entender o áudio.");
    }
  }

  function handleCancel() {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    setPhase("idle");
  }

  function closeReview() {
    setDraft(null);
    setPhase("idle");
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return (
    <div className="cerne-voice">
      {phase === "idle" && (
        <button
          type="button"
          className="cerne-voice__trigger"
          aria-label="Criar tarefa por voz"
          onClick={() => void handleStart()}
        >
          <MicIcon width={18} height={18} />
        </button>
      )}

      {phase === "recording" && (
        <div className="cerne-voice__panel" role="status">
          <span className="cerne-voice__pulse" aria-hidden="true" />
          <span className="cerne-voice__timer">{elapsedSeconds}s</span>
          <button
            type="button"
            className="cerne-voice__stop"
            aria-label="Parar e criar tarefa"
            onClick={() => void handleStop()}
          >
            <StopIcon width={12} height={12} />
          </button>
          <button
            type="button"
            className="cerne-voice__cancel"
            aria-label="Cancelar gravação"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>
      )}

      {phase === "processing" && (
        <div className="cerne-voice__panel" role="status">
          <span className="cerne-voice__spinner" aria-hidden="true" />
          <span>Entendendo…</span>
        </div>
      )}

      {phase === "error" && (
        <div className="cerne-voice__panel cerne-voice__panel--error" role="alert">
          <span>{errorMessage}</span>
          <button type="button" className="cerne-voice__retry" onClick={() => setPhase("idle")}>
            Fechar
          </button>
        </div>
      )}

      {phase === "review" && draft && <VoiceTaskReview draft={draft} onClose={closeReview} />}
    </div>
  );
}
