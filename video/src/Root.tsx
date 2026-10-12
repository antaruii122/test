import React from "react";
import { Composition } from "remotion";
import { Part1, Part2, Part3 } from "./Videos";
import { Ep01, ep01Duration, HookKey } from "./episodes/Ep01";
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
  </>
);
