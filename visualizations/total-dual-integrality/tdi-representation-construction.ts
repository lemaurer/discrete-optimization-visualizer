import baseVisualization from "@/visualizations/helpers/tdi-representation-construction-base";
import { buildAExamples } from "@/visualizations/helpers/tdi-representation-build-a";

const visualization = {
  ...baseVisualization,
  duration: 38,
  description:
    `${baseVisualization.description} The example selector also includes a row-by-row construction view that keeps P visible while A and b are built from the Hilbert-basis support inequalities.`,
  examples: [...(baseVisualization.examples ?? []), ...buildAExamples],
};

export default visualization;
