import type { ProjectConfig } from "../config/project";
export type SceneProps = {
  config: ProjectConfig;
  frame: number;
  length: number;
  title: string;
  subtitle: string;
};
