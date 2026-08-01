import type { Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import { triangleScene } from "./duality-geometry";

function slackPlane(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.4, 4.6], y: [-0.4, 2.4] },
    constraints: [],
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: false,
    axisLabels: { x: "primal slack sᵢ=bᵢ−Aᵢx", y: "dual multiplier yᵢ" },
    primitives,
    caption: {
      primary: "Slack–multiplier plane",
      secondary: "complementary pairs lie on the coordinate axes",
    },
    ...overrides,
  };
}

const triangleStages: VisualizationStage[] = [
  {
    id: "scs-primal-dual-pair",
    kicker: "Theorem 7 · Optimal primal–dual pair",
    title: "Start from the matching optima x*=(2,2) and y*=(1,1,0)",
    description:
      "For the primal triangle and objective c=(1,1), x*=(2,2) is optimal. The dual optimum y* gives weight one to x₁≤2 and x₂≤2, and zero to −x₁−x₂≤0.",
    formula: "x*=(2,2),   y*=(1,1,0),   cᵀx*=bᵀy*=4",
    insight:
      "Complementary slackness explains exactly which primal inequalities the dual certificate uses.",
    scene: triangleScene([
      { kind: "point", at: [2, 2], label: "optimal x*", style: "optimum" },
      { kind: "label", at: [-2.1, 2.25], text: "y₁=1 on x₁≤2", tone: "accent" },
      { kind: "label", at: [-2.1, 1.9], text: "y₂=1 on x₂≤2", tone: "accent" },
      { kind: "label", at: [-2.1, 1.55], text: "y₃=0 on slack row", tone: "muted" },
    ], { objective: { vector: [1, 1], label: "c=(1,1)" } }),
  },
  {
    id: "scs-compute-slacks",
    kicker: "Theorem 7 · Compute primal slacks",
    title: "Two rows are tight and the third has positive slack",
    description:
      "At x*=(2,2), the first two inequalities are equalities. The third row has slack 0−(−4)=4.",
    formula: "s=b−Ax*=(0,0,4)",
    insight:
      "Tight means sᵢ=0; inactive means sᵢ>0.",
    scene: slackPlane([
      { kind: "point", at: [0, 1], label: "row 1: (s₁,y₁)=(0,1)", style: "integer" },
      { kind: "point", at: [0, 1.35], label: "row 2: (s₂,y₂)=(0,1)", style: "integer" },
      { kind: "point", at: [4, 0], label: "row 3: (s₃,y₃)=(4,0)", style: "fractional" },
    ]),
  },
  {
    id: "scs-weak-product",
    kicker: "Theorem 7 · Weak complementary slackness",
    title: "Every row has zero slack or zero multiplier",
    description:
      "The optimality condition is yᵢ(Aᵢx*−bᵢ)=0, equivalently yᵢsᵢ=0. Thus each row pair lies on one of the coordinate axes.",
    formula: "yᵢsᵢ=0 for every i",
    insight:
      "Positive dual weight forces a tight primal row, and positive primal slack forces zero dual weight.",
    scene: slackPlane([
      { kind: "line", from: [0, 0], to: [4.4, 0], label: "yᵢ=0 axis", style: "constraint", color: "#8f88dc", animate: true },
      { kind: "line", from: [0, 0], to: [0, 2.2], label: "sᵢ=0 axis", style: "constraint", color: "#f49a4a", animate: true },
      { kind: "point", at: [0, 1], label: "tight and weighted", style: "integer" },
      { kind: "point", at: [4, 0], label: "slack and unweighted", style: "fractional" },
    ]),
  },
  {
    id: "scs-strong-equivalence",
    kicker: "Theorem 8 · Strong complementary slackness",
    title: "There exists an optimal pair with exact support–tightness correspondence",
    description:
      "The strong theorem in the notes chooses an optimal pair satisfying yᵢ=0 if and only if the corresponding primal inequality is not tight.",
    formula: "yᵢ=0 ⇔ Aᵢx*−bᵢ≠0  ⇔  sᵢ>0",
    insight:
      "Equivalently, every tight row receives strictly positive dual weight and every slack row receives zero weight.",
    scene: slackPlane([
      { kind: "line", from: [0, 0], to: [4.4, 0], label: "slack rows: yᵢ=0", style: "constraint", color: "#8f88dc" },
      { kind: "line", from: [0, 0], to: [0, 2.2], label: "tight rows: yᵢ>0", style: "constraint", color: "#f49a4a" },
      { kind: "point", at: [0, 1], label: "rows 1 and 2", style: "optimum" },
      { kind: "point", at: [4, 0], label: "row 3", style: "fractional" },
      { kind: "label", at: [1.4, 1.75], text: "no row sits at (0,0)", tone: "accent" },
    ]),
  },
  {
    id: "scs-objective-gap",
    kicker: "Theorem 7 · Why the products control optimality",
    title: "The duality gap is the sum of multiplier–slack products",
    description:
      "For feasible x and y, bᵀy−cᵀx=yᵀ(b−Ax)=Σᵢyᵢsᵢ. The gap is zero exactly when every complementary product is zero.",
    formula: "bᵀy−cᵀx=Σᵢyᵢsᵢ≥0",
    insight:
      "Complementary slackness is strong duality resolved row by row.",
    scene: slackPlane([
      { kind: "point", at: [0, 1], label: "product 0", style: "integer" },
      { kind: "point", at: [4, 0], label: "product 0", style: "fractional" },
      { kind: "label", at: [1.2, 1.35], text: "Σ yᵢsᵢ = 0", tone: "accent" },
    ]),
  },
];

