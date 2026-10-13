import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import timing from "./ntm04.timing.json";
import { Emoji, layout, Person, Punch, Sfx, Sticker, Timing, usePop } from "./kit";
import { Apartment, cam, Mia, MIA_SHORT, MiaEpisode, Shot } from "./mia";

const T = timing as Timing;
export const ntm04Duration = () => layout(T, "A", MIA_SHORT).total;

const lineOf = (scene: string) => T.lines.find((l) => l.scene === scene)!;
const at = (scene: string, w: string, nth = 0) => {
  const hits = lineOf(scene).words.filter((x) => x.w.toLowerCase().startsWith(w));
  return Math.round(((hits[nth] ?? hits[0])?.start ?? 0) * FPS);
};
const ROSE = "#FF7EB6";

const TopicCard: React.FC = () => {
  const s = usePop(-12, 9);
  return (
    <>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.white, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>
        NOBODY TOLD ME…
      </div>
      <div style={{ position: "absolute", top: 270, left: 90, right: 90, transform: `scale(${s}) rotate(-2deg)`, background: ROSE, color: C.white, border: `9px solid ${C.ink}`, borderRadius: 34, boxShadow: `12px 12px 0 ${C.ink}`, padding: "18px 30px", fontFamily: FONT, fontWeight: 900, fontSize: 68, lineHeight: 1.1, textAlign: "center" }}>
        👃 Why can't I smell my OWN perfume?
      </div>
    </>
  );
};

/* Generic perfume bottle (no brand) */
const Bottle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={160 * s} height={240 * s} viewBox="0 0 160 240" style={{ position: "absolute", left: x - 80 * s, top: y - 120 * s, overflow: "visible" }}>
    <rect x={60} y={10} width={40} height={40} rx={8} fill="#D4AF37" stroke={C.ink} strokeWidth={7} />
    <rect x={70} y={45} width={20} height={20} fill="#D4AF37" stroke={C.ink} strokeWidth={6} />
    <rect x={15} y={65} width={130} height={165} rx={34} fill="rgba(255,126,182,0.75)" stroke={C.ink} strokeWidth={9} />
    <rect x={35} y={95} width={30} height={90} rx={15} fill="rgba(255,255,255,0.6)" />
  </svg>
);

/* Perfume mist puffs from (x,y) drifting in direction dx */
const Mist: React.FC<{ x: number; y: number; dx?: number; from?: number; n?: number; spread?: number }> = ({ x, y, dx = -1, from = 0, n = 14, spread = 1 }) => {
  const frame = useCurrentFrame() - from;
  if (frame < 0) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const t = (frame + i * 3) % 45;
        const px = x + dx * t * (6 + random(`m${i}`) * 4) * spread;
        const py = y - t * 2 + Math.sin(t / 5 + i) * 25 * spread;
        const r = (20 + t * 2.2) * spread;
        return <div key={i} style={{ position: "absolute", left: px - r / 2, top: py - r / 2, width: r, height: r, borderRadius: "50%", background: "rgba(255,120,190,0.6)", border: "4px solid rgba(200,60,140,0.5)", opacity: 1 - t / 50 }} />;
      })}
    </>
  );
};

const Hook = () => (
  <Punch shake instant>
    <Shot keys={[{ f: 0, z: 1.1, x: 540, y: 940 }, { f: 80, z: 1.3, x: 560, y: 880 }]} bg={<Apartment night={false} />}>
      <Mia x={540} y={1000} face="think" pose="spoon" />
      <Bottle x={800} y={950} s={0.9} />
      <Emoji e="❓" x={700} y={640} size={130} delay={10} />
    </Shot>
    <TopicCard />
    <Sfx name="boom" at={0} volume={0.7} />
  </Punch>
);

