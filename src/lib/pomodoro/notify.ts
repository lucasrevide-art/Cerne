/** Aviso sonoro + notificação do sistema quando um ciclo do Pomodoro termina. */

export function requestNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function notifyPhaseComplete(message: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Cerne", { body: message, tag: "cerne-pomodoro" });
  }
  playChime();
}

/** Dois tons curtos sintetizados via Web Audio — sem depender de um asset de áudio. */
export function playChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.22;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    window.setTimeout(() => ctx.close(), 1200);
  } catch {
    // Áudio indisponível (ex.: autoplay bloqueado) — a notificação do sistema já basta.
  }
}
