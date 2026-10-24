import { generateScore } from "../server/audio";
import { defaults, timeline, frames } from "../src/config/project";
for (const format of ["vertical", "short"] as const) {
  const c = { ...defaults, format };
  await generateScore(
    format === "short"
      ? "public/audio/score-short.wav"
      : "public/audio/score.wav",
    frames(c) / 30,
    timeline(c)
      .slice(1)
      .map((s) => s.from / 30),
  );
}
