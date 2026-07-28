import type {
  Point3D,
  Primitive,
  Scene,
  Scene3D,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

function scene2D(
  constraints: Scene["constraints"],
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-0.7, 3.4], y: [-0.7, 3.4] },
    constraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    ...overrides,
  };
}

function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: true,
    showLattice: true,
    showVertices: true,
    scene3D: configuration,
  };
}

const tuConstraints: Scene["constraints"] = [
  { id: "left", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "bottom", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "right", a: 1, b: 0, limit: 2, label: "x₁≤2", color: "#8f88dc" },
  { id: "top", a: 0, b: 1, limit: 2, label: "x₂≤2", color: "#8f88dc" },
  { id: "diagonal", a: 1, b: 1, limit: 3, label: "x₁+x₂≤3", color: "#f49a4a" },
];

const tuVertices: Point3D[] = [
  [0, 0, 0],
  [2, 0, 0],
  [2, 1, 0],
  [1, 2, 0],
  [0, 2, 0],
];

const tuStages: VisualizationStage[] = [
  {
    id: "tu-matrix-definition",
    kicker: "Definition 17 · Totally unimodular",
    title: "Inspect every square submatrix, not only full-size bases",
    description:
      "The inequality matrix has rows (−1,0), (0,−1), (1,0), (0,1), and (1,1). Every 1×1 minor is 0 or ±1, and every 2×2 determinant is also 0 or ±1.",
    formula: "A is TU ⇔ every square subdeterminant lies in {0,±1}",
    insight:
      "Total unimodularity is a statement about all square minors. It is designed for inequality systems, where slack-variable bases can involve many different submatrices.",
    scene: scene2D(tuConstraints, [
      { kind: "label", at: [2.65, 3], text: "A=[−I; I; (1,1)]", tone: "accent" },
      { kind: "label", at: [2.65, 2.65], text: "all minors: 0,±1", tone: "muted" },
    ], {
      caption: {
        primary: "A totally unimodular inequality matrix",
        secondary: "integer right-hand side b=(0,0,2,2,3)",
      },
    }),
  },
  {
    id: "tu-polyhedron",
    kicker: "Theorem 19(b,c) · Polyhedral consequence",
    title: "An integral right-hand side produces an integral polygon",
    description:
      "The feasible region is a clipped square. Its vertices are (0,0), (2,0), (2,1), (1,2), and (0,2), all lattice points.",
    formula: "P(b)={x:Ax≤b} is integral for integral b",
    insight:
      "The matrix controls every possible basis. Since every nonsingular basis determinant is ±1, Cramer’s rule cannot create fractional vertex coordinates.",
    scene: scene2D(tuConstraints, [
      ...tuVertices.map<Primitive>((point, index) => ({
        kind: "point",
        at: [point[0], point[1]],
        label: index === 0 ? "all vertices integral" : undefined,
        style: "integer",
      })),
    ], {
      caption: {
        primary: "TU matrix + integral b",
        secondary: "every displayed vertex lies on the lattice",
      },
    }),
  },
  {
    id: "tu-basis-at-vertex",
    kicker: "Theorem 19 · Basis argument",
    title: "At a vertex, choose the active rows as a square basis",
    description:
      "At x*=(2,1), the active equations are x₁=2 and x₁+x₂=3. Their basis matrix B=[[1,0],[1,1]] has determinant one.",
    formula: "Bx*=b_B,   det(B)=1",
    insight:
      "A vertex is determined locally by active constraints. TU guarantees that every possible active square system is unimodular.",
    scene: scene2D(tuConstraints, [
      { kind: "point", at: [2,1], label: "vertex x*=(2,1)", style: "optimum" },
      { kind: "line", from: [2,-0.5], to: [2,3.2], label: "x₁=2", style: "constraint", color: "#8f88dc" },
      { kind: "line", from: [-0.2,3.2], to: [3.2,-0.2], label: "x₁+x₂=3", style: "constraint", color: "#f49a4a" },
      { kind: "label", at: [0.45,2.85], text: "det B=1", tone: "accent" },
    ]),
  },
  {
    id: "tu-cramer",
    kicker: "Theorem 19 · Cramer’s rule",
    title: "A unit determinant leaves no denominator",
    description:
      "Cramer’s rule writes each basic coordinate as det(B_i)/det(B). Both numerator determinants are integers and the denominator equals ±1.",
    formula: "x*_j=det(B_j)/det(B)∈ℤ",
    insight:
      "This is the precise bridge from determinant conditions on A to integrality of the polyhedron.",
    scene: scene2D(tuConstraints, [
      { kind: "point", at: [2,1], label: "x*=(2,1)", style: "optimum" },
      { kind: "vector", from: [0,0], to: [2,0], label: "x₁=2", color: "#8f88dc", animate: true },
      { kind: "vector", from: [2,0], to: [2,1], label: "x₂=1", color: "#f49a4a", animate: true },
      { kind: "label", at: [0.7,2.85], text: "integer minors / ±1", tone: "accent" },
    ]),
  },
  {
    id: "tu-lp-equals-ip",
    kicker: "Theorem 19 · Optimization consequence",
    title: "Every bounded linear objective has an integral optimal vertex",
    description:
      "Maximizing c=(2,1) selects the vertex (2,1). Because an LP optimum can be taken at a vertex and every vertex is integral, the LP relaxation already solves the integer problem.",
    formula: "max{cᵀx:Ax≤b}=max{cᵀx:Ax≤b,x∈ℤ²}",
    insight:
      "TU is valuable algorithmically because no cutting planes or branching are required for integral b.",
    scene: scene2D(tuConstraints, [
      { kind: "point", at: [2,1], label: "LP = IP optimum", style: "optimum" },
      { kind: "line", from: [-0.2,3], to: [1.6,-0.6], label: "objective level", style: "objective", color: "#e27c89", animate: true },
    ], {
      objective: { vector: [2,1], label: "c=(2,1)" },
    }),
  },
];

