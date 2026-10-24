import {
  Background,
  ImagePanel,
  Label,
  Title,
  useLayout,
} from "../components/SceneKit";
import { smooth } from "../animations/motion";
import type { SceneProps } from "./types";
const names = [
  "Herbicidas",
  "Inseticidas",
  "Fungicidas",
  "Biológicos",
  "Fertilidade do solo",
];
export function CoursesScene({ config, frame, title }: SceneProps) {
  const { width, height, wide, pad } = useLayout();
  const a = config.theme.accent;
  const cw = wide ? 370 : 680;
  const ch = wide ? 390 : 450;
  const track = Math.max(0, Math.min(4, (frame - 20) / 37));
  const active = Math.round(track);
  return (
    <>
      <Background config={config} />
      <div
        style={{
          position: "absolute",
          left: pad,
          top: height * (wide ? 0.18 : 0.18),
        }}
      >
        <Label color={a}>Temas do universo agro</Label>
        <Title text={title} frame={frame} size={wide ? 88 : 106} />
      </div>
      <div
        style={{
          position: "absolute",
          top: wide ? height * 0.49 : height * 0.49,
          left: 0,
          width: "100%",
          height: ch,
          perspective: 1500,
        }}
      >
        {names.map((name, i) => {
          const shift = i - track;
          const x = width / 2 - cw / 2 + shift * (cw * 0.64);
          const q = smooth(frame, i * 3, 27);
          const course = config.assets.courses[i];
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                width: cw,
                height: ch,
                left: x,
                top: Math.abs(shift) * 15,
                transform: `translateY(${(1 - q) * 150}px) rotateY(${-shift * 12}deg) translateZ(${-Math.abs(shift) * 100}px)`,
                opacity: Math.max(0.22, 1 - Math.abs(shift) * 0.25) * q,
                border: "1px solid #5c8b5c77",
                borderRadius: 22,
                background: "linear-gradient(145deg,#244b35,#10221a)",
                overflow: "hidden",
                boxShadow: "0 28px 70px #0007",
              }}
            >
              {course?.src ? (
                <ImagePanel
                  src={course.src}
                  frame={frame}
                  style={{ position: "absolute", inset: 0, opacity: 0.72 }}
                />
              ) : (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(ellipse at ${20 + i * 15}% 20%,#a3d96825,transparent 70%)`,
                    }}
                  />
                  <svg width="100%" height="100%" viewBox="0 0 600 450">
                    <g stroke={a} strokeWidth="1" opacity=".24">
                      {Array.from({ length: 9 }, (_, j) => (
                        <ellipse
                          key={j}
                          cx={320 + Math.sin(frame / 90) * 10}
                          cy="170"
                          rx={25 + j * 32}
                          ry={20 + j * 19}
                          transform={`rotate(${-20 + i * 13} 320 170)`}
                          fill="none"
                        />
                      ))}
                    </g>
                  </svg>
                </>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(transparent,#091c11dd)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 35,
                  bottom: 36,
                  right: 25,
                }}
              >
                <div
                  style={{
                    fontSize: 19,
                    color: a,
                    letterSpacing: 4,
                    marginBottom: 12,
                  }}
                >
                  EXPLORE
                </div>
                <div
                  style={{
                    fontSize: wide ? 37 : 49,
                    fontWeight: 600,
                    letterSpacing: -1,
                  }}
                >
                  {course?.label || name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: pad,
          top: wide ? height * 0.92 : height * 0.79,
          display: "flex",
          gap: 10,
        }}
      >
        {names.map((_, i) => (
          <div
            key={i}
            style={{
              height: 3,
              width: i === active ? 65 : 24,
              background: i === active ? a : "#456245",
              transition: "none",
            }}
          />
        ))}
      </div>
    </>
  );
}
