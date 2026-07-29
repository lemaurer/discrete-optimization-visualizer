import { theorem35ExplicitConeStages } from "@/visualizations/helpers/explicit-proximity-cones";
import type { VisualizationDefinition } from "@/visualizations/types";

const visualization: VisualizationDefinition = {
  id: "theorem-35-proof-walkthrough",
  title: "Theorem 35 — Proof Walkthrough",
  shortTitle: "Theorem 35 proof",
  chapter: "Extreme-ray proximity",
  order: 8,
  description:
    "Build the sign-compatible displacement cone explicitly from z and an optimal witness, translate its partial ray combinations back into P, and then follow both minimum-ray-mass cases to the nΔ bound.",
  difficulty: "Advanced",
  duration: 21,
  accent: "#79c9c0",
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: theorem35ExplicitConeStages,
  proof: {
    title: "Theorem 35 in the order used by the lecture notes",
    steps: [
      "Choose a nonoptimal feasible integer point z and an optimal integer point ŷ, then form the sign-compatible cone containing ŷ−z.",
      "Among all improving integral displacements d=Σλᵢuᵢ, select one minimizing Σλᵢ.",
      "Use Carathéodory and Lemma 32 to keep at most n primitive rays of norm at most Δ.",
      "If λⱼ≥1 and cᵀuʲ>0, then z+uʲ is already a feasible improving integer point at distance at most Δ.",
      "If λⱼ≥1 and cᵀuʲ≤0, remove one copy of uʲ; strict improvement survives but total coefficient mass falls, contradicting minimality.",
      "Thus all coefficients are below one and ‖d‖∞≤nΔ.",
    ],
  },
};

export default visualization;