const equalityLeft: Point3D = [1,0,0];
const equalityRight: Point3D = [0,1,1];

function unimodularSegmentConfiguration(overrides: Partial<Scene3D> = {}): Scene3D {
  return {
    bounds: { x: [-0.25,1.35], y: [-0.25,1.35], z: [-0.25,1.35] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.75, pitch: 0.42, distance: 4.8 },
    segments: [
      {
        id: "equality-segment",
        from: equalityLeft,
        to: equalityRight,
        label: "P(b)={x≥0:Ax=b}",
        color: "#8f88dc",
        width: 6,
        animate: true,
      },
    ],
    markers: [
      { id: "left", at: equalityLeft, label: "vertex (1,0,0)", style: "integer" },
      { id: "right", at: equalityRight, label: "vertex (0,1,1)", style: "integer" },
    ],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: {
      primary: "Equality polyhedron for a unimodular matrix",
      secondary: "A=[[3,2,1],[1,1,0]], b=(3,1)",
    },
    ...overrides,
  };
}

const unimodularStages: VisualizationStage[] = [
  {
    id: "unimodular-definition",
    kicker: "Definition 17 · Unimodular",
    title: "For a full-row-rank matrix, inspect only its bases",
    description:
      "The matrix A=[[3,2,1],[1,1,0]] has rank two. Every pair of columns forming a basis has determinant ±1: det(a¹,a²)=1, det(a¹,a³)=−1, and det(a²,a³)=−1.",
    formula: "A unimodular ⇔ every basis determinant is ±1",
    insight:
      "The entry 3 is allowed because unimodularity ignores square submatrices that are not full-row-rank bases.",
    scene: scene3D(unimodularSegmentConfiguration({
      caption: {
        primary: "Unimodular but not totally unimodular",
        secondary: "basis determinants are ±1, but the 1×1 minor [3] is not",
      },
    })),
  },
  {
    id: "unimodular-not-tu",
    kicker: "Definition 17 · Distinction",
    title: "This matrix is unimodular but fails total unimodularity",
    description:
      "Total unimodularity would inspect every square submatrix, including the single entry 3. Since 3∉{0,±1}, A is not TU even though all of its bases are unimodular.",
    formula: "unimodular ⇏ totally unimodular",
    insight:
      "Unimodular matrices naturally govern equality systems Ax=b with x≥0; TU matrices govern the more flexible inequality systems Ax≤b.",
    scene: scene3D(unimodularSegmentConfiguration({
      caption: {
        primary: "Same matrix, two determinant tests",
        secondary: "bases pass; the 1×1 minor [3] fails TU",
      },
    })),
  },
  {
    id: "unimodular-equality-polyhedron",
    kicker: "Theorem 19(a) · Equality polyhedron",
    title: "The feasible set is a segment with integral endpoints",
    description:
      "For b=(3,1), the system Ax=b, x≥0 produces the segment joining (1,0,0) and (0,1,1). These are the basic feasible solutions associated with different column bases.",
    formula: "P(b)={x≥0:Ax=b}=conv{(1,0,0),(0,1,1)}",
    insight:
      "The polyhedron may contain fractional points inside the segment, but integrality means its minimal faces—here the vertices—contain integer points.",
    scene: scene3D(unimodularSegmentConfiguration()),
  },
  {
    id: "unimodular-basis-solutions",
    kicker: "Theorem 19(a) · Basis solutions",
    title: "Each endpoint is obtained from an inverse integral basis",
    description:
      "At a basic solution, nonbasic coordinates are zero and x_B=A_B⁻¹b. Because det(A_B)=±1 and A_B,b are integral, the inverse maps b to an integral vector.",
    formula: "x_B=A_B⁻¹b∈ℤ²,   x_N=0",
    insight:
      "Only the endpoint bases matter for the equality-form polyhedron, which is why unimodularity is sufficient here.",
    scene: scene3D(unimodularSegmentConfiguration({
      segments: [
        { id: "basis-left", from: [0,0,0], to: equalityLeft, label: "basis {1,3}", color: "#f49a4a", width: 4, animate: true },
        { id: "basis-right", from: [0,0,0], to: equalityRight, label: "basis {2,3}", color: "#79c9c0", width: 4, animate: true },
        { id: "segment", from: equalityLeft, to: equalityRight, label: "all feasible convex combinations", color: "#8f88dc", width: 5 },
      ],
    })),
  },
];

