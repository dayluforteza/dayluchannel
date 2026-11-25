import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import "./fonts";
import { scenes, totalFrames, FPS, sceneAt } from "./timeline";
import { Scene3D } from "./Scene3D";
import { C, prog } from "./util";


export { totalFrames, FPS };

const HEAD = "Montserrat, 'DejaVu Sans', sans-serif";
const BODY = "Inter, 'DejaVu Sans', sans-serif";

const LABELS: Record<string, { n?: string; t: string; c: string }> = {
  gancho: { t: "Cómo buscan ahora tus clientes", c: C.cyan },
  problema: { t: "Solo 2 o 3 nombres", c: C.red },
  tip1: { n: "01", t: "Ficha de Google completa", c: C.magenta },
  tip2: { n: "02", t: "Reseñas con detalle", c: C.gold },
  tip3: { n: "03", t: "Web propia y rápida", c: C.green },
  cta: { t: "Revisión gratis", c: C.violet },
};

/* ---------- subtítulos palabra a palabra ---------- */
const Captions: React.FC<{ f: number }> = ({ f }) => {
  const s = sceneAt(f);
  const t = (f - s.from) / FPS;
  const words = s.words.filter((w) => /[\p{L}\p{N}]/u.test(w.w));
  if (f < s.from || !words.length) return null;
  // trozos de hasta 4 palabras
  const chunks: { start: number; end: number; words: typeof words }[] = [];
  for (let i = 0; i < words.length; i += 4) {
    const w = words.slice(i, i + 4);
    chunks.push({ start: w[0].t, end: w[w.length - 1].t + w[w.length - 1].d, words: w });
  }
  let ci = chunks.findIndex((c, i) => t < (chunks[i + 1]?.start ?? Infinity));
  if (ci < 0) ci = chunks.length - 1;
  const ch = chunks[ci];
  if (t > ch.end + 0.6) return null;
  const pop = prog(f, s.from + Math.round(ch.start * FPS) - 2, s.from + Math.round(ch.start * FPS) + 5);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1295, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 22px", transform: `scale(${0.88 + 0.12 * pop}) translateY(${(1 - pop) * 18}px)`, opacity: pop }}>
      {ch.words.map((w, i) => {
        const active = t >= w.t && t < w.t + w.d + 0.08;
        const said = t >= w.t;
        return (
          <span
            key={i}
            style={{
              fontFamily: HEAD,
              fontWeight: 900,
              fontSize: 86,
              lineHeight: 1.08,
              letterSpacing: -1,
              color: active ? C.cyan : said ? C.white : "rgba(244,246,255,.55)",
              textShadow: active ? `0 0 28px ${C.cyan}, 0 6px 0 rgba(0,0,0,.45)` : "0 6px 0 rgba(0,0,0,.45), 0 0 30px rgba(0,0,0,.6)",
              transform: active ? "translateY(-4px) scale(1.06)" : "none",
              display: "inline-block",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- etiqueta de escena ---------- */
const SceneLabel: React.FC<{ f: number }> = ({ f }) => {
  return (
    <>
      {scenes.map((s) => {
        const L = LABELS[s.id];
        const k = Math.min(prog(f, s.from + 2, s.from + 16), 1 - prog(f, s.from + s.frames - 10, s.from + s.frames));
        if (k <= 0.001) return null;
        return (
          <div key={s.id} style={{ position: "absolute", left: 0, right: 0, top: 215, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * -30}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 34px", borderRadius: 999, background: "rgba(8,10,24,.62)", border: `2px solid ${L.c}`, boxShadow: `0 0 40px ${L.c}55, inset 0 0 24px ${L.c}22`, backdropFilter: "blur(8px)" }}>
              {L.n && <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 52, color: L.c, textShadow: `0 0 20px ${L.c}` }}>{L.n}</span>}
              <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: 0.5 }}>{L.t}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------- llamada a la acción ---------- */
const CTA: React.FC<{ f: number }> = ({ f }) => {
  const s = scenes.find((x) => x.id === "cta")!;
  const k = prog(f, s.from + 40, s.from + 58);
  if (k <= 0) return null;
  const pulse = 1 + 0.035 * Math.sin((f - s.from) / 4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1085, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${(0.8 + 0.2 * k) * pulse})` }}>
      <div style={{ padding: "26px 60px", borderRadius: 999, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet} 55%, ${C.magenta})`, boxShadow: `0 0 70px ${C.violet}aa`, fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: "#fff" }}>
        Comenta «IA» ⤵
      </div>
    </div>
  );
};

/* ---------- cierre ---------- */
const Outro: React.FC<{ f: number }> = ({ f }) => {
  const last = scenes[scenes.length - 1];
  const start = last.from + last.frames - 6;
  const k = prog(f, start, start + 16);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ background: `rgba(5,6,15,${0.82 * k})`, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 26, opacity: k }}>
      <div style={{ width: 170, height: 170, borderRadius: 44, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, boxShadow: `0 0 80px ${C.violet}`, fontFamily: HEAD, fontWeight: 900, fontSize: 82, color: "#fff", transform: `scale(${0.7 + 0.3 * k})` }}>DF</div>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 70, color: C.white }}>Daylu Forteza</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 40, color: "#aab3d8" }}>Webs e IA para negocios · dayluforteza.es</div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = f / totalFrames;
  const flash = scenes.reduce((a, s) => a + Math.max(0, 1 - Math.abs(f - s.from) / 5) * 0.12, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, position: [0, 1.25, 10], near: 0.1, far: 100 }} gl={{ antialias: true }}>
        <Scene3D />
      </ThreeCanvas>

      {/* acabado: viñeta, degradados para leer y grano */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,15,.75) 0%, rgba(5,6,15,0) 16%, rgba(5,6,15,0) 62%, rgba(5,6,15,.85) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* marca */}
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "rgba(230,235,255,.8)" }}>
          DAYLU FORTEZA <span style={{ color: C.cyan }}>·</span> IA PARA NEGOCIOS
        </div>
      </div>

      <SceneLabel f={f} />
      <Captions f={f} />
      <CTA f={f} />
      <Outro f={f} />

      {/* barra de progreso */}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 120, height: 8, borderRadius: 8, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.magenta})`, boxShadow: `0 0 16px ${C.violet}` }} />
      </div>

      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames + 10}>
          <Audio src={staticFile(`${s.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const _unused = interpolate;
