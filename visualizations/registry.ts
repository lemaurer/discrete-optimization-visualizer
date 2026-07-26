import type { VisualizationDefinition, VisualizationModule } from "./types";

const modules = import.meta.glob<VisualizationModule>(
  ["./**/*.ts", "!./registry.ts", "!./types.ts"],
  { eager: true },
);

function isVisualization(
  definition: VisualizationDefinition | undefined,
): definition is VisualizationDefinition {
  return Boolean(
    definition?.id &&
      definition.title &&
      definition.chapter &&
      Array.isArray(definition.stages),
  );
}

export const visualizationRegistry: VisualizationDefinition[] = Object.values(modules)
  .map((module) => module.default)
  .filter(isVisualization)
  .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.order - b.order);
