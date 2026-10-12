// Renders all three TikTok-history videos to out/*.mp4
// Set REMOTION_BROWSER to a Chrome/headless-shell path if Remotion can't download its own.
import { execSync } from "node:child_process";
const browser = process.env.REMOTION_BROWSER ? `--browser-executable=${process.env.REMOTION_BROWSER}` : "";
for (const n of [1, 2, 3]) {
  execSync(`npx remotion render src/index.ts TikTokHistory${n} out/tiktok-history-${n}.mp4 ${browser}`, { stdio: "inherit" });
}
