let audioCtx: AudioContext | null = null;

function ensureCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function beep(frequency: number, durationMs: number, type: OscillatorType = "sine", gain = 0.05) {
  const ctx = ensureCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function playCorrect() {
  // 可愛上揚的兩段音
  beep(660, 120, "triangle");
  setTimeout(() => beep(880, 120, "triangle"), 110);
}

export function playWrong() {
  // 輕微低落音
  beep(220, 160, "sawtooth", 0.04);
}

export function playFinish() {
  // 小和弦（分解）慶祝
  beep(523.25, 120, "square", 0.06); // C5
  setTimeout(() => beep(659.25, 120, "square", 0.06), 110); // E5
  setTimeout(() => beep(783.99, 180, "square", 0.06), 220); // G5
}


