import React from "react";
import { Composition } from "remotion";
import { Part1, Part2, Part3 } from "./Videos";
import { DURATION, FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TikTokHistory1" component={Part1} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="TikTokHistory2" component={Part2} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="TikTokHistory3" component={Part3} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
  </>
);
