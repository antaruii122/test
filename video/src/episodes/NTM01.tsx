import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Confetti } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./ntm01.timing.json";
import { Emoji, layout, Punch, Sfx, Sticker, Timing, usePop } from "./kit";
import { Apartment, Box, cam, MIA_LAYOUT, Mia, MiaEpisode, Shot } from "./mia";

const T = timing as Timing;
export const ntm01Duration = () => layout(T, "A", MIA_LAYOUT).total;

const at = (words: { w: string; start: number }[], w: string) =>
  Math.round((words.find((x) => x.w.toLowerCase().startsWith(w))?.start ?? 0) * FPS);
const lineWords = (scene: string) => T.lines.find((l) => l.scene === scene)!.words;
const lineFrames = (scene: string) => Math.round(T.lines.find((l) => l.scene === scene)!.dur * FPS);

/* Rule: characters + props live inside <Shot> (the camera moves them);
   text stickers live outside it so they stay readable. */

const TopicCard: React.FC = () => {
  const s = usePop(-12, 9);
  return (
    <>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.white, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>
        NOBODY TOLD ME…
      </div>
      <div style={{ position: "absolute", top: 270, left: 90, right: 90, transform: `scale(${s}) rotate(-2deg)`, background: C.pink, color: C.white, border: `9px solid ${C.ink}`, borderRadius: 34, boxShadow: `12px 12px 0 ${C.ink}`, padding: "18px 30px", fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1.1, textAlign: "center" }}>
        🍦 Why does ice cream make my brain HURT?
      </div>
    </>
  );
};

const Floor = () => (
  <>
    <Box x={30} y={1180} w={300} h={230} label="KITCHEN" />
    <Box x={760} y={1150} w={280} h={260} label="BOOKS" />
    <Box x={90} y={1020} w={200} h={170} />
  </>
);

const Frost: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const a = frame / 10 + (i * Math.PI) / 2;
        return (
          <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * 190 - 40, top: y + Math.sin(a) * 90 - 40, fontSize: 80, fontFamily: FONT }}>
            ❄️
          </div>
        );
      })}
    </>
  );
};

const Hook = () => (
  <Punch shake instant>
    <Shot keys={[{ f: 0, z: 1.05, x: 540, y: 980 }, { f: 60, z: 1.2, x: 540, y: 900 }]} bg={<Apartment />}>
      <Floor />
      <Mia x={540} y={1000} face="pain" pose="spoon" />
      <Frost x={540} y={760} />
    </Shot>
    <TopicCard />
    <Sfx name="boom" at={0} />
  </Punch>
);

const Moving = () => {
  const ice = at(lineWords("moving"), "ice");
  return (
    <>
      <Shot whip={1} keys={[cam.wide(0), cam.wide(ice - 10), cam.medium(540, ice + 10)]} bg={<Apartment />}>
        <Floor />
        <Mia x={540} y={1000} face="happy" pose={useCurrentFrame() > ice ? "tub" : "point"} bounce />
      </Shot>
      <Sticker x={300} y={300} delay={2} bg={C.yellow} size={70} rot={-5}>📦 MOVING DAY</Sticker>
      <Sticker x={760} y={420} delay={ice} bg={C.white} size={64} rot={4}>🍦 celebration!</Sticker>
      <Sfx name="pop" at={ice} />
    </>
  );
};

const Spoons = () => {
  const frame = useCurrentFrame();
  const ow = at(lineWords("spoons"), "ow");
  const hurt = frame >= ow;
  return (
    <Punch shake={hurt}>
      <Shot keys={[cam.medium(540, 0), cam.medium(540, ow - 2), cam.face(540, 1000, ow + 4)]} bg={<Apartment />}>
        <Floor />
        <Mia x={540} y={1000} face={hurt ? "pain" : "full"} pose={hurt ? "headHold" : "spoon"} />
        {hurt && <Frost x={540} y={760} />}
      </Shot>
      {[0, 1, 2].map((i) => (
        <Sticker key={i} x={250 + i * 290} y={330} delay={4 + i * 9} bg={C.white} size={80} rot={-6 + i * 6}>
          🥄{i + 1}
        </Sticker>
      ))}
      {hurt && <Sticker x={540} y={1180} delay={ow} bg={C.pink} color={C.white} size={110} rot={-8}>OW!</Sticker>}
      <Sfx name="pop" at={4} />
      <Sfx name="pop" at={13} />
      <Sfx name="pop" at={22} />
      <Sfx name="boom" at={ow} />
    </Punch>
  );
};

