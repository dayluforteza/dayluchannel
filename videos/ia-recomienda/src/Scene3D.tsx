import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontJson from "three/examples/fonts/helvetiker_bold.typeface.json";
import { scenes, totalFrames } from "./timeline";
import { C, prog, sceneVis, roundedRect, starShape, useCanvasTexture, rr, wrap, clamp01 } from "./util";

const S = Object.fromEntries(scenes.map((s) => [s.id, s]));
const FONT = "Inter, 'DejaVu Sans', sans-serif";
const FONT_H = "Montserrat, 'DejaVu Sans', sans-serif";

/* ---------- semilla fija para que cada render sea idéntico ---------- */
function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* =========================== FONDO =========================== */
const Background: React.FC<{ f: number }> = ({ f }) => {
  const pts = useMemo(() => {
    const r = rand(7);
    const a = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      a[i * 3] = (r() - 0.5) * 26;
      a[i * 3 + 1] = r() * 14 - 2;
      a[i * 3 + 2] = -r() * 26 + 4;
    }
    return a;
  }, []);
  const glow = useCanvasTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
  const gridZ = (f * 0.035) % 1;
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 7, 26]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 5, 6]} intensity={1.4} />
      <pointLight position={[-3.5, 3, 3]} color={C.cyan} intensity={60} distance={18} />
      <pointLight position={[3.5, 2, 2.5]} color={C.magenta} intensity={45} distance={16} />
      <pointLight position={[0, -1, 4]} color={C.violet} intensity={25} distance={12} />
      <group position={[0, -1.7, gridZ]}>
        <gridHelper args={[60, 60, C.violet, "#1d2350"]} />
      </group>
      <points rotation={[0, f * 0.0012, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#9fb4ff" transparent opacity={0.7} depthWrite={false} />
      </points>
      {[
        { p: [-3.2, 4.5, -9], c: C.cyan, s: 9 },
        { p: [3.5, 1.5, -10], c: C.magenta, s: 10 },
        { p: [0, 7, -14], c: C.violet, s: 14 },
      ].map((o, i) => (
        <sprite key={i} position={o.p as [number, number, number]} scale={[o.s, o.s, 1]}>
          <spriteMaterial map={glow} color={o.c} transparent opacity={0.28 + 0.06 * Math.sin(f / 25 + i)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
};

/* =========================== CÁMARA =========================== */
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  // empujes de cámara en cada cambio de escena
  const keys = scenes.map((s) => s.from);
  const push = keys.reduce((acc, k) => acc + prog(f, k, k + 24) * 0.0, 0);
  const z = interpolate(f, [0, 40], [10.5, 8.2], { extrapolateRight: "clamp" }) - push;
  const x = Math.sin(f / 70) * 0.35;
  const y = 1.25 + Math.sin(f / 95) * 0.12;
  camera.position.set(x, y, z);
  camera.lookAt(0, 1.05, 0);
  return null;
};

/* =========================== ESCENA 1-2: MÓVIL CON IA =========================== */
const BUSINESSES = [
  ["Fontanería Centro", "4,9"],
  ["Agua Express", "4,8"],
  ["Reparaciones Sol", "4,7"],
];

const Phone: React.FC<{ f: number }> = ({ f }) => {
  const g = S.gancho, p = S.problema;
  const lf = f - g.from;
  const vis = Math.min(prog(f, g.from - 6, g.from + 16), 1 - prog(f, p.from + 10, p.from + 30));
  const geo = useMemo(() => {
    const e = new THREE.ExtrudeGeometry(roundedRect(1.72, 3.44, 0.26), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 5, curveSegments: 16 });
    e.translate(0, 0, -0.07);
    return e;
  }, []);
  const q = "¿Qué fontanero me recomiendas en Málaga?";
  const typed = Math.floor(clamp01((lf - 18) / 55) * q.length);
  const tex = useCanvasTexture(640, 1280, (ctx) => {
    const bg = ctx.createLinearGradient(0, 0, 0, 1280);
    bg.addColorStop(0, "#0d1024");
    bg.addColorStop(1, "#151036");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 640, 1280);
    // barra superior
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = `600 26px ${FONT}`;
    ctx.fillText("9:41", 40, 56);
    ctx.fillStyle = C.white;
    ctx.font = `800 34px ${FONT_H}`;
    ctx.fillText("Asistente IA", 40, 130);
    const dotG = ctx.createLinearGradient(560, 100, 600, 140);
    dotG.addColorStop(0, C.cyan);
    dotG.addColorStop(1, C.violet);
    ctx.fillStyle = dotG;
    ctx.beginPath();
    ctx.arc(585, 118, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(40, 160, 560, 2);
    // pregunta del usuario
    if (typed > 0) {
      ctx.font = `600 30px ${FONT}`;
      const lines = wrap(ctx, q.slice(0, typed), 400);
      const h = lines.length * 42 + 36;
      const grad = ctx.createLinearGradient(170, 210, 600, 210 + h);
      grad.addColorStop(0, "#3a5bff");
      grad.addColorStop(1, "#8b5cff");
      ctx.fillStyle = grad;
      rr(ctx, 600 - 440, 210, 440, h, 28);
      ctx.fill();
      ctx.fillStyle = "#fff";
      lines.forEach((l, i) => ctx.fillText(l, 600 - 440 + 24, 210 + 48 + i * 42));
    }
    // escribiendo…
    const answerStart = 92;
    if (lf > 76 && lf < answerStart) {
      ctx.fillStyle = "rgba(255,255,255,.1)";
      rr(ctx, 40, 380, 130, 64, 32);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * Math.abs(Math.sin(lf / 5 + i))})`;
        ctx.beginPath();
        ctx.arc(80 + i * 26, 412, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // respuesta de la IA
    if (lf >= answerStart || f >= p.from) {
      const a = f >= p.from ? 99 : lf - answerStart;
      ctx.fillStyle = "rgba(255,255,255,.07)";
      rr(ctx, 40, 380, 560, 520, 30);
      ctx.fill();
      ctx.fillStyle = C.white;
      ctx.font = `700 30px ${FONT}`;
      ctx.fillText("Te recomiendo estos 3:", 72, 440);
      BUSINESSES.forEach(([n, r], i) => {
        const k = clamp01((a - 6 - i * 9) / 8);
        if (k <= 0) return;
        ctx.globalAlpha = k;
        const y = 490 + i * 130;
        ctx.fillStyle = "rgba(62,231,255,.10)";
        rr(ctx, 64, y, 512, 108, 22);
        ctx.fill();
        ctx.fillStyle = C.cyan;
        ctx.font = `900 40px ${FONT_H}`;
        ctx.fillText(String(i + 1), 92, y + 68);
        ctx.fillStyle = C.white;
        ctx.font = `700 31px ${FONT}`;
        ctx.fillText(n, 150, y + 50);
        ctx.fillStyle = C.gold;
        ctx.font = `600 27px ${FONT}`;
        ctx.fillText(`★ ${r}  ·  Abierto ahora`, 150, y + 88);
        ctx.globalAlpha = 1;
      });
    }
    // caja de texto
    ctx.fillStyle = "rgba(255,255,255,.08)";
    rr(ctx, 40, 1150, 560, 80, 40);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText("Pregunta lo que quieras…", 80, 1200);
  });
  if (vis <= 0.001) return null;
  const enter = prog(f, g.from - 6, g.from + 30);
  const toBack = prog(f, p.from - 4, p.from + 26);
  const rotY = interpolate(enter, [0, 1], [-1.1, 0]) + Math.sin(f / 40) * 0.12 + toBack * 0.5;
  return (
    <group
      position={[interpolate(toBack, [0, 1], [0, -1.6]), 1.55 + Math.sin(f / 30) * 0.06 + toBack * 0.3, interpolate(toBack, [0, 1], [0, -3])]}
      rotation={[0.06, rotY, interpolate(enter, [0, 1], [0.25, -0.03])]}
      scale={interpolate(enter, [0, 1], [0.55, 0.9]) * vis}
    >
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#14151f" metalness={0.85} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.125]}>
        <planeGeometry args={[1.58, 3.3]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>

    </group>
  );
};

/* ---------- tarjetas de resultados (escena "problema") ---------- */
const ResultCard: React.FC<{ f: number; i: number; name: string; rating: string; loser?: boolean }> = ({ f, i, name, rating, loser }) => {
  const p = S.problema;
  const lf = f - p.from;
  const tex = useCanvasTexture(900, 220, (ctx) => {
    ctx.fillStyle = loser ? "rgba(40,42,58,.92)" : "rgba(14,22,44,.92)";
    rr(ctx, 6, 6, 888, 208, 40);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = loser ? "rgba(255,77,94,.9)" : C.green;
    rr(ctx, 6, 6, 888, 208, 40);
    ctx.stroke();
    ctx.fillStyle = loser ? "#8a8ea3" : C.white;
    ctx.font = `800 62px ${FONT_H}`;
    ctx.fillText(name, 60, 105);
    ctx.font = `600 44px ${FONT}`;
    if (loser) {
      ctx.fillStyle = C.red;
      ctx.fillText("✕  No aparece", 60, 172);
    } else {
      ctx.fillStyle = C.gold;
      ctx.fillText(`★ ${rating}`, 60, 172);
      ctx.fillStyle = C.green;
      ctx.fillText("✓ Recomendado", 330, 172);
    }
  });
  const inK = prog(f, p.from + 6 + i * 7, p.from + 26 + i * 7);
  const out = 1 - prog(f, p.from + p.frames - 10, p.from + p.frames + 4);
  const fall = loser ? prog(f, p.from + 115, p.from + 160) : 0;
  const y = 2.72 - i * 0.71 - fall * 2.2;
  return (
    <mesh
      position={[interpolate(inK, [0, 1], [3, 0.08]), y, interpolate(inK, [0, 1], [-2, 0.4]) - fall * 2]}
      rotation={[fall * 1.1, interpolate(inK, [0, 1], [-0.9, -0.12]) + Math.sin(lf / 30 + i) * 0.04, fall * 0.4]}
      scale={[2.55 * inK * out, 0.62 * inK * out, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={(loser ? 1 - fall * 0.85 : 1)} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

/* =========================== TIP 1: PIN DE MAPA =========================== */
const MapPin: React.FC<{ f: number }> = ({ f }) => {
  const s = S.tip1;
  const lf = f - s.from;
  const vis = sceneVis(f, s.from, s.frames);
  const chips = ["Horario", "Fotos", "Servicios"];
  const chipTex = chips.map((t, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCanvasTexture(520, 150, (ctx) => {
      ctx.fillStyle = "rgba(12,16,38,.92)";
      rr(ctx, 4, 4, 512, 142, 71);
      ctx.fill();
      ctx.strokeStyle = [C.cyan, C.magenta, C.gold][i];
      ctx.lineWidth = 5;
      rr(ctx, 4, 4, 512, 142, 71);
      ctx.stroke();
      ctx.fillStyle = [C.cyan, C.magenta, C.gold][i];
      ctx.beginPath();
      ctx.arc(80, 75, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b0d1c";
      ctx.font = `900 34px ${FONT}`;
      ctx.fillText("✓", 67, 88);
      ctx.fillStyle = C.white;
      ctx.font = `800 54px ${FONT_H}`;
      ctx.fillText(t, 132, 94);
    })
  );
  if (vis <= 0.001) return null;
  const drop = prog(f, s.from - 2, s.from + 22);
  return (
    <group scale={vis}>
      <group position={[0, interpolate(drop, [0, 1], [5, 2.35]) + Math.sin(lf / 14) * 0.08, 0]} rotation={[0, lf * 0.035, 0]}>
        <mesh>
          <sphereGeometry args={[0.55, 48, 48]} />
          <meshPhysicalMaterial color={C.magenta} emissive={C.magenta} emissiveIntensity={0.25} metalness={0.3} roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, -0.72, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.47, 1.05, 48]} />
          <meshPhysicalMaterial color={C.magenta} emissive={C.magenta} emissiveIntensity={0.2} metalness={0.3} roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.36]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      {[0, 1, 2].map((k) => {
        const t = ((lf + k * 22) % 66) / 66;
        return (
          <mesh key={k} position={[0, -1.66, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.3 + t * 3.2}>
            <ringGeometry args={[0.92, 1, 64]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={(1 - t) * 0.7 * drop} depthWrite={false} />
          </mesh>
        );
      })}
      {chips.map((_, i) => {
        const k = prog(f, s.from + 40 + i * 12, s.from + 58 + i * 12);
        const ang = -0.95 + i * 0.95 + Math.sin(lf / 45) * 0.06;
        return (
          <mesh key={i} position={[Math.sin(ang) * 1.55, 1.15 + (i === 1 ? -0.2 : 0.1), Math.cos(ang) * 1.1]} rotation={[0, ang * 0.55, 0]} scale={[1.35 * k, 0.39 * k, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={chipTex[i]} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/* =========================== TIP 2: ESTRELLAS + RESEÑA =========================== */
const Stars: React.FC<{ f: number }> = ({ f }) => {
  const s = S.tip2;
  const lf = f - s.from;
  const vis = sceneVis(f, s.from, s.frames);
  const geo = useMemo(() => {
    const e = new THREE.ExtrudeGeometry(starShape(0.34, 0.15), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4 });
    e.center();
    return e;
  }, []);
  const review = useCanvasTexture(1000, 520, (ctx) => {
    ctx.fillStyle = "rgba(250,250,255,.97)";
    rr(ctx, 6, 6, 988, 508, 44);
    ctx.fill();
    ctx.fillStyle = "#e9ecff";
    ctx.beginPath();
    ctx.arc(90, 96, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3f73";
    ctx.font = `800 42px ${FONT_H}`;
    ctx.fillText("M", 74, 112);
    ctx.fillStyle = "#111426";
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText("Marta G.", 158, 88);
    ctx.fillStyle = "#e3a300";
    ctx.font = `600 36px ${FONT}`;
    ctx.fillText("★★★★★", 158, 134);
    ctx.fillStyle = "#1a1d33";
    ctx.font = `700 54px ${FONT_H}`;
    const quote = "«Me arreglaron la fuga en una hora. Precio cerrado y muy limpios.»";
    const n = Math.floor(clamp01((lf - 30) / 70) * quote.length);
    wrap(ctx, quote.slice(0, n), 900).forEach((l, i) => ctx.fillText(l, 50, 250 + i * 70));
    ctx.fillStyle = "#7a7f99";
    ctx.font = `500 32px ${FONT}`;
    ctx.fillText("Reseña en Google · hace 2 días", 50, 470);
  });
  if (vis <= 0.001) return null;
  return (
    <group scale={vis}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = prog(f, s.from + i * 5, s.from + 18 + i * 5);
        const x = (i - 2) * 0.62;
        return (
          <mesh key={i} geometry={geo} position={[x, 2.75 + Math.sin(lf / 12 + i) * 0.06 - (i === 0 || i === 4 ? 0.12 : 0), 0]} rotation={[0.2, (1 - k) * 6.28 + Math.sin(lf / 20 + i) * 0.25, 0]} scale={k * 0.95}>
            <meshPhysicalMaterial color={C.gold} emissive="#ff9d00" emissiveIntensity={0.35} metalness={0.9} roughness={0.18} clearcoat={1} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.05, 0.2]} rotation={[-0.08, Math.sin(lf / 40) * 0.1 - 0.06, 0.02]} scale={[2.9 * prog(f, s.from + 12, s.from + 32), 1.51 * prog(f, s.from + 12, s.from + 32), 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={review} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* =========================== TIP 3: WEB RÁPIDA =========================== */
const Website: React.FC<{ f: number }> = ({ f }) => {
  const s = S.tip3;
  const lf = f - s.from;
  const vis = sceneVis(f, s.from, s.frames);
  const geo = useMemo(() => {
    const e = new THREE.ExtrudeGeometry(roundedRect(2.95, 2.25, 0.12), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 });
    e.translate(0, 0, -0.04);
    return e;
  }, []);
  const load = clamp01((lf - 8) / 24);
  const tex = useCanvasTexture(1180, 900, (ctx) => {
    ctx.fillStyle = "#f6f7fb";
    ctx.fillRect(0, 0, 1180, 900);
    ctx.fillStyle = "#e4e7f2";
    ctx.fillRect(0, 0, 1180, 70);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(40 + i * 34, 35, 11, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#fff";
    rr(ctx, 170, 15, 640, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#555b77";
    ctx.font = `500 24px ${FONT}`;
    ctx.fillText("🔒 tunegocio.es".replace("🔒 ", ""), 195, 43);
    // barra de carga
    ctx.fillStyle = C.green;
    ctx.fillRect(0, 70, 1180 * load, 6);
    ctx.globalAlpha = clamp01((lf - 14) / 10);
    const hero = ctx.createLinearGradient(0, 76, 1180, 520);
    hero.addColorStop(0, "#1b2a6b");
    hero.addColorStop(1, "#5b2bbf");
    ctx.fillStyle = hero;
    ctx.fillRect(0, 76, 1180, 470);
    ctx.fillStyle = "#9fb0ff";
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText("MÁLAGA Y COSTA DEL SOL", 70, 170);
    ctx.fillStyle = "#fff";
    ctx.font = `900 84px ${FONT_H}`;
    ctx.fillText("Fontanería", 70, 270);
    ctx.fillText("urgente 24 h", 70, 360);
    ctx.fillStyle = C.gold;
    ctx.font = `800 44px ${FONT}`;
    ctx.fillText("Desde 60 € · Presupuesto cerrado", 70, 440);
    ctx.fillStyle = C.green;
    rr(ctx, 70, 470, 360, 60, 30);
    ctx.fill();
    ctx.fillStyle = "#06311f";
    ctx.font = `800 30px ${FONT}`;
    ctx.fillText("Llamar ahora", 160, 510);
    ["Fugas y atascos", "Calderas", "Reformas de baño"].forEach((t, i) => {
      const x = 70 + i * 360;
      ctx.fillStyle = "#fff";
      rr(ctx, x, 590, 330, 240, 24);
      ctx.fill();
      ctx.fillStyle = "#1a1d33";
      ctx.font = `800 34px ${FONT_H}`;
      ctx.fillText(t, x + 28, 660);
      ctx.fillStyle = "#7a7f99";
      ctx.font = `500 26px ${FONT}`;
      ctx.fillText("Precio y tiempo", x + 28, 720);
      ctx.fillText("claros", x + 28, 758);
    });
    ctx.globalAlpha = 1;
  });
  const badge = useCanvasTexture(560, 170, (ctx) => {
    ctx.fillStyle = "rgba(8,30,20,.95)";
    rr(ctx, 4, 4, 552, 162, 81);
    ctx.fill();
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 6;
    rr(ctx, 4, 4, 552, 162, 81);
    ctx.stroke();
    ctx.fillStyle = C.green;
    ctx.font = `900 64px ${FONT_H}`;
    ctx.fillText("Carga: 0,8 s", 60, 108);
  });
  const streaks = useMemo(() => {
    const r = rand(42);
    return Array.from({ length: 22 }, () => ({ x: (r() - 0.5) * 7, y: r() * 5 - 1.2, sp: 0.25 + r() * 0.35, o: r() * 40 }));
  }, []);
  if (vis <= 0.001) return null;
  const enter = prog(f, s.from - 4, s.from + 24);
  const bk = prog(f, s.from + 40, s.from + 56);
  return (
    <group scale={vis}>
      {streaks.map((st, i) => {
        const z = -14 + (((lf + st.o) * st.sp) % 18);
        return (
          <mesh key={i} position={[st.x, st.y, z]}>
            <boxGeometry args={[0.012, 0.012, 1.6]} />
            <meshBasicMaterial color={i % 2 ? C.cyan : C.violet} transparent opacity={0.6} />
          </mesh>
        );
      })}
      <group position={[0, 1.55, interpolate(enter, [0, 1], [-6, 0])]} rotation={[-0.12 + Math.sin(lf / 50) * 0.03, interpolate(enter, [0, 1], [0.9, 0.18]) + Math.sin(lf / 35) * 0.06, 0]}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial color="#1a1c2a" metalness={0.8} roughness={0.25} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.075]}>
          <planeGeometry args={[2.85, 2.15]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0.95, -1.15, 0.35]} scale={[1.25 * bk, 0.38 * bk, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={badge} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

/* =========================== CTA: "IA" EN 3D =========================== */
const BigIA: React.FC<{ f: number }> = ({ f }) => {
  const s = S.cta;
  const lf = f - s.from;
  const vis = prog(f, s.from - 4, s.from + 18);
  const geo = useMemo(() => {
    const font = new FontLoader().parse(fontJson as never);
    const g = new TextGeometry("IA", { font, size: 1.35, depth: 0.42, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.045, bevelSegments: 6 });
    g.center();
    return g;
  }, []);
  if (vis <= 0.001) return null;
  return (
    <group position={[0, 1.75, 0]} scale={interpolate(vis, [0, 1], [0.3, 1])}>
      <mesh geometry={geo} rotation={[0.1, Math.sin(lf / 28) * 0.45 + (1 - vis) * 3, 0]}>
        <meshPhysicalMaterial color="#b9a6ff" emissive={C.violet} emissiveIntensity={0.35} metalness={0.75} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + (i ? 0.5 : -0.35), lf * (i ? 0.02 : -0.025), i ? 0.3 : -0.2]}>
          <torusGeometry args={[1.75 + i * 0.25, 0.02, 16, 160]} />
          <meshBasicMaterial color={i ? C.magenta : C.cyan} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/* =========================== COMPOSICIÓN =========================== */
export const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const p = S.problema;
  const fadeOut = 1 - prog(f, totalFrames - 14, totalFrames);
  return (
    <group scale={1} visible={fadeOut > 0}>
      <CameraRig f={f} />
      <Background f={f} />
      <Phone f={f} />
      {f > p.from - 4 && f < p.from + p.frames + 6 && (
        <>
          {BUSINESSES.map(([n, r], i) => (
            <ResultCard key={i} f={f} i={i} name={n} rating={r} />
          ))}
          <ResultCard f={f} i={3} name="Tu negocio" rating="" loser />
        </>
      )}
      <MapPin f={f} />
      <Stars f={f} />
      <Website f={f} />
      <BigIA f={f} />
    </group>
  );
};
