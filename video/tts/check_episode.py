"""Pre-render check: fail if any stretch without voice is too long (dead air).

Usage: python3 tts/check_episode.py src/episodes/ntm02.timing.json [tail_seconds]
Mirrors the layout in src/episodes/kit.tsx (GAP=0.6s between lines, 0.3s after the hook).
"""
import json
import sys

GAP, HOOK_GAP, MAX_SILENCE = 0.6, 0.3, 2.0

def main(path: str, tail: float):
    t = json.load(open(path))
    ok = True
    for key, hook in t["hooks"].items():
        sec = hook["dur"] + HOOK_GAP
        for line in t["lines"]:
            sec += line["dur"] + GAP
        last_voice = sec - GAP
        total = last_voice + tail
        dead_tail = total - last_voice
        status = "OK" if dead_tail <= MAX_SILENCE else "FAIL"
        ok &= status == "OK"
        print(f"{t['id']} hook {key}: {total:.1f}s total, {dead_tail:.1f}s after last line -> {status}")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 2.6)
