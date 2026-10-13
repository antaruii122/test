import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame } from "remotion";
import { Confetti } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./wi01.timing.json";
import { Captions, Emoji, layout, Punch, SeriesChrome, Sfx, Soundtrack, Sticker, Timing, usePop } from "./kit";

const T = timing as Timing;
export type WI01Hook = "A" | "C";
export const wi01Duration = (hook: WI01Hook) => layout(T, hook).total;

const OCEAN = "#2E86FF";
const LAND = "#3DDC97";
const MOON = "#D9D9E3";

/* ---------- Space background: deep gradient + twinkling stars ---------- */
const Space: React.FC<{ dim?: number }> = ({ dim = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg, #050B24, #12153F 55%, #2A1250)", overflow: "hidden" }}>
      {new Array(90).fill(0).map((_, i) => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / (8 + random(`t${i}`) * 20) + i));
        const s = 2 + random(`s${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`x${i}`) * 1080,
              top: random(`y${i}`) * 1920,
              width: s,
              height: s,
              borderRadius: "50%",
              background: C.white,
              opacity: tw * (1 - dim * 0.3),
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "#000", opacity: dim * 0.5 }} />
    </AbsoluteFill>
  );
};

/* ---------- Characters ---------- */
const Face: React.FC<{ r: number; mood?: "happy" | "wow" | "sad" | "dizzy" }> = ({ r, mood = "happy" }) => {
  const frame = useCurrentFrame();
  const blink = frame % 80 > 74 ? 0.15 : 1;
  const ex = r * 0.32;
  const ey = -r * 0.1;
  const er = r * 0.11;
  return (
    <g>
      {mood === "dizzy" ? (
        <>
          <text x={-ex} y={ey + er} textAnchor="middle" fontSize={er * 3} fontFamily="Inter" fontWeight={900} fill={C.ink}>×</text>
          <text x={ex} y={ey + er} textAnchor="middle" fontSize={er * 3} fontFamily="Inter" fontWeight={900} fill={C.ink}>×</text>
        </>
      ) : (
        <>
          <ellipse cx={-ex} cy={ey} rx={er} ry={er * 1.3 * blink} fill={C.ink} />
          <ellipse cx={ex} cy={ey} rx={er} ry={er * 1.3 * blink} fill={C.ink} />
          <circle cx={-ex + er * 0.35} cy={ey - er * 0.4} r={er * 0.35} fill={C.white} />
          <circle cx={ex + er * 0.35} cy={ey - er * 0.4} r={er * 0.35} fill={C.white} />
        </>
      )}
      <ellipse cx={-ex * 1.6} cy={r * 0.18} rx={r * 0.12} ry={r * 0.07} fill={C.pink} opacity={0.55} />
      <ellipse cx={ex * 1.6} cy={r * 0.18} rx={r * 0.12} ry={r * 0.07} fill={C.pink} opacity={0.55} />
      {mood === "wow" ? (
        <ellipse cx={0} cy={r * 0.3} rx={r * 0.1} ry={r * 0.14} fill={C.ink} />
      ) : mood === "sad" ? (
        <path d={`M${-r * 0.18} ${r * 0.38} Q0 ${r * 0.22} ${r * 0.18} ${r * 0.38}`} stroke={C.ink} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${-r * 0.2} ${r * 0.24} Q0 ${r * 0.48} ${r * 0.2} ${r * 0.24}`} stroke={C.ink} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

const Earth: React.FC<{
  x: number;
  y: number;
  r?: number;
  tilt?: number;
  mood?: "happy" | "wow" | "sad" | "dizzy";
  axis?: boolean;
  bulge?: number;
  delay?: number;
}> = ({ x, y, r = 220, tilt = 0, mood = "happy", axis = false, bulge = 0, delay = -10 }) => {
  const s = usePop(delay, 9);
  const frame = useCurrentFrame();
  const spin = (frame * 2) % 360;
  return (
    <svg
      width={r * 3}
      height={r * 3}
      viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`}
      style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible", transform: `scale(${s})` }}
    >
      {bulge > 0 && (
        <ellipse cx={0} cy={0} rx={r * (1 + 0.25 * bulge)} ry={r * 0.98} fill={OCEAN} opacity={0.45} stroke={C.cyan} strokeWidth={6} strokeDasharray="18 12" />
      )}
      <g transform={`rotate(${tilt})`}>
        {axis && <line x1={0} y1={-r * 1.35} x2={0} y2={r * 1.35} stroke={C.yellow} strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />}
        <defs>
          <clipPath id={`earth${r}`}>
            <circle cx={0} cy={0} r={r} />
          </clipPath>
        </defs>
        <circle cx={0} cy={0} r={r} fill={OCEAN} />
        <g clipPath={`url(#earth${r})`} fill={LAND}>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${((spin / 360) * r * 4) - r * 2 * (k + 1)} 0)`}>
              <path d={`M${-r * 0.6} ${-r * 0.5} q${r * 0.4} ${-r * 0.3} ${r * 0.7} 0 q${r * 0.1} ${r * 0.4} ${-r * 0.3} ${r * 0.5} q${-r * 0.4} ${r * 0.1} ${-r * 0.4} ${-r * 0.5}z`} />
              <path d={`M${r * 0.4} ${r * 0.1} q${r * 0.5} ${-r * 0.1} ${r * 0.6} ${r * 0.4} q${-r * 0.2} ${r * 0.4} ${-r * 0.5} ${r * 0.3}z`} />
            </g>
          ))}
        </g>
        <circle cx={0} cy={0} r={r} fill="none" stroke={C.ink} strokeWidth={r * 0.06} />
        <Face r={r} mood={mood} />
      </g>
    </svg>
  );
};

