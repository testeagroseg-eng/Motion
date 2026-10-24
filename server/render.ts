import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { resolve, join } from "node:path";
import { mkdir, unlink, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  ProjectConfig,
  frames,
  validateConfig,
  timeline,
} from "../src/config/project";
import { generateScore } from "./audio";
export const root = resolve(import.meta.dirname, "..");
export const publicDir = join(root, "public");
export function run(cmd: string, args: string[]) {
  return new Promise<string>((done, fail) => {
    const p = spawn(cmd, args, { cwd: root });
    let stdout = "",
      stderr = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr = (stderr + d).slice(-12000)));
    p.on("error", fail);
    p.on("close", (code) =>
      code === 0 ? done(stdout) : fail(new Error(`${cmd}: ${stderr}`)),
    );
  });
}
export function localAsset(name: string) {
  if (
    !/^(audio|assets|official|uploads)\/[a-zA-Z0-9_./-]+$/.test(name) ||
    name.split("/").includes("..")
  )
    throw new Error("Caminho de ativo inválido.");
  const p = resolve(publicDir, name);
  if (!p.startsWith(publicDir + "/"))
    throw new Error("Ativo fora da pasta pública.");
  return p;
}
export async function probe(path: string) {
  return JSON.parse(
    await run("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      path,
    ]),
  );
}
let bundlePromise: Promise<string> | null = null;
export function clearBundle() {
  bundlePromise = null;
}
export function getBundle(onProgress?: (n: number) => void) {
  if (!bundlePromise)
    bundlePromise = bundle({
      entryPoint: join(root, "src/compositions/Root.tsx"),
      publicDir,
      onProgress,
    }).catch((e) => {
      bundlePromise = null;
      throw e;
    });
  return bundlePromise;
}
export async function renderProject(
  input: ProjectConfig,
  output: string,
  onProgress: (n: number, stage: string) => void = () => {},
) {
  const config = validateConfig(input);
  const duration = frames(config) / 30;
  const paths = [
    config.assets.logo,
    config.assets.platform,
    ...config.assets.courses.map((x) => x.src),
  ].filter(Boolean);
  for (const p of paths) await access(localAsset(p));
  const voice =
    config.format === "short"
      ? config.audio.shortNarration
      : config.audio.narration;
  if (voice) {
    const info = await probe(localAsset(voice));
    if (Number(info.format.duration) > duration + 0.1)
      throw new Error(
        `A narração tem ${Number(info.format.duration).toFixed(1)}s, mas a composição tem ${duration.toFixed(1)}s. Aumente a duração das cenas ou substitua o áudio.`,
      );
  }
  await mkdir(resolve(output, ".."), { recursive: true });
  onProgress(0.01, "Preparando composição");
  const serveUrl = await getBundle((p) =>
    onProgress((p / 100) * 0.09, "Preparando composição"),
  );
  const browserExecutable =
    process.env.CHROME_EXECUTABLE || "/usr/bin/chromium";
  const props = { config };
  const composition = await selectComposition({
    serveUrl,
    id: "AgroSegPlay",
    inputProps: props,
    browserExecutable,
  });
  const silent = output.replace(/\.mp4$/, ".video.mp4");
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: silent,
    inputProps: props,
    browserExecutable,
    concurrency: 2,
    crf: 18,
    x264Preset: "fast",
    muted: true,
    timeoutInMilliseconds: 90000,
    onProgress: ({ progress }) =>
      onProgress(0.1 + progress * 0.83, "Renderizando quadros"),
    onBrowserLog: (log) => {
      if (log.type === "error") console.error(log.text);
    },
  });
  onProgress(0.95, "Mixando áudio e aplicando ducking");
  const score = output.replace(/\.mp4$/, ".score.wav");
  if (config.audio.music)
    await generateScore(
      score,
      duration,
      timeline(config)
        .slice(1)
        .map((s) => s.from / 30),
    );
  const args = ["-y", "-v", "error", "-i", silent];
  let filter = "",
    maps: string[] = [];
  if (voice && config.audio.music) {
    args.push("-i", localAsset(voice), "-stream_loop", "-1", "-i", score);
    filter = `[1:a]volume=${config.audio.voiceVolume},apad,atrim=duration=${duration},asplit=2[voice][key];[2:a]volume=${config.audio.musicVolume},atrim=duration=${duration},afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, duration - 1)}:d=1[music];[music][key]sidechaincompress=threshold=0.025:ratio=7:attack=12:release=280:makeup=1[duck];[voice][duck]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95:level=false[a]`;
    maps = ["-map", "[a]"];
  } else if (voice) {
    args.push("-i", localAsset(voice));
    filter = `[1:a]volume=${config.audio.voiceVolume},apad,atrim=duration=${duration}[a]`;
    maps = ["-map", "[a]"];
  } else if (config.audio.music) {
    args.push("-stream_loop", "-1", "-i", score);
    filter = `[1:a]volume=${config.audio.musicVolume},atrim=duration=${duration},afade=t=out:st=${Math.max(0, duration - 1)}:d=1[a]`;
    maps = ["-map", "[a]"];
  }
  if (filter) args.push("-filter_complex", filter);
  args.push(
    "-map",
    "0:v:0",
    ...maps,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-t",
    String(duration),
    "-movflags",
    "+faststart",
    output,
  );
  await run("ffmpeg", args);
  await unlink(silent);
  if (config.audio.music) await unlink(score);
  const info = await probe(output);
  if (
    !info.streams.some((s: { codec_type: string }) => s.codec_type === "video")
  )
    throw new Error("Saída sem vídeo.");
  if (
    (voice || config.audio.music) &&
    !info.streams.some((s: { codec_type: string }) => s.codec_type === "audio")
  )
    throw new Error("Saída sem áudio.");
  onProgress(1, "Concluído");
  return info;
}
