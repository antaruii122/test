import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import timing from "./ntm05.timing.json";
import { Counter, Emoji, layout, Person, Punch, Sfx, Sticker, Timing } from "./kit";
import { cam, ColdLayers, Mia, MIA_SHORT, MiaEpisode, MiaTopic, Office, SAFE_CX, Shot } from "./mia";

const T = timing as Timing;
export const ntm05Duration = () => layout(T, "A", MIA_SHORT).total;

const lineOf = (scene: string) => T.lines.find((l) => l.scene === scene)!;
const at = (scene: string, w: string, nth = 0) => {
  const hits = lineOf(scene).words.filter((x) => x.w.toLowerCase().startsWith(w));
  return Math.round(((hits[nth] ?? hits[0])?.start ?? 0) * FPS);
};
const ICE = "#5AA9FF";

/* Mia bundled up and shivering */
const ColdMia: React.FC<{ x: number; y: number; face?: "pain" | "think" | "smug" | "happy" | "wow"; pose?: "relax" | "shrug" | "point" | "headHold" }> = ({ x, y, face = "pain", pose = "relax" }) => {
  const frame = useCurrentFrame();
  const j = Math.sin(frame * 2.2) * 4;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${j}px)` }}>
      <Mia x={x} y={y} face={face} pose={pose} />
      <ColdLayers x={x} y={y} />
    </div>
  );
};

const Hook = () => (
  <Punch shake instant>
    <Shot keys={[{ f: 0, z: 1.1, x: 520, y: 960 }, { f: 90, z: 1.3, x: 500, y: 880 }]} bg={<Office />}>
      <ColdMia x={460} y={1000} />
    </Shot>
    <MiaTopic text="🥶 Why am I ALWAYS colder than the guys at work?" bg={ICE} />
    <Sfx name="boom" at={0} volume={0.7} />
  </Punch>
);

const OfficeScene = () => {
  const layers = at("office", "three");
  return (
    <>
      <Shot whip={1} keys={[cam.wide(0), { f: layers, z: 1.15, x: 500, y: 960 }]} bg={<Office />}>
        <Person x={790} y={980} color={C.cyan} label="T-shirt guy" scale={0.95} />
        <Emoji e="😎" x={790} y={720} size={120} delay={8} float={false} />
        <ColdMia x={330} y={1000} face="pain" />
      </Shot>
      <Sticker x={SAFE_CX} y={330} delay={4} bg={C.white} size={58} rot={-3}>💼 first week, new job</Sticker>
      <Sticker x={SAFE_CX} y={470} delay={layers} bg={ICE} color={C.white} size={62} rot={3}>👕 vs 🧥🧥🧥</Sticker>
      <Sfx name="pop" at={layers} />
    </>
  );
};

/* An old 1960s formula sheet */
const Formula = () => {
  const frame = useCurrentFrame();
  const man = at("formula", "forty");
  return (
    <>
      <Shot keys={[{ f: 0, z: 0.75, x: 540, y: 820 }, { f: 12, z: 1, x: 540, y: 820 }, { f: man + 10, z: 1.15, x: 520, y: 860 }]}>
        <div style={{ position: "absolute", left: 140, top: 430, width: 720, height: 820, background: "#F5E6C8", border: `12px solid ${C.ink}`, borderRadius: 18, transform: "rotate(-3deg)", boxShadow: `14px 14px 0 ${C.ink}` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: "absolute", left: 50, right: 50 + (i % 2) * 120, top: 90 + i * 60, height: 14, background: "#C9B48A", borderRadius: 7 }} />
          ))}
          <div style={{ position: "absolute", left: 60, top: 400, fontFamily: "DejaVu Serif", fontSize: 50, color: "#6D4C41", lineHeight: 1.3 }}>based on:<br />man, ~40 years old<br />~70 kg</div>
        </div>
        {frame > man && <Person x={500} y={1030} color="#90A4AE" label="40 y/o man" scale={0.9} delay={man} />}
      </Shot>
      <Sticker x={SAFE_CX} y={330} delay={6} bg="#8D6E63" color={C.white} size={84} rot={-6}>📜 1960s</Sticker>
      <Sfx name="pop" at={6} />
      <Sfx name="ding" at={man} />
    </>
  );
};

/* Heat each body makes at rest (illustrative, not to scale) */
const Metabolism = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Flame: React.FC<{ x: number; s: number }> = ({ x, s }) => (
    <div style={{ position: "absolute", left: x - 60, top: 640 - 80 * s, fontSize: 120 * s, fontFamily: FONT, transform: `scale(${grow}) translateY(${Math.sin(frame / 4 + x) * 6}px)` }}>🔥</div>
  );
  return (
    <>
      <Shot keys={[cam.wide(0), { f: 60, z: 1.08, x: 520, y: 940 }]} bg={<Office />}>
        <Person x={700} y={1000} color={C.cyan} scale={0.95} />
        <ColdMia x={330} y={1000} face="think" pose="relax" />
        <Flame x={700} s={1.25} />
        <Flame x={330} s={0.9} />
      </Shot>
      <Sticker x={SAFE_CX} y={330} delay={8} bg={C.orange} size={58} rot={-3}>🔥 body heat at rest</Sticker>
      <Sfx name="whoosh" at={10} />
    </>
  );
};

const Study = () => {
  const n = at("study", "thirty");
  return (
    <>
      <Shot keys={[cam.medium(500, 0), cam.face(330, 1000, n)]} bg={<Office />}>
        <ColdMia x={330} y={1000} face="wow" pose="point" />
      </Shot>
      <Sticker x={SAFE_CX} y={330} delay={4} bg={C.white} size={58} rot={-3}>🔬 one study (2015)</Sticker>
      <div style={{ position: "absolute", top: 440, left: 90, width: 800 }}>
        <Counter to={35} prefix="up to " suffix="%" y={0} size={110} color={C.yellow} delay={n - 6} dur={20} />
      </div>
      <Sfx name="ding" at={n + 14} />
    </>
  );
};

const Tip = () => {
  const cardigan = at("tip", "cardigan");
  const drink = at("tip", "hot");
  return (
    <>
      <Shot whip={-1} keys={[cam.face(330, 1000, 0), cam.face(330, 1000, cardigan - 6), cam.medium(420, cardigan + 6)]} bg={<Office />}>
        <ColdMia x={330} y={1000} face="smug" pose="point" />
      </Shot>
      <Sticker x={SAFE_CX} y={330} delay={2} bg={C.pink} color={C.white} size={58} rot={-3}>it's not just you 💕</Sticker>
      <Sticker x={SAFE_CX} y={490} delay={cardigan} bg={C.yellow} size={60} rot={3}>🧶 cardigan at your desk</Sticker>
      <Sticker x={SAFE_CX} y={640} delay={drink} bg={C.white} size={60} rot={-2}>☕ hot drink</Sticker>
      <Sfx name="pop" at={cardigan} />
      <Sfx name="pop" at={drink} />
    </>
  );
};

/* Ending: honest question, then she disappears under a giant blanket while T-shirt guy fans himself → loops to the hook */
const Ending = () => {
  const frame = useCurrentFrame();
  const voiceEnd = Math.round(lineOf("ending").dur * FPS);
  const wrap = interpolate(frame, [voiceEnd + 4, voiceEnd + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Punch shake={frame > voiceEnd + 14}>
      <Shot keys={[cam.face(330, 1000, 0), cam.face(330, 1000, voiceEnd + 2), { f: voiceEnd + 12, z: 1.05, x: 520, y: 960 }]} bg={<Office />}>
        <Person x={790} y={980} color={C.cyan} scale={0.95} />
        {frame > voiceEnd + 8 && <Emoji e="🪭" x={900} y={820} size={110} delay={voiceEnd + 8} />}
        <ColdMia x={330} y={1000} face="smug" pose="shrug" />
        <div style={{ position: "absolute", left: 140, top: 1500 - 900 * wrap, width: 380, height: 900, background: "#7E57C2", border: `12px solid ${C.ink}`, borderRadius: "120px 120px 20px 20px" }}>
          <div style={{ position: "absolute", left: 120, top: 120, fontSize: 90, fontFamily: FONT }}>😌</div>
        </div>
      </Shot>
      <Sfx name="whoosh" at={voiceEnd + 4} />
      <Sfx name="pop" at={voiceEnd + 14} />
    </Punch>
  );
};

export const NTM05: React.FC = () => (
  <MiaEpisode
    t={T}
    label="NOBODY TOLD ME… #5"
    opts={MIA_SHORT}
    hook={<Hook />}
    scenes={{
      office: () => <OfficeScene />,
      formula: () => <Formula />,
      metabolism: () => <Metabolism />,
      study: () => <Study />,
      tip: () => <Tip />,
      ending: () => <Ending />,
    }}
  />
);
