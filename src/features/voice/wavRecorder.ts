/**
 * Grava o microfone e devolve um WAV (PCM 16-bit, mono) pronto pra Gemini —
 * a API documenta oficialmente wav/mp3/aiff/aac/ogg/flac como entrada de
 * áudio, mas NÃO webm, que é o único formato que o MediaRecorder do Chrome
 * produz nativamente. Por isso a captura usa Web Audio API direto (em vez
 * de MediaRecorder) e codifica o WAV manualmente aqui.
 */

const TARGET_SAMPLE_RATE = 16_000;
const BUFFER_SIZE = 4096;

export interface WavRecorder {
  /** Para a captura e devolve o áudio gravado como um Blob "audio/wav". */
  stop: () => Promise<Blob>;
  /** Interrompe e descarta a gravação, sem gerar nada. */
  cancel: () => void;
}

export async function startWavRecording(): Promise<WavRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // O sampleRate pedido aqui é só uma preferência — nem todo navegador honra
  // pra um MediaStreamSource; o header do WAV usa context.sampleRate real,
  // então o arquivo fica correto de qualquer forma.
  const context = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  const source = context.createMediaStreamSource(stream);
  // ScriptProcessorNode é oficialmente "deprecated" em favor de AudioWorklet,
  // mas continua suportado em todo navegador relevante e evita ter que
  // hospedar um módulo de worklet separado só pra isso.
  const processor = context.createScriptProcessor(BUFFER_SIZE, 1, 1);
  const silentGain = context.createGain();
  silentGain.gain.value = 0;

  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };

  // O processor só dispara onaudioprocess se estiver conectado a um destino;
  // passa por um ganho zerado pra não tocar o próprio microfone nas caixas.
  source.connect(processor);
  processor.connect(silentGain);
  silentGain.connect(context.destination);

  function teardown() {
    processor.disconnect();
    source.disconnect();
    silentGain.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
  }

  return {
    stop: async () => {
      teardown();
      const sampleRate = context.sampleRate;
      const length = chunks.reduce((sum, c) => sum + c.length, 0);
      const merged = new Float32Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return encodeWav(merged, sampleRate);
    },
    cancel: teardown,
  };
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, text: string) {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (mono, 16-bit)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}
