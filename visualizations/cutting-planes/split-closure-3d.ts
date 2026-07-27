import type { VisualizationDefinition } from "@/visualizations/types";
import { splitClosure3DExample } from "@/visualizations/helpers/three-dimensional-examples";

const visualization: VisualizationDefinition = {
  id: "split-closure-3d",
  title: "Split Closure in 3D",
  shortTitle: "Split closure 3D",
  chapter: "Cutting planes",
  order: 2.5,
  description:
    "See split strips become slabs, remove fractional caps, and intersect the resulting split polyhedra in three dimensions.",
  difficulty: "Advanced",
  duration: 12,
  accent: "#8f88dc",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: splitClosure3DExample.stages,
  proof: splitClosure3DExample.proof,
};

export default visualization;
