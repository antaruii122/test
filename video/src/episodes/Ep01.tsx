import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Background, Confetti, Phone, YearBadge } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./ep01.timing.json";
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
  Timing,
  usePop,
} from "./kit";

const T = timing as Timing;
export type HookKey = "A" | "B" | "C";
export const ep01Duration = (hook: HookKey) => layout(T, hook).total;

/* A generic camera "app" tile (not the real logo) */
const AppTile: React.FC<{ label: string; color: string; icon: string; x: number; y: number; delay?: number; size?: number }> = ({
  label,
  color,
  icon,
  x,
  y,
  delay = 0,
  size = 300,
}) => {
  const s = usePop(delay, 8);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, textAlign: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.24,
          background: color,
          border: `10px solid ${C.ink}`,
          boxShadow: `12px 12px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          fontFamily: FONT,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size * 0.2,
          color: C.white,
          WebkitTextStroke: `10px ${C.ink}`,
          paintOrder: "stroke fill",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------------- Hooks ---------------- */
const Hook: React.FC<{ k: HookKey }> = ({ k }) => {
  const w = T.hooks[k].words.map((x) => Math.round(x.start * FPS));
  if (k === "A")
    return (
      <Punch shake instant>
        <Sticker x={540} y={420} delay={-12} bg={C.cyan} size={120} rot={-6}>
          13 employees
        </Sticker>
        <Sticker x={540} y={700} delay={w[2]} bg={C.yellow} size={150} rot={4}>
          $1 BILLION
        </Sticker>
        <Sticker x={540} y={990} delay={w[6]} bg={C.pink} size={110} rot={-3} color={C.white}>
          18 months
        </Sticker>
        <Sfx name="boom" at={0} />
        <Sfx name="coin" at={w[2]} />
        <Sfx name="pop" at={w[6]} />
      </Punch>
    );
  if (k === "B")
    return (
      <Punch shake instant>
        <Phone x={540} y={760} mood="sleep" delay={-12} screen={<span style={{ fontSize: 110 }}>👎</span>} />
        <Sticker x={540} y={340} delay={w[4]} bg={C.pink} color={C.white} size={96} rot={-6}>
          NOBODY WANTED IT
        </Sticker>
        <Sfx name="boom" at={0} />
        <Sfx name="pop" at={w[4]} />
      </Punch>
    );
  return (
    <Punch shake instant>
      <Emoji e="💰" x={540} y={520} size={330} delay={-12} />
      <Sticker x={540} y={300} delay={w[2]} bg={C.yellow} size={130} rot={-4}>
        $1,000,000,000
      </Sticker>
      {new Array(13).fill(0).map((_, i) => (
        <Person key={i} x={150 + (i % 7) * 130} y={880 + Math.floor(i / 7) * 190} scale={0.45} delay={w[7] + i * 2} color={[C.cyan, C.pink, C.green][i % 3]} />
      ))}
      <Sfx name="boom" at={0} />
      <Sfx name="coin" at={w[2]} />
      <Sfx name="pop" at={w[7]} />
    </Punch>
  );
};

/* ---------------- Body scenes ---------------- */
const Flop = () => (
  <Punch shake>
    <Phone x={540} y={760} mood="sleep" screen={<span style={{ fontSize: 110 }}>📉</span>} />
    <Sticker x={540} y={330} delay={10} bg={C.pink} color={C.white} size={170} rot={-10}>
      FLOP
    </Sticker>
    <Sfx name="boom" at={10} />
  </Punch>
);

const Burbn = ({ second }: { second?: boolean }) => (
  <Punch>
    {!second && <YearBadge year="2010" top={230} />}
    <Phone x={540} y={second ? 700 : 820} scale={second ? 0.8 : 0.9} screen={<span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.orange }}>Burbn</span>} />
    {second ? (
      <>
        <Sticker x={250} y={330} delay={4} bg={C.cyan} size={64} rot={-8}>📍 Check-ins</Sticker>
        <Sticker x={820} y={470} delay={18} bg={C.yellow} size={64} rot={6}>🗓️ Plans</Sticker>
        <Sticker x={270} y={1080} delay={32} bg={C.green} size={64} rot={-4}>📷 Photos</Sticker>
        <Sfx name="pop" at={4} />
        <Sfx name="pop" at={18} />
        <Sfx name="pop" at={32} />
      </>
    ) : (
      <Person x={860} y={1000} label="Kevin Systrom" delay={10} scale={0.8} />
    )}
  </Punch>
);

const Money = () => (
  <Punch>
    <Emoji e="💰" x={540} y={620} size={340} />
    <Counter to={500000} prefix="$" y={880} />
    <Sticker x={540} y={330} delay={6} bg={C.green} size={80}>
      from investors
    </Sticker>
    <Sfx name="coin" at={44} />
  </Punch>
);

const Confused = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <Phone x={540} y={760} mood="wow" screen={<span style={{ fontSize: 120 }}>😵‍💫</span>} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = frame / 12 + (i * Math.PI * 2) / 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * 360 - 40,
              top: 700 + Math.sin(a) * 300 - 60,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 130,
              color: [C.yellow, C.cyan, C.pink][i % 3],
              WebkitTextStroke: `10px ${C.ink}`,
              paintOrder: "stroke fill",
            }}
          >
            ?
          </div>
        );
      })}
    </Punch>
  );
};

const Duo = () => (
  <Punch>
    <Person x={330} y={800} label="Kevin Systrom" delay={0} />
    <Person x={750} y={800} label="Mike Krieger" delay={8} color={C.pink} />
    <Emoji e="💡" x={540} y={420} size={220} delay={36} />
    <Sfx name="ding" at={36} />
  </Punch>
);

const Photos = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <div style={{ position: "absolute", left: 160, top: 360, opacity: interpolate(frame, [20, 30], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Sticker x={170} y={60} bg="#999" size={64} rot={-6}>📍 Check-ins</Sticker>
      </div>
      <Emoji e="❌" x={330} y={420} size={150} delay={26} float={false} />
      <Emoji e="📷" x={540} y={820} size={300} delay={50} />
      {new Array(10).fill(0).map((_, i) => {
        const t = frame - 56 - i * 4;
        if (t < 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 380 + ((i * 97) % 340), top: 760 - t * 9, fontSize: 90, opacity: interpolate(t, [20, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontFamily: FONT }}>
            ❤️
          </div>
        );
      })}
      <Sfx name="pop" at={26} />
      <Sfx name="ding" at={50} />
    </Punch>
  );
};

const Cut = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [4, 26], [-200, 1280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gone = frame > 18;
  return (
    <Punch>
      {!gone && (
        <>
          <Sticker x={300} y={400} bg={C.cyan} size={60}>📍 Check-ins</Sticker>
          <Sticker x={780} y={520} bg={C.yellow} size={60}>🗓️ Plans</Sticker>
        </>
      )}
      <div style={{ position: "absolute", left: x, top: 470, fontSize: 200, transform: "rotate(90deg)", fontFamily: FONT }}>✂️</div>
      {gone && (
        <>
          <Sticker x={540} y={420} delay={34} bg={C.yellow} size={90}>📷 Photos</Sticker>
          <Sticker x={540} y={640} delay={50} bg={C.cyan} size={90} rot={4}>✨ Filters</Sticker>
          <Sticker x={540} y={860} delay={64} bg={C.pink} color={C.white} size={90} rot={-3}>❤️ Likes</Sticker>
        </>
      )}
      <Sfx name="whoosh" at={4} />
      <Sfx name="pop" at={34} />
      <Sfx name="pop" at={50} />
      <Sfx name="pop" at={64} />
    </Punch>
  );
};

const Launch = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [40, 90], [0, -300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Punch>
      <div style={{ opacity: interpolate(frame, [36, 46], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <YearBadge year="Oct 2010" color={C.cyan} top={220} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${lift}px)` }}>
        <AppTile label="Instagram" icon="📷" color={`linear-gradient(135deg, ${C.yellow}, ${C.pink} 55%, #8A3FFC)`} x={540} y={760} delay={4} />
        {frame > 40 && <Emoji e="🔥" x={540} y={1110} size={170} float={false} />}
      </div>
      <Sfx name="whoosh" at={40} />
    </Punch>
  );
};