const Spray = () => {
  const again = [at("spray", "sprayed"), at("spray", "again", 0), at("spray", "again", 1)];
  const frame = useCurrentFrame();
  const count = again.filter((f) => frame >= f).length;
  return (
    <>
      <Shot whip={1} keys={[cam.medium(540, 0), cam.medium(540, again[0]), cam.face(540, 1000, again[2])]} bg={<Apartment night={false} />}>
        <Mia x={540} y={1000} face={count >= 3 ? "smug" : "think"} pose="point" />
        <Bottle x={850} y={720} s={0.7} />
        {again.map((f, i) => (
          <Mist key={i} x={800} y={680} from={f} n={10} />
        ))}
      </Shot>
      {count > 0 && <Sticker x={540} y={330} delay={again[0]} bg={ROSE} color={C.white} size={96} rot={-5}>💨 ×{count}</Sticker>}
      {again.map((f, i) => (
        <Sfx key={i} name="whoosh" at={f} volume={0.6} />
      ))}
    </>
  );
};

/* Nose → brain diagram. mode "bored": brain falls asleep. mode "filter": constant smell blocked, new smells pass. */
const Brain: React.FC<{ mode: "bored" | "filter" }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const sig = (frame * 6) % 400;
  const smoke = at("filter", "smoke");
  const food = at("filter", "food");
  return (
    <div style={{ position: "absolute", left: 90, top: 380, width: 900, height: 900 }}>
      <svg width={900} height={900} viewBox="0 0 900 900">
        <circle cx={450} cy={450} r={420} fill="#FFF4EE" stroke={C.ink} strokeWidth={16} />
        {/* brain */}
        <path d="M300 250 Q300 160 400 170 Q450 120 520 170 Q620 160 620 260 Q680 320 620 390 Q600 460 500 440 Q450 480 390 440 Q290 450 280 370 Q230 310 300 250 Z" fill="#F8B4C8" stroke={C.ink} strokeWidth={12} />
        <path d="M380 230 Q420 270 400 320 M500 210 Q470 270 520 330 M560 300 Q520 340 560 380" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* nose */}
        <path d="M200 620 Q260 520 300 640 Q320 700 250 700 Q180 700 200 620 Z" fill="#F6C9A8" stroke={C.ink} strokeWidth={12} />
        {/* signal path nose → brain */}
        <path d="M270 600 Q330 500 400 440" stroke="#999" strokeWidth={10} fill="none" strokeDasharray="14 14" />
        {mode === "bored" && <circle cx={270 + (130 * (sig % 200)) / 200} cy={600 - (160 * (sig % 200)) / 200} r={18} fill={ROSE} stroke={C.ink} strokeWidth={5} />}
        {mode === "bored" && frame > 40 && (
          <text x={450} y={330} textAnchor="middle" fontSize={110} style={{ fontFamily: FONT }}>😴</text>
        )}
        {mode === "filter" && (
          <>
            <rect x={300} y={470} width={170} height={40} rx={10} fill={C.ink} transform="rotate(-38 385 490)" />
            <text x={250} y={560} fontSize={90} style={{ fontFamily: FONT }}>🌸</text>
            <text x={210} y={500} fontSize={80} style={{ fontFamily: FONT }}>🚫</text>
            {frame > smoke && <text x={560 + Math.sin(frame / 4) * 10} y={620} fontSize={110} style={{ fontFamily: FONT }}>🔥</text>}
            {frame > food && <text x={660} y={760} fontSize={110} style={{ fontFamily: FONT }}>🍕</text>}
            {frame > smoke && <text x={600} y={300} fontSize={110} style={{ fontFamily: FONT }}>❗</text>}
          </>
        )}
      </svg>
    </div>
  );
};

const BrainScene = () => {
  const boring = at("brain", "boring");
  return (
    <>
      <Shot keys={[{ f: 0, z: 0.7, x: 540, y: 830 }, { f: 12, z: 1, x: 540, y: 830 }, { f: boring, z: 1.25, x: 540, y: 720 }]}>
        <Brain mode="bored" />
      </Shot>
      <Sticker x={540} y={300} delay={boring} bg={C.white} size={70} rot={-3}>🧠 "boring."</Sticker>
      <Sfx name="pop" at={boring} />
    </>
  );
};

