import type { Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-0.5, 5.5],
  y: [-0.5, 5.5],
};

const baseConstraints: Scene["constraints"] = [
  {
    id: "nonnegative-y",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#79c9c0",
  },
  {
    id: "left-edge",
    a: -2,
    b: 1,
    limit: 0,
    label: "x₂ ≤ 2x₁",
    color: "#d4ef77",
  },
  {
    id: "right-edge",
    a: 2,
    b: 1,
    limit: 10,
    label: "2x₁+x₂ ≤ 10",
    color: "#a7a0ed",
  },
];

const splitLines: NonNullable<Scene["primitives"]> = [
  {
    kind: "line",
    from: [2, -0.25],
    to: [2, 5.25],
    style: "cut",
    color: "#f28b45",
  },
  {
    kind: "line",
    from: [3, -0.25],
    to: [3, 5.25],
    style: "cut",
    color: "#f28b45",
  },
  {
    kind: "label",
    at: [1.48, 2.72],
    text: "πᵀx = π₀",
  },
  {
    kind: "label",
    at: [3.08, 3.15],
    text: "πᵀx = π₀+1",
  },
];

const removedCap: NonNullable<Scene["primitives"]>[number] = {
  kind: "polygon",
  points: [
    [2, 4],
    [2.5, 5],
    [3, 4],
  ],
  label: "removed cap",
  style: "removed",
};

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints: baseConstraints,
  showGrid: true,
  showFeasibleRegion: true,
  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "split-inequality-description",
  title: "Inequality Description of a Split Polyhedron",
  shortTitle: "Split inequality description",
  chapter: "Cutting planes",
  order: 5,
  description:
    "See why satisfying every multiplier-generated inequality exactly describes the convex hull left by one split disjunction.",
  difficulty: "Advanced",
  duration: 10,
  accent: "#f28b45",
  controls: {
    constraints: true,
    vertices: true,
    labels: true,
  },
  stages: [
    {
      id: "relaxation",
      kicker: "01 · Start with P",
      title: "The relaxation contains a fractional peak",
      description:
        "Our example is a triangle. The point at its peak lies inside P, but its first coordinate falls strictly between two consecutive integers.",
      formula: "P = {x ∈ ℝ² : x₂≥0, x₂≤2x₁, 2x₁+x₂≤10}",
      insight: "The theorem begins with membership in P, then adds a family of inequalities.",
      scene: scene({
        primitives: [
          {
            kind: "point",
            at: [2.5, 5],
            label: "fractional peak",
            style: "fractional",
          },
          {
            kind: "label",
            at: [1.05, 1.15],
            text: "P",
            tone: "accent",
          },
        ],
      }),
    },
    {
      id: "split",
      kicker: "02 · Fix (π, π₀)",
      title: "The split keeps two integer sides",
      description:
        "Take π=(1,0) and π₀=2. Feasible points must lie on the left side x₁≤2 or the right side x₁≥3; the open strip contains no integer x₁.",
      formula: "πᵀx≤π₀  ∨  πᵀx≥π₀+1  ⟺  x₁≤2 ∨ x₁≥3",
      insight: "The disjunction deletes the peak, but keeps both surviving pieces of P.",
      scene: scene({
        primitives: [
          removedCap,
          ...splitLines,
          {
            kind: "label",
            at: [2.12, 1.1],
            text: "forbidden strip",
            tone: "muted",
          },
        ],
      }),
    },
    {
      id: "one-inequality",
      kicker: "03 · One u ∈ Bπ,π₀",
      title: "One multiplier produces one valid cut",
      description:
        "Choose an admissible multiplier u*. Its instance of inequality (14) supports both surviving pieces and cuts off the fractional peak.",
      formula: "u* ∈ Bπ,π₀  ⟹  inequality (14):  x₂ ≤ 4",
      insight: "Every generated inequality is valid on both sides, so it is valid for their convex hull.",
      scene: scene({
        primitives: [
          removedCap,
          ...splitLines,
          {
            kind: "line",
            from: [0.25, 4],
            to: [4.75, 4],
            style: "cut",
            color: "#e27c89",
          },
          {
            kind: "label",
            at: [3.18, 4.16],
            text: "(14): x₂ ≤ 4",
          },
          {
            kind: "point",
            at: [2.5, 5],
            label: "violates (14)",
            style: "fractional",
          },
        ],
      }),
    },
    {
      id: "all-inequalities",
      kicker: "04 · Intersect all u",
      title: "All admissible cuts recover the hull",
      description:
        "Now impose inequality (14) for every u in Bπ,π₀. Their halfspaces intersect with P, leaving exactly the convex hull of the two split pieces.",
      formula: "P⁽π,π₀⁾ = {x∈P : (14) holds for every u∈Bπ,π₀}",
      insight: "The universal quantifier means intersection: a point must survive every valid halfspace.",
      scene: scene({
        constraints: [
          ...baseConstraints,
          {
            id: "split-cut",
            a: 0,
            b: 1,
            limit: 4,
            label: "u* : x₂ ≤ 4",
            color: "#e27c89",
          },
        ],
        showVertices: true,
        primitives: [
          ...splitLines,
          {
            kind: "label",
            at: [1.1, 1.2],
            text: "P⁽π,π₀⁾",
            tone: "accent",
          },
        ],
      }),
    },
    {
      id: "membership-test",
      kicker: "05 · Read the theorem",
      title: "Membership becomes an inequality test",
      description:
        "The lower point belongs to P and passes every generated inequality. The upper point belongs to P but fails one certificate, so it cannot belong to P⁽π,π₀⁾.",
      formula: "x∈P⁽π,π₀⁾  ⇔  x∈P and ∀u∈Bπ,π₀, x satisfies (14)",
      insight: "To reject a point, one violated member of the family is enough.",
      scene: scene({
        constraints: [
          ...baseConstraints,
          {
            id: "split-cut",
            a: 0,
            b: 1,
            limit: 4,
            label: "u* : x₂ ≤ 4",
            color: "#e27c89",
          },
        ],
        primitives: [
          ...splitLines,
          {
            kind: "point",
            at: [2.5, 3],
            label: "passes every cut",
            style: "integer",
          },
          {
            kind: "point",
            at: [2.5, 4.6],
            label: "fails u*",
            style: "fractional",
          },
        ],
      }),
    },
  ],
  proof: {
    title: "Why does the inequality family give equality?",
    steps: [
      "Each inequality (14) indexed by u∈Bπ,π₀ is valid for both sides of the split.",
      "A linear inequality valid for both pieces is also valid for their convex hull P⁽π,π₀⁾.",
      "Conversely, the admissible multiplier set contains the supporting inequalities needed to separate every point of P outside that hull.",
      "Intersecting P with all of those halfspaces therefore leaves exactly P⁽π,π₀⁾.",
    ],
  },
};

export default visualization;
