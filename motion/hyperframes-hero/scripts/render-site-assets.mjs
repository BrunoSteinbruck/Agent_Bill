import { mkdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(workspaceRoot, "..", "..");
const runHyperframesScript = path.join(workspaceRoot, "scripts", "run-hyperframes.mjs");
const videosDir = path.join(repoRoot, "public", "videos");
const imagesDir = path.join(repoRoot, "public", "images");
const mp4Path = path.join(videosDir, "hero.mp4");
const webmPath = path.join(videosDir, "hero.webm");
const posterPath = path.join(imagesDir, "hero-poster.webp");

mkdirSync(videosDir, { recursive: true });
mkdirSync(imagesDir, { recursive: true });

function runNodeScript(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: workspaceRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, {
    cwd: workspaceRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNodeScript([
  runHyperframesScript,
  "render",
  ".",
  "-o",
  mp4Path,
  "--fps",
  "24",
  "--quality",
  "standard",
  "--workers",
  "1",
]);

runFfmpeg([
  "-y",
  "-i",
  mp4Path,
  "-an",
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "34",
  "-deadline",
  "good",
  "-cpu-used",
  "2",
  webmPath,
]);

runFfmpeg([
  "-y",
  "-ss",
  "00:00:01.200",
  "-i",
  mp4Path,
  "-frames:v",
  "1",
  "-vf",
  "scale=1600:-1",
  "-c:v",
  "libwebp",
  "-compression_level",
  "6",
  "-quality",
  "82",
  posterPath,
]);

console.log(`Rendered hero assets:
- ${mp4Path}
- ${webmPath}
- ${posterPath}`);
