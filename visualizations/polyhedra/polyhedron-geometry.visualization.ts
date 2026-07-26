import type { Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const viewport: Scene["viewport"] = { x: [-1, 8], y: [-1, 7] };

const constraints: Scene["constraints"] = [
  { id: "left", a: -1, b: 0, limit: 0, label: "x₁ ≥ 0", color: "#f49a4a" },
  { id: "bottom", a: 0, b: -1, limit: 0, label: "x₂ ≥ 0", color: "#7ecbc4" },
  { id: "slope", a: 1, b: 1, limit: 7, label: "x₁ + x₂ ≤ 7", color: "#d4ef77" },
  { id: "steep", a: 2, b: 1, limit: 10, label: "2x₁ + x₂ ≤ 10", color: "#a7a0ed" },
  { id: "cap", a: 0, b: 1, limit: 5, label: "x₂ ≤ 5", color: "#e88d99" },
];

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints,
  showGrid: true,
  showFeasibleRegion: true,
  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "polyhedron-geometry",
  title: "The Geometry of a Polyhedron",
  shortTitle: "Polyhedron geometry",
  chapter: "Polyhedral geometry",
  order: 1,
  description:
    "Turn a system of linear inequalities into a shape you can inspect, perturb, and reason about.",
  difficulty: "Foundation",
  duration: 8,
  accent: "#d4ef77",
  controls: {
    constraints: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: [
    {
      id: "definition",
      kicker: "01 · Definition",
      title: "Inequalities carve out space",
      description:
        "Each inequality keeps one side of a line. Their intersection is the feasible region P — a polyhedron in two dimensions.",
      formula: "P = { x ∈ ℝ² : Ax ≤ b }",
      insight: "A polyhedron is an intersection of finitely many closed halfspaces.",
      scene: scene(),
    },
    {
      id: "constraints",
      kicker: "02 · Build the region",
      title: "One halfspace at a time",
      description:
        "The boundary of each constraint is a line. Activate or remove constraints below and watch the intersection change.",
      formula: "aᵢᵀx ≤ bᵢ  for  i = 1,…,m",
      insight: "A single redundant constraint can disappear without changing P.",
      scene: scene({ showActiveConstraints: true }),
    },
    {
      id: "vertices",
      kicker: "03 · Combinatorial structure",
      title: "Vertices remember what is tight",
      description:
        "At a vertex in ℝ², two linearly independent constraints are typically active. Hover near the corners and trace the boundaries that define them.",
      formula: "I(x̄) = { i : aᵢᵀx̄ = bᵢ }",
      insight: "Vertices turn continuous geometry into a finite set of candidates.",
      scene: scene({ showVertices: true, showActiveConstraints: true }),
    },
    {
      id: "lattice",
      kicker: "04 · Integrality",
      title: "Now add the integer lattice",
      description:
        "Integer optimization only accepts the lattice points inside P. Their convex hull is the integer hull — the tightest polyhedron with the same integer solutions.",
      formula: "Pᴵ = conv(P ∩ ℤ²)",
      insight: "The LP relaxation contains every integer solution, but often contains fractional vertices too.",
      scene: scene({
        showVertices: true,
        showLattice: true,
        showIntegerHull: true,
        primitives: [
          { kind: "point", at: [3.67, 2.67], label: "fractional vertex", style: "fractional" },
        ],
      }),
    },
    {
      id: "objective",
      kicker: "05 · Optimization",
      title: "The optimum lives on the boundary",
      description:
        "Slide the objective in its improving direction. The last point of contact is optimal; for a linear objective, some vertex is always optimal when an optimum exists.",
      formula: "max { 3x₁ + 2x₂ : x ∈ P }",
      insight: "Geometry explains why simplex can search by walking from vertex to vertex.",
      scene: scene({
        showVertices: true,
        showLattice: true,
        objective: { vector: [3, 2], label: "c = (3, 2)" },
      }),
    },
  ],
  proof: {
    title: "Why do vertices matter?",
    steps: [
      "A linear objective has parallel level sets cᵀx = α.",
      "Move the level set in the direction of c until it last touches P.",
      "The touching face contains a vertex, so an optimal vertex exists whenever P has an optimum.",
    ],
  },
};

export default visualization;
