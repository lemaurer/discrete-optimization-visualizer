import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const viewport: Scene["viewport"] = { x: [-0.7, 6.7], y: [-0.7, 6.7] };

function scene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints: [],
    primitives,
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Integer decomposition property",
      secondary: "an integer point in kP is peeled into k integer points of P",
    },
    ...overrides,
  };
}

function triangle(
  scale: number,
  label: string,
  style: "feasible" | "integer-hull" = "feasible",
  fromScale?: number,
): Primitive {
  return {
    kind: "polygon",
    points: [[0, 0], [2 * scale, 0], [0, 2 * scale]],
    label,
    style,
    fromPoints:
      fromScale === undefined
        ? undefined
        : [[0, 0], [2 * fromScale, 0], [0, 2 * fromScale]],
  };
}

const y: Point2D = [4, 2];
const x3: Point2D = [2, 0];
const remainder2: Point2D = [2, 2];
const x2: Point2D = [1, 1];
const x1: Point2D = [1, 1];

const decompositionStages: VisualizationStage[] = [
  {
    id: "idp-base-and-dilate",
    kicker: "Theorem 22 · Dilations",
    title: "Compare one copy of P with the dilation 3P",
    description:
      "For A=(1,1) and b=2, the base polytope is P(b)={x≥0:x₁+x₂≤2}. Multiplying the right-hand side by three expands every point radially and gives P(3b)=3P.",
    formula: "P(b)={x≥0:Ax≤b},   P(3b)=3P(b)",
    insight:
      "The integer decomposition property asks whether every lattice point of the large triangle is a sum of three lattice points from the small triangle.",
    scene: scene([
      triangle(3, "3P=P(3b)", "feasible", 1),
      triangle(1, "P=P(b)", "integer-hull"),
    ]),
  },
  {
    id: "idp-target",
    kicker: "Theorem 22 · Target lattice point",
    title: "Choose an integer point y inside the dilation",
    description:
      "The point y=(4,2) satisfies y₁+y₂=6, so y∈P(3b). The question is whether it can be split into three feasible integer summands.",
    formula: "y=(4,2)∈P(6)∩ℤ²",
    insight:
      "The summands need not be vertices and need not be distinct; each only has to belong to P(b)∩ℤ².",
    scene: scene([
      triangle(3, "3P", "feasible"),
      triangle(1, "one-copy budget P", "integer-hull"),
      { kind: "point", at: y, label: "target y=(4,2)", style: "optimum" },
    ]),
  },
  {
    id: "idp-auxiliary-polyhedron",
    kicker: "Theorem 22 · Inductive polyhedron",
    title: "Build the auxiliary polyhedron that chooses one summand",
    description:
      "The proof searches for x³ satisfying Ax³≤b and A(y−x³)≤2b, together with 0≤x³≤y. In this example those inequalities collapse to x₁+x₂=2 inside the coordinate box.",
    formula: "Q={x:Ay−2b≤Ax≤b, 0≤x≤y}",
    insight:
      "The point y/3 lies in Q, so Q is nonempty. Because the defining matrix remains TU, Q has an integral vertex.",
    scene: scene([
      triangle(3, "3P", "feasible"),
      {
        kind: "line",
        from: [0, 2],
        to: [2, 0],
        label: "Q: x₁+x₂=2",
        style: "cut",
        color: "#f49a4a",
        animate: true,
      },
      { kind: "point", at: [4 / 3, 2 / 3], label: "y/3∈Q", style: "fractional" },
      { kind: "point", at: x3, label: "integral vertex x³=(2,0)", style: "integer", animateFrom: [4 / 3, 2 / 3] },
      { kind: "point", at: y, label: "y", style: "optimum" },
    ]),
  },
  {
    id: "idp-first-peel",
    kicker: "Theorem 22 · Peel one copy",
    title: "Subtract the integral vertex and keep a valid remainder",
    description:
      "Choose x³=(2,0). The remainder y′=y−x³=(2,2) is integral and satisfies y′∈P(2b)=2P.",
    formula: "y′=y−x³=(2,2),   Ay′≤2b",
    insight:
      "The lower inequality Ay−2b≤Ax³ is exactly what guarantees that the remainder stays inside the smaller dilation.",
    scene: scene([
      triangle(3, "3P", "feasible"),
      triangle(2, "2P for the remainder", "integer-hull", 3),
      { kind: "point", at: y, label: "old target y", style: "optimum" },
      { kind: "point", at: remainder2, label: "remainder y′=(2,2)", style: "integer", animateFrom: y },
      { kind: "vector", from: remainder2, to: y, label: "+x³=(2,0)", color: "#f49a4a", animate: true },
    ]),
  },
  {
    id: "idp-repeat",
    kicker: "Theorem 22 · Induction",
    title: "Repeat the same step for the two-copy remainder",
    description:
      "Apply the inductive construction to y′∈2P. Select x²=(1,1)∈P and leave y″=(1,1)∈P for the final summand.",
    formula: "y′=x²+y″=(1,1)+(1,1)",
    insight:
      "Each iteration removes one feasible lattice point and decreases the dilation factor by one.",
    scene: scene([
      triangle(2, "2P", "feasible"),
      triangle(1, "P", "integer-hull"),
      { kind: "point", at: remainder2, label: "y′=(2,2)", style: "optimum" },
      { kind: "point", at: x2, label: "x²=(1,1)", style: "integer", animateFrom: remainder2 },
      { kind: "point", at: x1, label: "x¹=(1,1)", style: "integer" },
      { kind: "vector", from: x2, to: remainder2, label: "+x¹", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "idp-sum",
    kicker: "Theorem 22 · Decomposition",
    title: "The three one-copy points add back to y",
    description:
      "The final decomposition uses x¹=(1,1), x²=(1,1), and x³=(2,0). Every summand is integral and lies in P(b).",
    formula: "(4,2)=(1,1)+(1,1)+(2,0)",
    insight:
      "TU is stronger than vertex integrality: it coordinates all dilations so every lattice point can be assembled from one-copy lattice points.",
    scene: scene([
      triangle(3, "3P", "feasible"),
      triangle(1, "P", "integer-hull"),
      { kind: "vector", from: [0, 0], to: x1, label: "x¹", color: "#79c9c0", animate: true },
      { kind: "vector", from: x1, to: [2, 2], label: "+x²", color: "#8f88dc", animate: true },
      { kind: "vector", from: [2, 2], to: y, label: "+x³", color: "#f49a4a", animate: true },
      { kind: "point", at: y, label: "sum y=(4,2)", style: "optimum" },
    ]),
  },
];

const boxStages: VisualizationStage[] = [
  {
    id: "idp-box-base",
    kicker: "Integer decomposition · Product example",
    title: "A unit box decomposes coordinate by coordinate",
    description:
      "For P=[0,1]² and k=3, the dilation is 3P=[0,3]². The target y=(2,1) is an integer point of 3P.",
    formula: "P=[0,1]²,   y=(2,1)∈3P",
    insight:
      "Boxes provide the simplest TU example because each coordinate can be distributed independently among the copies.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[3,0],[3,3],[0,3]],
        label: "3P",
        style: "feasible",
        fromPoints: [[0,0],[1,0],[1,1],[0,1]],
      },
      {
        kind: "polygon",
        points: [[0,0],[1,0],[1,1],[0,1]],
        label: "P",
        style: "integer-hull",
      },
      { kind: "point", at: [2,1], label: "y=(2,1)", style: "optimum" },
    ], { viewport: { x: [-0.5,3.5], y: [-0.5,3.5] } }),
  },
  {
    id: "idp-box-layers",
    kicker: "Integer decomposition · Binary layers",
    title: "Read each coordinate as the number of copies receiving a one",
    description:
      "The first coordinate equals two, so two copies receive a first-coordinate one. The second coordinate equals one, so one copy receives a second-coordinate one.",
    formula: "(2,1)=(1,1)+(1,0)+(0,0)",
    insight:
      "This is the same decomposition principle as the theorem, visible as stacking binary layers.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[1,0],[1,1],[0,1]],
        label: "each summand lies in P",
        style: "integer-hull",
      },
      { kind: "vector", from: [0,0], to: [1,1], label: "x¹=(1,1)", color: "#79c9c0", animate: true },
      { kind: "vector", from: [1,1], to: [2,1], label: "+x²=(1,0)", color: "#8f88dc", animate: true },
      { kind: "vector", from: [2,1], to: [2,1], label: "+x³=(0,0)", color: "#f49a4a", animate: true },
      { kind: "point", at: [2,1], label: "y", style: "optimum" },
    ], { viewport: { x: [-0.5,3.5], y: [-0.5,3.5] } }),
  },
];

