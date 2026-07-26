import type { Scene } from "@/engine/types";

export interface VisualizationStage {
  id: string;
  kicker: string;
  title: string;
  description: string;
  formula?: string;
  insight?: string;
  scene: Scene;
}

export interface VisualizationDefinition {
  id: string;
  title: string;
  shortTitle?: string;
  chapter: string;
  order: number;
  description: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  duration: number;
  accent: string;
  stages: VisualizationStage[];
  controls?: {
    constraints?: boolean;
    lattice?: boolean;
    vertices?: boolean;
    labels?: boolean;
  };
  proof?: {
    title: string;
    steps: string[];
  };
}

export interface VisualizationModule {
  default: VisualizationDefinition;
}
