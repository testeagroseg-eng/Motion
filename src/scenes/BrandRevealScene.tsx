import {
  Background,
  Brand,
  Label,
  Title,
  ImagePanel,
  useLayout,
} from "../components/SceneKit";
import { pop, smooth } from "../animations/motion";
import type { SceneProps } from "./types";
export function BrandRevealScene({ config, frame, subtitle }: SceneProps) {
  const { height, width, wide, pad } = useLayout();
  const q = pop(frame, 3);
  return (
    <>
      <Background config={config} />
      <div
        style={{
          position: "absolute",
          width: width * 0.85,
          height: width * 0.85,
          borderRadius: "50%",
          border: "1px solid #6e9d5133",
          left: width * 0.08,
          top: height * 0.15,
          transform: `scale(${0.8 + smooth(frame) * 0.4})`,
          boxShadow: "0 0 140px #9bdb5a08 inset",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: wide ? height * 0.2 : height * 0.27,
          textAlign: "center",
          opacity: smooth(frame),
          transform: `translateY(${(1 - q) * 70}px) scale(${0.9 + 0.1 * q})`,
        }}
      >
        <Label color={config.theme.accent}>Apresentamos</Label>
        <Brand config={config} large />
      </div>
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: height * (wide ? 0.49 : 0.45),
        }}
      >
        <Title
          text={subtitle.replace(" que ", "\nque ")}
          frame={frame - 23}
          size={wide ? 66 : 72}
          center
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: wide ? width * 0.29 : pad,
          right: wide ? width * 0.29 : pad,
          top: height * (wide ? 0.72 : 0.68),
          height: wide ? 240 : 340,
          perspective: 1400,
          opacity: smooth(frame, 34, 24),
          transform: `translateY(${(1 - smooth(frame, 34)) * 90}px)`,
        }}
      >
        <ImagePanel
          src="assets/field.jpg"
          frame={frame}
          style={{
            height: "100%",
            borderRadius: 20,
            transform: `rotateX(16deg) rotateY(${Math.sin(frame / 100) * 5}deg)`,
            boxShadow: "0 40px 100px #0008",
            border: "1px solid #7ea46366",
          }}
        />
      </div>
    </>
  );
}