const failureStages: VisualizationStage[] = [
  {
    id: "idp-failure-fractional-vertex",
    kicker: "Theorem 22 · Converse",
    title: "A non-TU row creates a fractional vertex",
    description:
      "Take A=(2,1), b=1, and P={x≥0:2x₁+x₂≤1}. The vertex x*=(1/2,0) is fractional because the active coefficient two appears in the denominator.",
    formula: "x*=(1/2,0)∈P,   A is not TU",
    insight:
      "The 1×1 minor [2] already violates total unimodularity.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[0.5,0],[0,1]],
        label: "P(b)",
        style: "feasible",
      },
      { kind: "point", at: [0.5,0], label: "fractional vertex x*", style: "fractional" },
      { kind: "point", at: [0,0], label: "integral point", style: "integer" },
      { kind: "point", at: [0,1], label: "integral point", style: "integer" },
    ], { viewport: { x: [-0.3,2.3], y: [-0.3,2.3] } }),
  },
  {
    id: "idp-failure-scale",
    kicker: "Theorem 22 · Clear denominators",
    title: "Scale the fractional vertex until it becomes integral",
    description:
      "The determinant denominator is k=2. Therefore y=2x*=(1,0) is an integer point of P(2b)=2P.",
    formula: "y=2x*=(1,0)∈P(2b)∩ℤ²",
    insight:
      "This is exactly the construction used in the converse proof from the notes.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[1,0],[0,2]],
        label: "2P=P(2b)",
        style: "feasible",
        fromPoints: [[0,0],[0.5,0],[0,1]],
      },
      { kind: "point", at: [0.5,0], label: "x*", style: "fractional" },
      { kind: "point", at: [1,0], label: "y=2x* integral", style: "optimum", animateFrom: [0.5,0] },
    ], { viewport: { x: [-0.3,2.3], y: [-0.3,2.3] } }),
  },
  {
    id: "idp-failure-no-sum",
    kicker: "Theorem 22 · Failed decomposition",
    title: "No two integer points of P can sum to y",
    description:
      "The only integer points of P are (0,0) and (0,1). Their pairwise sums have first coordinate zero, so none equals y=(1,0).",
    formula: "y∉(P∩ℤ²)+(P∩ℤ²)",
    insight:
      "The lattice point exists in 2P but cannot be assembled from two one-copy lattice points: the integer decomposition property fails.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[1,0],[0,2]],
        label: "2P",
        style: "feasible",
      },
      {
        kind: "polygon",
        points: [[0,0],[0.5,0],[0,1]],
        label: "P",
        style: "integer-hull",
      },
      { kind: "point", at: [0,0], label: "P∩ℤ²", style: "integer" },
      { kind: "point", at: [0,1], style: "integer" },
      { kind: "point", at: [0,2], label: "possible sum", style: "integer" },
      { kind: "point", at: [1,0], label: "unreachable y", style: "fractional" },
    ], { viewport: { x: [-0.3,2.3], y: [-0.3,2.3] } }),
  },
  {
    id: "idp-failure-extreme-contradiction",
    kicker: "Theorem 22 · Why decomposition would contradict extremality",
    title: "A hypothetical decomposition would express x* as a nontrivial average",
    description:
      "If y=x¹+x² with integer x¹,x²∈P, then x*=y/2=(x¹+x²)/2. Since x* is a fractional vertex, it cannot be the midpoint of two distinct feasible points, while equality would force fractional summands if both coincided with x*.",
    formula: "x*=1/2(x¹+x²), contradiction",
    insight:
      "Thus the decomposition property for every integer b and k forces all P(b) to be integral, and hence forces A to be TU.",
    scene: scene([
      {
        kind: "polygon",
        points: [[0,0],[0.5,0],[0,1]],
        label: "P",
        style: "feasible",
      },
      { kind: "point", at: [0.5,0], label: "vertex x* cannot be an average", style: "fractional" },
      { kind: "vector", from: [0,0], to: [0.5,0], label: "hypothetical averaging", color: "#e27c89", animate: true },
      { kind: "vector", from: [0,1], to: [0.5,0], label: "would need another P point", color: "#e27c89", animate: true },
    ], { viewport: { x: [-0.3,2.3], y: [-0.3,2.3] } }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "tu-simplex-induction",
    title: "TU simplex — follow the inductive proof",
    description:
      "Use the auxiliary polyhedron from Theorem 22 to peel y=(4,2) from 3P into three integral points of P.",
    stages: decompositionStages,
  },
  {
    id: "unit-box-layers",
    title: "Unit box — binary layer decomposition",
    description:
      "A compact coordinatewise example where a lattice point in 3[0,1]² is decomposed into three binary vectors.",
    stages: boxStages,
  },
  {
    id: "non-tu-failure",
    title: "Non-TU triangle — decomposition fails",
    description:
      "Clear the denominator of a fractional vertex and obtain an integer point in 2P that cannot be written as a sum of two integer points of P.",
    stages: failureStages,
  },
];

