import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

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
export type MiaPose = "relax" | "spoon" | "headHold" | "point" | "shrug" | "tub";

/** Episodes provide "is Mia talking right now" (computed on the global timeline) so her mouth moves with the voice. */
export const TalkContext = createContext<boolean>(false);

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
  const talking = useContext(TalkContext);
  const mouthOpen = talking ? 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.9)) : 0;
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
        <line x1={140} y1={165 - tilt / 2} x2={182} y2={165 + tilt / 2} />
        <line x1={218} y1={165 + tilt / 2} x2={260} y2={165 - tilt / 2} />
      </g>
    );
  };

  const mouth = () => {
    if (face === "full")
      return <ellipse cx={200} cy={262} rx={34} ry={22} fill={C.pink} stroke={C.ink} strokeWidth={6} />;
    if (mouthOpen > 0)
      return <ellipse cx={200} cy={262} rx={22} ry={6 + 18 * mouthOpen} fill="#7A1F2B" stroke={C.ink} strokeWidth={6} />;
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
        <g transform={`translate(0 ${breathe * 0.5})`}>
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
