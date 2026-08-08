import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  PROXIMITY_COLORS as C,
  label2D,
  line2D,
  marker3D,
  point2D,
  scene2D,
  scene3D,
  segment3D,
  vector2D,
} from "@/visualizations/helpers/standard-form-proximity-scenes";

const feasible2D: [Point2D, Point2D] = [[3, 0], [0, 2]];
const xStar2D: Point2D = [3, 0];
const y2D: Point2D = [-3, 2];

function base2D(extra: Primitive[], secondary: string) {
  return scene2D(
    [
      line2D(feasible2D[0], feasible2D[1], "2x₁+3x₂=6, x≥0", C.aqua, "constraint"),
      point2D(xStar2D, "x*=(3,0)", "optimum"),
      ...extra,
    ],
    { primary: "Lemma 151 · feasible kernel directions cannot improve an LP optimum", secondary },
    { viewport: { x: [-0.7, 3.8], y: [-0.7, 2.8] }, objective: { vector: [3, 4], label: "c=(3,4)" } },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "lem151-2d-setup",
    kicker: "Chapter 25 · Lemma 151 · 2D",
    title: "Fix an optimal basic LP solution and distinguish basic from nonbasic variables",
    description:
      "For A=[2 3], b=6 and c=(3,4), the feasible set is the segment 2x₁+3x₂=6, x≥0. The LP optimum is x*=(3,0), with B={1} and N={2}.",
    formula: "x*_B=A_B^{-1}b=3,   x*_N=0",
    insight:
      "Lemma 151 studies kernel directions y with Ay=0 that are nonnegative on every nonbasic coordinate. Such directions are locally feasible from x*.",
    scene: base2D([], "The nonbasic coordinate x₂ is zero at x*."),
  },
  {
    id: "lem151-2d-cone",
    kicker: "Proof step 1 · The cone C",
    title: "A kernel direction may decrease basic variables, but it may not decrease nonbasic ones",
    description:
      "Take y=(-3,2). It satisfies Ay=2(-3)+3(2)=0 and y₂=2≥0, so y belongs to C={y:Ay=0, y_i≥0 for i∈N}.",
    formula: "C={y:Ay=0, y₂≥0},   y=(-3,2)∈C",
    insight: "The condition y_N≥0 is exactly what is needed because x*_N=0.",
    scene: base2D([vector2D(xStar2D, [0,2], "y=(-3,2)", C.violet)], "The arrow is parallel to the equality Ax=b."),
  },
  {
    id: "lem151-2d-lambda",
    kicker: "Proof step 2 · Scale until nonnegativity is safe",
    title: "Choose λ so that x*+λy remains nonnegative",
    description:
      "When a basic component y_i is negative, λ is capped by x*_i/|y_i|. Here λ=min{1,3/3}=1, and x*+λy=(0,2) is still feasible.",
    formula: "λ=min{1, x*_i/|y_i| : i∈B, y_i<0}",
    insight: "For j∈N, x*_j=0 and y_j≥0 automatically give x*_j+λy_j≥0.",
    scene: base2D([
      vector2D(xStar2D, [0,2], "λy", C.orange),
      point2D([0,2], "x*+λy=(0,2)", "integer"),
    ], "Ay=0 preserves the equality and the λ-choice preserves nonnegativity."),
  },
  {
    id: "lem151-2d-objective",
    kicker: "Proof step 3 · Invoke optimality",
    title: "If cᵀy were positive, the feasible perturbation would beat x*",
    description:
      "Here cᵀy=3(-3)+4(2)=-1. In general x*+λy is feasible and λ>0, so LP optimality implies cᵀ(x*+λy)≤cᵀx*, hence cᵀy≤0.",
    formula: "cᵀ(x*+λy)≤cᵀx*  ⇒  λ cᵀy≤0  ⇒  cᵀy≤0",
    insight: "Lemma 151 is a local optimality statement on the feasible kernel cone determined by the optimal basis.",
    scene: base2D([
      point2D([0,2], "objective 8", "integer"),
      label2D([2.0,1.7], "cᵀx*=9 > 8", "accent"),
    ], "The admissible kernel direction decreases the objective."),
  },
];

const xStar3D: Point3D = [3,2,0];
const end3D: Point3D = [1,0,2];

