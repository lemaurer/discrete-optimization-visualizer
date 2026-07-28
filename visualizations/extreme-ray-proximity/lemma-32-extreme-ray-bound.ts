import type { Point2D, Primitive, Scene } from "@/engine/types";
import type { VisualizationDefinition, VisualizationStage } from "@/visualizations/types";

const viewport: Scene["viewport"] = { x: [-1.25, 6.5], y: [-1.25, 6.5] };

const coneConstraints: Scene["constraints"] = [
  {
    id: "upper-ray",
    a: -2,
    b: 1,
    limit: 0,
    label: "−2x₁+x₂≤0",
    color: "#f49a4a",
  },
  {
    id: "lower-ray",
    a: 1,
    b: -2,
    limit: 0,
    label: "x₁−2x₂≤0",
    color: "#8f88dc",
  },
];

const origin: Point2D = [0, 0];
const upperRay: Point2D = [1, 2];
const lowerRay: Point2D = [2, 1];
const delta = 3;

function baseScene(overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints: coneConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Cone C={x:Ax≤0}",
      secondary: "A=[(−2,1);(1,−2)], maximal subdeterminant Δ=3",
    },
    ...overrides,
  };
}

function rayPrimitives(extra: Primitive[] = []): Primitive[] {
  return [
    {
      kind: "vector",
      from: origin,
      to: [5.5, 2.75],
      label: "ray ℝ₊(2,1)",
      color: "#8f88dc",
      animate: true,
    },
    {
      kind: "vector",
      from: origin,
      to: [2.75, 5.5],
      label: "ray ℝ₊(1,2)",
      color: "#f49a4a",
      animate: true,
    },
    { kind: "point", at: lowerRay, label: "primitive u¹=(2,1)", style: "integer" },
    { kind: "point", at: upperRay, label: "primitive u²=(1,2)", style: "integer" },
    ...extra,
  ];
}