const Moon: React.FC<{ x: number; y: number; r?: number; mood?: "happy" | "wow" | "sad"; vanishAt?: number; delay?: number; opacity?: number }> = ({
  x,
  y,
  r = 110,
  mood = "happy",
  vanishAt,
  delay = -10,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 9);
  const v = vanishAt === undefined ? 1 : interpolate(frame, [vanishAt, vanishAt + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob = Math.sin(frame / 12) * 10;
  return (
    <>
      <svg
        width={r * 3}
        height={r * 3}
        viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`}
        style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5 + bob, transform: `scale(${s * v})`, opacity, overflow: "visible" }}
      >
        <circle cx={0} cy={0} r={r * 1.3} fill={MOON} opacity={0.18} />
        <circle cx={0} cy={0} r={r} fill={MOON} stroke={C.ink} strokeWidth={r * 0.07} />
        <circle cx={-r * 0.45} cy={-r * 0.5} r={r * 0.16} fill="#B9B9C8" />
        <circle cx={r * 0.5} cy={-r * 0.35} r={r * 0.1} fill="#B9B9C8" />
        <circle cx={r * 0.55} cy={r * 0.55} r={r * 0.13} fill="#B9B9C8" />
        <Face r={r} mood={mood} />
      </svg>
      {vanishAt !== undefined && frame >= vanishAt && frame < vanishAt + 30 && (
        <>
          <Confetti x={x} y={y} delay={vanishAt} n={30} />
          <Emoji e="💨" x={x} y={y} size={r * 2} delay={vanishAt} float={false} />
        </>
      )}
    </>
  );
};

const Sun: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 120 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={r * 3} height={r * 3} viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`} style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible" }}>
      <g transform={`rotate(${frame * 1.5})`}>
        {new Array(12).fill(0).map((_, i) => (
          <rect key={i} x={-r * 0.08} y={-r * 1.45} width={r * 0.16} height={r * 0.35} rx={r * 0.08} fill={C.yellow} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle cx={0} cy={0} r={r} fill={C.yellow} stroke={C.ink} strokeWidth={r * 0.07} />
      <Face r={r} mood="happy" />
    </svg>
  );
};

/* ---------- Title card from frame 0 ---------- */
const WhatIfTitle: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 96,
        color: C.yellow,
        WebkitTextStroke: `12px ${C.ink}`,
        paintOrder: "stroke fill",
      }}
    >
      WHAT IF…
    </div>
    <Sticker x={540} y={390} delay={-12} bg={C.cyan} size={62} rot={-3}>
      🌙 THE MOON DISAPPEARED?
    </Sticker>
  </>
);

const at = (words: { w: string; start: number }[], w: string) =>
  Math.round((words.find((x) => x.w.toLowerCase().startsWith(w))?.start ?? 0) * FPS);

const Hook: React.FC<{ k: WI01Hook }> = ({ k }) => {
  const words = T.hooks[k].words;
  const vanish = at(words, k === "A" ? "disappeared" : "vanished") + 6;
  return (
    <Punch shake instant>
      <WhatIfTitle />
      <Earth x={420} y={930} r={190} mood={useCurrentFrame() > vanish ? "wow" : "happy"} />
      <Moon x={820} y={700} r={90} vanishAt={vanish} />
      {k === "A" ? (
        <Sticker x={540} y={1200} delay={at(words, "scariest")} bg={C.pink} color={C.white} size={70} rot={-3}>
          it's NOT the dark sky 👀
        </Sticker>
      ) : (
        <>
          <Sticker x={250} y={1200} delay={at(words, "oceans")} bg={OCEAN} color={C.white} size={56} rot={-5}>🌊 oceans</Sticker>
          <Sticker x={560} y={1200} delay={at(words, "animals")} bg={LAND} size={56} rot={3}>🐢 animals</Sticker>
          <Sticker x={860} y={1200} delay={at(words, "seasons")} bg={C.white} size={56} rot={-2}>❄️ seasons</Sticker>
        </>
      )}
      <Sfx name="boom" at={0} />
      <Sfx name="whoosh" at={vanish} volume={0.8} />
      <Sfx name="pop" at={vanish + 2} />
    </Punch>
  );
};

/* ---------- Body scenes ---------- */
const Sky = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [40, 70], [1, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Punch>
      <AbsoluteFill style={{ background: "#000", opacity: (1 - fade) * 0.55 }} />
      <Moon x={540} y={560} r={170} opacity={fade} mood="sad" />
      <svg width={1080} height={500} viewBox="0 0 1080 500" style={{ position: "absolute", left: 0, top: 820 }}>
        <path d="M0 260 L120 150 L230 240 L380 90 L520 230 L650 120 L800 250 L930 140 L1080 230 V500 H0Z" fill="#141933" stroke={C.ink} strokeWidth={8} />
        {[150, 420, 700, 900].map((x, i) => (
          <rect key={i} x={x} y={330} width={60} height={80} fill={fade > 0.5 ? C.yellow : "#333"} stroke={C.ink} strokeWidth={6} />
        ))}
      </svg>
      <Sticker x={540} y={300} delay={8} bg={C.white} size={60}>brightest thing in the night sky</Sticker>
    </Punch>
  );
};

