import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { ampAt, Captions, layout, SeriesChrome, Sfx, Soundtrack, Timing } from "./kit";
import { C, FPS } from "../theme";

/* ---------- Mia: the series character. Drawn in code so she looks identical every episode. ---------- */
export const MIA = {
  skin: "#F6C9A8",
  hair: "#3B2418",
  hoodie: "#FFC93C",
  hoodieDark: "#E0A800",
  jeans: "#3D5A99",
  shoes: "#FFFFFF",
};

export type MiaFace = "happy" | "pain" | "wow" | "think" | "smug" | "full";
export type MiaPose = "relax" | "spoon" | "headHold" | "point" | "shrug" | "tub" | "belly";

/** Episodes provide Mia's current voice loudness (0..1, global timeline) so her mouth follows the real audio. */
export const TalkContext = createContext<number>(0);

export const Mia: React.FC<{
  x: number;
  y: number;
  scale?: number;
  face?: MiaFace;
  pose?: MiaPose;
  flip?: boolean;
  bounce?: boolean;
}> = ({ x, y, scale = 1.15, face = "happy", pose = "relax", flip = false, bounce = false }) => {
  const frame = useCurrentFrame();
  const amp = useContext(TalkContext);
  const talking = amp > 0.08;
  // talking adds life: small head tilt + eyebrow lift that follow the voice
  const headTilt = talking ? Math.sin(frame / 7) * 3 * (0.5 + amp) : Math.sin(frame / 30) * 1;
  const browLift = amp * 8;
  const blink = frame % 90 > 85 ? 0.12 : 1;
  const breathe = Math.sin(frame / 14) * 4;
  const hop = bounce ? -Math.abs(Math.sin(frame / 6)) * 30 : 0;

  // arm targets (hand positions) per pose, in local coords (shoulders at 125,330 / 275,330)
  const hands: Record<MiaPose, [number, number, number, number]> = {
    relax: [95, 470, 305, 470],
    spoon: [95, 470, 235, 215],
    headHold: [140, 150, 260, 150],
    point: [95, 470, 380, 250 + Math.sin(frame / 6) * 8],
    shrug: [40, 300, 360, 300],
    tub: [165, 400, 235, 400],
    belly: [150, 450, 250, 450],
  };
  const [lx, ly, rx, ry] = hands[pose];

  const eyes = () => {
    if (face === "pain")
      return (
        <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M150 190 L175 205 L150 220" />
          <path d="M250 190 L225 205 L250 220" />
        </g>
      );
    if (face === "smug")
      return (
        <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M145 205 Q163 192 181 205" />
          <path d="M219 205 Q237 192 255 205" />
        </g>
      );
    const ry2 = (face === "wow" ? 30 : 24) * blink;
    return (
      <>
        <ellipse cx={163} cy={205} rx={19} ry={ry2} fill={C.ink} />
        <ellipse cx={237} cy={205} rx={19} ry={ry2} fill={C.ink} />
        {blink > 0.5 && (
          <>
            <circle cx={170} cy={195} r={7} fill={C.white} />
            <circle cx={244} cy={195} r={7} fill={C.white} />
          </>
        )}
      </>
    );
  };

  const brows = () => {
    const tilt = face === "pain" ? 12 : face === "think" ? -6 : face === "wow" ? -10 : 0;
    return (
      <g stroke={MIA.hair} strokeWidth={10} strokeLinecap="round">
        <line x1={140} y1={165 - tilt / 2 - browLift} x2={182} y2={165 + tilt / 2 - browLift} />
        <line x1={218} y1={165 + tilt / 2 - browLift} x2={260} y2={165 - tilt / 2 - browLift} />
      </g>
    );
  };

  const mouth = () => {
    if (face === "full")
      return <ellipse cx={200} cy={262} rx={34} ry={22} fill={C.pink} stroke={C.ink} strokeWidth={6} />;
    if (talking) {
      // 4 shapes by loudness; on loud frames alternate wide / round so it doesn't look like a flap
      if (amp < 0.3) return <ellipse cx={200} cy={262} rx={18} ry={7} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} />;
      if (amp < 0.6)
        return frame % 7 < 3 ? (
          <ellipse cx={200} cy={264} rx={14} ry={16} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} />
        ) : (
          <ellipse cx={200} cy={263} rx={24} ry={13} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} />
        );
      return (
        <g>
          <path d={`M172 252 Q200 ${262 + 30 * amp} 228 252 Z`} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={184} y={252} width={32} height={7} rx={3} fill={C.white} />
        </g>
      );
    }
    if (face === "pain") return <path d="M175 265 q8 -10 16 0 q8 10 16 0 q8 -10 16 0" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
    if (face === "wow") return <ellipse cx={200} cy={265} rx={14} ry={18} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} />;
    if (face === "think") return <path d="M180 265 L222 258" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
    return <path d="M175 255 Q200 285 225 255" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
  };

  const arm = (sx: number, sy: number, hx: number, hy: number) => {
    const mx = (sx + hx) / 2 + (hx < sx ? -30 : 30);
    const my = (sy + hy) / 2 + 30;
    return (
      <>
        <path d={`M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}`} stroke={C.ink} strokeWidth={50} strokeLinecap="round" fill="none" />
        <path d={`M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}`} stroke={MIA.hoodie} strokeWidth={36} strokeLinecap="round" fill="none" />
        <circle cx={hx} cy={hy} r={24} fill={MIA.skin} stroke={C.ink} strokeWidth={7} />
      </>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x - 200 * scale,
        top: y - 350 * scale,
        width: 400 * scale,
        height: 700 * scale,
        transform: `translateY(${hop}px) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <svg width={400 * scale} height={700 * scale} viewBox="0 0 400 700" style={{ overflow: "visible" }}>
        {/* hair (back) */}
        <path d="M95 210 Q90 80 200 70 Q310 80 305 210 L310 300 Q250 320 200 300 Q150 320 90 300 Z" fill={MIA.hair} stroke={C.ink} strokeWidth={8} />
        {/* legs */}
        <rect x={140} y={540} width={50} height={120} rx={20} fill={MIA.jeans} stroke={C.ink} strokeWidth={8} />
        <rect x={210} y={540} width={50} height={120} rx={20} fill={MIA.jeans} stroke={C.ink} strokeWidth={8} />
        <ellipse cx={160} cy={668} rx={42} ry={20} fill={MIA.shoes} stroke={C.ink} strokeWidth={8} />
        <ellipse cx={240} cy={668} rx={42} ry={20} fill={MIA.shoes} stroke={C.ink} strokeWidth={8} />
        {/* hoodie body */}
        <g transform={`translate(0 ${breathe * 0.3})`}>
          <path d="M110 330 Q120 300 200 300 Q280 300 290 330 L300 560 Q200 580 100 560 Z" fill={MIA.hoodie} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M150 470 H250 V520 Q200 535 150 520 Z" fill={MIA.hoodieDark} stroke={C.ink} strokeWidth={6} />
          <line x1={185} y1={315} x2={180} y2={380} stroke={C.ink} strokeWidth={5} />
          <line x1={215} y1={315} x2={220} y2={380} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* left arm behind props, right arm in front */}
        {arm(125, 335, lx, ly)}
        {/* head */}
        <g transform={`translate(0 ${breathe * 0.5}) rotate(${headTilt} 200 290)`}>
          <rect x={180} y={270} width={40} height={40} fill={MIA.skin} stroke={C.ink} strokeWidth={7} />
          <circle cx={200} cy={200} r={105} fill={MIA.skin} stroke={C.ink} strokeWidth={9} />
          <ellipse cx={140} cy={245} rx={20} ry={11} fill={C.pink} opacity={0.5} />
          <ellipse cx={260} cy={245} rx={20} ry={11} fill={C.pink} opacity={0.5} />
          {eyes()}
          {brows()}
          {mouth()}
          {/* bangs */}
          <path d="M95 190 Q100 85 200 85 Q300 85 305 190 Q270 130 220 140 Q200 110 170 140 Q120 125 95 190Z" fill={MIA.hair} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        </g>
        {pose === "spoon" && (
          <g transform="translate(235 215) rotate(-30)">
            <rect x={-6} y={0} width={12} height={90} rx={6} fill="#C9CED6" stroke={C.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-6} rx={18} ry={12} fill="#C9CED6" stroke={C.ink} strokeWidth={5} />
          </g>
        )}
        {pose === "tub" && <IceCreamTub x={200} y={400} />}
        {arm(275, 335, rx, ry)}
      </svg>
    </div>
  );
};

/* ---------- Virtual camera with parallax ----------
   keys: camera keyframes (frame, zoom, focus x/y, roll). The background moves less than the
   foreground, which gives depth. `whip` adds a fast pan + motion blur at the start of the shot. */
export type CamKey = { f: number; z: number; x: number; y: number; r?: number };
export const Shot: React.FC<{ keys: CamKey[]; bg?: React.ReactNode; whip?: -1 | 1; children: React.ReactNode }> = ({
  keys,
  bg,
  whip,
  children,
}) => {
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const opt = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: Easing.inOut(Easing.cubic) };
  const v = (key: "z" | "x" | "y" | "r") => (keys.length === 1 ? (keys[0][key] ?? 0) : interpolate(frame, fs, keys.map((k) => k[key] ?? 0), opt));
  const z = v("z");
  const x = v("x");
  const y = v("y");
  const r = v("r");
  const w = whip ? interpolate(frame, [0, 7], [whip * 700, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  const blur = whip ? interpolate(frame, [0, 7], [18, 0], { extrapolateRight: "clamp" }) : 0;
  const cam = (depth: number) => {
    const zz = 1 + (z - 1) * depth;
    const xx = 540 + (x - 540) * depth;
    const yy = 960 + (y - 960) * depth;
    return `translate(${540 + w * depth}px, 960px) rotate(${r * depth}deg) scale(${zz}) translate(${-xx}px, ${-yy}px)`;
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: blur ? `blur(${blur}px)` : undefined }}>
      {bg && <AbsoluteFill style={{ transformOrigin: "0 0", transform: cam(0.45) }}>{bg}</AbsoluteFill>}
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: cam(1) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Handy shots around a character standing at (x, y) */
export const cam = {
  wide: (f = 0): CamKey => ({ f, z: 1, x: 540, y: 960 }),
  medium: (cx: number, f = 0): CamKey => ({ f, z: 1.35, x: cx, y: 900 }),
  face: (cx: number, cy = 1000, f = 0): CamKey => ({ f, z: 2.1, x: cx, y: cy - 190 }),
  low: (cx: number, f = 0): CamKey => ({ f, z: 1.5, x: cx, y: 1150, r: -4 }),
};

export const IceCreamTub: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-40} rx={70} ry={30} fill="#FFE3EC" stroke={C.ink} strokeWidth={7} />
    <circle cx={-25} cy={-55} r={18} fill="#FF9EBB" stroke={C.ink} strokeWidth={5} />
    <circle cx={15} cy={-60} r={20} fill="#8B5A3C" stroke={C.ink} strokeWidth={5} />
    <path d="M-70 -40 L-55 50 Q0 65 55 50 L70 -40 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-58} y={-5} width={116} height={26} fill={C.pink} />
  </g>
);

/* ---------- Mia's apartment ---------- */
export const Apartment: React.FC<{ night?: boolean }> = ({ night = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #F3D8E4 0%, #E9C6DA 62%, #C99A7A 62%, #B5856A 100%)" }}>
      {/* window */}
      <div style={{ position: "absolute", left: 640, top: 520, width: 330, height: 400, border: `12px solid ${C.ink}`, borderRadius: 16, background: night ? "linear-gradient(180deg,#1A1F4A,#3B2E7A)" : "linear-gradient(180deg,#9DE0FF,#E6F7FF)", overflow: "hidden" }}>
        {night &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "absolute", left: 20 + i * 52, bottom: 0, width: 40, height: 80 + ((i * 53) % 120), background: "#151735", borderTop: `4px solid ${C.ink}` }}>
              {(frame + i * 7) % 60 > 10 && <div style={{ margin: "14px 10px", width: 12, height: 12, background: C.yellow }} />}
            </div>
          ))}
        <div style={{ position: "absolute", left: 159, top: 0, bottom: 0, width: 12, background: C.ink }} />
        <div style={{ position: "absolute", top: 190, left: 0, right: 0, height: 12, background: C.ink }} />
      </div>
      {/* fairy lights */}
      {new Array(9).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 60 + i * 115, top: 470 + Math.sin(i) * 20, width: 22, height: 22, borderRadius: "50%", background: [C.yellow, C.pink, C.cyan][i % 3], opacity: 0.6 + 0.4 * Math.abs(Math.sin(frame / 10 + i)), boxShadow: `0 0 18px ${C.yellow}` }} />
      ))}
    </AbsoluteFill>
  );
};

export const Box: React.FC<{ x: number; y: number; w?: number; h?: number; label?: string }> = ({ x, y, w = 260, h = 200, label }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#D9A066", border: `9px solid ${C.ink}`, borderRadius: 10, boxShadow: `8px 8px 0 ${C.ink}` }}>
    <div style={{ position: "absolute", left: w / 2 - 25, top: 0, width: 50, height: h, background: "#E8C08F", borderLeft: `4px solid ${C.ink}`, borderRight: `4px solid ${C.ink}` }} />
    {label && (
      <div style={{ position: "absolute", bottom: 14, width: "100%", textAlign: "center", fontFamily: "Inter", fontWeight: 900, fontSize: 30, color: C.ink }}>{label}</div>
    )}
  </div>
);

/* ---------- Shared shell for every "Nobody Told Me" episode ---------- */
// The ending's final gag needs ~1s after the last line, then it loops. No dead air.
export const MIA_LAYOUT = { tail: 1.5 };
export const MiaEpisode: React.FC<{
  t: Timing;
  label: string;
  hook: React.ReactNode;
  scenes: Record<string, () => React.ReactNode>;
}> = ({ t, label, hook, scenes }) => {
  const frame = useCurrentFrame();
  const { hookClip, hookLen, placed, total } = layout(t, "A", MIA_LAYOUT);
  const amp = ampAt(frame / FPS, hookClip, placed);
  return (
    <TalkContext.Provider value={amp}>
      <AbsoluteFill style={{ background: "#E9C6DA" }}>
        <Sequence durationInFrames={hookLen}>{hook}</Sequence>
        {placed.map((p, i) => (
          <Sequence key={i} from={p.from} durationInFrames={p.len}>
            {scenes[p.scene]()}
            <Sfx name="whoosh" at={0} volume={0.2} />
          </Sequence>
        ))}
        <Captions hookClip={hookClip} placed={placed} />
        <SeriesChrome label={label} total={total} showFrom={hookLen} />
        <Soundtrack hookClip={hookClip} placed={placed} total={total} />
      </AbsoluteFill>
    </TalkContext.Provider>
  );
};

/* ---------- More sets ---------- */
export const Supermarket: React.FC = () => {
  const items = ["#3DDC97", "#FF6B6B", "#FFC93C", "#5AA9FF", "#C77DFF", "#FF9F43"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #EAF6FF 0%, #DDEFF9 60%, #CFD8DC 60%, #B0BEC5 100%)" }}>
      <div style={{ position: "absolute", top: 380, left: 340, width: 400, padding: "10px 0", textAlign: "center", background: "#2ECC71", border: `8px solid ${C.ink}`, borderRadius: 18, fontFamily: "Inter", fontWeight: 900, fontSize: 56, color: C.white }}>PRODUCE</div>
      {[0, 1].map((side) => (
        <div key={side} style={{ position: "absolute", top: 540, left: side ? 700 : -40, width: 420, height: 640, background: "#F5F5F5", border: `10px solid ${C.ink}`, borderRadius: 12 }}>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} style={{ position: "absolute", top: 20 + row * 155, left: 16, right: 16, height: 130, borderBottom: `10px solid ${C.ink}`, display: "flex", alignItems: "flex-end", justifyContent: "space-around" }}>
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{ width: 56, height: 70 + ((k * 13 + row * 7) % 40), background: items[(k + row + side) % items.length], border: `6px solid ${C.ink}`, borderRadius: 10 }} />
              ))}
            </div>
          ))}
        </div>
      ))}
      {/* floor tiles */}
      {new Array(8).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: 1152, left: i * 140, width: 6, height: 800, background: "#90A4AE", transform: `skewX(${(i - 3.5) * 8}deg)` }} />
      ))}
    </AbsoluteFill>
  );
};

export const Kitchen: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF1D6 0%, #FDE3B8 58%, #C99A7A 58%, #B5856A 100%)" }}>
    {/* fridge */}
    <div style={{ position: "absolute", left: 40, top: 420, width: 260, height: 700, background: "#F0F4F8", border: `10px solid ${C.ink}`, borderRadius: 24 }}>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, height: 10, background: C.ink }} />
      <div style={{ position: "absolute", top: 90, right: 24, width: 14, height: 90, background: C.ink, borderRadius: 7 }} />
      <div style={{ position: "absolute", top: 300, right: 24, width: 14, height: 120, background: C.ink, borderRadius: 7 }} />
    </div>
    {/* counter + stove */}
    <div style={{ position: "absolute", left: 300, top: 900, width: 820, height: 60, background: "#8D6E63", border: `10px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: 300, top: 960, width: 820, height: 200, background: "#BCAAA4", border: `10px solid ${C.ink}`, borderTop: "none" }} />
    <div style={{ position: "absolute", left: 760, top: 870, width: 220, height: 30, background: "#555", border: `8px solid ${C.ink}`, borderRadius: 8 }} />
    {/* shelf with plant */}
    <div style={{ position: "absolute", left: 640, top: 560, width: 380, height: 22, background: "#8D6E63", border: `8px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: 700, top: 470, fontSize: 90, fontFamily: "Inter" }}>🪴</div>
    <div style={{ position: "absolute", left: 860, top: 480, fontSize: 80, fontFamily: "Inter" }}>🫙</div>
  </AbsoluteFill>
);

export const Cart: React.FC<{ x: number; y: number; items?: string[] }> = ({ x, y, items = [] }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 380, height: 300 }}>
    <svg width={380} height={300} viewBox="0 0 380 300">
      <path d="M10 20 H60 L90 200 H330 L360 70 H75" fill="none" stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
      <path d="M78 70 H360 L335 190 H95 Z" fill="rgba(90,169,255,0.25)" stroke={C.ink} strokeWidth={8} />
      <circle cx={120} cy={250} r={28} fill="#555" stroke={C.ink} strokeWidth={8} />
      <circle cx={300} cy={250} r={28} fill="#555" stroke={C.ink} strokeWidth={8} />
    </svg>
    {items.map((e, i) => (
      <div key={i} style={{ position: "absolute", left: 110 + i * 70, top: 30 - (i % 2) * 20, fontSize: 90, fontFamily: "Inter" }}>{e}</div>
    ))}
  </div>
);

export const SaladBowl: React.FC<{ x: number; y: number; s?: number; extras?: string[] }> = ({ x, y, s = 1, extras = [] }) => (
  <div style={{ position: "absolute", left: x - 200 * s, top: y - 150 * s, width: 400 * s, height: 300 * s }}>
    <svg width={400 * s} height={300 * s} viewBox="0 0 400 300">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse key={i} cx={70 + i * 43} cy={110 - (i % 3) * 18} rx={52} ry={34} fill={["#3DDC97", "#2BB673", "#7BE495"][i % 3]} stroke={C.ink} strokeWidth={6} />
      ))}
      <path d="M10 120 Q200 330 390 120 Z" fill={C.white} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      <path d="M40 150 Q200 260 360 150" stroke={C.cyan} strokeWidth={12} fill="none" />
    </svg>
    {extras.map((e, i) => (
      <div key={i} style={{ position: "absolute", left: (90 + i * 90) * s, top: 10 * s, fontSize: 90 * s, fontFamily: "Inter" }}>{e}</div>
    ))}
  </div>
);
