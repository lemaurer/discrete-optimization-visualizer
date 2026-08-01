import { signCompatibleConeStages } from "@/visualizations/helpers/explicit-proximity-cones";
import type { VisualizationDefinition } from "@/visualizations/types";

const visualization: VisualizationDefinition = {
  id: "sign-compatible-cone",
  title: "The Sign-Compatible Cone in Proximity Proofs",
  shortTitle: "How the proof cone is built",
  chapter: "Extreme-ray proximity",
  order: 5,
  description:
    "Construct the cone directly from two feasible points, the row-sign partition, and homogeneous inequalities; then see why the displacement lies inside it and how Remark 33 uses only bounded partial ray combinations.",
  difficulty: "Intermediate",
  duration: 14,
  accent: "#79c9c0",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: signCompatibleConeStages,
  proof: {
    title: "What the cone does in the proofs",
    steps: [
      "Start with two feasible points x and y and define d=y−x.",
      "Partition the rows according to the sign of Aᵢd=Aᵢy−Aᵢx.",
      "Replace each inhomogeneous inequality by the corresponding homogeneous sign condition on a displacement u.",
      "The intersection of those homogeneous halfspaces is a cone C containing d.",
      "Decompose d into nonnegative combinations of primitive extreme rays of C.",
      "Remark 33 guarantees feasibility for coefficientwise partial combinations bounded by the coefficients of d; it does not claim that x+C is entirely feasible.",
    ],
  },
};

export default visualization;
