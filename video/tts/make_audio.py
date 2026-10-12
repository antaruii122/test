"""Synthesize an original, royalty-free music bed + SFX (no samples, no licensing).

Usage: tts/.venv/bin/python tts/make_audio.py
Writes public/audio/music.wav, public/audio/{pop,whoosh,ding,coin,boom}.wav
"""
import pathlib

import numpy as np
import soundfile as sf

SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def tone(freq, dur, kind="sine"):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * freq * t
    if kind == "square":
        return np.sign(np.sin(ph)) * 0.6
    if kind == "saw":
        return 2 * (t * freq % 1) - 1
    return np.sin(ph)


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def music(seconds=75, bpm=112):
    beat = 60 / bpm
    n = int(seconds * SR)
    mix = np.zeros(n)

    def add(sig, t0, gain):
        i = int(t0 * SR)
        j = min(n, i + len(sig))
        if i < n:
            mix[i:j] += sig[: j - i] * gain

    kick_n = int(0.3 * SR)
    t = np.arange(kick_n) / SR
    kick = np.sin(2 * np.pi * (50 + 120 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    hat = rng.standard_normal(int(0.05 * SR)) * env(int(0.05 * SR), 0.001, 0.015)
    hat = np.diff(hat, prepend=0)  # crude high-pass
    clap = rng.standard_normal(int(0.15 * SR)) * env(int(0.15 * SR), 0.001, 0.04)

    # I–V–vi–IV in C, bright and poppy
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    bass = [36, 31, 33, 29]
    melody = [72, 74, 76, 79, 76, 74, 72, 67]
    bars = int(seconds / (beat * 4)) + 1
    for b in range(bars):
        t0 = b * beat * 4
        ch = chords[b % 4]
        for k in range(4):
            add(kick, t0 + k * beat, 0.9)
            add(hat, t0 + k * beat + beat / 2, 0.25)
            if k in (1, 3):
                add(clap, t0 + k * beat, 0.35)
        for k in range(8):  # pluck arpeggio, 8th notes
            note = ch[k % 3] + (12 if k >= 4 else 0)
            sig = tone(midi(note), beat / 2, "square") * env(int(beat / 2 * SR), 0.003, 0.08)
            add(sig, t0 + k * beat / 2, 0.08)
        for k in range(4):  # bass on every beat
            sig = tone(midi(bass[b % 4]), beat * 0.9, "saw") * env(int(beat * 0.9 * SR), 0.005, 0.25)
            add(sig, t0 + k * beat, 0.18)
        if b % 2 == 1:  # little bell melody every other bar
            for k, m in enumerate(melody):
                sig = tone(midi(m + 12), beat / 2) * env(int(beat / 2 * SR), 0.002, 0.15)
                add(sig, t0 + k * beat / 2, 0.06)

    fade = int(2 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix /= np.max(np.abs(mix)) * 1.15
    sf.write(OUT / "music.wav", np.stack([mix, mix], 1).astype(np.float32), SR)


def sfx():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    pop = np.sin(2 * np.pi * (400 + 900 * np.exp(-t * 40)) * t) * env(n, 0.001, 0.04)
    sf.write(OUT / "pop.wav", pop * 0.8, SR)

    n = int(0.45 * SR)
    noise = rng.standard_normal(n)
    sweep = np.zeros(n)
    a = 0.0
    cut = np.linspace(0.02, 0.4, n) * np.sin(np.linspace(0, np.pi, n))
    for i in range(n):  # one-pole low-pass with rising cutoff
        a += cut[i] * (noise[i] - a)
        sweep[i] = a
    whoosh = sweep * np.sin(np.linspace(0, np.pi, n)) ** 2
    sf.write(OUT / "whoosh.wav", whoosh / np.max(np.abs(whoosh)) * 0.7, SR)

    d = 0.9
    ding = (tone(1568, d) + 0.5 * tone(2349, d) + 0.25 * tone(3136, d)) * env(int(d * SR), 0.002, 0.3)
    sf.write(OUT / "ding.wav", ding / np.max(np.abs(ding)) * 0.6, SR)

    a = tone(988, 0.08, "square") * env(int(0.08 * SR), 0.001, 0.05)
    b = tone(1319, 0.4, "square") * env(int(0.4 * SR), 0.001, 0.15)
    coin = np.concatenate([a, b])
    sf.write(OUT / "coin.wav", coin * 0.35, SR)

    n = int(1.0 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (40 + 80 * np.exp(-t * 8)) * t) * np.exp(-t * 3)
    boom += rng.standard_normal(n) * np.exp(-t * 12) * 0.3
    sf.write(OUT / "boom.wav", boom / np.max(np.abs(boom)) * 0.9, SR)


if __name__ == "__main__":
    music()
    sfx()
    print("wrote", sorted(p.name for p in OUT.iterdir()))
