import { Composition, registerRoot } from "remotion";
import { Campaign } from "./Campaign";
import { defaults, frames, size, validateConfig } from "../config/project";
const Root = () => (
  <Composition
    id="AgroSegPlay"
    component={Campaign}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1050}
    defaultProps={{ config: defaults }}
    calculateMetadata={({ props }) => {
      const c = validateConfig(props.config);
      return { ...size(c), durationInFrames: frames(c), props: { config: c } };
    }}
  />
);
registerRoot(Root);
