# Shorts Factory: project plan

Goal: post 1 animated vertical short per day for 60 days (YouTube Shorts as the main platform, plus TikTok, Instagram Reels and Facebook) and earn from ads, affiliate links and brand deals.
Base: New Zealand, so YouTube Partner Program applies. TikTok Creator Rewards does not cover NZ [VERIFY in TikTok Studio].

## Series

| # | Series | Status |
|---|--------|--------|
| 1 | **The Story of…** (brand/history stories). Order: Instagram → Nintendo → Vikings → YouTube → PlayStation → Samsung → Twitch → Nokia → Discord → Red Bull | Ep01 done, Ep02 Nintendo built (not rendered) |
| 2 | **What If…?** (speculative science, cartoon Earth/Moon characters) | Test video WI01 "What if the Moon disappeared?" |
| Existing | Map facts (WorldAtlas formula / MapReel) | Ricardo's existing project, kept separate |

## Future ideas (saved, not started)
- **How This Scam Works**: animated breakdowns of real scams. Low competition, security niche, affiliate links (password managers / security apps).
- **Why Is It So Cheap / Expensive?**: everyday economics. Business niche, and it cross-promotes with The Story of….

## Hook rules (every video)
1. The first words name the topic: "The story of X:", "How does X work?", or "Why does X…?". The topic is also on screen from frame 0.
2. Next comes the most surprising fact: a number, a flop, or an unexpected origin.
3. Frame 0 is never empty: no fade, no zoom, no intro card.
4. The last line loops back to the hook.
5. Length is at least 61s, which TikTok requires for monetization.

## Fact rules
- Every fact gets a web check before it's scripted. Sources go in the episode JSON and in the post description.
- Never invent numbers. If a fact isn't confirmed, cut it or rephrase it.

## Production checklist (per episode, about 30–40 min)
1. Research and verify facts, then write `episodes/epXX-<name>.json` with hooks A and C plus lines and sources.
2. `npm run voice -- episodes/epXX-<name>.json` generates the voice lines and their timing.
3. Build the scenes in `src/episodes/EpXX.tsx` and register them in `src/Root.tsx`.
4. Render still frames 0, 120 and the middle, then fix any layout issues.
5. Render hooks A and C (about 4 min each).
6. Write the posting kit in `posts/epXX.md`: title, description, hashtags, sources.

## 60-day schedule
- **Weeks 1–2:** Story-of episodes 1–10, posted daily.
- **Week 3:** add a second series, once Ricardo picks one.
- **Week 3:** start pitching "your brand's story in 60s" to 20–30 companies, using the channel as the portfolio.
- **Day 30:** review "Viewed vs. Swiped Away" and average view duration per series. Double down on the best series and drop the worst.
- **Day 60:** decide whether to continue, based on subscribers, affiliate clicks and inbound requests.

## Realistic money (be honest)
- YPP needs 1,000 subscribers plus 10M Shorts views in 90 days. Shorts pay about $0.03–0.08 per 1,000 views.
- Within 60 days, the realistic income is affiliate commissions plus 1–3 paid brand-story videos, not ad revenue.
