import type { Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const infeasibleConstraints: Scene["constraints"] = [
  { id: "x1-upper", a: 1, b: 0, limit: 0, label: "x₁≤0", color: "#f49a4a" },
  { id: "x2-upper", a: 0, b: 1, limit: 0, label: "x₂≤0", color: "#8f88dc" },
  { id: "sum-lower", a: -1, b: -1, limit: -1, label: "−x₁−x₂≤−1", color: "#79c9c0" },
];

const feasibleConstraints: Scene["constraints"] = [
  { id: "x1-upper", a: 1, b: 0, limit: 1, label: "x₁≤1", color: "#f49a4a" },
  { id: "x2-upper", a: 0, b: 1, limit: 1, label: "x₂≤1", color: "#8f88dc" },
  { id: "sum-lower", a: -1, b: -1, limit: 0, label: "−x₁−x₂≤0", color: "#79c9c0" },
];

function systemScene(
  constraints: Scene["constraints"],
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-1.7, 1.7], y: [-1.7, 1.7] },
    constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    primitives,
    caption: {
      primary: "System Ax≤b",
      secondary: "Farkas gives exactly one of a feasible point or a certificate",
    },
    ...overrides,
  };
}

function normalCertificateScene(primitives: Primitive[]): Scene {
  return {
    viewport: { x: [-1.7, 1.7], y: [-1.7, 1.7] },
    constraints: [],
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "normal coordinate 1", y: "normal coordinate 2" },
    primitives,
    caption: {
      primary: "Farkas certificate in row-normal space",
      secondary: "y=(1,1,1) makes the weighted normals cancel",
    },
  };
}

const infeasibleStages: VisualizationStage[] = [
  {
    id: "farkas-infeasible-system",
    kicker: "Theorem 3 · First alternative fails",
    title: "Three halfspaces have no common point",
    description:
      "The first two inequalities require x₁≤0 and x₂≤0, while the third requires x₁+x₂≥1. No point can satisfy all three simultaneously.",
    formula: "Ax≤b has no solution",
    insight:
      "Infeasibility is global: looking at any one or two inequalities alone does not reveal the contradiction.",
    scene: systemScene(infeasibleConstraints, [
      { kind: "label", at: [-1.25, -1.2], text: "x₁≤0 and x₂≤0", tone: "muted" },
      { kind: "label", at: [0.55, 1.15], text: "x₁+x₂≥1", tone: "accent" },
    ], { showFeasibleRegion: false }),
  },
  {
    id: "farkas-search-multipliers",
    kicker: "Theorem 3 · Search for a certificate",
    title: "Assign nonnegative weights to the contradictory rows",
    description:
      "Farkas asks for y≥0 such that yᵀA=0. Here the simple choice y=(1,1,1) weights every inequality once.",
    formula: "y=(1,1,1)≥0",
    insight:
      "The weights must cancel all x-dependent terms so that only an impossible scalar inequality remains.",
    scene: normalCertificateScene([
      { kind: "vector", from: [0, 0], to: [1, 0], label: "a₁=(1,0)", color: "#f49a4a", animate: true },
      { kind: "vector", from: [1, 0], to: [1, 1], label: "+a₂=(0,1)", color: "#8f88dc", animate: true },
      { kind: "vector", from: [1, 1], to: [0, 0], label: "+a₃=(−1,−1)", color: "#79c9c0", animate: true },
      { kind: "point", at: [0, 0], label: "sum of weighted normals =0", style: "optimum" },
    ]),
  },
  {
    id: "farkas-cancel",
    kicker: "Theorem 3 · Cancel the variables",
    title: "The weighted left-hand sides sum to zero",
    description:
      "Adding the three inequalities with weights y=(1,1,1) gives (x₁)+(x₂)+(−x₁−x₂)=0. This is precisely yᵀA=0.",
    formula: "yᵀA=(1,1,1)A=(0,0)",
    insight:
      "After cancellation, the certificate no longer depends on the unknown x.",
    scene: normalCertificateScene([
      { kind: "polygon", points: [[0, 0], [1, 0], [1, 1]], label: "closed vector triangle", style: "integer-hull", fromPoints: [[0, 0], [0, 0], [0, 0]] },
      { kind: "vector", from: [0, 0], to: [1, 0], label: "a₁", color: "#f49a4a", animate: true },
      { kind: "vector", from: [1, 0], to: [1, 1], label: "a₂", color: "#8f88dc", animate: true },
      { kind: "vector", from: [1, 1], to: [0, 0], label: "a₃", color: "#79c9c0", animate: true },
    ]),
  },
  {
    id: "farkas-negative-rhs",
    kicker: "Theorem 3 · Contradict the right-hand side",
    title: "The same weights make the right-hand sides sum to −1",
    description:
      "The weighted right-hand side is 0+0−1=−1. Any feasible x would therefore imply the impossible inequality 0≤−1.",
    formula: "yᵀb=−1<0  ⇒  0=yᵀAx≤yᵀb=−1",
    insight:
      "The vector y is a short, checkable certificate that proves infeasibility without searching over x.",
    scene: systemScene(infeasibleConstraints, [
      { kind: "label", at: [-1.25, 1.2], text: "add all three rows", tone: "accent" },
      { kind: "label", at: [-1.25, 0.85], text: "0 ≤ −1  contradiction", tone: "accent" },
    ], { showFeasibleRegion: false, showConstraints: false }),
  },
  {
    id: "farkas-exclusive",
    kicker: "Theorem 3 · Exactly one alternative",
    title: "A feasible point and a negative certificate cannot coexist",
    description:
      "If Ax≤b and y≥0 with yᵀA=0, then 0=yᵀAx≤yᵀb. Therefore yᵀb<0 is impossible whenever a feasible x exists.",
    formula: "either ∃x:Ax≤b  or  ∃y≥0:yᵀA=0,yᵀb<0",
    insight:
      "Farkas' lemma is an alternatives theorem: feasibility and its certificate are mutually exclusive and collectively exhaustive.",
    scene: normalCertificateScene([
      { kind: "point", at: [-0.8, 0.8], label: "feasible x", style: "integer" },
      { kind: "point", at: [0.8, -0.8], label: "certificate y", style: "optimum" },
      { kind: "line", from: [-0.25, -1.3], to: [0.25, 1.3], label: "exactly one side", style: "cut", color: "#e27c89", animate: true },
    ]),
  },
];