const nonTuConstraints: Scene["constraints"] = [
  { id: "x1-nonnegative", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "x2-nonnegative", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "weighted", a: 2, b: 1, limit: 1, label: "2x₁+x₂≤1", color: "#e27c89" },
];

const nonTuStages: VisualizationStage[] = [
  {
    id: "non-tu-minor",
    kicker: "Counterexample · Non-TU",
    title: "A single minor of magnitude two creates a denominator",
    description:
      "For A=(2,1), the 1×1 subdeterminant [2] violates total unimodularity. With integral b=1, the active equation 2x₁+x₂=1 can solve to half-integral coordinates.",
    formula: "det([2])=2",
    insight:
      "The determinant bound predicts exactly where fractions may enter through Cramer’s rule.",
    scene: scene2D(nonTuConstraints, [
      { kind: "label", at: [1.7,2.7], text: "minor 2 ⇒ denominator 2", tone: "accent" },
    ], {
      viewport: { x: [-0.3,1.5], y: [-0.3,1.5] },
      caption: {
        primary: "Non-TU inequality matrix",
        secondary: "A=(2,1), b=1",
      },
    }),
  },
  {
    id: "non-tu-fractional-vertex",
    kicker: "Counterexample · Fractional polyhedron",
    title: "The LP relaxation has a fractional vertex",
    description:
      "The feasible triangle has vertices (0,0), (0,1), and (1/2,0). The right-hand side is integral, but one vertex is not.",
    formula: "x*=(1/2,0)",
    insight:
      "Without TU, integral right-hand sides do not guarantee an integral polyhedron.",
    scene: scene2D(nonTuConstraints, [
      { kind: "point", at: [0,0], label: "integral vertex", style: "integer" },
      { kind: "point", at: [0,1], label: "integral vertex", style: "integer" },
      { kind: "point", at: [0.5,0], label: "fractional vertex", style: "fractional" },
    ], {
      viewport: { x: [-0.3,1.5], y: [-0.3,1.5] },
    }),
  },
  {
    id: "non-tu-objective-gap",
    kicker: "Counterexample · LP versus IP",
    title: "A linear objective can prefer the fractional vertex",
    description:
      "Maximizing x₁ chooses the LP vertex (1/2,0), while every feasible integer point has x₁=0. The LP and IP optimal values differ.",
    formula: "z_LP=1/2,   z_IP=0",
    insight:
      "This is the algorithmic cost of losing total unimodularity: solving the relaxation no longer solves the integer problem.",
    scene: scene2D(nonTuConstraints, [
      { kind: "point", at: [0.5,0], label: "LP optimum", style: "fractional" },
      { kind: "point", at: [0,1], label: "IP optimum value 0", style: "integer" },
      { kind: "point", at: [0,0], style: "integer" },
      { kind: "line", from: [0.5,-0.2], to: [0.5,1.3], label: "x₁=1/2", style: "objective", color: "#e27c89", animate: true },
    ], {
      viewport: { x: [-0.3,1.5], y: [-0.3,1.5] },
      objective: { vector: [1,0], label: "maximize x₁" },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "tu-inequality-polytope",
    title: "TU inequality matrix — integral polygon",
    description:
      "Follow the Hoffman–Kruskal argument from square subdeterminants to active bases, Cramer’s rule, integral vertices, and equality of LP and IP optima.",
    stages: tuStages,
  },
  {
    id: "unimodular-not-tu",
    title: "Unimodular but not TU — equality segment",
    description:
      "Use the notes’ matrix [[3,2,1],[1,1,0]] to separate basis unimodularity from total unimodularity and visualize its equality polyhedron in 3D.",
    stages: unimodularStages,
  },
  {
    id: "non-tu-fractional",
    title: "Non-TU matrix — fractional vertex",
    description:
      "A minor of magnitude two creates a half-integral LP vertex and a strict LP–IP objective gap.",
    stages: nonTuStages,
  },
];

const visualization: VisualizationDefinition = {
  id: "tu-unimodular-polyhedra",
  title: "Unimodular and Totally Unimodular Polyhedra",
  shortTitle: "Unimodular and TU",
  chapter: "Total unimodularity",
  order: 1,
  description:
    "Compare unimodular and totally unimodular determinant conditions, then see how unit basis determinants force integral vertices through Cramer’s rule.",
  difficulty: "Intermediate",
  duration: 20,
  accent: "#8f88dc",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: tuStages,
  examples,
  proof: {
    title: "The Hoffman–Kruskal determinant-to-polyhedron argument",
    steps: [
      "For equality form P(b)={x≥0:Ax=b}, a vertex has x_B=A_B⁻¹b and x_N=0 for a column basis B.",
      "If A is unimodular, every basis determinant is ±1. Cramer’s rule therefore makes x_B integral for integral b.",
      "For inequality form P(b)={x≥0:Ax≤b}, add slack variables and use that A is TU exactly when [A,I] is unimodular.",
      "Thus every basic feasible solution of the slack-form equality system is integral, so every vertex of P(b) is integral.",
      "For unrestricted x, write x=x⁺−x⁻ and use preservation of total unimodularity under adjoining −A.",
      "Conversely, if every P(b) is integral for every integral b, carefully chosen right-hand sides force every basis inverse to be integral and hence every basis determinant to be ±1.",
    ],
  },
};

export default visualization;
