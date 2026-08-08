import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  boxMesh,
  label2D,
  line2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
} from "@/visualizations/helpers/lattice-free-scenes";

const polygonP: Point2D[] = [[0,0],[2.5,0],[2,1],[1,2],[0,2.5]];
const latticeP: Point2D[] = [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2]];
const objectiveOptima: Point2D[] = [[2,1],[1,2]];

function theoremScene2D(extra: Primitive[], secondary: string) {
  return scene2D(
    [polygon2D(polygonP, "P", "feasible"), ...latticeP.map((p) => point2D(p, undefined, "lattice")), ...extra],
    { primary: "Theorem 146 · integer objective certificate", secondary },
    { viewport: { x: [-0.5, 3.4], y: [-0.5, 3.4] }, objective: { vector: [1,1], label: "c=(1,1)" } },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "th146-2d-statement",
    kicker: "Chapter 24 · Theorem 146 · 2D",
    title: "Only 2ⁿ−1 original inequalities are needed to preserve the integer optimum",
    description:
      "Let γ be the finite optimum of the integer problem over P. The theorem says that some subsystem of at most 2ⁿ−1 rows of Ax≤b already has exactly the same integer optimum.",
    formula: "γ=max{cᵀx:x∈P∩ℤⁿ} ⇒ ∃I, |I|≤2ⁿ−1, γ=max{cᵀx:A_Ix≤b_I, x∈ℤⁿ}",
    insight: "In dimension two the certificate needs at most three original constraints, regardless of how many rows describe P.",
    scene: theoremScene2D(
      objectiveOptima.map((p, i) => point2D(p, i === 0 ? "γ=3" : undefined, "optimum")),
      "Running example: c=x₁+x₂ and γ=3.",
    ),
  },
  {
    id: "th146-2d-pt",
    kicker: "Proof step 1 · Cut above γ",
    title: "For every t, forbid objective values at least γ+1/t",
    description:
      "Define P_t by adding the inequality cᵀx≥γ+1/t. Since γ is the largest integer-feasible objective value, P_t contains no integer point.",
    formula: "P_t={x:Ax≤b, cᵀx≥γ+1/t},   P_t∩ℤⁿ=∅",
    insight: "The threshold is deliberately strict above γ. As t grows, it approaches the optimal level from above.",
    scene: theoremScene2D(
      [
        line2D([0.4,3.1],[3.1,0.4], "cᵀx=γ+1/t", C.rose, "cut"),
        label2D([2.1,2.5], "integer-empty cap P_t", "accent"),
      ],
      "The cap above the threshold has no lattice point.",
    ),
  },
  {
    id: "th146-2d-doignon",
    kicker: "Proof step 2 · Apply Theorem 144",
    title: "Doignon compresses each integer-infeasible P_t to at most 2ⁿ rows",
    description:
      "The certificate for P_t uses at most 2ⁿ inequalities in total. It must include the objective-threshold inequality, because the original system Ax≤b itself has an integer feasible point.",
    formula: "≤2ⁿ total rows ⇒ ≤2ⁿ−1 rows from Ax≤b",
    insight: "This is the exact origin of the minus one in Theorem 146.",
    scene: theoremScene2D(
      [
        line2D([0.4,3.1],[3.1,0.4], "mandatory objective row", C.rose, "cut"),
        line2D([0,0],[2.5,0], "selected row 1", C.orange, "constraint"),
        line2D([0,0],[0,2.5], "selected row 2", C.aqua, "constraint"),
        label2D([1.25,0.35], "I(t): at most 3 original rows", "accent"),
      ],
      "Every t has a small index set I(t).",
    ),
  },
  {
    id: "th146-2d-subsequence",
    kicker: "Proof step 3 · Finite pigeonhole on index sets",
    title: "Infinitely many t-values but only finitely many possible row subsets",
    description:
      "There are only finitely many subsets of {1,…,m} of size at most 2ⁿ−1. Hence one index set I′ occurs along an infinite subsequence t₁<t₂<⋯.",
    formula: "I′=I(t₁)=I(t₂)=⋯",
    insight: "This step freezes the changing Doignon certificates into one fixed subsystem.",
    scene: theoremScene2D(
      [
        label2D([0.3,2.9], "t₁", "muted"),
        label2D([0.8,2.9], "t₂", "muted"),
        label2D([1.3,2.9], "t₃", "muted"),
        label2D([2.0,2.9], "…", "muted"),
        label2D([0.65,2.55], "same I′ repeats infinitely often", "accent"),
      ],
      "Finite family of index sets + infinite sequence ⇒ constant subsequence.",
    ),
  },
  {
    id: "th146-2d-no-better",
    kicker: "Proof step 4 · Exclude cᵀx>γ",
    title: "The fixed subsystem I′ admits no integer point strictly better than γ",
    description:
      "If an integer x satisfied A_{I′}x≤b_{I′} and cᵀx>γ, choose a sufficiently large subsequence index k so that 1/t_k<cᵀx−γ. Then x would violate the integer-infeasibility certificate for P_{t_k}.",
    formula: "{x∈ℤⁿ:A_{I′}x≤b_{I′}, cᵀx>γ}=∅",
    insight: "The thresholds γ+1/t_k converge to γ, so every strictly better integer objective is eventually caught.",
    scene: theoremScene2D(
      [
        line2D([0,3.05],[3.05,0], "cᵀx=γ", C.violet, "objective"),
        point2D([2,2], "hypothetical cᵀx=4", "fractional"),
        label2D([1.75,2.35], "eventually excluded by γ+1/t_k", "accent"),
      ],
      "No integer point above the γ-level survives the fixed subsystem.",
    ),
  },
  {
    id: "th146-2d-attain-gamma",
    kicker: "Proof step 5 · Keep an incumbent",
    title: "The original optimum still satisfies the retained rows",
    description:
      "An optimal integer solution x* of the original problem satisfies every row of Ax≤b, hence certainly the subset I′. Therefore the reduced system has an integer point with objective γ.",
    formula: "x*∈P∩ℤⁿ ⇒ A_{I′}x*≤b_{I′}, cᵀx*=γ",
    insight: "No point can be better than γ, and x* still achieves γ: the reduced system has exactly the same optimum.",
    scene: theoremScene2D(
      objectiveOptima.map((p, i) => point2D(p, i === 0 ? "x* survives · value γ" : undefined, "optimum")),
      "Conclusion: the small subsystem preserves the integer optimum.",
    ),
  },
];