const NotFrozen = () => (
  <>
    <Shot whip={-1} keys={[cam.medium(330, 0), cam.medium(330, 18), { f: 40, z: 1.5, x: 760, y: 700 }]} bg={<Apartment />}>
      <Floor />
      <Mia x={330} y={1000} face="think" pose="point" />
      <Emoji e="🧠" x={790} y={650} size={250} delay={6} />
      <Emoji e="❌" x={850} y={560} size={120} delay={22} float={false} />
    </Shot>
    <Sticker x={540} y={1180} delay={22} bg={C.cyan} size={66} rot={4}>not frozen!</Sticker>
    <Sfx name="pop" at={22} />
  </>
);

/* Zoom bubble: inside the head */
const Diagram: React.FC<{ mode: "shrink" | "expand" | "nerve" }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const width =
    mode === "shrink"
      ? interpolate(frame, [10, 50], [44, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : mode === "expand"
        ? interpolate(frame, [6, 18], [12, 62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + Math.sin(frame / 2) * 5
        : 50 + Math.sin(frame / 2) * 5;
  const vessel = mode === "shrink" ? "#5AA9FF" : C.pink;
  const nerve = interpolate(frame, [8, 50], [600, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 90, top: 330, width: 900, height: 900 }}>
      <svg width={900} height={900} viewBox="0 0 900 900">
        <defs>
          <clipPath id="bubble">
            <circle cx={450} cy={450} r={420} />
          </clipPath>
        </defs>
        <circle cx={450} cy={450} r={420} fill="#FFF4EE" />
        <g clipPath="url(#bubble)">
          <path d="M200 900 L200 640 Q120 600 150 520 L110 470 Q100 440 140 430 Q130 300 220 200 Q330 90 520 110 Q760 140 800 380 Q830 600 640 700 L640 900 Z" fill={C.white} stroke={C.ink} strokeWidth={12} />
          <path d="M150 560 Q330 470 560 540" stroke="#F49AB0" strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M170 545 Q330 470 540 530" stroke={vessel} strokeWidth={width} fill="none" strokeLinecap="round" opacity={0.9} />
          {mode === "nerve" && (
            <path d="M420 500 Q470 380 400 260 Q360 200 300 230" stroke={C.yellow} strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={nerve} />
          )}
        </g>
        <circle cx={450} cy={450} r={420} fill="none" stroke={C.ink} strokeWidth={16} />
      </svg>
      <div style={{ position: "absolute", left: 170, top: 630, fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.ink, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 16, padding: "4px 16px" }}>roof of mouth</div>
      {mode === "shrink" && <Emoji e="🧊" x={680} y={620} size={130} delay={4} />}
      {mode === "nerve" && frame > 45 && <Emoji e="⚡" x={300} y={230} size={140} delay={45} float={false} />}
    </div>
  );
};

const Vessels = () => (
  <>
    <Shot keys={[{ f: 0, z: 0.6, x: 540, y: 780 }, { f: 14, z: 1, x: 540, y: 780 }, { f: 90, z: 1.35, x: 460, y: 840 }]}>
      <Diagram mode="shrink" />
    </Shot>
    <Sticker x={540} y={250} delay={30} bg="#5AA9FF" color={C.white} size={70} rot={-3}>blood vessels shrink 🥶</Sticker>
    <Sfx name="whoosh" at={0} />
  </>
);
const Dilate = () => (
  <Punch shake>
    <Shot keys={[{ f: 0, z: 1.35, x: 460, y: 840 }, { f: 10, z: 1.6, x: 430, y: 840 }]}>
      <Diagram mode="expand" />
    </Shot>
    <Sticker x={540} y={250} delay={10} bg={C.pink} color={C.white} size={70} rot={3}>…then open up FAST 💥</Sticker>
    <Sfx name="boom" at={8} />
  </Punch>
);
const Nerves = () => (
  <>
    <Shot keys={[{ f: 0, z: 1.4, x: 480, y: 820 }, { f: 50, z: 1.5, x: 420, y: 600 }, { f: 90, z: 1.0, x: 540, y: 780 }]}>
      <Diagram mode="nerve" />
    </Shot>
    <Sticker x={540} y={250} delay={46} bg={C.yellow} size={66} rot={-3}>pain → forehead ⚡</Sticker>
    <Sfx name="ding" at={46} />
  </>
);

const Name = () => {
  const frame = useCurrentFrame();
  const words = ["SPHENOPALATINE", "GANGLIONEURALGIA"];
  return (
    <>
      <Shot whip={1} keys={[cam.low(540, 0), cam.low(540, 60), cam.face(540, 1050, 80)]} bg={<Apartment />}>
        <Floor />
        <Mia x={540} y={1050} face={frame > 70 ? "full" : "wow"} pose={frame > 70 ? "spoon" : "relax"} />
      </Shot>
      {words.map((wd, r) => (
        <div key={r} style={{ position: "absolute", top: 300 + r * 130, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 84 }}>
          {wd.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: [C.yellow, C.cyan, C.pink][(i + r) % 3],
                WebkitTextStroke: `9px ${C.ink}`,
                paintOrder: "stroke fill",
                transform: `translateY(${Math.sin(frame / 4 + i * 0.6) * 12}px) scale(${interpolate(frame, [r * 8 + i, r * 8 + i + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      ))}
    </>
  );
};

const Harmless = () => {
  const frame = useCurrentFrame();
  const left = Math.max(0, Math.round(interpolate(frame, [6, 60], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <>
      <Shot whip={-1} keys={[{ f: 0, z: 1.3, x: 800, y: 700 }, { f: 55, z: 1.3, x: 800, y: 700 }, { f: 75, z: 1, x: 540, y: 960 }]} bg={<Apartment />}>
        <Floor />
        <Mia x={330} y={1000} face="happy" pose="point" />
        <div style={{ position: "absolute", left: 640, top: 520, width: 320, height: 320, borderRadius: "50%", background: C.white, border: `14px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: C.ink, boxShadow: `10px 10px 0 ${C.ink}` }}>
          {left}s
        </div>
      </Shot>
      <Sticker x={540} y={300} delay={60} bg={C.green} size={70} rot={-4}>✅ harmless</Sticker>
      <Sfx name="ding" at={60} />
    </>
  );
};

const Fix = () => {
  const w = lineWords("fix");
  return (
    <>
      <Shot keys={[cam.face(330, 1000, 0), cam.face(330, 1000, at(w, "press") - 4), cam.medium(420, at(w, "press") + 10)]} bg={<Apartment />}>
        <Floor />
        <Mia x={330} y={1000} face="smug" pose="point" />
      </Shot>
      <Sticker x={600} y={300} delay={at(w, "press")} bg={C.yellow} size={50} rot={-4}>👅 tongue on roof of mouth</Sticker>
      <Sticker x={620} y={460} delay={at(w, "sip")} bg={C.cyan} size={54} rot={3}>☕ sip something warm</Sticker>
      <Sfx name="pop" at={at(w, "press")} />
      <Sfx name="pop" at={at(w, "sip")} />
    </>
  );
};

const Slower = () => {
  const not = at(lineWords("slower"), "not");
  return (
    <>
      <Shot whip={1} keys={[cam.medium(540, 0), cam.medium(540, not - 4), cam.low(540, not + 6)]} bg={<Apartment />}>
        <Floor />
        <Mia x={540} y={1000} face={useCurrentFrame() > not ? "smug" : "think"} pose="tub" />
      </Shot>
      <Sticker x={540} y={330} delay={4} bg={C.white} size={70} rot={-3}>🐢 eat slower?</Sticker>
      <Sticker x={540} y={520} delay={not} bg={C.pink} color={C.white} size={80} rot={5}>❌ NOT HAPPENING</Sticker>
      <Sfx name="boom" at={not} />
    </>
  );
};

/* Ending: close-up honest question, then a giant spoonful that loops back to the hook */
const Ending = () => {
  const frame = useCurrentFrame();
  const voiceEnd = lineFrames("ending");
  const bite = frame > voiceEnd + 12;
  return (
    <Punch shake={bite}>
      <Shot keys={[cam.face(540, 1000, 0), cam.face(540, 1000, voiceEnd + 6), { f: voiceEnd + 14, z: 1.05, x: 540, y: 980 }]} bg={<Apartment />}>
        <Floor />
        <Mia x={540} y={1000} face={bite ? "pain" : "smug"} pose={bite ? "spoon" : "shrug"} />
        {bite && <Frost x={540} y={760} />}
      </Shot>
      {!bite && <Sticker x={540} y={300} delay={0} bg={C.white} size={58} rot={-3}>🤔 did you know this?</Sticker>}
      {bite && <Confetti x={540} y={700} delay={voiceEnd + 12} n={20} />}
      <Sfx name="whoosh" at={voiceEnd + 4} />
      <Sfx name="boom" at={voiceEnd + 12} />
    </Punch>
  );
};

export const NTM01: React.FC = () => (
  <MiaEpisode
    t={T}
    label="NOBODY TOLD ME… #1"
    hook={<Hook />}
    scenes={{
      moving: () => <Moving />,
      spoons: () => <Spoons />,
      notfrozen: () => <NotFrozen />,
      vessels: () => <Vessels />,
      dilate: () => <Dilate />,
      nerves: () => <Nerves />,
      name: () => <Name />,
      harmless: () => <Harmless />,
      fix: () => <Fix />,
      slower: () => <Slower />,
      ending: () => <Ending />,
    }}
  />
);
