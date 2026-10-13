import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, FPS } from "../theme";

export type Word = { w: string; start: number; end: number };
export type Clip = { file: string; text: string; dur: number; words: Word[]; amp?: number[] };
export type Line = Clip & { scene: string };
export type Timing = { id: string; title: string; hooks: Record<string, Clip>; lines: Line[] };

export const GAP = 0.6; // pause between lines (s)
export const HOOK_GAP = 0.3;
export const TAIL = 2.6; // hold after last line (follow card)
export type LayoutOpts = { tail?: number; minSeconds?: number; gap?: number };

export type Placed = Line & { from: number; len: number; startSec: number };

/** Lay out hook + lines on the timeline, in frames. */
export const layout = (t: Timing, hook: string, opts: LayoutOpts = {}) => {
  const tail = opts.tail ?? TAIL;
  const minSeconds = opts.minSeconds ?? 0; // no forced padding: it only creates dead air
  const gap = opts.gap ?? GAP;
  const h = t.hooks[hook];
  const hookLen = Math.round((h.dur + HOOK_GAP) * FPS);
  let sec = h.dur + HOOK_GAP;
  const placed: Placed[] = t.lines.map((l) => {
    const p = { ...l, startSec: sec, from: Math.round(sec * FPS), len: 0 };
    sec += l.dur + gap;
    return p;
  });
  const total = Math.max(Math.round((sec - gap + tail) * FPS), Math.round(minSeconds * FPS));
  placed.forEach((p, i) => {
    p.len = (i + 1 < placed.length ? placed[i + 1].from : total) - p.from;
  });
  return { hookClip: h, hookLen, placed, total };
};