const Users = () => {
  const frame = useCurrentFrame();
  const n = Math.min(60, Math.floor(interpolate(frame, [6, 60], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <Punch>
      <YearBadge year="2012" color={C.yellow} top={220} />
      <Counter to={30000000} y={500} size={140} color={C.cyan} dur={54} />
      {new Array(n).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 90 + (i % 10) * 92, top: 720 + Math.floor(i / 10) * 92, fontSize: 70, fontFamily: FONT }}>
          🧑
        </div>
      ))}
      {frame > 60 && <Confetti x={540} y={600} delay={60} n={60} />}
      <Sfx name="ding" at={60} />
    </Punch>
  );
};

const Deal = () => {
  const frame = useCurrentFrame();
  const m = interpolate(frame, [16, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Punch>
      <YearBadge year="April 2012" color={C.pink} top={220} />
      <AppTile label="Facebook" icon="👍" color="#1877F2" x={260 + 60 * m} y={720} size={240} delay={0} />
      <AppTile label="Instagram" icon="📷" color={`linear-gradient(135deg, ${C.yellow}, ${C.pink} 55%, #8A3FFC)`} x={820 - 60 * m} y={720} size={240} delay={6} />
      <Emoji e="🤝" x={540} y={720} size={170} delay={34} float={false} />
      <Sticker x={540} y={1070} delay={70} bg={C.yellow} size={110} rot={-4}>
        $1,000,000,000
      </Sticker>
      {frame > 70 && <Confetti x={540} y={1000} delay={70} n={70} />}
      <Sfx name="whoosh" at={16} />
      <Sfx name="pop" at={34} />
      <Sfx name="coin" at={70} volume={0.8} />
    </Punch>
  );
};

const Team = () => (
  <Punch>
    <Sticker x={540} y={330} delay={0} bg={C.cyan} size={150} rot={-5}>
      only 13
    </Sticker>
    {new Array(13).fill(0).map((_, i) => (
      <Person key={i} x={150 + (i % 5) * 195} y={640 + Math.floor(i / 5) * 230} scale={0.6} delay={4 + i * 3} color={[C.cyan, C.pink, C.green, C.yellow][i % 4]} />
    ))}
    {new Array(13).fill(0).map((_, i) => (
      <Sfx key={i} name="pop" at={4 + i * 3} volume={0.25} />
    ))}
  </Punch>
);

const Loop = () => {
  const frame = useCurrentFrame();
  return (
    <Punch>
      <Phone x={540} y={720} mood="sleep" scale={0.85} screen={<span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.orange }}>Burbn</span>} />
      {frame > 80 && (
        <Sticker x={540} y={300} delay={80} bg={C.pink} color={C.white} size={70} rot={-3}>
          Follow for #2: Nintendo 👉
        </Sticker>
      )}
      <Sfx name="pop" at={80} />
    </Punch>
  );
};

