import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { Confetti } from "../components";
import { C, FONT, FPS } from "../theme";
import timing from "./ntm02.timing.json";
import { Emoji, layout, Punch, Sfx, Sticker, Timing, usePop } from "./kit";
import { Apartment, Box, cam, MIA_LAYOUT, Cart, Kitchen, Mia, MiaEpisode, SaladBowl, Shot, Supermarket } from "./mia";

const T = timing as Timing;
export const ntm02Duration = () => layout(T, "A", MIA_LAYOUT).total;

const lineOf = (scene: string) => T.lines.find((l) => l.scene === scene)!;
const at = (scene: string, w: string, nth = 0) => {
  const hits = lineOf(scene).words.filter((x) => x.w.toLowerCase().startsWith(w));
  return Math.round((hits[nth] ?? hits[0])?.start * FPS || 0);
};

const TopicCard: React.FC = () => {
  const s = usePop(-12, 9);
  return (
    <>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.white, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>
        NOBODY TOLD ME…
      </div>
      <div style={{ position: "absolute", top: 270, left: 90, right: 90, transform: `scale(${s}) rotate(-2deg)`, background: C.green, color: C.ink, border: `9px solid ${C.ink}`, borderRadius: 34, boxShadow: `12px 12px 0 ${C.ink}`, padding: "18px 30px", fontFamily: FONT, fontWeight: 900, fontSize: 68, lineHeight: 1.1, textAlign: "center" }}>
        🥗 Why am I STARVING 1 hour after a salad?
      </div>
    </>
  );
};

/* Stomach growl lines */
const Growl: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = (frame + i * 8) % 24;
        return (
          <div key={i} style={{ position: "absolute", left: x - 90 - t * 3, top: y - 60, width: 180 + t * 6, height: 120 + t * 4, borderRadius: "50%", border: `8px solid ${C.ink}`, opacity: 1 - t / 24, transform: `translate(${-t}px, ${-t * 0.5}px)` }} />
        );
      })}
    </>
  );
};

/* Inside the stomach */
const Stomach: React.FC<{ fill: number; leaves?: boolean; slow?: boolean }> = ({ fill, leaves = true, slow }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 140, top: 420, width: 800, height: 760 }}>
      <svg width={800} height={760} viewBox="0 0 800 760">
        <defs>
          <clipPath id="stom">
            <path d="M330 40 Q300 160 330 220 Q120 230 110 450 Q110 690 380 700 Q640 700 690 520 Q730 360 600 300 Q470 260 450 200 Q440 120 470 40 Z" />
          </clipPath>
        </defs>
        <path d="M330 40 Q300 160 330 220 Q120 230 110 450 Q110 690 380 700 Q640 700 690 520 Q730 360 600 300 Q470 260 450 200 Q440 120 470 40 Z" fill="#FFD6DE" stroke={C.ink} strokeWidth={14} />
        <g clipPath="url(#stom)">
          <rect x={0} y={760 - 520 * fill} width={800} height={760} fill="rgba(90,169,255,0.55)" />
          {leaves &&
            new Array(14).fill(0).map((_, i) => (
              <ellipse
                key={i}
                cx={180 + random(`lx${i}`) * 440}
                cy={760 - 520 * fill * random(`ly${i}`) - 20 + Math.sin(frame / 8 + i) * 8}
                rx={44}
                ry={26}
                fill={["#3DDC97", "#2BB673", "#7BE495"][i % 3]}
                stroke={C.ink}
                strokeWidth={5}
                transform={`rotate(${i * 37} ${180 + random(`lx${i}`) * 440} ${760 - 520 * fill * random(`ly${i}`)})`}
              />
            ))}
        </g>
      </svg>
      {slow && <div style={{ position: "absolute", left: 600, top: 560, fontSize: 130, fontFamily: FONT, transform: `translateX(${Math.sin(frame / 20) * 20}px)` }}>🐢</div>}
    </div>
  );
};

