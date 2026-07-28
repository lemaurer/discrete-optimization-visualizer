import type { Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationStage,
} from "@/visualizations/types";
import {
  dualProof,
  dualRayConfiguration,
  scene3D,
  triangleScene,
} from "./duality-geometry";

function gapScene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.4, 5.2], y: [-0.4, 5.2] },
    constraints: [],
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: false,
    axisLabels: { x: "primal value cᵀx", y: "dual value bᵀy" },
    primitives,
    caption: {
      primary: "Weak-duality value plane",
      secondary: "every feasible pair lies on or above the diagonal",
    },
    ...overrides,
  };
}

const stages: VisualizationStage[] = [
  {
    id: "dual-lp-primal",
    kicker: "Theorem 6 · Primal problem",
    title: "Optimize a linear objective over the primal triangle",
    description:
      "Consider P={x:x₁≤2, x₂≤2, −x₁−x₂≤0} and maximize cᵀx=x₁+x₂. The objective reaches its maximum at the vertex x*=(2,2).",
    formula: "max{cᵀx:Ax≤b},   c=(1,1),   x*=(2,2)",
    insight:
      "The primal optimum is the highest objective level still touching P.",
    scene: triangleScene([
      { kind: "point", at: [2, 2], label: "primal optimum x*", style: "optimum" },
      { kind: "line", from: [1.35, 2.65], to: [2.65, 1.35], label: "cᵀx=4", style: "objective", color: "#e27c89", animate: true },
    ], { objective: { vector: [1, 1], label: "c=(1,1)" } }),
  },
  {
    id: "dual-lp-construct",
    kicker: "Theorem 6 · Construct the dual",
    title: "Choose nonnegative row weights reproducing c",
    description:
      "The dual feasible set is D={y≥0:Aᵀy=c}. For this A, every feasible dual point has the form y=(1+t,1+t,t), t≥0.",
    formula: "min{bᵀy:Aᵀy=c, y≥0}",
    insight:
      "The primal right-hand side b becomes the dual objective, while the primal objective c becomes the dual equality target.",
    scene: scene3D(dualRayConfiguration()),
  },
  {
    id: "dual-lp-weak-duality",
    kicker: "Theorem 6 · Weak duality",
    title: "Every dual feasible point gives an upper bound on every primal point",
    description:
      dualProof.weakDuality,
    formula: "cᵀx=yᵀAx≤yᵀb",
    insight:
      "Primal values can never cross above dual values, so max(primal)≤min(dual).",
    scene: gapScene([
      { kind: "line", from: [0, 0], to: [5, 5], label: "equality line", style: "objective", color: "#8f88dc", animate: true },
      { kind: "polygon", points: [[0, 0], [0, 5], [5, 5]], label: "allowed weak-duality region", style: "feasible" },
      { kind: "point", at: [2, 4.8], label: "generic feasible pair", style: "fractional" },
      { kind: "vector", from: [2, 2], to: [2, 4.8], label: "duality gap", color: "#e27c89", animate: true },
    ]),
  },
  {
    id: "dual-lp-minimize",
    kicker: "Theorem 6 · Solve the dual",
    title: "The dual objective selects the endpoint y*=(1,1,0)",
    description:
      "Here b=(2,2,0), so along the dual ray y=(1+t,1+t,t) the objective is bᵀy=4+4t. It is minimized at t=0.",
    formula: "bᵀy=2y₁+2y₂=4+4t,   y*=(1,1,0)",
    insight:
      "A linear objective over the dual polyhedron again selects a vertex.",
    scene: scene3D(dualRayConfiguration({
      markers: [
        { id: "ystar", at: [1, 1, 0], label: "dual optimum y*, value 4", style: "optimum" },
        { id: "higher", at: [2, 2, 1], label: "feasible but cost 8", style: "fractional" },
      ],
      segments: [
        { id: "ray", from: [1, 1, 0], to: [3.2, 3.2, 2.2], label: "dual feasible ray", color: "#8f88dc", width: 5, animate: true },
        { id: "cost-rise", from: [1, 1, 0], to: [2, 2, 1], label: "bᵀy increases", color: "#e27c89", width: 4, animate: true },
      ],
    })),
  },
  {
    id: "dual-lp-strong-duality",
    kicker: "Theorem 6 · Strong duality",
    title: "The best primal lower bound meets the best dual upper bound",
    description:
      "The primal vertex x*=(2,2) has value 4 and the dual vertex y*=(1,1,0) also has value 4. The weak-duality gap closes completely.",
    formula: "max{cᵀx:Ax≤b}=4=min{bᵀy:Aᵀy=c,y≥0}",
    insight:
      "Strong duality says this equality is structural whenever both feasible polyhedra are nonempty.",
    scene: gapScene([
      { kind: "line", from: [0, 0], to: [5, 5], label: "primal value = dual value", style: "objective", color: "#8f88dc", animate: true },
      { kind: "point", at: [4, 4], label: "(cᵀx*, bᵀy*)=(4,4)", style: "optimum", animateFrom: [2, 4.8] },
      { kind: "label", at: [1.1, 4.35], text: "gap = 0", tone: "accent" },
    ]),
  },
  {
    id: "dual-lp-proof-contradiction",
    kicker: "Theorem 6 · Proof idea from the notes",
    title: "Farkas rules out a strict gap below the dual optimum",
    description:
      "Let δ be the attained dual optimum. If no primal point satisfies cᵀx≥δ, then the augmented system Ax≤b and −cᵀx≤−δ is infeasible. Farkas produces multipliers (z,λ). The notes show λ>0 and divide by λ to obtain a dual feasible point cheaper than δ, a contradiction.",
    formula: "zᵀA−λcᵀ=0, zᵀb−λδ<0 ⇒ (z/λ)ᵀb<δ",
    insight:
      "The strong-duality proof is an infeasibility-certificate argument, not merely a geometric coincidence.",
    scene: gapScene([
      { kind: "line", from: [0, 0], to: [5, 5], label: "weak-duality boundary", style: "objective", color: "#8f88dc" },
      { kind: "point", at: [3.2, 4], label: "hypothetical strict gap", style: "fractional" },
      { kind: "vector", from: [3.2, 4], to: [4, 4], label: "Farkas contradiction closes gap", color: "#e27c89", animate: true },
    ]),
  },
];

