import { generatedVisualizations } from "./generated";
import type { VisualizationDefinition } from "./types";

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

export const visualizationRegistry: VisualizationDefinition[] = generatedVisualizations
  .filter(isVisualization)
  .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.order - b.order);
