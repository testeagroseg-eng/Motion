import { Background, Label, Title, useLayout } from "../components/SceneKit";
import { smooth } from "../animations/motion";
import type { SceneProps } from "./types";
const words = [
  "HERBICIDAS",
  "FUNGICIDAS",
  "FERTILIDADE",
  "BIOLÓGICOS",
  "MANEJO",
];
export function ChallengeScene({ config, frame, title }: SceneProps) {
  const { width, height, wide, pad } = useLayout();
  const a = config.theme.accent;
  const positions = wide
    ? [
        [0.1, 0.35],
        [0.59, 0.25],
        [0.46, 0.66],
        [0.07, 0.77],
        [0.77, 0.53],
      ]
    : [
        [0.08, 0.27],
        [0.42, 0.39],
        [0.1, 0.77],
        [0.47, 0.68],
        [0.61, 0.19],
      ];
  return (
    <>
      <Background config={config} />
      <div style={{ position: "absolute", inset: 0, perspective: 1000 }}>
        {words.map((w, i) => {
          const p = positions[i];
          const q = smooth(frame, i * 3, 28);
          const exit = smooth(frame, 90, 27);
          return (
            <div
              key={w}
              style={{
                position: "absolute",
                left: width * p[0],
                top: height * p[1],
                fontSize: wide ? 40 : 32,
                letterSpacing: 3,
                color: i === 2 ? a : "#688473",
                opacity: q * (1 - exit) * 0.85,
                transform: `translate(${Math.sin(frame / 55 + i) * 22}px,${(1 - q) * 80 + Math.cos(frame / 45 + i) * 18}px) rotateY(${(i - 2) * 8}deg) scale(${1 - exit * 0.8})`,
                filter: `blur(${i === 1 ? 1.5 : 0}px)`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: height * 0.45,
          textAlign: "center",
        }}
      >
        <Label color={a}>A evolução começa com você</Label>
        <Title text={title} frame={frame - 10} size={wide ? 125 : 111} center />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "66%",
          width: 1,
          height: 80,
          background: a,
          transform: `scaleY(${smooth(frame, 35, 30)})`,
          transformOrigin: "top",
          opacity: 0.6,
        }}
      />
    </>
  );
}
