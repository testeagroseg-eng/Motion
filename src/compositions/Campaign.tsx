import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { ProjectConfig, timeline, frames } from "../config/project";
import { Brand, sans } from "../components/SceneKit";
import { OpeningScene } from "../scenes/OpeningScene";
import { ChallengeScene } from "../scenes/ChallengeScene";
import { BrandRevealScene } from "../scenes/BrandRevealScene";
import { CoursesScene } from "../scenes/CoursesScene";
import { PlatformScene } from "../scenes/PlatformScene";
import { OfferScene } from "../scenes/OfferScene";
import { ClosingScene } from "../scenes/ClosingScene";
import { smooth } from "../animations/motion";
const sceneMap = {
  opening: OpeningScene,
  challenge: ChallengeScene,
  brand: BrandRevealScene,
  courses: CoursesScene,
  platform: PlatformScene,
  offer: OfferScene,
  closing: ClosingScene,
};
function Shot({
  config,
  scene,
}: {
  config: ProjectConfig;
  scene: ReturnType<typeof timeline>[number];
}) {
  const f = useCurrentFrame();
  const Component = sceneMap[scene.id];
  const entering = smooth(f, 0, 11);
  return (
    <AbsoluteFill
      style={{
        opacity: entering,
        transform: `scale(${1 + (1 - entering) * 0.035})`,
        filter: f < 8 ? `blur(${(1 - entering) * 2}px)` : "none",
      }}
    >
      <Component
        config={config}
        frame={f}
        length={scene.length}
        title={scene.title}
        subtitle={scene.subtitle}
      />
    </AbsoluteFill>
  );
}
export function Campaign({ config }: { config: ProjectConfig }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const scenes = timeline(config);
  const total = frames(config);
  const narration =
    config.format === "short"
      ? config.audio.shortNarration
      : config.audio.narration;
  const cue = config.captions.find(
    (c) => frame / 30 >= c.start && frame / 30 < c.end,
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: config.theme.ink,
        fontFamily: sans,
        color: "#f6f5ec",
        overflow: "hidden",
      }}
    >
      <style>{`@font-face{font-family:'Studio Sans';src:url('${staticFile("assets/studio-sans.otf")}') format('opentype');font-weight:400;font-display:block}@font-face{font-family:'Studio Sans';src:url('${staticFile("assets/studio-sans-bold.otf")}') format('opentype');font-weight:600;font-display:block}`}</style>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.length}
          premountFor={15}
        >
          <Shot config={config} scene={scene} />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          top: wide ? 66 : 120,
          left: wide ? 112 : 86,
          opacity: frame > scenes[6].from ? 0 : 0.85,
        }}
      >
        <Brand config={config} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: wide ? 46 : 122,
          left: wide ? 112 : 86,
          right: wide ? 112 : 86,
          display: "flex",
          justifyContent: "space-between",
          fontSize: wide ? 16 : 19,
          letterSpacing: 3,
          color: "#a3b9a2",
          opacity: 0.7,
        }}
      >
        <span>AGROSEGPLAY</span>
        <span>CONHECIMENTO QUE IMPULSIONA</span>
      </div>
      {config.captionsEnabled && cue && (
        <div
          style={{
            position: "absolute",
            bottom: wide ? 95 : 210,
            left: "9%",
            right: "9%",
            textAlign: "center",
            fontSize: wide ? 35 : 42,
            fontWeight: 600,
            lineHeight: 1.25,
            textShadow: "0 2px 12px #000",
            transform: `translateY(${(1 - smooth(frame - cue.start * 30, 0, 6)) * 15}px)`,
          }}
        >
          <span
            style={{
              background: "#0b1b15ec",
              borderRadius: 12,
              padding: "14px 22px",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {cue.text.split(" ").map((w, i, arr) => (
              <span
                key={i}
                style={{
                  color:
                    frame / 30 >
                    cue.start + ((cue.end - cue.start) * i) / arr.length
                      ? config.theme.accent
                      : "#fff",
                }}
              >
                {w}{" "}
              </span>
            ))}
          </span>
        </div>
      )}
      {narration && (
        <Audio
          src={staticFile(narration)}
          volume={config.audio.voiceVolume}
          delayRenderTimeoutInMilliseconds={60000}
        />
      )}{" "}
      {config.audio.music && (
        <Audio
          src={staticFile(
            config.format === "short"
              ? "audio/score-short.wav"
              : "audio/score.wav",
          )}
          volume={(f) =>
            config.audio.musicVolume *
            (narration ? 0.4 : 0.7) *
            Math.min(1, f / 20, (total - f) / 40)
          }
          loop
        />
      )}
    </AbsoluteFill>
  );
}
