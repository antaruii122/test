"""Generate voiceover lines + timing for an episode script.

Usage: tts/.venv/bin/python tts/make_episode.py episodes/ep01-instagram.json
Writes public/<id>/*.wav and src/episodes/<id>.timing.json
"""
import json
import pathlib
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODELS = ROOT / "tts" / "models"


def words_with_times(text: str, dur: float):
    # Kokoro gives no word timestamps; spread words by character weight (+ pause after punctuation).
    words = text.split()
    weights = [len(w) + (3 if w[-1] in ".,?!" else 0) + 1 for w in words]
    total = sum(weights)
    t, out = 0.0, []
    for w, k in zip(words, weights):
        d = dur * k / total
        out.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def amplitude(samples: np.ndarray, sr: int, fps: int = 30):
    """Per-frame loudness 0..1 so the character's mouth follows the real voice."""
    hop = sr // fps
    n = int(np.ceil(len(samples) / hop))
    rms = np.array([np.sqrt(np.mean(samples[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    ref = np.percentile(rms, 95) or 1.0
    amp = np.clip(rms / ref, 0, 1)
    amp = np.convolve(amp, [0.25, 0.5, 0.25], mode="same")  # light smoothing
    return [round(float(a), 2) for a in amp]


def main(script_path: str):
    ep = json.loads(pathlib.Path(script_path).read_text())
    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.int8.onnx"), str(MODELS / "voices-v1.0.bin"))
    out_dir = ROOT / "public" / ep["id"]
    out_dir.mkdir(parents=True, exist_ok=True)

    def say(text: str, name: str, spoken: str | None = None):
        # `spoken` lets a line use phonetic spelling for TTS while captions keep the real text
        samples, sr = kokoro.create(spoken or text, voice=ep["voice"], speed=ep["speed"], lang="en-us")
        # trim leading/trailing silence so the voice starts on frame 0
        idx = np.where(np.abs(samples) > 0.01)[0]
        samples = samples[max(0, idx[0] - 200): idx[-1] + 2000] if len(idx) else samples
        sf.write(out_dir / f"{name}.wav", samples, sr)
        dur = len(samples) / sr
        return {
            "file": f"{ep['id']}/{name}.wav",
            "text": text,
            "dur": round(dur, 3),
            "words": words_with_times(text, dur),
            "amp": amplitude(samples, sr),
        }

    timing = {"id": ep["id"], "title": ep["title"], "hooks": {}, "lines": []}
    for key, text in ep["hooks"].items():
        timing["hooks"][key] = say(text, f"hook{key}")
    for i, line in enumerate(ep["lines"]):
        timing["lines"].append({"scene": line["scene"], **say(line["text"], f"line{i:02d}", line.get("say"))})

    dest = ROOT / "src" / "episodes" / f"{ep['id']}.timing.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(timing, indent=1))
    total = sum(l["dur"] for l in timing["lines"])
    print(f"wrote {dest} — body {total:.1f}s, hooks:", {k: v["dur"] for k, v in timing["hooks"].items()})


if __name__ == "__main__":
    main(sys.argv[1])