const stages: VisualizationStage[] = [
  {
    id: "lemma32-cone",
    kicker: "Lemma 32 · The cone",
    title: "An integer matrix carves out a rational cone",
    description:
      "The homogeneous inequalities Ax≤0 meet at the origin. The boundary directions are the extreme rays: once a point lies on one of them, it cannot be written as a nontrivial sum of two different cone directions.",
    formula: "C={x∈ℝⁿ:Ax≤0}",
    insight:
      "The cone may be unbounded, but Lemma 32 concerns the first primitive lattice vector on each extreme ray, not every point on the ray.",
    scene: baseScene(),
  },
  {
    id: "lemma32-rays",
    kicker: "Lemma 32 · Extreme directions",
    title: "Each edge has one primitive integer generator",
    description:
      "The two highlighted lattice vectors are the shortest integral generators of the two rays. Every other integral point on the same edge is a positive integer multiple.",
    formula: "u primitive ⇔ gcd(u₁,…,uₙ)=1",
    insight:
      "Primitive normalization is essential: the ray is infinite, while its canonical integer direction is finite.",
    scene: baseScene({ primitives: rayPrimitives() }),
  },
  {
    id: "lemma32-multiples",
    kicker: "Lemma 32 · Why primitive matters",
    title: "Multiples escape, but the primitive generator stays fixed",
    description:
      "Points 2u and 3u can be arbitrarily far from the origin. The lemma does not bound them; it bounds the unique primitive generator u on the same ray.",
    formula: "u,2u,3u,… lie on the same extreme ray",
    insight:
      "The determinant bound is a bound on arithmetic complexity of a direction, not on the geometric length of the whole ray.",
    scene: baseScene({
      primitives: rayPrimitives([
        { kind: "point", at: [2, 4], label: "2u²", style: "fractional" },
        { kind: "point", at: [3, 6], label: "3u²", style: "fractional" },
      ]),
    }),
  },
  {
    id: "lemma32-tight-row",
    kicker: "Lemma 32 · Tight subsystem",
    title: "An extreme ray is pinned down by tight equations",
    description:
      "For u=(1,2), the row −2x₁+x₂≤0 is tight. In dimension two, one independent tight row leaves exactly one one-dimensional null direction.",
    formula: "A′u=0,   rank(A′)=|I|−1",
    insight:
      "Extreme-ray geometry reduces the problem to a nearly square integer linear system.",
    scene: baseScene({
      showFeasibleRegion: false,
      primitives: [
        {
          kind: "line",
          from: [-0.5, -1],
          to: [3.2, 6.4],
          label: "−2x₁+x₂=0",
          style: "constraint",
          color: "#f49a4a",
        },
        {
          kind: "vector",
          from: origin,
          to: upperRay,
          label: "u=(1,2)",
          color: "#f49a4a",
          animate: true,
        },
        { kind: "point", at: upperRay, label: "primitive generator", style: "integer" },
      ],
    }),
  },
  {
    id: "lemma32-cramer",
    kicker: "Lemma 32 · Cramer’s rule",
    title: "The coordinates are controlled by subdeterminants",
    description:
      "Delete the column containing the largest coordinate and solve the remaining square system. Cramer’s rule expresses the resulting integer direction through determinants of submatrices of A.",
    formula: "u′ⱼ=det(A′₀),   u′ᵢ=−det(A′ᵢ),   u′=λu",
    insight:
      "Every coordinate appearing in the canonical determinant vector has absolute value at most Δ.",
    scene: baseScene({
      showFeasibleRegion: false,
      showConstraints: false,
      primitives: [
        {
          kind: "polygon",
          points: [[0, 0], [1, 0], [1, 2], [0, 2]],
          label: "coordinate rectangle",
          style: "integer-hull",
        },
        { kind: "vector", from: origin, to: upperRay, label: "u=(1,2)", color: "#f49a4a", animate: true },
        { kind: "line", from: [1, 0], to: [1, 2], label: "|det(A′₀)|=2", style: "cut" },
        { kind: "line", from: [0, 2], to: [1, 2], label: "|det(A′ᵢ)|=1", style: "objective", color: "#8f88dc" },
        { kind: "label", at: [3.8, 4.8], text: "all minors ≤ Δ=3", tone: "accent" },
      ],
    }),
  },
  {
    id: "lemma32-delta-box",
    kicker: "Lemma 32 · Determinant box",
    title: "All primitive extreme rays hit the Δ-box",
    description:
      "The square is the ℓ∞-ball of radius Δ. Both primitive extreme-ray generators lie inside it, even though their rays continue forever beyond it.",
    formula: "‖u‖∞≤Δ",
    insight:
      "The matrix determinants place a finite arithmetic window around the origin that contains every primitive extreme direction.",
    scene: baseScene({
      showFeasibleRegion: false,
      showConstraints: false,
      primitives: [
        {
          kind: "polygon",
          points: [[-delta, -delta], [delta, -delta], [delta, delta], [-delta, delta]],
          label: "‖x‖∞≤Δ",
          style: "feasible",
          fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
        },
        ...rayPrimitives(),
      ],
      caption: {
        primary: "The determinant window",
        secondary: "Δ=max{|det(B)|:B square submatrix of A}=3",
      },
    }),
  },
  {
    id: "lemma32-conclusion",
    kicker: "Lemma 32 · Conclusion",
    title: "Unbounded geometry, bounded arithmetic directions",
    description:
      "The cone has infinitely many points, but its primitive integral edge directions are selected by tight integer systems. Their coordinates are minors, so none can exceed Δ in absolute value.",
    formula: "extreme ray + primitive + Cramer ⇒ ‖u‖∞≤Δ",
    insight:
      "This is the atomic estimate later summed by Carathéodory to obtain nΔ and mΔ bounds.",
    scene: baseScene({
      primitives: rayPrimitives([
        {
          kind: "polygon",
          points: [[-delta, -delta], [delta, -delta], [delta, delta], [-delta, delta]],
          label: "all primitive generators live here",
          style: "integer-hull",
        },
      ]),
    }),
  },
];

const visualization: VisualizationDefinition = {
  id: "lemma-32-extreme-ray-bound",
  title: "Lemma 32 — Extreme Rays and Δ",
  shortTitle: "Lemma 32: ray bound",
  chapter: "Extreme-ray proximity",
  order: 1,
  description:
    "See how a nearly square tight subsystem and Cramer’s rule force every primitive integral extreme ray into an ℓ∞-box of radius Δ.",
  difficulty: "Intermediate",
  duration: 12,
  accent: "#f49a4a",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages,
  proof: {
    title: "Why an extreme ray is bounded by the largest subdeterminant",
    steps: [
      "Normalize the integral extreme ray u so gcd(u₁,…,uₙ)=1.",
      "The support I of u admits |I|−1 independent tight rows A′ with A′u=0.",
      "Choose j∈I with |uⱼ|=‖u‖∞ and delete column j to obtain a square matrix A′₀.",
      "Cramer’s rule constructs an integral null vector u′ whose coordinates are determinants of A′₀ and the column-replacement matrices A′ᵢ.",
      "The nullspace is one-dimensional, so u′=λu for an integer λ≥1.",
      "Therefore ‖u‖∞≤‖u′‖∞=|det(A′₀)|≤Δ.",
    ],
  },
};

export default visualization;