const cubePoints: Point3D[] = [
  [0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1],[1,1,1],
  [2,0,0],[0,2,0],[0,0,2],[2,1,1],[1,2,1],[1,1,2],
];

const stages3D: VisualizationStage[] = [
  {
    id: "th146-3d-statement",
    kicker: "Chapter 24 · Theorem 146 · 3D",
    title: "In dimension three at most seven original constraints suffice",
    description:
      "The dimension-dependent number is 2³−1=7. The proof is identical: add one objective threshold, use the 2³-row Doignon certificate, then remove the mandatory threshold row from the count.",
    formula: "|I|≤2³−1=7",
    insight: "The theorem is about the number of retained rows, not about the number of optimal points or facets of the integer hull.",
    scene: scene3D({
      bounds: { x: [-0.3,2.4], y: [-0.3,2.4], z: [-0.3,2.4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.48, distance: 5.3 },
      meshes: [boxMesh("box", [0,0,0], [2,2,2], "P", "ghost", 0.12)],
      markers: cubePoints.map((p,i) => marker3D(`p-${i}`, p, undefined, "integer", 0.045)),
      segments: [segment3D("objective", [0,0,0], [1.5,1.5,1.5], "c=(1,1,1)", C.violet)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "3D integer optimization", secondary: "One threshold row + at most seven original rows." },
    }),
  },
  {
    id: "th146-3d-proof-flow",
    kicker: "Proof steps · 3D summary",
    title: "The complete proof is a five-step compression argument",
    description:
      "For each t: make P_t integer-empty, compress with Doignon, retain at most seven original rows, freeze one repeated index set along an infinite subsequence, and pass to the limit γ+1/t↓γ.",
    formula: "P_t∩ℤ³=∅ → I(t), |I(t)|≤7 → I′ repeated → no cᵀx>γ → x* attains γ",
    insight: "The limiting argument is discrete: any integer point with objective strictly above γ has a positive objective gap, so some 1/t_k is smaller than that gap.",
    scene: scene3D({
      bounds: { x: [-0.3,2.4], y: [-0.3,2.4], z: [-0.3,2.4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.48, distance: 5.3 },
      meshes: [boxMesh("box-proof", [0,0,0], [2,2,2], "reduced feasible region", "ghost", 0.1)],
      markers: [marker3D("opt", [2,1,1], "x* · value γ", "optimum", 0.1)],
      segments: [
        segment3D("t1", [2.2,2.2,2.2], [1.8,1.8,1.8], "γ+1/t₁", C.rose),
        segment3D("t2", [2.0,2.0,2.0], [1.65,1.65,1.65], "γ+1/t₂", C.orange),
        segment3D("limit", [1.8,1.8,1.8], [1.5,1.5,1.5], "→γ", C.violet),
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Thresholds converge to the integer optimum", secondary: "A fixed small row set certifies all sufficiently fine thresholds along the subsequence." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "th146-2d", title: "2D · full proof walkthrough", stages: stages2D },
  { id: "th146-3d", title: "3D · proof geometry", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "theorem-146-sparse-optimality-certificate",
  title: "Theorem 146 — A Sparse Constraint Certificate for an Integer Optimum",
  shortTitle: "Sparse optimum certificate · Thm 146",
  chapter: "Lattice-free polyhedra",
  order: 3,
  description:
    "Visualizes Theorem 146 and every proof step: the γ+1/t cap, Doignon compression, the 2ⁿ−1 row count, the constant infinite subsequence of row sets, the limiting exclusion of better integer points, and preservation of an optimal incumbent.",
  difficulty: "Advanced",
  duration: 15,
  accent: C.aqua,
  visualLabel: "Objective-threshold geometry",
  insightLabel: "Proof mechanism",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 146 proof skeleton",
    steps: [
      "For every t∈ℕ define P_t={x:Ax≤b, cᵀx≥γ+1/t}. By optimality of γ, P_t∩ℤⁿ=∅.",
      "Apply Theorem 144. At most 2ⁿ inequalities certify integer infeasibility; the objective threshold must be among them, leaving at most 2ⁿ−1 rows from Ax≤b. Call their index set I(t).",
      "Only finitely many such index sets exist, so an infinite subsequence t₁<t₂<⋯ has one constant set I′.",
      "If an integer point satisfied A_{I′}x≤b_{I′} and cᵀx>γ, then for large k we would have cᵀx≥γ+1/t_k, contradicting the certificate for t_k.",
      "An original optimal integer solution x* satisfies A_{I′}x*≤b_{I′} and cᵀx*=γ. Hence the reduced system has optimum exactly γ.",
    ],
  },
};

export default visualization;