/* ---------- Audio: voice clips, music bed, sfx ---------- */
export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.6 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={60} layout="none">
    <Html5Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const Soundtrack: React.FC<{ hookClip: Clip; placed: Placed[]; total: number }> = ({
  hookClip,
  placed,
  total,
}) => {
  const frame = useCurrentFrame();
  const music = interpolate(frame, [0, 6, total - 45, total], [0.0, 0.13, 0.13, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Html5Audio src={staticFile("audio/music.wav")} volume={music} />
      <Html5Audio src={staticFile(hookClip.file)} />
      {placed.map((p, i) => (
        <Sequence key={i} from={p.from} durationInFrames={Math.round(p.dur * FPS) + 10} layout="none">
          <Html5Audio src={staticFile(p.file)} />
        </Sequence>
      ))}
    </>
  );
};

/* ---------- TikTok-style captions: 1–3 word chunks, active word highlighted ---------- */
type Chunk = { words: Word[]; start: number; end: number };

const chunk = (clip: Clip, offset: number): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  clip.words.forEach((w, i) => {
    cur.push({ ...w, start: w.start + offset, end: w.end + offset });
    const last = i === clip.words.length - 1;
    if (cur.length === 3 || /[.,?!]$/.test(w.w) || last) {
      out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  });
  return out;
};

export const Captions: React.FC<{ hookClip: Clip; placed: Placed[]; top?: number }> = ({
  hookClip,
  placed,
  top = 1330,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunks = [...chunk(hookClip, 0), ...placed.flatMap((p) => chunk(p, p.startSec))];
  const idx = chunks.findIndex((c, i) => t >= c.start && t < (chunks[i + 1]?.start ?? c.end + 0.4));
  if (idx < 0) return null;
  const c = chunks[idx];
  if (t > c.end + 0.5) return null;
  const s = spring({ frame: frame - Math.round(c.start * fps) + 5, fps, config: { damping: 11, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 44px",
        padding: "0 60px",
        transform: `scale(${0.6 + s * 0.4})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 104,
        lineHeight: 1.1,
        textTransform: "uppercase",
      }}
    >
      {c.words.map((w, i) => {
        const active = t >= w.start && t < w.end + 0.05;
        return (
          <span
            key={i}
            style={{
              color: active ? C.yellow : C.white,
              WebkitTextStroke: `13px ${C.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 9px 0 ${C.ink}`,
              transform: active ? "rotate(-2deg)" : undefined,
              display: "inline-block",
            }}
          >
            {w.w.replace(/[,.]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Visual primitives ---------- */
export const usePop = (delay = 0, damping = 9) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 170 } });
};

export const Sticker: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  delay?: number;
  bg?: string;
  rot?: number;
  size?: number;
  color?: string;
}> = ({ children, x, y, delay = 0, bg = C.yellow, rot = -5, size = 90, color = C.ink }) => {
  const s = usePop(delay, 8);
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s}) rotate(${rot + Math.sin((frame - delay) / 8) * 2}deg)`,
        background: bg,
        color,
        border: `9px solid ${C.ink}`,
        borderRadius: 34,
        boxShadow: `12px 12px 0 ${C.ink}`,
        padding: "8px 40px",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Emoji: React.FC<{ e: string; x: number; y: number; size?: number; delay?: number; float?: boolean }> = ({
  e,
  x,
  y,
  size = 160,
  delay = 0,
  float = true,
}) => {
  const s = usePop(delay, 8);
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + (float ? Math.sin((frame + x) / 12) * 14 : 0),
        transform: `translate(-50%, -50%) scale(${s})`,
        fontSize: size,
        fontFamily: FONT,
        lineHeight: 1,
      }}
    >
      {e}
    </div>
  );
};

export const Person: React.FC<{ x: number; y: number; color?: string; scale?: number; delay?: number; label?: string }> = ({
  x,
  y,
  color = C.cyan,
  scale = 1,
  delay = 0,
  label,
}) => {
  const s = usePop(delay, 8);
  const frame = useCurrentFrame();
  const bob = Math.sin((frame + x) / 9) * 6;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, transform: `translate(-50%, -50%) scale(${s * scale})` }}>
      <svg width={220} height={300} viewBox="0 0 220 300" style={{ overflow: "visible" }}>
        <rect x={35} y={140} width={150} height={160} rx={70} fill={color} stroke={C.ink} strokeWidth={10} />
        <circle cx={110} cy={85} r={70} fill="#FFD7B5" stroke={C.ink} strokeWidth={10} />
        <circle cx={85} cy={85} r={9} fill={C.ink} />
        <circle cx={135} cy={85} r={9} fill={C.ink} />
        <path d="M85 112 Q110 135 135 112" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M42 70 Q60 5 120 15 Q185 20 180 75 Q150 40 42 70Z" fill={C.ink} />
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            top: 300,
            left: "50%",
            transform: "translateX(-50%)",
            background: C.white,
            border: `6px solid ${C.ink}`,
            borderRadius: 20,
            padding: "4px 18px",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 38,
            color: C.ink,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export const Counter: React.FC<{ to: number; prefix?: string; y: number; size?: number; color?: string; delay?: number; dur?: number }> = ({
  to,
  prefix = "",
  y,
  size = 130,
  color = C.yellow,
  delay = 4,
  dur = 40,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.round((1 - Math.pow(1 - p, 3)) * to);
  const done = p >= 1;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color,
        WebkitTextStroke: `${size * 0.1}px ${C.ink}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${size * 0.08}px 0 ${C.ink}`,
        transform: `scale(${done ? 1 + Math.sin(frame / 3) * 0.03 : 1})`,
      }}
    >
      {prefix}
      {v.toLocaleString("en-US")}
    </div>
  );
};

/** Punch-in camera: every scene starts slightly zoomed and settles (pattern interrupt). */
export const Punch: React.FC<{ children: React.ReactNode; shake?: boolean; instant?: boolean }> = ({ children, shake, instant }) => {
  const frame = useCurrentFrame();
  const z = instant ? 1 : interpolate(frame, [0, 8], [1.18, 1], { extrapolateRight: "clamp" });
  const sx = shake ? Math.sin(frame * 2.3) * interpolate(frame, [0, 12], [18, 0], { extrapolateRight: "clamp" }) : 0;
  const o = instant ? 1 : interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${z}) translateX(${sx}px)`, opacity: o }}>{children}</AbsoluteFill>;
};

export const SeriesChrome: React.FC<{ label: string; total: number; showFrom?: number }> = ({ label, total, showFrom = 0 }) => {
  const frame = useCurrentFrame();
  const tag = interpolate(frame, [showFrom, showFrom + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 60,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 36,
          color: C.white,
          background: C.pink,
          border: `6px solid ${C.ink}`,
          borderRadius: 999,
          padding: "8px 26px",
          boxShadow: `6px 6px 0 ${C.ink}`,
          opacity: tag,
          transform: `translateY(${(1 - tag) * -40}px)`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 60,
          right: 60,
          height: 18,
          borderRadius: 9,
          background: "rgba(255,255,255,0.18)",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${(frame / total) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.pink})` }} />
      </div>
    </AbsoluteFill>
  );
};

/** Title card shown from frame 0 of every hook, so viewers instantly know the topic. */
export const StoryTitle: React.FC<{ name: string; icon: string; bg: string; color?: string }> = ({
  name,
  icon,
  bg,
  color = C.white,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 72,
        color: C.white,
        WebkitTextStroke: `10px ${C.ink}`,
        paintOrder: "stroke fill",
      }}
    >
      THE STORY OF
    </div>
    <Sticker x={540} y={385} delay={-12} bg={bg} color={color} size={112} rot={-3}>
      {icon} {name}
    </Sticker>
  </>
);

/** Voice loudness (0..1) at time t on the global timeline, from the per-frame `amp` data. */
export const ampAt = (t: number, hookClip: Clip, placed: Placed[]) => {
  const pick = (c: Clip, start: number) => {
    if (!c.amp || t < start || t >= start + c.dur) return null;
    return c.amp[Math.min(c.amp.length - 1, Math.floor((t - start) * FPS))] ?? 0;
  };
  const h = pick(hookClip, 0);
  if (h !== null) return h;
  for (const p of placed) {
    const a = pick(p, p.startSec);
    if (a !== null) return a;
  }
  return 0;
};
