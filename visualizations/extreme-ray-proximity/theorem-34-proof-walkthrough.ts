import { theorem34ExplicitConeStages } from "@/visualizations/helpers/explicit-proximity-cones";
import type { VisualizationDefinition } from "@/visualizations/types";

const visualization: VisualizationDefinition = {
  id: "theorem-34-proof-walkthrough",
  title: "Theorem 34 — Proof Walkthrough",
  shortTitle: "Theorem 34 proof",
  chapter: "Extreme-ray proximity",
  order: 7,
  description:
    "Follow the note proof from the row comparison to an explicitly drawn sign-compatible cone, its primitive extreme rays, the safe coefficient box from Remark 33, integer ray absorption, and the nΔ remainder.",
  difficulty: "Advanced",
  duration: 20,
  accent: "#8f88dc",
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: theorem34ExplicitConeStages,
  proof: {
    title: "Theorem 34 in the order used by the lecture notes",
    steps: [
      "Fix a chosen LP optimum y* and an arbitrary integer optimum x̂.",
      "Partition the rows according to whether Aᵢy* is below or above Aᵢx̂ and define the resulting sign-compatible cone C.",
      "The vector y*−x̂ belongs to C; partial nonnegative combinations of its ray decomposition remain feasible by Remark 33.",
      "Use Carathéodory to write y*−x̂ with at most n primitive integral extreme rays, each bounded by Δ through Lemma 32.",
      "Absorb every full integral ray copy into x̂; feasibility, integrality, and optimality are preserved.",
      "Every remaining coefficient is below one, so the remainder has infinity norm at most nΔ.",
    ],
  },
};

export default visualization;