function duplicateScene(primitives: Primitive[]): Scene {
  return {
    viewport: { x: [-0.25, 1.25], y: [-0.25, 1.25] },
    constraints: [
      { id: "y1-positive", a: -1, b: 0, limit: 0, label: "y₁≥0", color: "#f49a4a" },
      { id: "y2-positive", a: 0, b: -1, limit: 0, label: "y₂≥0", color: "#8f88dc" },
      { id: "sum", a: 1, b: 1, limit: 1, label: "y₁+y₂≤1", color: "#79c9c0" },
      { id: "sum-lower", a: -1, b: -1, limit: -1, label: "y₁+y₂≥1", color: "#79c9c0" },
    ],
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: false,
    axisLabels: { x: "y₁", y: "y₂" },
    primitives,
    caption: {
      primary: "Dual optima for two duplicate tight inequalities",
      secondary: "primal: maximize x subject to x≤1 and x≤1",
    },
  };
}

const duplicateStages: VisualizationStage[] = [
  {
    id: "scs-duplicate-dual-segment",
    kicker: "Second example · Degenerate optimum",
    title: "Duplicate tight rows create a segment of dual optima",
    description:
      "For max x subject to two copies of x≤1, the primal optimum is x*=1. The dual is min y₁+y₂ subject to y₁+y₂=1 and y≥0, so every point on the segment is dual optimal.",
    formula: "D*={(y₁,y₂)≥0:y₁+y₂=1}",
    insight:
      "Degeneracy means that optimal dual weights are not unique.",
    scene: duplicateScene([
      { kind: "line", from: [0, 1], to: [1, 0], label: "dual optimal segment", style: "objective", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "scs-duplicate-weak-pair",
    kicker: "Second example · Weak pair",
    title: "An arbitrary optimal pair need not satisfy the strong equivalence",
    description:
      "Choose y=(1,0). Both duplicate primal inequalities are tight, but the second receives zero weight. Weak complementary slackness still holds because every product is zero.",
    formula: "x*=1, y=(1,0): y₂=0 although row 2 is tight",
    insight:
      "Strong complementary slackness is an existence theorem, not a statement about every optimal pair.",
    scene: duplicateScene([
      { kind: "point", at: [1, 0], label: "weakly complementary optimum", style: "fractional" },
      { kind: "label", at: [0.18, 0.88], text: "row 2 tight but y₂=0", tone: "accent" },
    ]),
  },
  {
    id: "scs-duplicate-strong-pair",
    kicker: "Second example · Select the strong pair",
    title: "Move inside the optimal face until every tight row has positive weight",
    description:
      "Choose y=(1/2,1/2). The primal point is unchanged, the dual objective remains one, and both tight duplicate rows now have strictly positive multipliers.",
    formula: "y=(1/2,1/2)>0 on both tight rows",
    insight:
      "The strong theorem guarantees that such a well-supported optimal pair exists.",
    scene: duplicateScene([
      { kind: "point", at: [1, 0], label: "arbitrary optimum", style: "fractional" },
      { kind: "point", at: [0.5, 0.5], label: "strongly complementary optimum", style: "optimum", animateFrom: [1, 0] },
      { kind: "vector", from: [1, 0], to: [0.5, 0.5], label: "redistribute dual weight", color: "#e27c89", animate: true },
    ]),
  },
];

const triangleExample: VisualizationExample = {
  id: "triangle-slackness",
  title: "Triangle — row-by-row duality gap",
  description:
    "Compute slacks and multipliers for a nondegenerate optimal pair and see both weak and strong complementary slackness.",
  stages: triangleStages,
};

const duplicateExample: VisualizationExample = {
  id: "duplicate-tight-rows",
  title: "Duplicate rows — why strong slackness is existential",
  description:
    "Compare an arbitrary weakly complementary optimum with a specially selected strongly complementary pair.",
  stages: duplicateStages,
};

const visualization: VisualizationDefinition = {
  id: "strong-complementary-slackness",
  title: "Strong Complementary Slackness",
  shortTitle: "Strong slackness",
  chapter: "LP duality and certificates",
  order: 4,
  description:
    "Resolve the duality gap row by row, distinguish weak from strong complementary slackness, and see why the strong theorem asserts existence of a specially supported optimal pair.",
  difficulty: "Intermediate",
  duration: 17,
  accent: "#e27c89",
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: triangleStages,
  examples: [triangleExample, duplicateExample],
  proof: {
    title: "Theorems 7 and 8 from the notes",
    steps: [
      "For primal feasible x and dual feasible y, define slacks s=b−Ax≥0.",
      "The duality gap satisfies bᵀy−cᵀx=yᵀ(b−Ax)=Σᵢyᵢsᵢ.",
      "All summands are nonnegative, so x and y are optimal exactly when yᵢsᵢ=0 for every row: weak complementary slackness.",
      "Strong complementary slackness strengthens the support pattern: there exists an optimal pair with yᵢ=0 if and only if sᵢ>0.",
      "Equivalently, for that selected pair every tight row has yᵢ>0 and every slack row has yᵢ=0.",
      "The duplicate-row example shows why this cannot be required of every optimal pair.",
    ],
  },
};

export default visualization;