const scenes: Record<string, (i: number) => React.ReactNode> = {
  flop: () => <Flop />,
  burbn: (i) => <Burbn second={i > 1} />,
  money: () => <Money />,
  confused: () => <Confused />,
  duo: () => <Duo />,
  photos: () => <Photos />,
  cut: () => <Cut />,
  launch: () => <Launch />,
  users: () => <Users />,
  deal: () => <Deal />,
  team: () => <Team />,
  loop: () => <Loop />,
};

export const Ep01: React.FC<{ hook: HookKey }> = ({ hook }) => {
  const { hookClip, hookLen, placed, total } = layout(T, hook);
  return (
    <AbsoluteFill>
      <Background hue={["#1A0B3A", "#4A1460"]} />
      <Sequence durationInFrames={hookLen}>
        <Hook k={hook} />
      </Sequence>
      {placed.map((p, i) => (
        <Sequence key={i} from={p.from} durationInFrames={p.len}>
          {scenes[p.scene](i)}
          <Sfx name="whoosh" at={0} volume={0.25} />
        </Sequence>
      ))}
      <Captions hookClip={hookClip} placed={placed} />
      <SeriesChrome ep={1} total={total} />
      <Soundtrack hookClip={hookClip} placed={placed} total={total} />
    </AbsoluteFill>
  );
};
