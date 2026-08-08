import baseVisualization from "@/visualizations/helpers/tdi-representation-construction-base";
import { buildAExamples } from "@/visualizations/helpers/tdi-representation-build-a";

const visualization = {
  ...baseVisualization,
  duration: 40,
  description:
    `${baseVisualization.description} The example selector also includes a side-by-side construction view: the original polyhedron P={x:Cx≤d} stays fixed while A is revealed from the minimal-face generating sets H_i, together with the current partial polyhedron {x:A^(k)x≤b^(k)}.`,
  examples: [...(baseVisualization.examples ?? []), ...buildAExamples],
};

export default visualization;
