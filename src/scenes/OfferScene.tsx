import { hasOffer } from "../config/project";
import {
  Background,
  Label,
  Title,
  useLayout,
  Arrow,
} from "../components/SceneKit";
import { smooth, pop } from "../animations/motion";
import type { SceneProps } from "./types";
export function OfferScene({ config, frame, title, subtitle }: SceneProps) {
  const { height, wide, pad } = useLayout();
  const a = config.theme.accent;
  const enabled = hasOffer(config);
  return (
    <>
      <Background config={config} />
      <div
        style={{
          position: "absolute",
          left: "-20%",
          right: "-20%",
          top: "-25%",
          height: "110%",
          background: `radial-gradient(ellipse,${a}13,transparent 62%)`,
          transform: `scale(${0.9 + frame / 1000})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: height * (wide ? 0.26 : 0.29),
        }}
      >
        <Label color={a}>
          {enabled ? "CONDIÇÃO ESPECIAL DE ACESSO" : "CONTINUE EVOLUINDO"}
        </Label>
        {enabled ? (
          <>
            <div
              style={{
                fontSize: wide ? 52 : 58,
                color: "#8caa8e",
                position: "relative",
                display: "inline-block",
              }}
            >
              R$ {config.offer.previous}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  height: 3,
                  left: -8,
                  width: `${smooth(frame, 10, 20) * 108}%`,
                  background: "#8caa8e",
                  transform: "rotate(-4deg)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: wide ? 210 : 190,
                letterSpacing: -12,
                fontWeight: 650,
                lineHeight: 1.2,
                color: a,
                transform: `scale(${0.93 + 0.07 * pop(frame, 20)})`,
                transformOrigin: "left",
                opacity: smooth(frame, 18, 15),
              }}
            >
              <span style={{ fontSize: 60, letterSpacing: -3 }}>R$ </span>
              {config.offer.current}
            </div>
          </>
        ) : (
          <Title text={title} frame={frame} size={wide ? 126 : 118} />
        )}
        <div
          style={{
            fontSize: wide ? 31 : 32,
            color: "#b6c9b7",
            marginTop: 55,
            maxWidth: 850,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 70,
            display: "flex",
            alignItems: "center",
            gap: 25,
            color: a,
            fontSize: 39,
            opacity: smooth(frame, 30),
          }}
        >
          play.agroseg.net.br <Arrow color={a} />
        </div>
      </div>
    </>
  );
}
