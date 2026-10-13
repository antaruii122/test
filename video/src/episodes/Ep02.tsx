import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Background, Confetti, Phone, YearBadge } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./ep02.timing.json";
import {
  Captions,
  Counter,
  Emoji,
  layout,
  Person,
  Punch,
  SeriesChrome,
  Sfx,
  Soundtrack,
  Sticker,
  StoryTitle,
  Timing,
} from "./kit";

const T = timing as Timing;
export type Ep02Hook = "A" | "C";
export const ep02Duration = (hook: Ep02Hook) => layout(T, hook).total;

const RED = "#E60012";

/* Hanafuda-style card: generic red card with a flower/moon motif (not a real deck design) */
const Card: React.FC<{ icon: string; x: number; y: number; rot: number; delay: number }> = ({ icon, x, y, rot, delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 170,
        height: 260,
        marginLeft: -85,
        marginTop: -130,
        background: C.white,
        border: `9px solid ${C.ink}`,
        borderRadius: 18,
        boxShadow: `10px 10px 0 ${C.ink}`,
        transform: `rotate(${rot * t}deg) scale(${t}) translateY(${(1 - t) * 300}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 12, background: RED, borderRadius: 8 }} />
      <span style={{ position: "relative", fontSize: 100, fontFamily: FONT }}>{icon}</span>
    </div>
  );
};

const CardFan: React.FC<{ y?: number; delay?: number }> = ({ y = 820, delay = 0 }) => (
  <>
    {["🌸", "🍁", "🌙", "🌿", "🦌"].map((e, i) => (
      <Card key={i} icon={e} x={540 + (i - 2) * 120} y={y + Math.abs(i - 2) * 30} rot={(i - 2) * 14} delay={delay + i * 4} />
    ))}
  </>
);

/* ---------------- Hooks ---------------- */
const Hook: React.FC<{ k: Ep02Hook }> = ({ k }) => {
  const words = T.hooks[k].words;
  const at = (w: string) => Math.round((words.find((x) => x.w.toLowerCase().startsWith(w))?.start ?? 0) * FPS);
  return (
    <Punch shake instant>
      <StoryTitle name="NINTENDO" icon="🎮" bg={RED} />
      {k === "A" ? (
        <>
          <Sticker x={540} y={620} delay={at("over")} bg={C.yellow} size={120} rot={4}>
            130+ years old
          </Sticker>
          <CardFan y={960} delay={at("playing")} />
          <Sfx name="pop" at={at("over")} />
          <Sfx name="whoosh" at={at("playing")} />
        </>
      ) : (
        <>
          <Sticker x={540} y={620} delay={at("playing")} bg={C.white} size={90} rot={-4}>
            🎴 card shop
          </Sticker>
          <Sticker x={540} y={830} delay={at("almost")} bg={C.pink} color={C.white} size={90} rot={3}>
            📉 almost broke
          </Sticker>
          <Sticker x={540} y={1040} delay={at("video")} bg={C.cyan} size={90} rot={-2}>
            🎮 video games
          </Sticker>
          <Sfx name="pop" at={at("playing")} />
          <Sfx name="boom" at={at("almost")} />
          <Sfx name="coin" at={at("video")} />
        </>
      )}
      <Sfx name="boom" at={0} />
    </Punch>
  );
};

/* ---------------- Body scenes ---------------- */
const Shop = () => (
  <Punch>
    <YearBadge year="1889" top={230} />
    <svg width={520} height={420} viewBox="0 0 520 420" style={{ position: "absolute", left: 140, top: 560 }}>
      <rect x={40} y={120} width={440} height={290} fill="#F4D9A8" stroke={C.ink} strokeWidth={12} />
      <path d="M10 130 L260 20 L510 130 Z" fill="#5B3A29" stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={40 + i * 73} y={130} width={73} height={50} fill={i % 2 ? RED : C.white} stroke={C.ink} strokeWidth={6} />
      ))}
      <rect x={210} y={260} width={100} height={150} fill="#7A4B2A" stroke={C.ink} strokeWidth={8} />
      <rect x={80} y={230} width={100} height={90} fill={C.cyan} stroke={C.ink} strokeWidth={8} />
      <rect x={340} y={230} width={100} height={90} fill={C.cyan} stroke={C.ink} strokeWidth={8} />
    </svg>
    <Person x={860} y={1060} label="Fusajiro Yamauchi" scale={0.75} delay={14} />
    <Sticker x={300} y={1120} delay={30} bg={C.white} size={60} rot={-5}>
      Kyoto, Japan 🇯🇵
    </Sticker>
    <Sfx name="pop" at={14} />
    <Sfx name="pop" at={30} />
  </Punch>
);

const Cards = () => (
  <Punch>
    <Sticker x={540} y={330} delay={4} bg={RED} color={C.white} size={100}>
      HANAFUDA
    </Sticker>
    <CardFan y={800} delay={10} />
    <Sfx name="whoosh" at={10} />
  </Punch>
);

const Heir = () => (
  <Punch>
    <YearBadge year="1949" color={C.cyan} top={230} />
    <Person x={540} y={820} label="Hiroshi Yamauchi" delay={6} />
    <Emoji e="👑" x={540} y={600} size={150} delay={24} float={false} />
    <Sfx name="ding" at={24} />
  </Punch>
);

const Ventures = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <Person x={540} y={900} label="Hiroshi Yamauchi" scale={0.9} />
      <Emoji e="💭" x={540} y={470} size={300} delay={4} float={false} />
      <div style={{ position: "absolute", left: 470, top: 400, fontSize: 120, fontFamily: FONT, transform: `rotate(${Math.sin(frame / 4) * 10}deg)` }}>📈</div>
    </Punch>
  );
};

const Ventures2 = () => {
  const words = T.lines.find((l) => l.scene === "ventures2")!.words;
  const at = (w: string) => Math.round((words.find((x) => x.w.toLowerCase().startsWith(w))?.start ?? 0) * FPS);
  return (
    <Punch>
      <Sticker x={540} y={380} delay={at("taxi")} bg={C.yellow} size={100} rot={-5}>🚕 Taxis</Sticker>
      <Sticker x={540} y={640} delay={at("love")} bg={C.pink} color={C.white} size={100} rot={4}>🏩 Love hotels</Sticker>
      <Sticker x={540} y={900} delay={at("instant")} bg={C.white} size={100} rot={-3}>🍚 Instant rice</Sticker>
      <Sfx name="pop" at={at("taxi")} />
      <Sfx name="pop" at={at("love")} />
      <Sfx name="pop" at={at("instant")} />
    </Punch>
  );
};

const Broke = () => (
  <Punch shake>
    <div style={{ opacity: 0.5 }}>
      <Sticker x={300} y={400} bg="#aaa" size={70} rot={-5}>🚕 Taxis</Sticker>
      <Sticker x={760} y={560} bg="#aaa" size={70} rot={4}>🏩 Hotels</Sticker>
      <Sticker x={330} y={720} bg="#aaa" size={70} rot={-3}>🍚 Rice</Sticker>
    </div>
    <Emoji e="❌" x={300} y={400} size={140} delay={6} float={false} />
    <Emoji e="❌" x={760} y={560} size={140} delay={12} float={false} />
    <Emoji e="❌" x={330} y={720} size={140} delay={18} float={false} />
    <Sticker x={540} y={1000} delay={34} bg={C.pink} color={C.white} size={100} rot={-8}>
      ALMOST BANKRUPT
    </Sticker>
    <Sfx name="pop" at={6} />
    <Sfx name="pop" at={12} />
    <Sfx name="pop" at={18} />
    <Sfx name="boom" at={34} />
  </Punch>
);

const Yokoi = () => (
  <Punch>
    <svg width={900} height={300} viewBox="0 0 900 300" style={{ position: "absolute", left: 90, top: 330 }}>
      <path d="M0 300 L0 120 L150 40 L150 120 L300 40 L300 120 L450 40 L450 120 L600 40 L600 300 Z" fill="#8892A6" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      <rect x={690} y={0} width={70} height={300} fill="#8892A6" stroke={C.ink} strokeWidth={10} />
    </svg>
    <Person x={540} y={860} label="Gunpei Yokoi" color={C.green} delay={6} />
    <Emoji e="🔧" x={760} y={760} size={140} delay={20} />
    <Emoji e="💡" x={540} y={560} size={160} delay={50} float={false} />
    <Sfx name="pop" at={20} />
    <Sfx name="ding" at={50} />
  </Punch>
);

/* Extending lattice arm (generic "extending grabber" toy) */
const Hand = () => {
  const frame = useCurrentFrame();
  const ext = interpolate(Math.sin(frame / 10), [-1, 1], [0.35, 1]);
  const n = 5;
  const segW = 110 * ext;
  return (
    <Punch>
      <YearBadge year="1966" color={C.yellow} top={230} />
      <svg width={1000} height={300} viewBox="0 0 1000 300" style={{ position: "absolute", left: 40, top: 560 }}>
        <rect x={0} y={110} width={90} height={110} rx={20} fill={C.yellow} stroke={C.ink} strokeWidth={10} />
        {new Array(n).fill(0).map((_, i) => {
          const x0 = 90 + i * segW;
          const h = 70 / ext;
          return (
            <g key={i} stroke={C.ink} strokeWidth={22} strokeLinecap="round">
              <line x1={x0} y1={165 - h} x2={x0 + segW} y2={165 + h} />
              <line x1={x0} y1={165 + h} x2={x0 + segW} y2={165 - h} />
            </g>
          );
        })}
        {new Array(n).fill(0).map((_, i) => {
          const x0 = 90 + i * segW;
          const h = 70 / ext;
          return (
            <g key={`c${i}`} stroke={C.white} strokeWidth={10} strokeLinecap="round">
              <line x1={x0} y1={165 - h} x2={x0 + segW} y2={165 + h} />
              <line x1={x0} y1={165 + h} x2={x0 + segW} y2={165 - h} />
            </g>
          );
        })}
        <circle cx={90 + n * segW + 40} cy={165} r={45} fill={RED} stroke={C.ink} strokeWidth={10} />
      </svg>
      <Sticker x={540} y={480} delay={8} bg={RED} color={C.white} size={80}>ULTRA HAND</Sticker>
      <Counter to={1000000} prefix="" y={940} size={120} color={C.cyan} delay={30} dur={40} />
      <Sticker x={540} y={1160} delay={70} bg={C.yellow} size={64}>units sold (1M+)</Sticker>
      <Sfx name="ding" at={70} />
    </Punch>
  );
};

const Toys = () => {
  const frame = useCurrentFrame();
  const swap = frame > 50;
  return (
    <Punch>
      {!swap ? (
        <>
          <Emoji e="🧸" x={300} y={600} size={200} delay={0} />
          <Emoji e="🎲" x={780} y={600} size={200} delay={6} />
          <Emoji e="🃏" x={540} y={900} size={200} delay={12} />
        </>
      ) : (
        <>
          <Emoji e="🕹️" x={540} y={760} size={380} delay={50} float={false} />
          <Confetti x={540} y={700} delay={50} />
        </>
      )}
      <Sfx name="whoosh" at={50} />
    </Punch>
  );
};

const Arcade = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <YearBadge year="1981" color={C.pink} top={230} />
      <svg width={460} height={720} viewBox="0 0 460 720" style={{ position: "absolute", left: 310, top: 470 }}>
        <path d="M40 0 H420 V140 L380 200 V720 H80 V200 L40 140 Z" fill="#1F4FD1" stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
        <rect x={110} y={210} width={240} height={250} rx={14} fill="#0B0B1E" stroke={C.ink} strokeWidth={8} />
        <rect x={80} y={490} width={300} height={80} fill={C.yellow} stroke={C.ink} strokeWidth={8} />
        <circle cx={160} cy={530} r={22} fill={RED} stroke={C.ink} strokeWidth={6} />
        <circle cx={300} cy={530} r={22} fill={C.green} stroke={C.ink} strokeWidth={6} />
        <text x={230} y={95} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill={C.yellow} stroke={C.ink} strokeWidth={3}>ARCADE</text>
      </svg>
      <div style={{ position: "absolute", left: 470, top: 700, fontSize: 110, fontFamily: FONT }}>🦍</div>
      <div style={{ position: "absolute", left: 430 + ((frame * 6) % 200), top: 830, fontSize: 60, fontFamily: FONT, transform: `rotate(${frame * 12}deg)` }}>🛢️</div>
      <Sticker x={540} y={1260} delay={30} bg={C.yellow} size={70}>MASSIVE HIT</Sticker>
      <Sfx name="coin" at={30} />
    </Punch>
  );
};

const Jumpman = () => {
  const frame = useCurrentFrame();
  const jump = Math.abs(Math.sin(frame / 7)) * -120;
  return (
    <Punch>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${jump}px)` }}>
        <Person x={540} y={820} color={RED} label="Jumpman" />
      </div>
      <Sticker x={540} y={380} delay={50} bg={RED} color={C.white} size={130} rot={-4}>= MARIO</Sticker>
      {frame > 50 && <Confetti x={540} y={420} delay={50} />}
      <Sfx name="ding" at={50} />
    </Punch>
  );
};

