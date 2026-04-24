import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const binName = process.platform === "win32" ? "hyperframes.cmd" : "hyperframes";
const hyperframesBin = path.join(workspaceRoot, "node_modules", ".bin", binName);

if (!existsSync(hyperframesBin)) {
  console.error("HyperFrames CLI is not installed yet. Run npm install in motion/hyperframes-hero.");
  process.exit(1);
}

const ffprobePath = ffprobeStatic.path;
const extraPathEntries = [
  path.dirname(ffmpegPath),
  path.dirname(ffprobePath),
  path.join(workspaceRoot, "node_modules", ".bin"),
];

const env = {
  ...process.env,
  PATH: `${extraPathEntries.join(path.delimiter)}${path.delimiter}${process.env.PATH ?? ""}`,
  FFMPEG_PATH: ffmpegPath,
  FFPROBE_PATH: ffprobePath,
};

const result = spawnSync(hyperframesBin, process.argv.slice(2), {
  cwd: workspaceRoot,
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);

