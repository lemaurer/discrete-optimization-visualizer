import type { VisualizationDefinition, VisualizationModule } from "./types";

const modules = import.meta.glob<VisualizationModule>("./**/*.visualization.ts", {
  eager: true,
});

export const visualizationRegistry: VisualizationDefinition[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.order - b.order);