const Tides = ({ noMoon }: { noMoon?: boolean }) => {
  const frame = useCurrentFrame();
  const b = noMoon ? interpolate(frame, [10, 50], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <Punch>
      <Earth x={540} y={800} r={210} bulge={b} mood={noMoon ? "sad" : "happy"} />
      {!noMoon && (
        <>
          <Moon x={540} y={300} r={80} />
          <div style={{ position: "absolute", left: 505, top: 400, fontSize: 90, fontFamily: FONT, transform: `translateY(${Math.sin(frame / 6) * 10}px)` }}>⬆️</div>
          <Sticker x={540} y={1180} delay={20} bg={OCEAN} color={C.white} size={70}>🌊 Moon = most of the tides</Sticker>
        </>
      )}
      {noMoon && (
        <>
          <Sun x={880} y={330} r={90} />
          <Sticker x={540} y={1180} delay={40} bg={C.pink} color={C.white} size={70}>tides: much weaker</Sticker>
          <Sfx name="pop" at={40} />
        </>
      )}
    </Punch>
  );
};

const Coast = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <svg width={1080} height={700} viewBox="0 0 1080 700" style={{ position: "absolute", left: 0, top: 500 }}>
        <path d={`M0 ${300 + Math.sin(frame / 10) * 20} Q270 ${260 + Math.sin(frame / 8) * 30} 540 ${300} T1080 ${300} V700 H0Z`} fill={OCEAN} stroke={C.ink} strokeWidth={10} />
        <path d="M0 520 Q300 440 600 520 T1080 500 V700 H0Z" fill="#E8C98A" stroke={C.ink} strokeWidth={10} />
      </svg>
      <Emoji e="🦀" x={300} y={1080} size={150} delay={6} />
      <Emoji e="🐚" x={620} y={1110} size={110} delay={12} />
      <Emoji e="🐟" x={820} y={950} size={120} delay={18} />
      <Emoji e="❓" x={300} y={900} size={110} delay={30} />
      <Emoji e="❓" x={820} y={790} size={100} delay={36} />
      <Sfx name="pop" at={30} />
    </Punch>
  );
};

