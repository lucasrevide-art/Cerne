import type { VoiceTaskContext, VoiceTaskDraft } from "./voiceContract";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o áudio gravado."));
    reader.readAsDataURL(blob);
  });
}

/** Manda o áudio gravado pra api/voice-task (que fala com a Gemini) e volta com o rascunho da tarefa. */
export async function requestVoiceTaskDraft(
  audioBlob: Blob,
  context: VoiceTaskContext,
): Promise<VoiceTaskDraft> {
  const audioBase64 = await blobToBase64(audioBlob);
  const res = await fetch("/api/voice-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType: audioBlob.type, context }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Falha ao processar o áudio (${res.status}).`);
  }

  return (await res.json()) as VoiceTaskDraft;
}
