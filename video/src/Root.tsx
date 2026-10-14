import React from "react";
import { Composition, Still } from "remotion";
import { FacebookCover, ProfilePhoto, YouTubeBanner } from "./brand/Brand";
import { Part1, Part2, Part3 } from "./Videos";
import { Ep01, ep01Duration, HookKey } from "./episodes/Ep01";
import { Ep02, ep02Duration, Ep02Hook } from "./episodes/Ep02";
import { WI01, wi01Duration, WI01Hook } from "./episodes/WI01";
import { NTM01, ntm01Duration } from "./episodes/NTM01";
import { NTM02, ntm02Duration } from "./episodes/NTM02";
import { NTM03, ntm03Duration } from "./episodes/NTM03";
import { NTM04, ntm04Duration } from "./episodes/NTM04";
import { NTM05, ntm05Duration } from "./episodes/NTM05";
import { DURATION, FPS, H, W } from "./theme";

const hooks: HookKey[] = ["A", "B", "C"];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TikTokHistory1" component={Part1} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="TikTokHistory2" component={Part2} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="TikTokHistory3" component={Part3} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    {hooks.map((h) => (
      <Composition
        key={h}
        id={`Ep01-Instagram-Hook${h}`}
        component={Ep01}
        defaultProps={{ hook: h }}
        durationInFrames={ep01Duration(h)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
    {(["A", "C"] as Ep02Hook[]).map((h) => (
      <Composition
        key={`ep02${h}`}
        id={`Ep02-Nintendo-Hook${h}`}
        component={Ep02}
        defaultProps={{ hook: h }}
        durationInFrames={ep02Duration(h)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  {(["A", "C"] as WI01Hook[]).map((h) => (
      <Composition
        key={`wi01${h}`}
        id={`WhatIf01-Moon-Hook${h}`}
        component={WI01}
        defaultProps={{ hook: h }}
        durationInFrames={wi01Duration(h)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  <Composition id="NobodyToldMe01-BrainFreeze" component={NTM01} durationInFrames={ntm01Duration()} fps={FPS} width={W} height={H} />
    <Composition id="NobodyToldMe02-Salad" component={NTM02} durationInFrames={ntm02Duration()} fps={FPS} width={W} height={H} />
    <Composition id="NobodyToldMe03-Onions" component={NTM03} durationInFrames={ntm03Duration()} fps={FPS} width={W} height={H} />
    <Composition id="NobodyToldMe04-Perfume" component={NTM04} durationInFrames={ntm04Duration()} fps={FPS} width={W} height={H} />
    <Composition id="NobodyToldMe05-OfficeCold" component={NTM05} durationInFrames={ntm05Duration()} fps={FPS} width={W} height={H} />
  <Still id="Brand-Profile" component={ProfilePhoto} width={800} height={800} />
    <Still id="Brand-YouTubeBanner" component={YouTubeBanner} width={2560} height={1440} />
    <Still id="Brand-FacebookCover" component={FacebookCover} width={1640} height={624} />
  </>
);
