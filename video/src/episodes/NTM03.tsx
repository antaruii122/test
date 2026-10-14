import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { Confetti } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./ntm03.timing.json";
import { Emoji, layout, Punch, Sfx, Sticker, Timing, usePop } from "./kit";
import { cam, Kitchen, Mia, MIA_LAYOUT, MiaEpisode, MiaTopic, SAFE_CX, Shot } from "./mia";

const T = timing as Timing;
export const ntm03Duration = () => layout(T, "A", MIA_LAYOUT).total;

const lineOf = (scene: string) => T.lines.find((l) => l.scene === scene)!;
const at = (scene: string, w: string, nth = 0) => {
  const hits = lineOf(scene).words.filter((x) => x.w.toLowerCase().startsWith(w));
  return Math.round(((hits[nth] ?? hits[0])?.start ?? 0) * FPS);
};
const PURPLE = "#B57EDC";

const TopicCard: React.FC = () => <MiaTopic text="🧅 Why does chopping an onion make me CRY?" bg={PURPLE} />;

/* ---------- Props ---------- */
const Onion: React.FC<{ x: number; y: number; s?: number; angry?: boolean; cut?: boolean }> = ({ x, y, s = 1, angry, cut }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={260 * s} height={280 * s} viewBox="-130 -150 260 280" style={{ position: "absolute", left: x - 130 * s, top: y - 140 * s, overflow: "visible" }}>
      <path d="M0 -140 Q10 -110 0 -95" stroke="#7CB342" strokeWidth={14} fill="none" strokeLinecap="round" />
      {cut ? (
        <>
          <ellipse cx={0} cy={10} rx={110} ry={100} fill="#F3E5F5" stroke={C.ink} strokeWidth={10} />
          {[80, 60, 40, 20].map((r, i) => (
            <ellipse key={i} cx={0} cy={10} rx={r} ry={r * 0.9} fill="none" stroke={PURPLE} strokeWidth={6} />
          ))}
        </>
      ) : (
        <path d="M0 -100 Q120 -20 100 50 Q80 120 0 120 Q-80 120 -100 50 Q-120 -20 0 -100 Z" fill={PURPLE} stroke={C.ink} strokeWidth={10} />
      )}
      {angry && (
        <g>
          <path d="M-55 0 L-15 15" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          <path d="M55 0 L15 15" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          <circle cx={-32} cy={32} r={12} fill={C.ink} />
          <circle cx={32} cy={32} r={12} fill={C.ink} />
          <path d={`M-30 ${82 + Math.sin(frame / 4) * 3} Q0 62 30 ${82 + Math.sin(frame / 4) * 3}`} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

const Board: React.FC<{ x: number; y: number; cut?: boolean }> = ({ x, y, cut }) => (
  <>
    <div style={{ position: "absolute", left: x - 230, top: y - 30, width: 460, height: 70, background: "#C68B59", border: `9px solid ${C.ink}`, borderRadius: 18 }} />
    <Onion x={x - 40} y={y - 90} s={0.7} cut={cut} />
    <svg width={300} height={80} viewBox="0 0 300 80" style={{ position: "absolute", left: x + 40, top: y - 80 }}>
      <rect x={0} y={30} width={90} height={26} rx={10} fill="#5D4037" stroke={C.ink} strokeWidth={6} />
      <path d="M90 30 L290 34 L90 58 Z" fill="#CFD8DC" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  </>
);

/* Gas wisps rising from (x,y) toward (tx,ty) */
const Gas: React.FC<{ x: number; y: number; tx: number; ty: number; n?: number }> = ({ x, y, tx, ty, n = 16 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const p = ((frame * 1.6 + i * (100 / n)) % 100) / 100;
        const px = x + (tx - x) * p + Math.sin(p * 9 + i) * 40;
        const py = y + (ty - y) * p;
        return (
          <div key={i} style={{ position: "absolute", left: px - 20, top: py - 20, width: 40 + random(`g${i}`) * 30, height: 40 + random(`g${i}`) * 30, borderRadius: "50%", background: "rgba(200,170,255,0.55)", border: "3px solid rgba(120,80,200,0.6)", opacity: 1 - p * 0.4 }} />
        );
      })}
    </>
  );
};

