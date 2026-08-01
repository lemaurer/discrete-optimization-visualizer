import type { Scene } from "@/engine/types";

export type VisualizationNavigationMode = "detail" | "split" | "closure";

export interface VisualizationStageNavigation {
  closure?: number;
  split?: number;
  milestone?: "split" | "closure";
}

export interface VisualizationStage {
  id: string;
  kicker: string;
  title: string;
  description: string;
  formula?: string;
  insight?: string;
  scene: Scene;
  navigation?: VisualizationStageNavigation;
}

export interface VisualizationProof {
  title: string;
  steps: string[];
}

export interface VisualizationExample {
  id: string;
  title: string;
  description?: string;
  stages: VisualizationStage[];
  proof?: VisualizationProof;
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
  visualLabel?: string;
  insightLabel?: string;
  stages: VisualizationStage[];
  examples?: VisualizationExample[];
  controls?: {
    constraints?: boolean;
    grid?: boolean;
    lattice?: boolean;
    vertices?: boolean;
    labels?: boolean;
  };
  proof?: VisualizationProof;
}

export interface VisualizationModule {
  default: VisualizationDefinition;
}
