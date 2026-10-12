import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";

const pop = (frame: number, fps: number, delay = 0, damping = 9) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 160 } });

/* ---------- Background: gradient, wobbling blobs, floating notes ---------- */
export const Background: React.FC<{ hue?: [string, string] }> = ({
  hue = [C.bg1, C.bg2],
}) => {
  const frame = useCurrentFrame();
  const notes = new Array(14).fill(0).map((_, i) => {
    const x = random(`x${i}`) * 1080;
    const speed = 1.2 + random(`s${i}`) * 2.2;
    const y = 1920 + 100 - ((frame * speed + random(`y${i}`) * 2100) % 2200);
    const rot = Math.sin((frame + i * 20) / 18) * 20;
    const color = [C.cyan, C.pink, C.yellow][i % 3];
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          fontSize: 50 + random(`f${i}`) * 50,
          color,
          opacity: 0.35,
          transform: `rotate(${rot}deg)`,
          fontFamily: "DejaVu Sans",
        }}
      >
        {i % 2 ? "♪" : "♫"}
      </div>
    );
  });
  const blob = (cx: number, cy: number, r: number, color: string, k: number) => (
    <div
      style={{
        position: "absolute",
        left: cx + Math.sin(frame / (30 + k)) * 60 - r,
        top: cy + Math.cos(frame / (25 + k)) * 60 - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: color,
        filter: "blur(90px)",
        opacity: 0.45,
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(160deg, ${hue[0]}, ${hue[1]})`, overflow: "hidden" }}
    >
      {blob(200, 400, 320, C.cyan, 3)}
      {blob(900, 1500, 360, C.pink, 9)}
      {blob(800, 300, 200, C.yellow, 15)}
      {notes}
    </AbsoluteFill>
  );
};

/* ---------- Cartoon text with thick outline + per-word pop ---------- */
export const PopText: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  stroke?: string;
  top?: number;
  stagger?: number;
}> = ({ text, delay = 0, size = 90, color = C.white, stroke = C.ink, top, stagger = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        position: top === undefined ? "relative" : "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.28}px`,
        padding: "0 70px",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const s = pop(frame, fps, delay + i * stagger);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color,
              WebkitTextStroke: `${size * 0.11}px ${stroke}`,
              paintOrder: "stroke fill",
              textShadow: `0 ${size * 0.08}px 0 ${stroke}`,
              transform: `scale(${s}) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`,
              opacity: Math.min(1, s * 2),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Big bouncing year sticker ---------- */
export const YearBadge: React.FC<{ year: string; delay?: number; color?: string; top?: number }> = ({
  year,
  delay = 0,
  color = C.yellow,
  top = 260,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 7);
  const wobble = Math.sin((frame - delay) / 6) * 3;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${s}) rotate(${-6 + wobble}deg)`,
      }}
    >
      <div
        style={{
          background: color,
          border: `10px solid ${C.ink}`,
          borderRadius: 40,
          padding: "10px 60px",
          boxShadow: `14px 14px 0 ${C.ink}`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 190,
          color: C.ink,
          letterSpacing: -4,
        }}
      >
        {year}
      </div>
    </div>
  );
};

/* ---------- Phone mascot ---------- */
export const Phone: React.FC<{
  x: number;
  y: number;
  scale?: number;
  body?: string;
  screen?: React.ReactNode;
  mood?: "happy" | "wow" | "sleep";
  dance?: boolean;
  delay?: number;
  flip?: boolean;
}> = ({ x, y, scale = 1, body = C.ink, screen, mood = "happy", dance = false, delay = 0, flip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;
  const s = pop(frame, fps, delay, 8);
  const bob = dance ? Math.abs(Math.sin(t / 5)) * -40 : Math.sin(t / 10) * 8;
  const tilt = dance ? Math.sin(t / 5) * 10 : Math.sin(t / 14) * 3;
  const blink = t % 70 > 64 ? 0.1 : 1;
  const armL = dance ? -40 + Math.sin(t / 4) * 40 : -20 + Math.sin(t / 10) * 10;
  const armR = dance ? 40 - Math.sin(t / 4) * 40 : 20 - Math.sin(t / 10) * 10;
  const eyeH = mood === "sleep" ? 4 : 34 * blink;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        top: y - 300,
        width: 340,
        height: 600,
        transform: `translateY(${bob}px) rotate(${tilt}deg) scale(${s * scale}) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <svg width={340} height={600} viewBox="0 0 340 600" style={{ overflow: "visible" }}>
        {/* arms */}
        <g stroke={C.ink} strokeWidth={22} strokeLinecap="round" fill="none">
          <path d={`M30 300 Q -40 ${300 + armL} -60 ${240 + armL * 2}`} />
          <path d={`M310 300 Q 380 ${300 + armR} 400 ${240 - armR * 2}`} />
        </g>
        <g stroke={C.white} strokeWidth={10} strokeLinecap="round" fill="none">
          <path d={`M30 300 Q -40 ${300 + armL} -60 ${240 + armL * 2}`} />
          <path d={`M310 300 Q 380 ${300 + armR} 400 ${240 - armR * 2}`} />
        </g>
        {/* legs */}
        <g stroke={C.ink} strokeWidth={22} strokeLinecap="round">
          <line x1={110} y1={540} x2={100 + (dance ? Math.sin(t / 5) * 20 : 0)} y2={610} />
          <line x1={230} y1={540} x2={240 - (dance ? Math.sin(t / 5) * 20 : 0)} y2={610} />
        </g>
        {/* body */}
        <rect x={20} y={10} width={300} height={540} rx={56} fill={body} stroke={C.ink} strokeWidth={12} />
        <rect x={42} y={60} width={256} height={420} rx={26} fill="#1E1446" stroke={C.ink} strokeWidth={6} />
        <rect x={135} y={28} width={70} height={14} rx={7} fill="#555" />
        {/* face */}
        <ellipse cx={120} cy={170} rx={26} ry={eyeH} fill={C.white} />
        <ellipse cx={220} cy={170} rx={26} ry={eyeH} fill={C.white} />
        {mood !== "sleep" && (
          <>
            <circle cx={126} cy={176} r={12 * blink} fill={C.ink} />
            <circle cx={226} cy={176} r={12 * blink} fill={C.ink} />
          </>
        )}
        <ellipse cx={90} cy={225} rx={18} ry={10} fill={C.pink} opacity={0.6} />
        <ellipse cx={250} cy={225} rx={18} ry={10} fill={C.pink} opacity={0.6} />
        {mood === "wow" ? (
          <ellipse cx={170} cy={240} rx={24} ry={30} fill={C.ink} stroke={C.white} strokeWidth={5} />
        ) : mood === "sleep" ? (
          <path d="M145 240 Q170 230 195 240" stroke={C.white} strokeWidth={8} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M130 225 Q170 275 210 225 Z" fill={C.pink} stroke={C.white} strokeWidth={6} strokeLinejoin="round" />
        )}
      </svg>
      {screen && (
        <div
          style={{
            position: "absolute",
            left: 42,
            top: 290,
            width: 256,
            height: 190,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: flip ? "scaleX(-1)" : undefined,
          }}
        >
          {screen}
        </div>
      )}
    </div>
  );
};

/* ---------- Glitchy two-tone music note (TikTok-style colors, generic) ---------- */
export const Note: React.FC<{ size?: number }> = ({ size = 120 }) => {
  const frame = useCurrentFrame();
  const j = Math.sin(frame / 3) * 4;
  const base: React.CSSProperties = {
    position: "absolute",
    fontFamily: "DejaVu Sans",
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1,
  };
  return (
    <div style={{ position: "relative", width: size * 0.7, height: size }}>
      <span style={{ ...base, color: C.cyan, left: -j, top: -j }}>♪</span>
      <span style={{ ...base, color: C.pink, left: j, top: j }}>♪</span>
      <span style={{ ...base, color: C.white }}>♪</span>
    </div>
  );
};

/* ---------- Circle wipe transition in/out of a scene ---------- */
export const Scene: React.FC<{ len: number; children: React.ReactNode; color?: string }> = ({
  len,
  children,
}) => {
  const frame = useCurrentFrame();
  const inR = interpolate(frame, [0, 10], [0, 150], { extrapolateRight: "clamp" });
  const outS = interpolate(frame, [len - 6, len], [1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outO = interpolate(frame, [len - 6, len], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${inR}% at 50% 50%)`,
        transform: `scale(${outS})`,
        opacity: outO,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Bottom progress bar + episode tag ---------- */
export const Chrome: React.FC<{ part: number }> = ({ part }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 60,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 38,
          color: C.white,
          background: C.pink,
          border: `6px solid ${C.ink}`,
          borderRadius: 999,
          padding: "8px 28px",
          boxShadow: `6px 6px 0 ${C.ink}`,
        }}
      >
        HISTORY OF TIKTOK · {part}/3
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          right: 60,
          height: 22,
          borderRadius: 11,
          background: "rgba(255,255,255,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.cyan}, ${C.pink})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Burst of confetti from a point ---------- */
export const Confetti: React.FC<{ x: number; y: number; delay?: number; n?: number }> = ({
  x,
  y,
  delay = 0,
  n = 40,
}) => {
  const frame = useCurrentFrame() - delay;
  if (frame < 0) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`a${i}${delay}`) * Math.PI * 2;
        const v = 18 + random(`v${i}${delay}`) * 26;
        const px = x + Math.cos(a) * v * frame;
        const py = y + Math.sin(a) * v * frame + 0.9 * frame * frame;
        const color = [C.cyan, C.pink, C.yellow, C.green, C.white][i % 5];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 26,
              height: 14,
              background: color,
              borderRadius: 4,
              transform: `rotate(${frame * 20 + i * 30}deg)`,
              opacity: interpolate(frame, [20, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          />
        );
      })}
    </>
  );
};

/* ---------- Stopwatch ---------- */
export const Stopwatch: React.FC<{ label: string; progress: number; size?: number; color?: string }> = ({
  label,
  progress,
  size = 420,
  color = C.cyan,
}) => {
  const r = size / 2 - 30;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size + 60 }}>
      <svg width={size} height={size + 60} viewBox={`0 -60 ${size} ${size + 60}`}>
        <rect x={size / 2 - 40} y={-50} width={80} height={50} rx={14} fill={C.pink} stroke={C.ink} strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r + 10} fill={C.white} stroke={C.ink} strokeWidth={14} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - 30}
          fill="none"
          stroke={color}
          strokeWidth={50}
          strokeDasharray={`${circ * progress * ((r - 30) / r)} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size * (label.length > 4 ? 0.15 : 0.22),
          color: C.ink,
        }}
      >
        {label}
      </div>
    </div>
  );
};