const visualization: VisualizationDefinition = {
  id: "integer-decomposition-property",
  title: "Integer Decomposition of Polyhedra",
  shortTitle: "Integer decomposition",
  chapter: "Total unimodularity",
  order: 2,
  description:
    "Visualize Theorem 22: a matrix is totally unimodular exactly when every nonnegative lattice point in P(kb) decomposes into k lattice points of P(b).",
  difficulty: "Advanced",
  duration: 20,
  accent: "#79c9c0",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: decompositionStages,
  examples,
  proof: {
    title: "The two directions of the Baum–Trotter characterization",
    steps: [
      "Assume the decomposition property holds for every integral b, every y∈P(kb)∩ℤⁿ₊, and every natural k.",
      "If some P(b) had a fractional vertex x*, choose k as a basis determinant so that kx* is integral by Cramer’s rule.",
      "Decomposing kx* into x¹+⋯+xᵏ with xⁱ∈P(b)∩ℤⁿ would write x* as their average, contradicting that x* is a fractional vertex.",
      "Conversely assume A is TU and proceed by induction on k.",
      "For y∈P(kb), form Q={x:Ay−(k−1)b≤Ax≤b, 0≤x≤y}. The point y/k proves Q is nonempty.",
      "The defining matrix of Q is TU, so Q has an integral vertex xᵏ.",
      "Then y′=y−xᵏ is integral and lies in P((k−1)b). Apply the induction hypothesis to y′ and append xᵏ.",
    ],
  },
};

export default visualization;
