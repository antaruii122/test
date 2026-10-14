import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { Mia } from "../episodes/mia";

export const BRAND_NAME = "Nobody Told Mia";
export const TAGLINE = "Everyday stuff nobody told you 💡";

const BG = "linear-gradient(160deg, #F7DCE8 0%, #EFC7DB 55%, #E5B3CE 100%)";

const Dots: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 22 }) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const x = ((i * 397) % 1000) / 1000;
      const y = ((i * 613) % 1000) / 1000;
      const s = 10 + ((i * 7) % 18);
      return (
        <div key={i} style={{ position: "absolute", left: x * w, top: y * h, width: s, height: s, borderRadius: "50%", background: [C.yellow, C.white, C.pink, C.cyan][i % 4], opacity: 0.55 }} />
      );
    })}
  </>
);

const Title: React.FC<{ size: number; tagSize: number; align?: "left" | "center" }> = ({ size, tagSize, align = "left" }) => (
  <div style={{ textAlign: align, fontFamily: FONT, fontWeight: 900 }}>
    <div style={{ fontSize: size, lineHeight: 1, color: C.white, WebkitTextStroke: `${size * 0.09}px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.07}px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
      Nobody Told <span style={{ color: C.yellow }}>Mia</span>
    </div>
    <div
      style={{
        display: "inline-block",
        marginTop: size * 0.28,
        fontSize: tagSize,
        color: C.ink,
        background: C.white,
        border: `${tagSize * 0.12}px solid ${C.ink}`,
        borderRadius: tagSize,
        padding: `${tagSize * 0.25}px ${tagSize * 0.7}px`,
        boxShadow: `${tagSize * 0.15}px ${tagSize * 0.15}px 0 ${C.ink}`,
        whiteSpace: "nowrap",
      }}
    >
      {TAGLINE}
    </div>
  </div>
);

/* Profile photo: Mia's face, centered for circular crops. No text (too small to read). */
export const ProfilePhoto: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
    <Dots w={800} h={800} n={14} />
    <div style={{ position: "absolute", left: 60, top: 60, width: 680, height: 680, borderRadius: "50%", background: C.yellow, opacity: 0.35 }} />
    <Mia x={400} y={700} scale={1.9} face="happy" pose="point" />
  </AbsoluteFill>
);

/* YouTube banner 2560x1440. Safe area (all devices): 1546x423 centered → x 507–2053, y 508–931. */
export const YouTubeBanner: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
    <Dots w={2560} h={1440} n={40} />
    <Mia x={800} y={720} scale={0.6} face="happy" pose="point" />
    <div style={{ position: "absolute", left: 1000, top: 620 }}>
      <Title size={108} tagSize={44} />
    </div>
  </AbsoluteFill>
);

/* Facebook cover 1640x624. Keep the left-bottom clear (profile photo overlaps on desktop); mobile crops the sides. */
export const FacebookCover: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
    <Dots w={1640} h={624} n={30} />
    <div style={{ position: "absolute", left: 170, top: 170 }}>
      <Title size={112} tagSize={44} />
    </div>
    <Mia x={1410} y={560} scale={0.9} face="happy" pose="point" />
  </AbsoluteFill>
);