const Coral = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,30,90,0.6), rgba(5,60,90,0.8))" }} />
      <Moon x={820} y={330} r={90} />
      {new Array(40).fill(0).map((_, i) => {
        const t = frame - 20 - (i % 10) * 3;
        if (t < 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 150 + random(`cx${i}`) * 780 + Math.sin(t / 6 + i) * 20,
              top: 1150 - t * (4 + random(`cv${i}`) * 4),
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: [C.pink, C.yellow, C.white][i % 3],
              opacity: interpolate(t, [0, 60], [1, 0], { extrapolateRight: "clamp" }),
            }}
          />
        );
      })}
      <Emoji e="🪸" x={250} y={1150} size={220} delay={0} float={false} />
      <Emoji e="🪸" x={540} y={1180} size={260} delay={4} float={false} />
      <Emoji e="🪸" x={830} y={1150} size={220} delay={8} float={false} />
      <Sticker x={540} y={560} delay={20} bg={C.yellow} size={64} rot={-4}>moonlight = signal 🌕</Sticker>
      <Sfx name="ding" at={20} />
    </Punch>
  );
};

const Tilt = ({ mode }: { mode: "steady" | "small" | "chaos" }) => {
  const frame = useCurrentFrame();
  const tilt =
    mode === "steady" ? 23.4 : mode === "small" ? 23.3 + Math.sin(frame / 10) * 1.2 : 22.5 + Math.sin(frame / 5) * 22.5;
  const label = mode === "chaos" ? `${Math.round(Math.max(0, tilt))}°` : `${tilt.toFixed(1)}°`;
  return (
    <Punch shake={mode === "chaos"}>
      <Earth x={540} y={820} r={220} tilt={tilt} axis mood={mode === "chaos" ? "dizzy" : "happy"} />
      {mode !== "chaos" && <Moon x={880} y={430} r={80} />}
      <Sticker x={540} y={1240} bg={mode === "chaos" ? C.pink : C.yellow} color={mode === "chaos" ? C.white : C.ink} size={90} rot={0}>
        tilt {label}
      </Sticker>
      {mode === "small" && (
        <Sticker x={540} y={330} delay={6} bg={C.white} size={70}>22° ↔ 24.5°</Sticker>
      )}
      {mode === "chaos" && (
        <Sticker x={540} y={330} delay={6} bg={C.pink} color={C.white} size={80} rot={-4}>0° ↔ 45° 😵</Sticker>
      )}
      {mode === "steady" && (
        <Sticker x={300} y={360} delay={20} bg={C.cyan} size={64} rot={-4}>Moon = stabilizer</Sticker>
      )}
      <Sfx name={mode === "chaos" ? "boom" : "pop"} at={6} />
    </Punch>
  );
};