const feasibleStages: VisualizationStage[] = [
  {
    id: "farkas-feasible-point",
    kicker: "Second example · First alternative holds",
    title: "A single point settles feasibility",
    description:
      "For x₁≤1, x₂≤1, and x₁+x₂≥0, the origin is feasible. The first Farkas alternative therefore holds immediately.",
    formula: "x=(0,0),   Ax≤b",
    insight:
      "Feasibility needs only one witness point.",
    scene: systemScene(feasibleConstraints, [
      { kind: "point", at: [0, 0], label: "feasible witness x", style: "optimum" },
    ]),
  },
  {
    id: "farkas-no-certificate",
    kicker: "Second example · Certificate impossible",
    title: "The feasible witness blocks every negative Farkas certificate",
    description:
      "For any y≥0 with yᵀA=0, multiplying the feasible inequality Ax≤b by y gives 0=yᵀAx≤yᵀb. Hence yᵀb can never be negative.",
    formula: "Ax≤b ⇒ yᵀb≥0 for every y≥0 with yᵀA=0",
    insight:
      "The same one-line inequality proves that the two alternatives cannot both hold.",
    scene: systemScene(feasibleConstraints, [
      { kind: "point", at: [0, 0], label: "feasible x", style: "optimum" },
      { kind: "label", at: [-1.3, 1.35], text: "no y can certify infeasibility", tone: "accent" },
    ]),
  },
];

const infeasibleExample: VisualizationExample = {
  id: "infeasible-certificate",
  title: "Infeasible system — construct y=(1,1,1)",
  description:
    "Watch nonnegative row weights cancel the variables and leave the contradiction 0≤−1.",
  stages: infeasibleStages,
};

const feasibleExample: VisualizationExample = {
  id: "feasible-witness",
  title: "Feasible system — the certificate cannot exist",
  description:
    "Use a feasible point to see why every candidate certificate must have nonnegative weighted right-hand side.",
  stages: feasibleStages,
};

const visualization: VisualizationDefinition = {
  id: "farkas-lemma",
  title: "Farkas' Lemma",
  shortTitle: "Farkas' lemma",
  chapter: "LP duality and certificates",
  order: 3,
  description:
    "Visualize the alternatives theorem from the notes: either Ax≤b has a feasible point, or nonnegative row weights cancel A and make b strictly negative.",
  difficulty: "Foundation",
  duration: 15,
  accent: "#f49a4a",
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: infeasibleStages,
  examples: [infeasibleExample, feasibleExample],
  proof: {
    title: "How to verify a Farkas certificate",
    steps: [
      "Check y≥0.",
      "Check yᵀA=0, so the weighted left-hand sides contain no x.",
      "Check yᵀb<0.",
      "If a feasible x existed, multiplying Ax≤b by y would give 0=yᵀAx≤yᵀb<0, a contradiction.",
      "Farkas' lemma states that whenever Ax≤b is infeasible, such a certificate y exists.",
    ],
  },
};

export default visualization;