const FilterScene = () => {
  const smoke = at("filter", "smoke");
  return (
    <>
      <Shot keys={[{ f: 0, z: 1, x: 540, y: 830 }, { f: smoke, z: 1.15, x: 600, y: 850 }]}>
        <Brain mode="filter" />
      </Shot>
      <Sticker x={540} y={260} delay={2} bg={C.yellow} size={60} rot={-3}>same smell = ignored</Sticker>
      <Sticker x={540} y={390} delay={smoke} bg={C.pink} color={C.white} size={60} rot={3}>new smell = ALERT</Sticker>
      <Sfx name="ding" at={smoke} />
    </>
  );
};

const Others = () => {
  const frame = useCurrentFrame();
  const all = at("others", "all");
  return (
    <Punch shake={frame > all}>
      <Shot whip={-1} keys={[cam.wide(0), { f: all, z: 1.05, x: 540, y: 960 }]} bg={<Apartment night={false} />}>
        <Mist x={540} y={850} dx={1} n={18} spread={2.2} />
        <Mist x={540} y={850} dx={-1} n={18} spread={2.2} />
        <Mia x={540} y={1000} face="happy" pose="relax" />
        <Person x={170} y={980} color={C.cyan} scale={0.9} />
        <Person x={910} y={980} color={C.green} scale={0.9} />
        {frame > all && <Emoji e="😵" x={170} y={780} size={130} delay={all} float={false} />}
        {frame > all && <Emoji e="🤢" x={910} y={780} size={130} delay={all + 4} float={false} />}
      </Shot>
      <Sticker x={540} y={330} delay={all} bg={ROSE} color={C.white} size={84} rot={-4}>they smell ALL of it</Sticker>
      <Sfx name="boom" at={all} />
    </Punch>
  );
};

const Tip = () => {
  const outside = at("tip", "step");
  const friend = at("tip", "friend");
  return (
    <>
      <Shot keys={[cam.face(330, 1000, 0), cam.face(330, 1000, outside - 4), cam.medium(420, outside + 8)]} bg={<Apartment night={false} />}>
        <Mia x={330} y={1000} face="smug" pose="point" />
      </Shot>
      <Sticker x={600} y={300} delay={4} bg="#aaa" size={62} rot={-4}>❌ re-spray</Sticker>
      <Sticker x={640} y={470} delay={outside} bg={C.cyan} size={62} rot={3}>🚪 step outside</Sticker>
      <Sticker x={660} y={640} delay={friend} bg={C.yellow} size={62} rot={-2}>👯 ask a friend</Sticker>
      <Sfx name="pop" at={outside} />
      <Sfx name="pop" at={friend} />
    </>
  );
};

/* Ending: honest question, then she sprays AGAIN, the room fills with pink, the plant wilts → loop */
const Ending = () => {
  const frame = useCurrentFrame();
  const voiceEnd = Math.round(lineOf("ending").dur * FPS);
  const psst = voiceEnd + 6;
  const fill = interpolate(frame, [psst, psst + 20], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Punch shake={frame > psst + 10}>
      <Shot keys={[cam.face(540, 1000, 0), cam.face(540, 1000, psst - 2), { f: psst + 10, z: 1.1, x: 540, y: 940 }]} bg={<Apartment night={false} />}>
        <Mia x={540} y={1000} face={frame > psst ? "smug" : "happy"} pose={frame > psst ? "point" : "shrug"} />
        {frame > psst && <Bottle x={840} y={720} s={0.7} />}
        <Mist x={800} y={680} from={psst} n={16} spread={1.8} />
        <Emoji e={frame > psst + 14 ? "🥀" : "🌷"} x={180} y={1050} size={150} float={false} />
      </Shot>
      <div style={{ position: "absolute", inset: 0, background: ROSE, opacity: fill }} />
      <Sfx name="whoosh" at={psst} />
      <Sfx name="boom" at={psst + 14} volume={0.6} />
    </Punch>
  );
};

export const NTM04: React.FC = () => (
  <MiaEpisode
    t={T}
    label="NOBODY TOLD ME… #4"
    opts={MIA_SHORT}
    hook={<Hook />}
    scenes={{
      spray: () => <Spray />,
      brain: () => <BrainScene />,
      filter: () => <FilterScene />,
      others: () => <Others />,
      tip: () => <Tip />,
      ending: () => <Ending />,
    }}
  />
);