const Seasons = () => (
  <Punch>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(120,200,255,0.35) 50%, rgba(255,110,40,0.35) 50%)" }} />
    <Emoji e="🥶" x={270} y={700} size={260} delay={4} />
    <Emoji e="❄️" x={270} y={1000} size={160} delay={10} />
    <Emoji e="🥵" x={810} y={700} size={260} delay={20} />
    <Emoji e="🔥" x={810} y={1000} size={160} delay={26} />
    <Sticker x={270} y={350} delay={4} bg={C.cyan} size={64} rot={-4}>freezing</Sticker>
    <Sticker x={810} y={350} delay={20} bg={C.orange} size={64} rot={4}>scorching</Sticker>
    <Sfx name="pop" at={4} />
    <Sfx name="pop" at={20} />
  </Punch>
);

const Days = ({ stop }: { stop?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <svg width={500} height={500} viewBox="-250 -250 500 500" style={{ position: "absolute", left: 290, top: 470 }}>
        <circle r={220} fill={C.white} stroke={C.ink} strokeWidth={16} />
        {new Array(12).fill(0).map((_, i) => (
          <rect key={i} x={-6} y={-200} width={12} height={30} fill={C.ink} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-150} stroke={C.ink} strokeWidth={14} strokeLinecap="round" transform={`rotate(${frame * (stop ? 6 : 3)})`} />
        <line x1={0} y1={0} x2={0} y2={-100} stroke={C.pink} strokeWidth={18} strokeLinecap="round" transform={`rotate(${frame * 0.5})`} />
        <circle r={16} fill={C.ink} />
      </svg>
      {!stop ? (
        <>
          <Moon x={880} y={380} r={80} />
          <Sticker x={540} y={1120} delay={20} bg={C.yellow} size={80}>+2 ms / century</Sticker>
          <Sfx name="ding" at={20} />
        </>
      ) : (
        <>
          <Sticker x={540} y={1120} delay={10} bg={C.pink} color={C.white} size={80} rot={-4}>slowdown: mostly stops</Sticker>
          <Sfx name="pop" at={10} />
        </>
      )}
    </Punch>
  );
};

const Outro = () => (
  <Punch>
    <Earth x={430} y={820} r={200} />
    <Moon x={790} y={650} r={95} />
    <Emoji e="❤️" x={640} y={520} size={150} delay={20} />
    <Sticker x={540} y={1180} delay={30} bg={C.green} size={70}>a stable home 🏡</Sticker>
    <Sfx name="ding" at={20} />
  </Punch>
);

const Loop = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <Moon x={540} y={700} r={180} />
      {frame > 70 && (
        <Sticker x={540} y={300} delay={70} bg={C.pink} color={C.white} size={64} rot={-3}>
          Follow for more What Ifs 👉
        </Sticker>
      )}
      <Sfx name="pop" at={70} />
    </Punch>
  );
};

const scenes: Record<string, () => React.ReactNode> = {
  sky: () => <Sky />,
  tides: () => <Tides />,
  tides2: () => <Tides noMoon />,
  coast: () => <Coast />,
  coral: () => <Coral />,
  tilt: () => <Tilt mode="steady" />,
  tilt2: () => <Tilt mode="small" />,
  chaos: () => <Tilt mode="chaos" />,
  seasons: () => <Seasons />,
  days: () => <Days />,
  days2: () => <Days stop />,
  outro: () => <Outro />,
  loop: () => <Loop />,
};

export const WI01: React.FC<{ hook: WI01Hook }> = ({ hook }) => {
  const { hookClip, hookLen, placed, total } = layout(T, hook);
  return (
    <AbsoluteFill>
      <Space />
      <Sequence durationInFrames={hookLen}>
        <Hook k={hook} />
      </Sequence>
      {placed.map((p, i) => (
        <Sequence key={i} from={p.from} durationInFrames={p.len}>
          {scenes[p.scene]()}
          <Sfx name="whoosh" at={0} volume={0.25} />
        </Sequence>
      ))}
      <Captions hookClip={hookClip} placed={placed} />
      <SeriesChrome label="WHAT IF THE MOON DISAPPEARED?" total={total} showFrom={hookLen} />
      <Soundtrack hookClip={hookClip} placed={placed} total={total} />
    </AbsoluteFill>
  );
};