const Console = () => (
  <Punch>
    <YearBadge year="1985" color={C.cyan} top={230} />
    <svg width={640} height={360} viewBox="0 0 640 360" style={{ position: "absolute", left: 220, top: 540 }}>
      <rect x={20} y={40} width={600} height={240} rx={20} fill="#C9CCD3" stroke={C.ink} strokeWidth={12} />
      <rect x={20} y={40} width={600} height={70} rx={20} fill="#8C909A" stroke={C.ink} strokeWidth={12} />
      <rect x={80} y={170} width={70} height={40} rx={8} fill={RED} stroke={C.ink} strokeWidth={6} />
      <rect x={170} y={170} width={70} height={40} rx={8} fill="#555" stroke={C.ink} strokeWidth={6} />
    </svg>
    <Sticker x={330} y={1020} delay={10} bg={C.white} size={70} rot={-5}>Famicom 🇯🇵</Sticker>
    <Sticker x={760} y={1120} delay={34} bg={C.cyan} size={70} rot={4}>NES 🇺🇸</Sticker>
    <Sfx name="pop" at={10} />
    <Sfx name="pop" at={34} />
  </Punch>
);

const Loop = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <CardFan y={760} delay={0} />
      {frame > 70 && (
        <Sticker x={540} y={330} delay={70} bg={C.pink} color={C.white} size={70} rot={-3}>
          Follow for #3: The Vikings 👉
        </Sticker>
      )}
      <Sfx name="pop" at={70} />
    </Punch>
  );
};

const scenes: Record<string, () => React.ReactNode> = {
  shop: () => <Shop />,
  cards: () => <Cards />,
  heir: () => <Heir />,
  ventures: () => <Ventures />,
  ventures2: () => <Ventures2 />,
  broke: () => <Broke />,
  yokoi: () => <Yokoi />,
  hand: () => <Hand />,
  toys: () => <Toys />,
  arcade: () => <Arcade />,
  jumpman: () => <Jumpman />,
  console: () => <Console />,
  loop: () => <Loop />,
};

export const Ep02: React.FC<{ hook: Ep02Hook }> = ({ hook }) => {
  const { hookClip, hookLen, placed, total } = layout(T, hook);
  return (
    <AbsoluteFill>
      <Background hue={["#2A0A12", "#5A0E1E"]} />
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
      <SeriesChrome label="THE STORY OF NINTENDO" total={total} showFrom={hookLen} />
      <Soundtrack hookClip={hookClip} placed={placed} total={total} />
    </AbsoluteFill>
  );
};
