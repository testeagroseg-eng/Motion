import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  frames,
  size,
  timeline,
  validateConfig,
} from "../src/config/project";
import { parseCaptions } from "../src/utils/captions";
import { localAsset } from "../server/render";
test("35-second campaign and 15-second cut have contiguous, deterministic frame ranges", () => {
  for (const [format, expected] of [
    ["vertical", 1050],
    ["horizontal", 1050],
    ["short", 450],
  ] as const) {
    const c = { ...defaults, format };
    assert.equal(frames(c), expected);
    let end = 0;
    for (const s of timeline(c)) {
      assert.equal(s.from, end);
      end += s.length;
    }
    assert.equal(end, expected);
    assert.deepEqual(
      size(c),
      format === "horizontal"
        ? { width: 1920, height: 1080 }
        : { width: 1080, height: 1920 },
    );
  }
});
test("unverified commercial offer cannot be rendered", () => {
  assert.throws(
    () =>
      validateConfig({
        ...defaults,
        offer: { ...defaults.offer, enabled: true },
      }),
    /Confirme/,
  );
  assert.throws(
    () =>
      validateConfig({
        ...defaults,
        offer: {
          ...defaults.offer,
          enabled: true,
          verified: true,
          source: "https://unrelated.example/",
        },
      }),
    /Confirme/,
  );
});
test("captions require actual cues and positive time ranges", () => {
  assert.throws(
    () => validateConfig({ ...defaults, captionsEnabled: true }),
    /Importe/,
  );
  assert.throws(() =>
    parseCaptions("1\n00:00:04,000 --> 00:00:02,000\nInválido"),
  );
  const [cue] = parseCaptions(
    "WEBVTT\n\n00:00:01.500 --> 00:00:03.000\nUma frase real.",
  );
  assert.deepEqual(cue, { start: 1.5, end: 3, text: "Uma frase real." });
});
test("rendered assets stay in the public asset folders", () => {
  assert.throws(() => localAsset("../../etc/passwd"));
  assert.throws(() => localAsset("uploads/../../private"));
  assert.throws(() => localAsset("https://unrelated.example/x"));
  assert.ok(
    localAsset("audio/narration-35.wav").endsWith(
      "/public/audio/narration-35.wav",
    ),
  );
});
test("duplicate scenes and out-of-range durations are rejected", () => {
  assert.throws(() =>
    validateConfig({
      ...defaults,
      scenes: defaults.scenes.map((s) => ({ ...s, id: "opening" })),
    }),
  );
  assert.throws(() =>
    validateConfig({
      ...defaults,
      scenes: defaults.scenes.map((s) => ({ ...s, duration: 0 })),
    }),
  );
});
