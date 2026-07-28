import { lemma32ProofExample } from "@/visualizations/helpers/proof-guided-extreme-ray-examples";
import type { VisualizationDefinition } from "@/visualizations/types";

const visualization: VisualizationDefinition = {
  id: "lemma-32-proof-walkthrough",
  title: "Lemma 32 — Proof Walkthrough",
  shortTitle: "Lemma 32 proof",
  chapter: "Extreme-ray proximity",
  order: 5,
  description:
    "Follow the lecture-note proof in order: tight rows, the largest coordinate, the Cramer determinant vector, primitive scaling, and the Δ bound.",
  difficulty: "Advanced",
  duration: 14,
  accent: "#f49a4a",
  controls: { constraints: true, grid: true, lattice: true, vertices: false, labels: true },
  stages: lemma32ProofExample.stages,
  proof: {
    title: "Lemma 32 exactly as organized in the notes",
    steps: [
      "Fix a primitive integral extreme ray u of C={x:Ax≤0}.",
      "Choose |I|−1 independent tight rows A′ with A′u=0.",
      "Select j with |uⱼ|=‖u‖∞ and delete column j to form A′₀.",
      "Use Cramer’s rule to construct an integral null vector u′ from subdeterminants of A.",
      "The nullspace is one-dimensional, hence u′=λu; primitivity gives |λ|≥1.",
      "Therefore ‖u‖∞≤‖u′‖∞=|det(A′₀)|≤Δ.",
    ],
  },
};

export default visualization;
