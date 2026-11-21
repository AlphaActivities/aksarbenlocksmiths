export const tones = {
  silent: "Silent",
  brass: "Brass Signal",
  amber: "Amber Pulse",
  steel: "Steel Chime",
} as const;
type Tone = keyof typeof tones;
export type SoundCategory = "inquiry" | "urgent" | "staff";
const defaults: Record<SoundCategory, Tone> = {
  inquiry: "silent", urgent: "silent", staff: "silent",
};
let audio: AudioContext | undefined;

export function soundChoices(user: string) {
  const choices = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(`c1-sounds:${user}`) ?? "null");
    for (const category of Object.keys(defaults) as SoundCategory[]) {
      const tone = saved?.[category];
      if (Object.prototype.hasOwnProperty.call(tones, tone)) choices[category] = tone;
    }
  } catch { /* Storage may be unavailable. */ }
  return choices;
}

export function saveSoundChoices(user: string, choices: typeof defaults) {
  try {
    localStorage.setItem(`c1-sounds:${user}`, JSON.stringify(choices));
    return true;
  } catch {
    return false;
  }
}

export async function playTone(tone: Tone, preview = false) {
  try {
    if (preview && audio?.state !== "running") {
      audio ??= new AudioContext();
      await audio.resume();
    }
    if (tone === "silent" || !audio || audio.state !== "running") return;
    const context = audio;
    const pitches = { brass: [523, 784], amber: [392, 523, 659], steel: [659, 587] };
    pitches[tone].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.13;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.23);
    });
  } catch { /* Browser audio support and autoplay policies vary. */ }
}
