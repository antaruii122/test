import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Chrome, Confetti, Note, Phone, PopText, Scene, Stopwatch, YearBadge } from "./components";
import { C, FONT } from "./theme";

type Beat = { from: number; len: number; el: React.ReactNode };

const Timeline: React.FC<{ part: number; beats: Beat[]; hue?: [string, string] }> = ({ part, beats, hue }) => (
  <AbsoluteFill>
    <Background hue={hue} />
    {beats.map((b, i) => (
      <Sequence key={i} from={b.from} durationInFrames={b.len}>
        <Scene len={b.len}>{b.el}</Scene>
      </Sequence>
    ))}
    <Chrome part={part} />
  </AbsoluteFill>
);

const Intro: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
    <Note size={260} />
    <PopText text={title} size={120} color={C.yellow} delay={4} />
    <PopText text={sub} size={64} delay={14} stagger={2} />
  </AbsoluteFill>
);

const Outro: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const x = Math.sin(frame / 4) * 20;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <PopText text={text} size={96} color={C.cyan} />
      <div style={{ fontSize: 160, marginTop: 40, transform: `translateX(${x}px)`, fontFamily: FONT }}>👉</div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; delay?: number; top?: number; size?: number }> = ({
  text,
  delay = 8,
  top = 1250,
  size = 76,
}) => <PopText text={text} delay={delay} top={top} size={size} stagger={2} />;

/* ===================== PART 1 — ORIGINS (2012–2016) ===================== */