/* Energy meter (screen-space) */
const Meter: React.FC<{ label: string; value: number; color: string; y?: number }> = ({ label, value, color, y = 1150 }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: y }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink, marginBottom: 8 }}>{label}</div>
    <div style={{ height: 50, borderRadius: 25, border: `8px solid ${C.ink}`, background: C.white, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: "100%", background: color }} />
    </div>
  </div>
);

const Hook = () => (
  <Punch shake instant>
    <Shot keys={[{ f: 0, z: 1.05, x: 540, y: 980 }, { f: 70, z: 1.25, x: 540, y: 950 }]} bg={<Kitchen />}>
      <Mia x={540} y={1000} face="pain" pose="belly" />
      <Growl x={540} y={1060} />
    </Shot>
    <TopicCard />
    <Sfx name="boom" at={0} volume={0.8} />
  </Punch>
);

const Market = () => {
  const frame = useCurrentFrame();
  const l = [at("market", "lettuce", 0), at("market", "lettuce", 1), at("market", "lettuce", 2)];
  const items = l.filter((f) => frame > f).map(() => "🥬");
  return (
    <>
      <Shot whip={1} keys={[{ f: 0, z: 1.15, x: 420, y: 960 }, { f: 120, z: 1.15, x: 660, y: 960 }]} bg={<Supermarket />}>
        <Mia x={430 + frame * 0.6} y={1010} face="happy" pose="point" />
        <Cart x={560 + frame * 0.6} y={1060} items={items} />
      </Shot>
      <Sticker x={330} y={300} delay={4} bg={C.white} size={58} rot={-4}>🛒 first grocery shop alone</Sticker>
      {l.map((f, i) => (
        <Sfx key={i} name="pop" at={f} />
      ))}
    </>
  );
};

const Lunch = () => (
  <>
    <Shot keys={[cam.low(540, 0), { f: 50, z: 1.3, x: 540, y: 880 }]} bg={<Kitchen />}>
      <Mia x={540} y={1000} face="happy" pose="relax" bounce />
      <SaladBowl x={540} y={1180} s={1.4} />
    </Shot>
    <Sticker x={540} y={300} delay={6} bg={C.green} size={64} rot={-3}>🥗 GIANT bowl of leaves</Sticker>
    <Sfx name="ding" at={30} />
  </>
);

