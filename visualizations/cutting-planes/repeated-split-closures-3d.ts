import type { VisualizationDefinition } from "@/visualizations/types";
import { infiniteRank3DExample } from "@/visualizations/helpers/three-dimensional-examples";

const visualization: VisualizationDefinition = {
  id: "repeated-split-closures-3d",
  title: "Repeated Split Closures in 3D",
  shortTitle: "Repeated closures 3D",
  chapter: "Cutting planes",
  order: 3.5,
  description:
    "Rotate the mixed-integer counterexample in (x₁,x₂,y), inspect exact coordinate splits, and see why positive height survives every finite closure round.",
  difficulty: "Advanced",
  duration: 24,
  accent: "#f49a4a",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: infiniteRank3DExample.stages,
  proof: infiniteRank3DExample.proof,
};

export default visualization;