const Building: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 340, top: 1180 - 560 * grow, width: 400, height: 560 * grow, overflow: "hidden" }}>
      <svg width={400} height={560} viewBox="0 0 400 560">
        <rect x={20} y={20} width={360} height={540} rx={20} fill={C.cyan} stroke={C.ink} strokeWidth={12} />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}${c}`}
              x={60 + c * 105}
              y={70 + r * 110}
              width={70}
              height={70}
              rx={10}
              fill={(frame / 6 + r + c) % 3 < 1.5 ? C.yellow : C.white}
              stroke={C.ink}
              strokeWidth={8}
            />
          )),
        )}
        <rect x={150} y={470} width={100} height={90} rx={10} fill={C.pink} stroke={C.ink} strokeWidth={8} />
      </svg>
    </div>
  );
};

export const Part1: React.FC = () => (
  <Timeline
    part={1}
    beats={[
      { from: 0, len: 66, el: <Intro title="The History of TikTok" sub="Part 1: The Origins" /> },
      {
        from: 66,
        len: 120,
        el: (
          <>
            <YearBadge year="2012" />
            <Building />
            <Caption text="Zhang Yiming founds ByteDance in Beijing" />
          </>
        ),
      },
      {
        from: 186,
        len: 114,
        el: (
          <>
            <YearBadge year="2016" color={C.cyan} />
            <Phone x={540} y={900} dance screen={<Note size={150} />} delay={4} />
            <Confetti x={540} y={800} delay={10} />
            <Caption text="ByteDance launches Douyin in China" top={1300} />
          </>
        ),
      },
      { from: 300, len: 100, el: <FifteenSeconds /> },
      { from: 400, len: 50, el: <Outro text="Next: going global" /> },
    ]}
  />
);

const FifteenSeconds: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
      <PopText text="The big idea:" size={80} color={C.yellow} />
      <div style={{ height: 50 }} />
      <Stopwatch label={`${Math.round(p * 15)}s`} progress={p} size={520} color={C.pink} />
      <div style={{ height: 30 }} />
      <PopText text="Videos only 15 seconds long" size={84} delay={14} stagger={3} />
    </AbsoluteFill>
  );
};

/* ===================== PART 2 — GOING GLOBAL (2014–2018) ===================== */

const Globe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 10 } });
  const shift = (frame * 4) % 400;
  return (
    <div style={{ position: "absolute", left: 290, top: 600, width: 500, height: 500, transform: `scale(${s})` }}>
      <svg width={500} height={500} viewBox="0 0 500 500">
        <defs>
          <clipPath id="g">
            <circle cx={250} cy={250} r={230} />
          </clipPath>
        </defs>
        <circle cx={250} cy={250} r={230} fill="#3A86FF" />
        <g clipPath="url(#g)" fill={C.green} stroke={C.ink} strokeWidth={8}>
          {[0, 400, -400].map((o) => (
            <g key={o} transform={`translate(${o - shift} 0)`}>
              <path d="M60 140 q60 -60 130 -10 q30 60 -20 90 q-50 30 -90 -10 q-40 -30 -20 -70z" />
              <path d="M260 280 q70 -30 110 30 q10 80 -60 110 q-70 10 -70 -60z" />
              <path d="M250 90 q50 -20 80 10 q-10 40 -50 40 q-40 -10 -30 -50z" />
            </g>
          ))}
        </g>
        <circle cx={250} cy={250} r={230} fill="none" stroke={C.ink} strokeWidth={14} />
      </svg>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = frame / 15 + (i * Math.PI * 2) / 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 250 + Math.cos(a) * 300 - 40,
              top: 250 + Math.sin(a) * 120 - 40,
              transform: `scale(${0.7 + Math.sin(a) * 0.3})`,
              zIndex: Math.sin(a) > 0 ? 2 : -1,
            }}
          >
            <Note size={80} />
          </div>
        );
      })}
    </div>
  );
};

const Merge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const gone = frame > 44;
  return (
    <>
      <YearBadge year="Aug 2018" color={C.pink} />
      {!gone && (
        <>
          <Phone x={300 + 240 * m} y={900} body={C.orange} scale={0.75} mood="wow" />
          <Phone x={780 - 240 * m} y={900} scale={0.75} screen={<Note size={110} />} flip />
        </>
      )}
      {gone && (
        <>
          <Phone x={540} y={900} dance delay={44} screen={<Note size={150} />} />
          <Confetti x={540} y={850} delay={46} n={60} />
        </>
      )}
      <Caption text="Musical.ly merges into TikTok" top={1320} />
    </>
  );
};

export const Part2: React.FC = () => (
  <Timeline
    part={2}
    hue={["#0B1E3A", "#12406B"]}
    beats={[
      { from: 0, len: 60, el: <Intro title="The History of TikTok" sub="Part 2: Going Global" /> },
      {
        from: 60,
        len: 100,
        el: (
          <>
            <YearBadge year="2014" color={C.orange} />
            <Phone x={540} y={900} body={C.orange} mood="happy" dance delay={4} screen={<span style={{ fontSize: 120 }}>🎤</span>} />
            <Caption text="Musical.ly is born: lip-sync videos go viral" top={1300} />
          </>
        ),
      },
      {
        from: 160,
        len: 100,
        el: (
          <>
            <YearBadge year="2017" color={C.cyan} />
            <Globe />
            <Caption text="ByteDance takes the app worldwide as TikTok" top={1250} />
          </>
        ),
      },
      {
        from: 260,
        len: 70,
        el: (
          <>
            <YearBadge year="Nov 2017" color={C.yellow} />
            <Phone x={330} y={900} body={C.orange} scale={0.7} mood="wow" />
            <Phone x={750} y={900} scale={0.7} screen={<Note size={100} />} flip />
            <Caption text="ByteDance buys Musical.ly" top={1300} />
          </>
        ),
      },
      { from: 330, len: 82, el: <Merge /> },
      { from: 412, len: 38, el: <Outro text="Next: taking over" /> },
    ]}
  />
);

/* ===================== PART 3 — TAKING OVER (2020–2025) ===================== */

const House: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 10 } });
  return (
    <div style={{ position: "absolute", left: 190, top: 560, width: 700, height: 700, transform: `scale(${s})` }}>
      <svg width={700} height={700} viewBox="0 0 700 700">
        <path d="M60 330 L350 80 L640 330 Z" fill={C.pink} stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
        <rect x={110} y={320} width={480} height={360} fill={C.yellow} stroke={C.ink} strokeWidth={14} />
      </svg>
      <Phone x={350} y={500} dance scale={0.55} screen={<Note size={110} />} delay={6} />
    </div>
  );
};

const Billion: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [6, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - p, 3);
  const n = Math.round(eased * 1_000_000_000).toLocaleString("en-US");
  return (
    <>
      <YearBadge year="2021" color={C.cyan} />
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 118,
          color: C.yellow,
          WebkitTextStroke: `12px ${C.ink}`,
          paintOrder: "stroke fill",
          transform: `scale(${1 + (p === 1 ? Math.sin(frame / 3) * 0.03 : 0)})`,
        }}
      >
        {n}
      </div>
      {frame > 60 && <Confetti x={540} y={800} delay={60} n={70} />}
      <Caption text="TikTok hits 1 billion monthly users" top={1000} />
    </>
  );
};

const TenMinutes: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const label = p < 0.5 ? "15s" : "10 min";
  return (
    <>
      <YearBadge year="2022" color={C.green} />
      <div style={{ position: "absolute", top: 600, left: 280 }}>
        <Stopwatch label={label} progress={p < 0.5 ? 0.25 : p} size={520} color={p < 0.5 ? C.pink : C.green} />
      </div>
      <Caption text="Videos can now run up to 10 minutes" top={1300} />
    </>
  );
};

const Blackout: React.FC = () => {
  const frame = useCurrentFrame();
  const dark = frame > 14 && frame < 46;
  return (
    <>
      <YearBadge year="Jan 2025" color={C.pink} />
      <Phone
        x={540}
        y={900}
        mood={dark ? "sleep" : "happy"}
        dance={frame >= 46}
        screen={dark ? <span style={{ fontSize: 90 }}>💤</span> : <Note size={130} />}
      />
      {frame >= 46 && <Confetti x={540} y={800} delay={46} />}
      <Sequence durationInFrames={14} layout="none">
        <Caption text="Then, in the US…" delay={0} top={1300} />
      </Sequence>
      <Sequence from={14} durationInFrames={32} layout="none">
        <Caption text="TikTok goes dark for about a day" delay={0} top={1300} />
      </Sequence>
      <Sequence from={46} layout="none">
        <Caption text="…and then it's back!" delay={0} top={1300} />
      </Sequence>
    </>
  );
};

const Finale: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
    <Note size={240} />
    <PopText text="From 15 seconds…" size={96} color={C.cyan} delay={2} />
    <PopText text="…to the whole world." size={96} color={C.yellow} delay={14} />
  </AbsoluteFill>
);

export const Part3: React.FC = () => (
  <Timeline
    part={3}
    hue={["#2A0B2E", "#5E1250"]}
    beats={[
      { from: 0, len: 50, el: <Intro title="The History of TikTok" sub="Part 3: Taking Over" /> },
      {
        from: 50,
        len: 90,
        el: (
          <>
            <YearBadge year="2020" color={C.yellow} />
            <House />
            <Caption text="Lockdowns hit and everyone starts dancing at home" top={1320} />
          </>
        ),
      },
      { from: 140, len: 90, el: <Billion /> },
      { from: 230, len: 80, el: <TenMinutes /> },
      { from: 310, len: 80, el: <Blackout /> },
      { from: 390, len: 60, el: <Finale /> },
    ]}
  />
);
