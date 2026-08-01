import type { Point2D, Primitive, Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [0, 10],
  y: [0, 8],
};

const facilityPositions: Point2D[] = [
  [2, 6.5],
  [2, 4.75],
  [2, 3],
  [2, 1.25],
];

const clientPositions: Point2D[] = [
  [8, 6.5],
  [8, 4.75],
  [8, 3],
  [8, 1.25],
];

const facilities = (
  value: string,
  style: "facility" | "facility-fractional" = "facility",
): Primitive[] =>
  facilityPositions.map((at, index) => ({
    kind: "point",
    at,
    label: `F${index + 1} · ${value}`,
    style,
  }));

const clients: Primitive[] = clientPositions.map((at, index) => ({
  kind: "point",
  at,
  label: `C${index + 1}`,
  style: "client",
}));

const diagonalAssignments = (color = "#79c9c0"): Primitive[] =>
  facilityPositions.map((from, index) => ({
    kind: "line",
    from,
    to: clientPositions[index],
    label: `x${index + 1}${index + 1}=1`,
    style: "assignment",
    color,
  }));

const oneFacilityNetwork = (color: string): Primitive[] => [
  {
    kind: "point",
    at: [2, 4],
    label: "Factory j · yⱼ",
    style: "facility",
  },
  ...clients,
  ...clientPositions.map(
    (to, index): Primitive => ({
      kind: "line",
      from: [2, 4],
      to,
      label: `x${index + 1}j`,
      style: "assignment",
      color,
    }),
  ),
];

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints: [],
  showGrid: false,
  showAxes: false,
  showFeasibleRegion: false,
  caption: {
    label: "Facility assignment network",
    detail: "4 factories · 4 clients",
  },
  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "facility-location-formulations",
  title: "Facility Location: Two Formulations",
  shortTitle: "Facility formulations",
  chapter: "Model formulations",
  order: 1,
  description:
    "Compare an individual linking formulation with its compact Big-M aggregation, then watch their LP relaxations separate.",
  difficulty: "Intermediate",
  duration: 12,
  accent: "#79c9c0",
  visualLabel: "Assignment model",
  insightLabel: "Modeling insight",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "problem",
      kicker: "01 · Facility location",
      title: "Open factories and serve every client",
      description:
        "Opening factory j costs cⱼ. Assigning client i to that factory costs dᵢⱼ. Binary yⱼ records whether the factory opens; xᵢⱼ records the assigned fraction.",
      formula: "min  Σⱼ cⱼyⱼ + ΣᵢΣⱼ dᵢⱼxᵢⱼ   with   Σⱼxᵢⱼ=1  ∀i",
      insight: "Both formulations use the same objective and assignment equations. Only the linking constraints differ.",
      scene: scene({
        primitives: [
          ...facilities("yⱼ=1"),
          ...clients,
          ...diagonalAssignments(),
          { kind: "label", at: [1.25, 7.45], text: "candidate factories", tone: "accent" },
          { kind: "label", at: [7.45, 7.45], text: "clients", tone: "accent" },
        ],
      }),
    },
    {
      id: "fl",
      kicker: "02 · Formulation FL",
      title: "Link every assignment individually",
      description:
        "FL adds one implication for every client-factory pair. A client can use factory j only up to the opening level yⱼ.",
      formula: "FL:  xᵢⱼ ≤ yⱼ  ∀i,j   ·   m+mn constraints in total",
      insight: "In the LP relaxation, a full assignment xᵢⱼ=1 immediately forces yⱼ=1.",
      scene: scene({
        caption: {
          label: "Individual linking formulation FL",
          detail: "m links per factory",
        },
        primitives: [
          ...oneFacilityNetwork("#79c9c0"),
          { kind: "label", at: [1.25, 7.25], text: "m separate guards", tone: "accent" },
        ],
      }),
    },
    {
      id: "afl",
      kicker: "03 · Aggregated AFL",
      title: "Compress all links into one Big-M row",
      description:
        "AFL sums the assignments entering each factory. With m clients, the valid upper bound is M=m, so one aggregate row replaces m individual rows.",
      formula: "AFL:  Σᵢxᵢⱼ ≤ myⱼ  ∀j   ·   m+n constraints in total",
      insight: "AFL is smaller, but one large capacity budget can hide a single oversized assignment.",
      scene: scene({
        caption: {
          label: "Aggregated Big-M formulation AFL",
          detail: "1 link per factory",
        },
        primitives: [
          ...oneFacilityNetwork("#f28b45"),
          { kind: "label", at: [1.25, 7.25], text: "one shared budget", tone: "accent" },
        ],
      }),
    },
    {
      id: "integer-equivalence",
      kicker: "04 · Integer solutions",
      title: "For yⱼ∈{0,1}, both models agree",
      description:
        "If yⱼ=0, both formulations force every xᵢⱼ to zero. If yⱼ=1, either model permits all assignments allowed by the remaining constraints.",
      formula: "yⱼ=0 ⇒ xᵢⱼ=0  ∀i   ·   yⱼ=1 ⇒ up to m clients may use factory j",
      insight: "The integer feasible solutions and the integer optimum Zᴵᴾ are identical.",
      scene: scene({
        caption: {
          label: "Integer-equivalent linking logic",
          detail: "closed means no service",
        },
        primitives: [
          {
            kind: "point",
            at: [2, 6],
            label: "closed · y=0",
            style: "facility-closed",
          },
          {
            kind: "point",
            at: [2, 2.4],
            label: "open · y=1",
            style: "facility",
          },
          ...clients,
          ...clientPositions.map(
            (to): Primitive => ({
              kind: "line",
              from: [2, 2.4],
              to,
              style: "assignment",
              color: "#79c9c0",
            }),
          ),
          { kind: "label", at: [1.25, 7.2], text: "no outgoing assignments", tone: "muted" },
        ],
      }),
    },
    {
      id: "fractional-leak",
      kicker: "05 · LP counterexample",
      title: "Aggregation admits a fractional leak",
      description:
        "Relax yⱼ to [0,1] and take m=4. AFL accepts one full assignment with the factory only one-quarter open; FL rejects the very same point.",
      formula: "x₁ⱼ=1, x₂ⱼ=x₃ⱼ=x₄ⱼ=0, yⱼ=¼:   1≤4·¼ ✓   but   1≤¼ ✕",
      insight: "This point lies in P_AFL but not in P_FL, proving that the containment can be strict.",
      scene: scene({
        caption: {
          label: "Fractional counterexample",
          detail: "P_FL ⊂ P_AFL",
        },
        primitives: [
          {
            kind: "point",
            at: [2, 4],
            label: "Factory j · yⱼ=¼",
            style: "facility-fractional",
          },
          ...clients,
          {
            kind: "line",
            from: [2, 4],
            to: clientPositions[0],
            label: "x₁ⱼ=1",
            style: "assignment",
            color: "#e27c89",
          },
          { kind: "label", at: [3.4, 2.25], text: "AFL accepts ✓", tone: "accent" },
          { kind: "label", at: [6.1, 2.25], text: "FL rejects ✕", tone: "default" },
        ],
      }),
    },
    {
      id: "objective-gap",
      kicker: "06 · Concrete gap",
      title: "The weak relaxation underprices opening",
      description:
        "Let cⱼ=40, dᵢᵢ=0, and dᵢⱼ=30 for i≠j. AFL opens four factories at level ¼ and serves each client locally at zero assignment cost.",
      formula: "AFL point: yⱼ=¼, xⱼⱼ=1  ⇒  z_AFL=4·40·¼+0=40",
      insight: "FL blocks every link xⱼⱼ=1≤¼. Its best relaxation value is 130, equal to the integer optimum here.",
      scene: scene({
        caption: {
          label: "AFL relaxation solution",
          detail: "objective value 40",
        },
        primitives: [
          ...facilities("yⱼ=¼", "facility-fractional"),
          ...clients,
          ...diagonalAssignments("#e27c89"),
          { kind: "label", at: [3.65, 7.35], text: "four quarter-open factories", tone: "accent" },
        ],
      }),
    },
    {
      id: "strength",
      kicker: "07 · Formulation strength",
      title: "FL is larger—and decisively stronger",
      description:
        "For minimization, the smaller feasible relaxation gives the larger lower bound. AFL saves constraints; FL gives the solver much less fractional freedom.",
      formula: "P_FL ⊂ P_AFL  ⇒  z_AFL ≤ z_FL ≤ Zᴵᴾ   ·   example: 40 < 130 = 130",
      insight: "“Better” means stronger LP bounds, not fewer rows. FL usually spends model size to reduce branch-and-bound work.",
      scene: scene({
        caption: {
          label: "Lower-bound comparison",
          detail: "stronger bound points right",
        },
        primitives: [
          {
            kind: "line",
            from: [1.3, 4],
            to: [8.7, 4],
            style: "assignment",
            color: "#10202a",
          },
          { kind: "point", at: [2.1, 4], label: "z_AFL=40", style: "fractional" },
          { kind: "point", at: [8, 4], label: "z_FL=Zᴵᴾ=130", style: "optimum" },
          { kind: "label", at: [1.3, 5.25], text: "weak Big-M bound", tone: "muted" },
          { kind: "label", at: [6.55, 5.25], text: "strong FL bound", tone: "accent" },
          { kind: "label", at: [3.8, 2.7], text: "tighter lower bound  →", tone: "default" },
        ],
      }),
    },
  ],
  proof: {
    title: "Why does FL dominate AFL?",
    steps: [
      "Summing the FL inequalities xᵢⱼ≤yⱼ over all m clients gives Σᵢxᵢⱼ≤myⱼ, so every point in P_FL also lies in P_AFL.",
      "The fractional point yⱼ=1/m, x₁ⱼ=1, and xᵢⱼ=0 for i>1 satisfies AFL but violates FL, so the inclusion can be strict.",
      "Minimizing over a smaller relaxation cannot improve downward: therefore z_AFL≤z_FL.",
      "Every integer feasible solution lies in both relaxations, so z_FL≤Zᴵᴾ and both integer formulations have the same optimum.",
    ],
  },
};

export default visualization;