const Later = () => {
  const frame = useCurrentFrame();
  const hungry = frame > 26;
  return (
    <Punch shake={hungry}>
      <Shot keys={[cam.medium(540, 0), cam.medium(540, 24), cam.face(540, 1000, 34)]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face={hungry ? "pain" : "think"} pose="belly" />
        {hungry && <Growl x={540} y={1060} />}
      </Shot>
      <Sticker x={540} y={300} delay={0} bg={C.yellow} size={80} rot={-4}>⏰ 1 HOUR LATER</Sticker>
      {hungry && <Sticker x={540} y={1180} delay={26} bg={C.pink} color={C.white} size={90} rot={5}>GRRRR 👹</Sticker>}
      <Sfx name="boom" at={26} />
    </Punch>
  );
};

const StomachScene = ({ fade }: { fade?: boolean }) => {
  const frame = useCurrentFrame();
  const fill = fade
    ? interpolate(frame, [0, 30, 80], [0.85, 0.85, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(frame, [0, 40], [0.1, 0.85], { extrapolateRight: "clamp" });
  const energy = fade ? 0.12 : interpolate(frame, [20, 60], [0, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Shot keys={fade ? [{ f: 0, z: 1, x: 540, y: 800 }, { f: 80, z: 1.15, x: 540, y: 820 }] : [{ f: 0, z: 0.6, x: 540, y: 800 }, { f: 14, z: 1, x: 540, y: 800 }]}>
        <Stomach fill={fill} />
      </Shot>
      {!fade && <Sticker x={540} y={300} delay={8} bg={C.cyan} size={62} rot={-3}>💧 water + 🥬 fiber</Sticker>}
      {fade && <Sticker x={540} y={300} delay={30} bg={C.pink} color={C.white} size={62} rot={3}>full… then it fades 📉</Sticker>}
      <Meter label="⚡ energy" value={energy} color={C.yellow} />
    </>
  );
};

const BubbleWrap = () => {
  const frame = useCurrentFrame();
  const open = frame > 30;
  return (
    <>
      <Shot whip={-1} keys={[cam.medium(540, 0), { f: 40, z: 1.4, x: 700, y: 1000 }]} bg={<Apartment />}>
        <Mia x={300} y={1000} face={open ? "wow" : "happy"} pose="point" />
        <Box x={560} y={940} w={360} h={300} label="DELIVERY" />
        {open &&
          new Array(16).fill(0).map((_, i) => {
            const t = frame - 30;
            return (
              <div key={i} style={{ position: "absolute", left: 600 + random(`b${i}`) * 300, top: 940 - t * (4 + random(`v${i}`) * 6) + t * t * 0.08, width: 60, height: 60, borderRadius: "50%", background: "rgba(220,240,255,0.9)", border: `5px solid ${C.ink}` }} />
            );
          })}
        {open && <div style={{ position: "absolute", left: 710, top: 880, fontSize: 60, fontFamily: FONT }}>🫥</div>}
      </Shot>
      {open && <Sticker x={540} y={300} delay={30} bg={C.white} size={66} rot={-4}>📦 mostly bubble wrap</Sticker>}
      <Sfx name="pop" at={30} />
      <Sfx name="pop" at={36} />
      <Sfx name="pop" at={42} />
    </>
  );
};

const Protein = () => {
  const w = ["eggs", "chicken", "beans", "yogurt"].map((x) => at("protein", x));
  const icons = ["🥚", "🍗", "🫘", "🥛"];
  return (
    <>
      <Shot keys={[cam.face(320, 1000, 0), cam.face(320, 1000, w[0] - 6), cam.medium(500, w[0] + 6)]} bg={<Kitchen />}>
        <Mia x={320} y={1000} face="smug" pose="point" />
      </Shot>
      <Sticker x={540} y={300} delay={2} bg={C.yellow} size={72} rot={-3}>💪 PROTEIN = full longer</Sticker>
      {icons.map((e, i) => (
        <Emoji key={i} e={e} x={720 + (i % 2) * 190} y={620 + Math.floor(i / 2) * 230} size={170} delay={w[i]} />
      ))}
      {w.map((f, i) => (
        <Sfx key={i} name="pop" at={f} />
      ))}
    </>
  );
};

const Fat = () => {
  const w = ["avocado", "nuts", "olive"].map((x) => at("fat", x));
  const slows = at("fat", "slows");
  const frame = useCurrentFrame();
  return (
    <>
      {frame < slows ? (
        <Shot keys={[cam.medium(540, 0)]} bg={<Kitchen />}>
          <Mia x={540} y={1000} face="happy" pose="shrug" />
        </Shot>
      ) : (
        <Shot keys={[{ f: slows, z: 0.7, x: 540, y: 800 }, { f: slows + 12, z: 1, x: 540, y: 800 }]}>
          <Stomach fill={0.6} leaves slow />
        </Shot>
      )}
      <Sticker x={540} y={300} delay={2} bg={C.green} size={66} rot={3}>🥑 a little healthy fat</Sticker>
      {frame < slows && ["🥑", "🥜", "🫒"].map((e, i) => <Emoji key={i} e={e} x={240 + i * 300} y={560} size={170} delay={w[i]} />)}
      {frame >= slows && <Sticker x={540} y={1180} delay={slows + 8} bg={C.white} size={60}>🐢 stomach empties slower</Sticker>}
      {w.map((f, i) => (
        <Sfx key={i} name="pop" at={f} />
      ))}
      <Sfx name="whoosh" at={slows} />
    </>
  );
};

const Trick = () => {
  const adding = at("trick", "adding");
  const frame = useCurrentFrame();
  return (
    <>
      <Shot whip={1} keys={[cam.medium(540, 0), cam.face(540, 1000, adding)]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face={frame > adding ? "smug" : "think"} pose="point" />
      </Shot>
      <Sticker x={540} y={320} delay={4} bg="#aaa" size={66} rot={-3}>❌ eat less salad</Sticker>
      <Sticker x={540} y={500} delay={adding} bg={C.yellow} size={80} rot={3}>✅ ADD to it</Sticker>
      <Sfx name="ding" at={adding} />
    </>
  );
};

const Recipe = () => {
  const frame = useCurrentFrame();
  const parts = [
    { e: "🥬", f: 0 },
    { e: "+", f: at("recipe", "plus", 0) - 4 },
    { e: "🥚", f: at("recipe", "protein") },
    { e: "+", f: at("recipe", "plus", 1) - 4 },
    { e: "🥑", f: at("recipe", "fat") },
  ];
  const same = at("recipe", "same");
  return (
    <>
      <Shot keys={[{ f: 0, z: 1.1, x: 540, y: 1000 }, { f: same, z: 1.1, x: 540, y: 1000 }, { f: same + 20, z: 1.35, x: 540, y: 1080 }]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face="happy" pose="relax" />
        {frame > same && <SaladBowl x={540} y={1180} s={1.3} extras={["🥚", "🥑", "🥜"]} />}
      </Shot>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
        {parts.map((p, i) => {
          const s = interpolate(frame, [p.f, p.f + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ fontSize: p.e === "+" ? 110 : 150, fontFamily: FONT, fontWeight: 900, color: C.white, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", transform: `scale(${s})`, display: "inline-block" }}>
              {p.e}
            </span>
          );
        })}
      </div>
      {frame > same && <Confetti x={540} y={1050} delay={same} n={30} />}
      <Sfx name="ding" at={same} />
    </>
  );
};

/* Ending: honest question, then she crunches plain lettuce and her stomach growls → loops to the hook */
const Ending = () => {
  const frame = useCurrentFrame();
  const voiceEnd = Math.round(lineOf("ending").dur * FPS);
  const growl = frame > voiceEnd + 16;
  return (
    <Punch shake={growl}>
      <Shot keys={[cam.face(540, 1000, 0), cam.face(540, 1000, voiceEnd + 8), { f: voiceEnd + 16, z: 1.05, x: 540, y: 980 }]} bg={<Kitchen />}>
        <Mia x={540} y={1000} face={growl ? "pain" : "smug"} pose={growl ? "belly" : "shrug"} />
        {growl && <Growl x={540} y={1060} />}
      </Shot>
      {!growl && <Sticker x={540} y={300} delay={0} bg={C.white} size={58} rot={-3}>🤔 did you know this?</Sticker>}
      {frame > voiceEnd + 2 && !growl && <Emoji e="🥬" x={640} y={760} size={130} delay={voiceEnd + 2} float={false} />}
      <Sfx name="pop" at={voiceEnd + 4} />
      <Sfx name="boom" at={voiceEnd + 16} volume={0.8} />
    </Punch>
  );
};

export const NTM02: React.FC = () => (
  <MiaEpisode
    t={T}
    label="NOBODY TOLD ME… #2"
    hook={<Hook />}
    scenes={{
      market: () => <Market />,
      lunch: () => <Lunch />,
      later: () => <Later />,
      stomach: () => <StomachScene />,
      stomach2: () => <StomachScene fade />,
      bubblewrap: () => <BubbleWrap />,
      protein: () => <Protein />,
      fat: () => <Fat />,
      trick: () => <Trick />,
      recipe: () => <Recipe />,
      ending: () => <Ending />,
    }}
  />
);