const stages3D: VisualizationStage[] = [
  {
    id: "lem151-3d-setup",
    kicker: "Lemma 151 · 3D variable space",
    title: "The same proof works on a genuine three-variable standard-form LP",
    description:
      "Use A=[[1,0,1],[0,1,1]], b=(3,2), c=(3,2,4). The feasible set is x(t)=(3−t,2−t,t), 0≤t≤2. The optimum is x*=(3,2,0), with B={1,2}, N={3}.",
    formula: "Ax=b, x≥0,   x(t)=(3−t,2−t,t)",
    insight: "This is not a schematic 3D analogue: the displayed line is the actual feasible polyhedron in ℝ³.",
    scene: scene3D({
      bounds: { x: [-0.4,3.5], y: [-0.4,2.7], z: [-0.4,2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.82, pitch: 0.45, distance: 5.5 },
      markers: [marker3D("xstar", xStar3D, "x*=(3,2,0)", "optimum", 0.1), marker3D("end", end3D, "(1,0,2)", "integer", 0.07)],
      segments: [segment3D("feasible", xStar3D, end3D, "Ax=b, x≥0", C.aqua, { width: 5, animate: false })],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Actual 3D feasible set", secondary: "The third coordinate is nonbasic and equals zero at x*." },
    }),
  },
  {
    id: "lem151-3d-direction",
    kicker: "Proof step 1 · Kernel cone",
    title: "The admissible direction is y=(-1,-1,1)",
    description:
      "Ay=0 and y₃=1≥0, hence y∈C. Its objective change is cᵀy=-3-2+4=-1.",
    formula: "y=(-1,-1,1),   Ay=0, y_N=y₃≥0, cᵀy=-1",
    insight: "The nonbasic sign restriction is visible directly: movement starts from x₃=0 and goes into x₃≥0.",
    scene: scene3D({
      bounds: { x: [-0.4,3.5], y: [-0.4,2.7], z: [-0.4,2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.82, pitch: 0.45, distance: 5.5 },
      markers: [marker3D("xstar2", xStar3D, "x*", "optimum", 0.1), marker3D("step", [2,1,1], "x*+y", "integer", 0.08)],
      segments: [segment3D("dir", xStar3D, [2,1,1], "y=(-1,-1,1)", C.violet)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Kernel perturbation", secondary: "The equality Ax=b is preserved exactly." },
    }),
  },
  {
    id: "lem151-3d-scale",
    kicker: "Proof step 2 · λ",
    title: "Scale only until a basic coordinate reaches zero",
    description:
      "Both negative basic components equal −1, so λ=min{1,3,2}=1 in this example. For a general y, the same minimum formula guarantees every component of x*+λy is nonnegative.",
    formula: "λ=min{1, x*_i/|y_i| : i∈B, y_i<0}>0",
    insight: "Nothing dimension-specific occurs in this step; the basis/nonbasis split carries the proof.",
    scene: scene3D({
      bounds: { x: [-0.4,3.5], y: [-0.4,2.7], z: [-0.4,2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.82, pitch: 0.45, distance: 5.5 },
      markers: [marker3D("a", xStar3D, "x*", "optimum", 0.09), marker3D("b", [2,1,1], "feasible perturbation", "integer", 0.09)],
      segments: [segment3D("move", xStar3D, [2,1,1], "λy", C.orange)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Feasible scaled move", secondary: "A(x*+λy)=b and x*+λy≥0." },
    }),
  },
  {
    id: "lem151-3d-conclusion",
    kicker: "Proof step 3 · Optimality",
    title: "LP optimality rules out every positive-gain direction in C",
    description:
      "Because λ>0 and x*+λy is feasible, cᵀy>0 would contradict optimality of x*. Therefore cᵀy≤0 for all y∈C.",
    formula: "∀y∈C: cᵀy≤0",
    insight: "This lemma is the objective-sign engine used later when a zero-sum Steinitz block produces a conformal kernel direction.",
    scene: scene3D({
      bounds: { x: [-0.4,3.5], y: [-0.4,2.7], z: [-0.4,2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.82, pitch: 0.45, distance: 5.5 },
      markers: [marker3D("opt3", xStar3D, "LP optimum", "optimum", 0.11), marker3D("lower", [2,1,1], "lower objective", "integer", 0.07)],
      segments: [segment3D("downobj", xStar3D, [2,1,1], "cᵀy=-1", C.rose)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Lemma 151 conclusion", secondary: "No direction in C can improve the LP optimum." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "lem151-2d", title: "2D · one equality, complete proof", stages: stages2D },
  { id: "lem151-3d", title: "3D · two equalities, complete proof", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "lemma-151-optimal-kernel-directions",
  title: "Lemma 151 — Optimal Basic Solutions and Kernel Directions",
  shortTitle: "Kernel directions · Lemma 151",
  chapter: "Standard-form proximity",
  order: 1,
  description:
    "Visualizes the auxiliary optimality lemma used in Chapter 25: every kernel direction that is nonnegative on the nonbasic variables has nonpositive objective gain at an optimal basic LP solution.",
  difficulty: "Intermediate",
  duration: 10,
  accent: C.aqua,
  visualLabel: "Feasible kernel geometry",
  insightLabel: "Proof step",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Lemma 151 proof",
    steps: [
      "Fix y with Ay=0 and y_i≥0 on every nonbasic index i∈N.",
      "Choose λ=min{1,x*_i/|y_i|:i∈B,y_i<0}; if there are no negative basic components, take λ=1.",
      "Then x*+λy≥0: the λ-bound protects negative basic components, while x*_N=0 and y_N≥0 protect nonbasic components.",
      "Ay=0 gives A(x*+λy)=b, so x*+λy is LP feasible.",
      "Optimality of x* yields cᵀ(x*+λy)≤cᵀx*. Since λ>0, cᵀy≤0.",
    ],
  },
};

export default visualization;