const Hook = () => (
  <Punch shake instant>
    <Shot keys={[{ f: 0, z: 1.1, x: 540, y: 960 }, { f: 66, z: 1.25, x: 540, y: 900 }]} bg={<Kitchen />}>
      <Mia x={540} y={1000} face="cry" pose="headHold" />
      <Board x={540} y={1210} cut />
      <Gas x={500} y={1120} tx={540} ty={820} n={10} />
    </Shot>
    <TopicCard />
    <Sfx name="boom" at={0} />
  </Punch>
);

const Dinner = () => {
  const easy = at("dinner", "easy");
  return (
    <>
      <Shot whip={1} keys={[cam.wide(0), cam.wide(30), { f: easy, z: 1.4, x: 540, y: 1050 }]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face="happy" pose="point" />
        <Board x={540} y={1210} />
      </Shot>
      <Sticker x={SAFE_CX} y={300} delay={4} bg={C.white} size={60} rot={-4}>👩‍🍳 first real dinner</Sticker>
      <Sticker x={SAFE_CX} y={460} delay={easy} bg={C.green} size={72} rot={4}>🧅 EASY.</Sticker>
      <Sfx name="pop" at={easy} />
    </>
  );
};

const Cry = () => (
  <Punch shake>
    <Shot keys={[cam.medium(540, 0), cam.face(540, 1000, 14)]} bg={<Kitchen />}>
      <Mia x={540} y={1000} face="cry" pose="headHold" />
      <Board x={540} y={1210} cut />
      <Gas x={500} y={1120} tx={540} ty={820} n={10} />
    </Shot>
    <Sticker x={SAFE_CX} y={300} delay={0} bg={C.yellow} size={74} rot={-4}>⏱️ 5 seconds later</Sticker>
    <Sticker x={SAFE_CX} y={980} delay={18} bg="#5AA9FF" color={C.white} size={90} rot={5}>😭😭😭</Sticker>
    <Sfx name="boom" at={14} />
  </Punch>
);

const Attack = () => {
  const frame = useCurrentFrame();
  return (
    <Punch shake={frame > 20}>
      <Shot whip={-1} keys={[{ f: 0, z: 1, x: 540, y: 900 }, { f: 30, z: 1.4, x: 540, y: 820 }]} bg={<Kitchen />}>
        <Onion x={540} y={820} s={2.2} angry />
      </Shot>
      <Sticker x={SAFE_CX} y={300} delay={8} bg={C.pink} color={C.white} size={80} rot={-5}>⚔️ ATTACKING ME?!</Sticker>
      <Sfx name="boom" at={20} />
    </Punch>
  );
};

/* Onion cells breaking, two chemicals mixing */
const Cells = () => {
  const frame = useCurrentFrame();
  const cut = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mix = interpolate(frame, [at("cells", "two"), at("cells", "two") + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Shot keys={[{ f: 0, z: 0.7, x: 540, y: 820 }, { f: 14, z: 1, x: 540, y: 820 }, { f: 110, z: 1.2, x: 540, y: 820 }]}>
        <div style={{ position: "absolute", left: 140, top: 420, width: 800, height: 800, borderRadius: "50%", background: "#F3E5F5", border: `16px solid ${C.ink}`, overflow: "hidden" }}>
          {new Array(20).fill(0).map((_, i) => {
            const cx = 60 + (i % 5) * 150 + (Math.floor(i / 5) % 2) * 75;
            const cy = 80 + Math.floor(i / 5) * 160;
            const broken = cut > (i % 5) / 5;
            return (
              <div key={i} style={{ position: "absolute", left: cx, top: cy, width: 130, height: 130, borderRadius: 30, border: `8px ${broken ? "dashed" : "solid"} ${PURPLE}`, background: "rgba(255,255,255,0.6)" }}>
                <div style={{ position: "absolute", left: 20 + mix * 30, top: 40, width: 30, height: 30, borderRadius: "50%", background: mix > 0.6 ? C.green : C.yellow, border: `4px solid ${C.ink}` }} />
                <div style={{ position: "absolute", left: 80 - mix * 30, top: 60, width: 30, height: 30, borderRadius: "50%", background: mix > 0.6 ? C.green : PURPLE, border: `4px solid ${C.ink}` }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, top: 380 - 6, width: `${cut * 100}%`, height: 12, background: C.ink }} />
        </div>
      </Shot>
      <Sticker x={SAFE_CX} y={310} delay={4} bg={C.white} size={62} rot={-3}>🔪 cutting breaks the cells</Sticker>
      {mix > 0.1 && <Sticker x={SAFE_CX} y={980} delay={at("cells", "two")} bg={C.yellow} size={60} rot={3}>🟡 + 🟣 = 🧪 reaction</Sticker>}
      <Sfx name="whoosh" at={10} />
      <Sfx name="ding" at={at("cells", "two") + 20} />
    </>
  );
};

const GasScene = () => (
  <>
    <Shot keys={[{ f: 0, z: 1.5, x: 500, y: 1180 }, { f: 60, z: 1.6, x: 540, y: 820 }]} bg={<Kitchen />}>
      <Mia x={540} y={1000} face="wow" pose="relax" />
      <Board x={540} y={1210} cut />
      <Gas x={500} y={1130} tx={590} ty={790} n={22} />
    </Shot>
    <Sticker x={SAFE_CX} y={300} delay={20} bg={PURPLE} color={C.white} size={66} rot={-4}>💨 gas → your eyes</Sticker>
    <Sfx name="whoosh" at={6} />
  </>
);

/* Inside the eye: gas hits, turns to acid, tears flood */
const Eye = () => {
  const frame = useCurrentFrame();
  const acid = at("eyes", "acid");
  const flood = at("eyes", "flood");
  const tears = interpolate(frame, [flood, flood + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Shot keys={[{ f: 0, z: 0.7, x: 540, y: 820 }, { f: 12, z: 1, x: 540, y: 820 }]}>
        <svg width={900} height={700} viewBox="0 0 900 700" style={{ position: "absolute", left: 90, top: 470, overflow: "visible" }}>
          <path d="M40 350 Q450 30 860 350 Q450 670 40 350 Z" fill={C.white} stroke={C.ink} strokeWidth={16} />
          <circle cx={450} cy={350} r={150} fill="#8B5A3C" stroke={C.ink} strokeWidth={12} />
          <circle cx={450} cy={350} r={70} fill={C.ink} />
          <circle cx={500} cy={300} r={28} fill={C.white} />
          {frame > acid &&
            [0, 1, 2, 3, 4].map((i) => (
              <text key={i} x={200 + i * 130} y={250 + (i % 2) * 140} fontSize={90} textAnchor="middle" style={{ fontFamily: FONT }}>
                ⚡
              </text>
            ))}
          {new Array(10).fill(0).map((_, i) => (
            <ellipse key={i} cx={120 + i * 75} cy={560 + ((frame * 5 + i * 30) % 160) * tears} rx={22} ry={32} fill="#5AA9FF" stroke={C.ink} strokeWidth={4} opacity={tears} />
          ))}
        </svg>
        <Gas x={150} y={420} tx={600} ty={760} n={12} />
      </Shot>
      {frame > acid && <Sticker x={SAFE_CX} y={300} delay={acid} bg={C.yellow} size={62} rot={-3}>🧪 tiny bit of acid</Sticker>}
      {frame > flood && <Sticker x={SAFE_CX} y={440} delay={flood} bg="#5AA9FF" color={C.white} size={62} rot={3}>💧 tears wash it away</Sticker>}
      <Sfx name="pop" at={acid} />
      <Sfx name="whoosh" at={flood} />
    </>
  );
};

const Defense = () => (
  <>
    <Shot keys={[{ f: 0, z: 1.3, x: 540, y: 820 }, { f: 40, z: 1.5, x: 540, y: 800 }]} bg={<Kitchen />}>
      <Onion x={540} y={820} s={2} angry />
      <Emoji e="🛡️" x={820} y={680} size={170} delay={10} />
    </Shot>
    <Sticker x={SAFE_CX} y={300} delay={at("defense", "don't")} bg={C.pink} color={C.white} size={96} rot={-6}>"DON'T EAT ME!"</Sticker>
    <Sfx name="boom" at={at("defense", "don't")} />
  </>
);

const Knife = () => {
  const crushes = at("knife", "crushes");
  return (
    <>
      <Shot whip={1} keys={[cam.face(330, 1000, 0), cam.face(330, 1000, crushes - 6), cam.medium(480, crushes + 4)]} bg={<Kitchen />}>
        <Mia x={330} y={1000} face="smug" pose="point" />
        <Board x={640} y={1210} cut />
      </Shot>
      <Sticker x={SAFE_CX} y={300} delay={4} bg={C.green} size={70} rot={-3}>✅ SHARP knife</Sticker>
      <Sticker x={SAFE_CX} y={470} delay={crushes} bg={C.white} size={56} rot={3}>fewer crushed cells = less gas</Sticker>
      <Sfx name="ding" at={4} />
      <Sfx name="pop" at={crushes} />
    </>
  );
};

const Cold = () => {
  const frame = useCurrentFrame();
  const honest = at("cold", "honestly");
  return (
    <>
      <Shot keys={[{ f: 0, z: 1.6, x: 170, y: 780 }, { f: honest - 10, z: 1.6, x: 170, y: 780 }, { f: honest + 6, z: 1.2, x: 430, y: 900 }]} bg={<Kitchen />}>
        <Onion x={170} y={760} s={0.8} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 90 + i * 70, top: 600 + Math.sin(frame / 8 + i) * 20, fontSize: 60, fontFamily: FONT }}>❄️</div>
        ))}
        <Mia x={600} y={1000} face={frame > honest ? "think" : "happy"} pose={frame > honest ? "shrug" : "point"} />
      </Shot>
      <Sticker x={SAFE_CX} y={300} delay={4} bg={C.cyan} size={64} rot={-3}>🧊 chill it first?</Sticker>
      {frame > honest && <Sticker x={SAFE_CX} y={980} delay={honest} bg={C.white} size={58} rot={3}>🤷 not properly tested</Sticker>}
      <Sfx name="pop" at={honest} />
    </>
  );
};

/* Ending: honest question, then she sniffs a new onion and bursts into tears → loops to the hook */
const Ending = () => {
  const frame = useCurrentFrame();
  const voiceEnd = Math.round(lineOf("ending").dur * FPS);
  const burst = frame > voiceEnd + 14;
  return (
    <Punch shake={burst}>
      <Shot keys={[cam.face(540, 1000, 0), cam.face(540, 1000, voiceEnd + 6), { f: voiceEnd + 14, z: 1.1, x: 540, y: 960 }]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face={burst ? "cry" : "smug"} pose={burst ? "headHold" : "shrug"} />
        {frame > voiceEnd && <Onion x={700} y={780} s={0.6} />}
        {burst && <Gas x={680} y={800} tx={560} ty={800} n={8} />}
      </Shot>
      {!burst && <Sticker x={SAFE_CX} y={300} delay={0} bg={C.white} size={58} rot={-3}>🤔 did you know this?</Sticker>}
      {burst && <Confetti x={540} y={760} delay={voiceEnd + 14} n={18} />}
      <Sfx name="pop" at={voiceEnd + 2} />
      <Sfx name="boom" at={voiceEnd + 14} />
    </Punch>
  );
};

export const NTM03: React.FC = () => (
  <MiaEpisode
    t={T}
    label="NOBODY TOLD ME… #3"
    hook={<Hook />}
    scenes={{
      dinner: () => <Dinner />,
      cry: () => <Cry />,
      attack: () => <Attack />,
      cells: () => <Cells />,
      gas: () => <GasScene />,
      eyes: () => <Eye />,
      defense: () => <Defense />,
      knife: () => <Knife />,
      cold: () => <Cold />,
      ending: () => <Ending />,
    }}
  />
);
