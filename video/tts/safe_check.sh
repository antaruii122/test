#!/usr/bin/env bash
# Marks the zones TikTok / Reels / Shorts cover (red) on a frame every 2s, so you can see if
# anything important is hidden. Usage: tts/safe_check.sh out/video.mp4  -> out/stills/<name>_safe.png
set -euo pipefail
in="$1"; name=$(basename "$in" .mp4); mkdir -p out/stills
ffmpeg -loglevel error -y -i "$in" -vf "fps=1/2,drawbox=x=0:y=0:w=1080:h=250:color=red@0.45:t=fill,drawbox=x=0:y=1420:w=1080:h=500:color=red@0.45:t=fill,drawbox=x=890:y=250:w=190:h=1170:color=red@0.45:t=fill,scale=180:-1,tile=10x2" -frames:v 1 "out/stills/${name}_safe.png"
echo "out/stills/${name}_safe.png"
