import timing from "./timing.json";

export const FPS = 30;
const PAD = 12; // fotogramas de respiro tras cada frase

export type Word = { t: number; d: number; w: string };
export type Scene = { id: string; texto: string; dur: number; words: Word[]; from: number; frames: number };

let acc = 8; // pequeña entrada antes de la primera frase
export const scenes: Scene[] = (timing as Omit<Scene, "from" | "frames">[]).map((s) => {
  const frames = Math.ceil(s.dur * FPS) + PAD;
  const sc = { ...s, from: acc, frames };
  acc += frames;
  return sc;
});
export const totalFrames = acc + 45; // cierre con el logo

export const sceneAt = (frame: number) => {
  let cur = scenes[0];
  for (const s of scenes) if (frame >= s.from) cur = s;
  return cur;
};
