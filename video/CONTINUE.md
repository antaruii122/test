# How to continue this project (on your computer or in the cloud)

Everything lives in the GitHub repo `antaruii122/test`, branch `claude/motion-graphics-remotion-3tagdc`, folder `video/`.
A new Claude session has **no memory** of earlier ones: point it at this file first ("read video/CONTINUE.md and video/PROJECT.md").

## What exists

| Series | Episodes (composition id) | Status |
|---|---|---|
| **Nobody Told Me… (Mia)** | `NobodyToldMe01-BrainFreeze`, `NobodyToldMe02-Salad`, `NobodyToldMe03-Onions`, `NobodyToldMe04-Perfume` | Main series. #4 is the new 30s format |
| The Story of… | `Ep01-Instagram-HookA/B/C`, `Ep02-Nintendo-HookA/C` | Instagram rendered; Nintendo built, not rendered |
| What If…? | `WhatIf01-Moon-HookA/C` | Test video |
| Early tests | `TikTokHistory1/2/3` | 15s tests |

Scripts (text, facts, sources) are in `episodes/*.json`. Scene code is in `src/episodes/*.tsx`. Mia, her sets and the camera are in `src/episodes/mia.tsx`.

## Set up (once per machine)

Needs Node 22+, Python 3.10+, ffmpeg.

```bash
git clone https://github.com/antaruii122/test.git
cd test && git checkout claude/motion-graphics-remotion-3tagdc
cd video
npm install
npm run setup:tts      # free Kokoro voice model (~120 MB)
npm run audio          # music + sound effects
```

The voice files are not stored in git, because they can be regenerated. Regenerate them for each episode you want to render:

```bash
npm run voice -- episodes/ntm04-perfume.json
```

## Make / render a video

```bash
npm run studio                                   # live preview in the browser
npx remotion render src/index.ts NobodyToldMe04-Perfume out/ep4.mp4 --crf=26
```

In a cloud session where Remotion can't download Chrome, add `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

## New Mia episode, step by step
1. Pick a topic. Verify every fact with a web search. Never invent numbers, and make no medical claims (everyday science only).
2. Write `episodes/ntmXX-<topic>.json`: hook, then lines with a `scene` key each, then sources. Use `say` for phonetic spelling of hard words.
3. `npm run voice -- episodes/ntmXX-<topic>.json`
4. `python3 tts/check_episode.py src/episodes/ntmXX.timing.json 1.3 0.35` must say OK (no dead air).
5. Copy `src/episodes/NTM04.tsx` as a template, write the scenes, then register them in `src/Root.tsx`.
6. Render stills (frame 0, the middle, and the last 3 seconds every 0.5s), fix any overlaps, then render the full video.
7. Run `bash tts/safe_check.sh out/<video>.mp4`. Nothing important (text, stickers, Mia's face) may sit in the red zones.

## Mia bible (keep this updated)
- **Who:** Mia, about 24, just moved into her first apartment alone. Curious, a bit dramatic, funny. Learns everyday things "nobody told her".
- **Look (never change):** dark-brown bob, yellow hoodie, blue jeans, white sneakers, rosy cheeks. Drawn in code, so she looks identical every episode.
- **Voice:** Kokoro `af_bella`, speed 1.04–1.08.
- **Places so far:** her apartment (moving boxes, window, fairy lights), the kitchen, the supermarket.
- **Continuity:** #1 moving day (ice cream), #2 first grocery shop (salad), #3 first real dinner (onions), #4 perfume.
- **Format rules (from #4):**
  - 30–40s long.
  - The hook is a surprising statement, and the topic is on screen from frame 0.
  - One setup line, 2–3 explanation beats, one tip.
  - The ending asks the viewer about themselves ("Be honest…"), then a 1-second gag that loops back to the hook.
  - Few stickers: they go outside the camera, and never in the caption zone (y > 1300).
- **Topic ideas (not yet done):**
  - why you're always colder than the guys at the office
  - why a smell can bring back an old memory
  - why coffee makes some people sleepy
  - why hair gets frizzy in humidity
  - why your feet feel cold first
  - why a hot shower fogs the mirror but not the window

## Safe zone (TikTok + Reels + Shorts)
- The apps cover the top 250px, the bottom 500px and the right 190px of the 1080x1920 frame. The safe area is x 90–890, y 250–1420 (`SAFE` in `kit.tsx`).
- Captions sit at y 1090. The title card is `MiaTopic`. Stickers go at `x={SAFE_CX}` with size 62 or less.
- No top tag and no progress bar: the apps hide them.

## Lessons learned (don't repeat)
- Never force a minimum length: it created 6–7s of frozen video. The dead-air check now blocks this.
- Check the last 3 seconds of every render frame by frame. Sampling one frame every 5s missed it.
- TikTok Creator Rewards doesn't pay in New Zealand, so YouTube Shorts is the main platform.
- Ricardo decides strategy (niches, what to sell). Propose options, then wait for his OK before building.
