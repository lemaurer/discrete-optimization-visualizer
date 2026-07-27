import type { VisualizationDefinition } from "@/visualizations/types";
import { splitMembership3DExample } from "@/visualizations/helpers/three-dimensional-examples";

const visualization: VisualizationDefinition = {
  id: "split-membership-characterization-3d",
  title: "Membership Inside a Split in 3D",
  shortTitle: "Split membership 3D",
  chapter: "Cutting planes",
  order: 4.5,
  description:
    "Separate the split coordinate from the remaining dimensions and rotate the witness segment certificate in three-dimensional space.",
  difficulty: "Advanced",
  duration: 10,
  accent: "#79c9c0",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: splitMembership3DExample.stages,
  proof: splitMembership3DExample.proof,
};

export default visualization;
