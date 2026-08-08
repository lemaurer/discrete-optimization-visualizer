import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  integerMarkersInBox,
  label2D,
  line2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  simplexFrustumMesh,
  tetrahedronMesh,
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

const tetra3D: [Point3D, Point3D, Point3D, Point3D] = [
  [0,0,0], [3.5,0,0], [0,3.5,0], [0,0,3.5],
];
const integerP3D = integerMarkersInBox(
  "p3",
  [0,0,0],
  [3,3,3],
  ([x,y,z]) => x + y + z <= 3.5 + 1e-9,
);
const optimum3D: Point3D[] = [
  [3,0,0], [2,1,0], [2,0,1], [1,1,1], [0,3,0], [0,0,3],
];

function scene1463D(
  meshes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["meshes"],
  markers: ReturnType<typeof marker3D>[],
  segments: ReturnType<typeof segment3D>[],
  secondary: string,
) {
  return scene3D({
    bounds: { x: [-0.45, 3.9], y: [-0.45, 3.9], z: [-0.45, 3.9] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.78, pitch: 0.48, distance: 6.2 },
    meshes,
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: { primary: "Theorem 146 · concrete 3D proof", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "th146-3d-statement",
    kicker: "Chapter 24 · Theorem 146 · 3D",
    title: "Use a real 3D polyhedron whose LP extends beyond its integer optimum",
    description:
      "Let P={x≥0:x₁+x₂+x₃≤7/2} and c=(1,1,1). The LP reaches 7/2 on the slanted face, but integer objective values are integral, so the integer optimum is γ=3.",
    formula: "P={x≥0:1ᵀx≤7/2},   c=1,   γ=max{1ᵀx:x∈P∩ℤ³}=3",
    insight:
      "This makes the γ+1/t cap geometrically nonempty over the reals while remaining empty of integer points—the phenomenon used in the proof.",
    scene: scene1463D(
      [tetrahedronMesh("P3", tetra3D, "P", "ghost", 0.18)],
      [
        ...integerP3D,
        ...optimum3D.map((p,i) => marker3D(`opt-${i}`, p, i === 0 ? "integer optimum level γ=3" : undefined, "optimum", i === 0 ? 0.09 : 0.055)),
      ],
      [segment3D("c", [0,0,0], [1.25,1.25,1.25], "c=(1,1,1)", C.violet)],
      "The tetrahedron reaches the fractional level 3.5, while its best lattice layer is 3.",
    ),
  },
  {
    id: "th146-3d-pt",
    kicker: "Proof step 1 · Build P_t",
    title: "For t=4, the cap 13/4≤x₁+x₂+x₃≤7/2 is real but integer-empty",
    description:
      "Add cᵀx≥γ+1/t with t=4. The resulting cap lies between the parallel levels 13/4 and 7/2. An integer point would have integral coordinate sum strictly between 3 and 4, which is impossible.",
    formula: "P₄={x≥0:13/4≤1ᵀx≤7/2},   P₄∩ℤ³=∅",
    insight:
      "The 3D picture now shows the actual integer-empty polyhedron to which Doignon is applied.",
    scene: scene1463D(
      [
        tetrahedronMesh("P3-bg", tetra3D, "P", "ghost", 0.07),
        simplexFrustumMesh("P4", 3.25, 3.5, "P₄", "removed", 0.24),
      ],
      integerP3D,
      [segment3D("threshold", [3.25,0,0], [0,3.25,0], "1ᵀx=13/4", C.rose)],
      "The highlighted frustum is P₄; no lattice marker lies inside it.",
    ),
  },
  {
    id: "th146-3d-doignon",
    kicker: "Proof step 2 · Apply Doignon",
    title: "The threshold row must be in the small infeasibility certificate",
    description:
      "Doignon gives at most 2³=8 rows certifying that P_t is integer-empty. The added threshold row is mandatory: without it we are back to P, which contains many integer points. Thus at most seven original rows are needed. In this simple example only the original row 1ᵀx≤7/2 is needed together with the threshold.",
    formula: "{1ᵀx≤7/2, 1ᵀx≥3+1/t} already certifies integer infeasibility",
    insight:
      "The example uses fewer rows than the theorem's worst-case bound, but it shows exactly why the count drops from 2ⁿ to 2ⁿ−1.",
    scene: scene1463D(
      [simplexFrustumMesh("cert", 3.25, 3.5, "two-row certificate", "removed", 0.24)],
      [],
      [
        segment3D("upper", [3.5,0,0], [0,3.5,0], "original row: 1ᵀx≤7/2", C.orange),
        segment3D("lower", [3.25,0,0], [0,3.25,0], "mandatory threshold", C.rose),
      ],
      "One original row + the objective threshold already isolate an integer-empty objective slab.",
    ),
  },
  {
    id: "th146-3d-subsequence",
    kicker: "Proof step 3 · Freeze I(t)",
    title: "As t grows, the threshold moves toward γ while the same original row can repeat",
    description:
      "The abstract proof uses finite pigeonhole to obtain a fixed I′ along an infinite subsequence. Here the same row I′={1ᵀx≤7/2} works for every t≥2, so the subsequence phenomenon can be seen directly.",
    formula: "I(t)={sum row} for all t≥2 ⇒ I′={sum row}",
    insight:
      "The only moving object is the lower objective plane γ+1/t; the retained original subsystem is fixed.",
    scene: scene1463D(
      [
        simplexFrustumMesh("cap2", 3.5, 3.5, "t=2", "ghost", 0.05),
        simplexFrustumMesh("cap3", 3 + 1/3, 3.5, "t=3", "ghost", 0.08),
        simplexFrustumMesh("cap4", 3.25, 3.5, "t=4", "removed", 0.13),
      ],
      [],
      [
        segment3D("t2", [3.5,0,0], [0,3.5,0], "γ+1/2", C.rose),
        segment3D("t3", [10/3,0,0], [0,10/3,0], "γ+1/3", C.orange),
        segment3D("t4", [3.25,0,0], [0,3.25,0], "γ+1/4", C.aqua),
      ],
      "The objective thresholds descend toward the lattice layer 1ᵀx=3.",
    ),
  },
  {
    id: "th146-3d-no-better",
    kicker: "Proof step 4 · Exclude cᵀx>γ",
    title: "The fixed subsystem cannot contain an integer point with objective above 3",
    description:
      "For the retained row 1ᵀx≤7/2, every integer point has an integer coordinate sum. Therefore 1ᵀx≤7/2 already implies 1ᵀx≤3 on ℤ³. This is the concrete version of the general 1/t_k→0 argument.",
    formula: "x∈ℤ³, 1ᵀx≤7/2 ⇒ 1ᵀx≤3=γ",
    insight:
      "In the general proof, a strictly better point has a positive gap cᵀx−γ, and eventually 1/t_k is smaller than that gap. Here integrality makes the limiting argument visible immediately.",
    scene: scene1463D(
      [tetrahedronMesh("reduced", tetra3D, "reduced system I′", "ghost", 0.14)],
      [
        ...integerP3D,
        marker3D("bad4", [2,1,1], "sum=4 · excluded", "fractional", 0.1),
      ],
      [segment3D("gap", [2,1,1], [1.75,0.75,0.75], "violates 1ᵀx≤3.5", C.rose)],
      "No lattice point on level 4 or higher survives the fixed original row.",
    ),
  },
  {
    id: "th146-3d-attain",
    kicker: "Proof step 5 · Keep an optimum",
    title: "An original optimal integer point still satisfies the retained subsystem",
    description:
      "Take x*=(3,0,0). It belonged to P, so it certainly satisfies the retained row 1ᵀx≤7/2, and it has objective value γ=3. Combining existence at γ with exclusion above γ proves the reduced subsystem has the same optimum.",
    formula: "x*=(3,0,0),  1ᵀx*=3=γ",
    insight:
      "This completes the exact same five proof steps as the 2D walkthrough, now with genuine 3D objective caps rather than a summary diagram.",
    scene: scene1463D(
      [tetrahedronMesh("final", tetra3D, "I′ feasible region", "ghost", 0.1)],
      [marker3D("xstar", [3,0,0], "x* survives · γ=3", "optimum", 0.12)],
      [segment3D("objective-final", [0,0,0], [1.25,1.25,1.25], "c", C.violet)],
      "Conclusion: the fixed small subsystem attains γ and admits no better integer point.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "th146-2d", title: "2D · full proof walkthrough", stages: stages2D },
  { id: "th146-3d", title: "3D · full proof walkthrough", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "theorem-146-sparse-optimality-certificate",
  title: "Theorem 146 — A Sparse Constraint Certificate for an Integer Optimum",
  shortTitle: "Sparse optimum certificate · Thm 146",
  chapter: "Lattice-free polyhedra",
  order: 3,
  description:
    "Visualizes Theorem 146 and every proof step: the γ+1/t cap, Doignon compression, the 2ⁿ−1 row count, the constant infinite subsequence of row sets, the limiting exclusion of better integer points, and preservation of an optimal incumbent. Both 2D and 3D now follow the full proof stage by stage.",
  difficulty: "Advanced",
  duration: 17,
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