const visualization: VisualizationDefinition = {
  id: "dual-linear-program",
  title: "The Dual Linear Program",
  shortTitle: "LP duality",
  chapter: "LP duality and certificates",
  order: 2,
  description:
    "Build the dual LP from the primal rows, visualize weak duality as an upper-bound gap, solve both polyhedra, and follow the Farkas-based proof of strong duality from the notes.",
  difficulty: "Intermediate",
  duration: 18,
  accent: "#79c9c0",
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages,
  proof: {
    title: "Theorem 6: strong LP duality via Farkas' lemma",
    steps: [
      "For any primal feasible x and dual feasible y, weak duality gives cᵀx=yᵀAx≤yᵀb.",
      "Let δ=min{bᵀy:Aᵀy=c,y≥0}; the dual optimum is attained because its value is finite.",
      "To prove a primal point of value δ exists, suppose Ax≤b and −cᵀx≤−δ is infeasible.",
      "Farkas gives z≥0 and λ≥0 with zᵀA−λcᵀ=0 and zᵀb−λδ<0.",
      "If λ=0, the same certificate would prove P empty, contradicting primal feasibility; hence λ>0.",
      "Set y=z/λ. Then Aᵀy=c, y≥0, and bᵀy<δ, contradicting the definition of δ.",
      "Therefore a primal point reaches δ, and max(primal)=min(dual).",
    ],
  },
};

export default visualization;
