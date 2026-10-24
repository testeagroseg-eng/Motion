import {
  Background,
  Brand,
  Title,
  Label,
  Arrow,
  useLayout,
} from "../components/SceneKit";
import { FieldWorld } from "../components/FieldWorld";
import { smooth } from "../animations/motion";
import type { SceneProps } from "./types";
export function ClosingScene({ config, frame, title, subtitle }: SceneProps) {
  const { width, height, wide, pad } = useLayout();
  const a = config.theme.accent;
  return (
    <>
      <Background config={config} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.26 }}>
        <FieldWorld
          frame={frame + 200}
          width={width}
          height={height}
          color={a}
          mode="orbit"
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: wide ? height * 0.19 : height * 0.25,
          textAlign: "center",
          opacity: smooth(frame),
        }}
      >
        <Brand config={config} large />
      </div>
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: wide ? height * 0.42 : height * 0.42,
        }}
      >
        <Title text={title} frame={frame - 8} size={wide ? 94 : 98} center />
      </div>
      <div
        style={{
          position: "absolute",
          left: wide ? width * 0.25 : pad,
          right: wide ? width * 0.25 : pad,
          top: height * 0.68,
          opacity: smooth(frame, 22),
          transform: `translateY(${(1 - smooth(frame, 22)) * 35}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: wide ? "27px 42px" : "36px 40px",
            background: a,
            borderRadius: 100,
            color: config.theme.ink,
            fontSize: wide ? 39 : 44,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          play.agroseg.net.br
          <Arrow color={config.theme.ink} />
        </div>
        <div style={{ marginTop: 34, textAlign: "center" }}>
          <Label color={a}>{subtitle}</Label>
        </div>
      </div>
    </>
  );
}
