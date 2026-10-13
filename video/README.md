# Motion graphics (Remotion)

**Start here:** read `CONTINUE.md` (how to resume on any machine) and `PROJECT.md` (plan and series).

Vertical 1080x1920 cartoon explainers. Series: **Before They Were Famous** (brand origin stories, ~61s each).

## Hook rules (first 3 seconds)
- Every hook names the topic first, spoken and on screen from frame 0: "The story of <App>: …".
- After the name comes the most surprising fact (a number, a flop, an unexpected origin).
- Frame 0 is never empty: no fade, no zoom, no intro card.

## Pipeline
1. Script: `episodes/epXX-*.json` (3 hook variants A/B/C + lines, each with a `scene` key, plus sources).
2. Voice: `npm run voice:ep01` uses Kokoro TTS (free, Apache-2.0, runs locally). It writes `public/ep01/*.wav` and `src/episodes/ep01.timing.json`.
3. Music + SFX: `npm run audio` synthesizes an original music bed and sound effects, so there are no licensing issues.
4. Render: `npm run render:ep01` renders all 3 hook variants. If Remotion can't download Chrome, set `REMOTION_FLAGS="--browser-executable=/path/to/headless_shell"`.

One-time setup: `npm install && npm run setup:tts`.

Preview/edit live: `npm run studio`.
