import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type { VisualizationDefinition, VisualizationExample, VisualizationStage } from "@/visualizations/types";
import {
  PROXIMITY_COLORS as C,
  label2D,
  line2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  vector2D,
} from "@/visualizations/helpers/standard-form-proximity-scenes";

const W2: Point2D[] = [[2,0],[0,2],[1,2]];

function cone2D(extra: Primitive[], secondary: string) {
  return scene2D(
    [
      polygon2D([[0,0],[8.5,0],[8.5,8.5],[0,8.5]], "cone(W)", "component"),
      ...W2.map((w,i) => vector2D([0,0], w, `w${i+1}`, i===2 ? C.orange : C.aqua)),
      ...extra,
    ],
    { primary: "Theorem 155 · diagonal Frobenius bound", secondary },
    { viewport: { x: [-0.8,8.8], y: [-0.8,8.8] } },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "th155-2d-statement",
    kicker: "Chapter 25 · Theorem 155 · m=2",
    title: "The same proximity constant bounds the diagonal Frobenius threshold",
    description:
      "Let W be integral and cone(W) pointed. With Δ=max|W_ij|, Theorem 155 states that every lattice point admitting a sufficiently deep real conic representation is integrally generated once the depth reaches t=m(2mΔ+1)^m.",
    formula: "t*≤t:=m(2mΔ+1)^m",
    insight: "The proof reduces the integer-generation problem to a standard-form IP for the signed matrix [W,−W] and invokes Theorem 150 once.",
    scene: cone2D([
      point2D([1,0], "shallow lattice hole", "fractional"),
      point2D([6,6], "deep point b", "optimum"),
    ], "Running geometry: W={(2,0),(0,2),(1,2)}. The proof itself is dimension-independent."),
  },
  {
    id: "th155-2d-shift",
    kicker: "Proof step 1 · Remove the guaranteed diagonal depth",
    title: "Write b as a fixed diagonal shift plus a residual cone vector",
    description:
      "Assume b=Wλ∈Λ(W) and λ≥t1. Define b′=tW1. Then b−b′=W(λ−t1) belongs to cone(W), and b−b′ also lies in the lattice Λ(W) because both b and b′ do.",
    formula: "b′=tW1,   b−b′=W(λ−t1)∈cone(W)∩Λ(W)",
    insight: "This is why the diagonal condition λ≥t1 is exactly the right hypothesis: after subtracting t copies of every column, the residual remains in the real cone.",
    scene: cone2D([
      vector2D([0,0],[3,4], "b′=tW1 (scaled)", C.violet),
      vector2D([3,4],[6,6], "b−b′∈cone(W)", C.orange),
      point2D([6,6], "b", "optimum"),
    ], "The picture rescales the large numerical t; the vector identity b=b′+(b−b′) is exact."),
  },
  {
    id: "th155-2d-signed-ip",
    kicker: "Proof step 2 · Signed standard-form IP",
    title: "Represent the lattice residual with nonnegative positive and negative coefficient parts",
    description:
      "Consider Wx⁺−Wx⁻=b−b′ with x⁺,x⁻≥0 integral and zero objective. It is integer-feasible because b−b′∈Wℤⁿ: any signed integer coefficient vector q can be split as q=q⁺−q⁻.",
    formula: "[W,−W](x⁺,x⁻)=b−b′,   (x⁺,x⁻)∈ℤ₊^{2n}",
    insight: "The signed formulation converts arbitrary lattice membership into standard-form nonnegative variables.",
    scene: scene2D(
      [
        label2D([0.3,3.4], "q∈ℤⁿ", "default"),
        line2D([1.1,3.5],[2.2,3.5], "split", C.muted),
        label2D([2.4,4.0], "q⁺≥0", "accent"), label2D([2.4,3.0], "q⁻≥0", "accent"),
        line2D([3.5,3.5],[4.8,3.5], "Wq⁺−Wq⁻", C.violet),
        label2D([5.0,3.4], "b−b′", "default"),
      ],
      { primary: "Why the augmented IP is feasible", secondary: "Every signed integer coefficient vector is the difference of two nonnegative integer vectors." },
      { viewport: { x: [0,7], y: [1.8,5.2] }, showGrid: false, showLattice: false, axisLabels: { x: "", y: "" } },
    ),
  },
  {
    id: "th155-2d-lp",
    kicker: "Proof step 3 · A special LP optimum",
    title: "Because the residual is in cone(W), the LP can choose y⁻=0",
    description:
      "The residual has a nonnegative real representation b−b′=Wy⁺. Hence (y⁺,0) is feasible for the LP relaxation. The objective is identically zero, so every feasible point is optimal.",
    formula: "b−b′=Wy⁺, y⁺≥0 ⇒ (y⁺,y⁻=0) is LP-optimal",
    insight: "The zero negative part is the coordinate block to which the proximity theorem will be applied.",
    scene: cone2D([
      vector2D([0,0],[3,2], "Wy⁺=b−b′", C.aqua),
      label2D([3.2,2.35], "y⁻=0", "accent"),
    ], "No negative columns are needed in the fractional representation of the residual."),
  },
  {
    id: "th155-2d-proximity",
    kicker: "Proof step 4 · Apply Theorem 150 to [W,−W]",
    title: "Find an integer feasible signed representation with only a small negative part",
    description:
      "The matrix [W,−W] has the same m and the same Δ as W. Theorem 150 gives an integer solution (z⁺,z⁻) within L1-distance t of (y⁺,0). In particular, ∥z⁻∥₁≤t.",
    formula: "∥(z⁺,z⁻)−(y⁺,0)∥₁≤t ⇒ ∥z⁻∥₁≤t",
    insight: "Only the bound on z⁻ matters. The positive part may change arbitrarily within the remaining proximity budget.",
    scene: scene2D(
      [
        label2D([0.4,3.8], "fractional optimum", "muted"), point2D([1.6,3.8], "(y⁺,0)", "fractional"),
        line2D([1.8,3.8],[4.2,3.8], "Theorem 150", C.violet),
        point2D([4.5,3.8], "(z⁺,z⁻) integer", "optimum"),
        label2D([3.8,2.8], "∥z⁻∥₁≤t", "accent"),
      ],
      { primary: "Proximity controls the negative correction", secondary: "The augmented problem has m equations, so exactly the Chapter-25 bound applies." },
      { viewport: { x: [0,7], y: [2,5] }, showGrid: false, showLattice: false, axisLabels: { x: "", y: "" } },
    ),
  },
  {
    id: "th155-2d-compensate",
    kicker: "Proof step 5 · Add back t copies of every column",
    title: "The diagonal reserve absorbs every negative integer coefficient",
    description:
      "Set μ=z⁺−z⁻+t1. Since each z⁻_i≤∥z⁻∥₁≤t, every coordinate μ_i is nonnegative and integral. Moreover Wμ=(b−b′)+tW1=b.",
    formula: "μ=z⁺−z⁻+t1∈ℤ₊ⁿ,   Wμ=b",
    insight: "This is the decisive use of the diagonal reserve: t units in every coordinate dominate the entire negative correction componentwise.",
    scene: cone2D([
      vector2D([0,0],[3,2], "W(z⁺−z⁻)=b−b′", C.orange),
      vector2D([3,2],[6,6], "+tW1=b′", C.violet),
      point2D([6,6], "b=Wμ, μ∈ℤ₊ⁿ", "optimum"),
    ], "The signed integer representation becomes a nonnegative integer representation of b."),
  },
  {
    id: "th155-2d-conclusion",
    kicker: "Proof step 6 · Conclude the threshold bound",
    title: "Every lattice point at diagonal depth t is in the integer cone",
    description:
      "The argument applies to every b∈Λ(W) with a representation λ≥t1. Therefore t is a valid diagonal Frobenius threshold, so the minimum threshold t* is at most t.",
    formula: "t*≤m(2mΔ+1)^m",
    insight: "Theorem 155 is a direct structural application of proximity: closeness in coefficient space eliminates holes deep inside a pointed integer cone.",
    scene: cone2D([
      point2D([1,0], "shallow hole allowed", "fractional"),
      point2D([6,6], "deep lattice point is generated", "optimum"),
      label2D([3.4,7.4], "depth ≥t ⇒ intcone(W)", "accent"),
    ], "The bound is uniform over all sufficiently deep lattice points."),
  },
];

const W3: Point3D[] = [[2,0,0],[0,2,0],[0,0,2],[1,2,2]];

function cone3D(markers: ReturnType<typeof marker3D>[], segments: ReturnType<typeof segment3D>[], secondary: string) {
  return scene3D({
    bounds: { x: [-0.5,7.5], y: [-0.5,8.5], z: [-0.5,8.5] },
    axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
    camera: { yaw: -0.82, pitch: 0.48, distance: 7.2 },
    markers,
    segments: [
      ...W3.map((w,i) => segment3D(`base-${i}-${secondary}`, [0,0,0], w, `w${i+1}`, i===3 ? C.orange : C.aqua, { width: 3, animate: false })),
      ...segments,
    ],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: { primary: "Theorem 155 · genuine 3D cone", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "th155-3d-statement",
    kicker: "Theorem 155 · 3D row space",
    title: "The theorem is unchanged for a genuine three-dimensional pointed cone",
    description:
      "Take W=[2e₁,2e₂,2e₃,(1,2,2)]. Here m=3 and Δ=2. The theorem gives one uniform diagonal depth t=3(2·3·2+1)^3 after which every lattice point with λ≥t1 has a nonnegative integer representation.",
    formula: "t=3·13³=6591",
    insight: "The large number is a worst-case proof bound; the visualization keeps it symbolic/scaled rather than pretending the cone has small coordinates.",
    scene: cone3D([marker3D("deep3", [5,7,7], "deep b (scaled)", "optimum", 0.1)], [], "Columns are actual 3D vectors; only the huge depth t is visually rescaled."),
  },
  {
    id: "th155-3d-shift",
    kicker: "Proof step 1 · Diagonal shift",
    title: "Subtract b′=tW1 and remain in both the cone and lattice",
    description:
      "From b=Wλ with λ≥t1, the residual equals W(λ−t1) and is therefore in cone(W). Since b and b′ are lattice vectors, the residual is also in Λ(W).",
    formula: "b−b′∈cone(W)∩Λ(W)",
    insight: "The 3D picture exactly mirrors the 2D proof: the diagonal reserve and residual are two genuine vectors in row space.",
    scene: cone3D(
      [marker3D("bp3", [3,6,6], "b′=tW1 (scaled)", "integer", 0.08), marker3D("b3", [5,7,7], "b", "optimum", 0.1)],
      [segment3D("diag3", [0,0,0], [3,6,6], "b′", C.violet), segment3D("res3", [3,6,6], [5,7,7], "b−b′", C.orange)],
      "Subtracting the diagonal reserve leaves a real-conic lattice residual.",
    ),
  },
  {
    id: "th155-3d-signed",
    kicker: "Proof steps 2–3 · Signed formulation and LP",
    title: "Use [W,−W] for lattice feasibility, but the fractional optimum needs only +W",
    description:
      "Lattice membership gives an integer signed representation of b−b′, so the augmented IP is feasible. Cone membership gives a nonnegative real representation with y⁻=0, which is LP-optimal because the objective is zero.",
    formula: "W x⁺−W x⁻=b−b′;   LP choice (y⁺,0)",
    insight: "These two memberships—lattice and cone—supply the integer feasibility and the special fractional reference point respectively.",
    scene: cone3D(
      [marker3D("respoint", [2,1,1], "b−b′ (scaled)", "integer", 0.09)],
      [segment3D("plusrep", [0,0,0], [2,1,1], "Wy⁺, y⁻=0", C.aqua)],
      "The residual lies in the positive cone even though an arbitrary integer lattice representation could use negative coefficients.",
    ),
  },
  {
    id: "th155-3d-proximity",
    kicker: "Proof step 4 · Theorem 150",
    title: "Proximity bounds the entire negative coefficient block by t",
    description:
      "Apply Theorem 150 to [W,−W]. It still has m=3 equations and maximum entry Δ=2. An integer feasible (z⁺,z⁻) exists with total L1 distance at most t from (y⁺,0), hence ∥z⁻∥₁≤t.",
    formula: "∥z⁻∥₁≤t=3(13)^3",
    insight: "The proof needs no geometric classification of the holes in the 3D semigroup; one proximity estimate controls all of them at once.",
    scene: cone3D(
      [marker3D("frac", [2,1,1], "fractional + representation", "fractional", 0.08), marker3D("int", [2.3,1.2,1.1], "nearby signed integer representation", "optimum", 0.09)],
      [segment3D("near", [2,1,1], [2.3,1.2,1.1], "proximity in coefficient space", C.violet)],
      "The displayed row-space points are symbolic images of coefficient representations; the inequality is in coefficient L1 norm.",
    ),
  },
  {
    id: "th155-3d-compensate",
    kicker: "Proof step 5 · Absorb negative coefficients",
    title: "Add t to every coefficient and the signed representation becomes nonnegative",
    description:
      "Because z⁻_i≤t for every i, μ=z⁺−z⁻+t1 is componentwise nonnegative and integral. Applying W gives Wμ=(b−b′)+b′=b.",
    formula: "μ∈ℤ₊ⁿ,   Wμ=b",
    insight: "This single componentwise inequality is the bridge from proximity to the high-dimensional Frobenius conclusion.",
    scene: cone3D(
      [marker3D("finalb", [5,7,7], "b∈intcone(W)", "optimum", 0.11)],
      [segment3D("resfinal", [0,0,0], [2,1,1], "signed residual", C.orange), segment3D("reservefinal", [2,1,1], [5,7,7], "+ diagonal reserve", C.violet)],
      "The diagonal reserve turns the signed integer coefficient vector into μ≥0.",
    ),
  },
  {
    id: "th155-3d-conclusion",
    kicker: "Proof step 6 · Uniformity",
    title: "Since b was arbitrary, t is a valid global diagonal Frobenius threshold",
    description:
      "Every b in the lattice with a real representation λ≥t1 admits the constructed μ∈ℤ₊ⁿ. Therefore the minimum valid threshold satisfies t*≤t.",
    formula: "t*≤m(2mΔ+1)^m",
    insight: "The 2D and 3D selectors now follow the same proof step-for-step; only the row-space dimension changes.",
    scene: cone3D(
      [marker3D("hole3", [1,0,0], "shallow hole", "fractional", 0.08), marker3D("deepok", [5,7,7], "deep generated point", "optimum", 0.11)],
      [],
      "Shallow holes may remain, but the diagonal interior is guaranteed hole-free after the theorem's threshold.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "th155-2d", title: "2D · complete proof walkthrough", stages: stages2D },
  { id: "th155-3d", title: "3D · complete proof walkthrough", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "theorem-155-diagonal-frobenius-bound",
  title: "Theorem 155 — Proximity Bound for the Diagonal Frobenius Number",
  shortTitle: "Diagonal Frobenius bound · Thm 155",
  chapter: "Standard-form proximity",
  order: 6,
  description:
    "Visualizes every proof step of Theorem 155: subtract the diagonal reserve, formulate a signed standard-form IP, choose an LP solution with zero negative part, apply Theorem 150, absorb the bounded negative integer part with t1, and recover a nonnegative integer representation.",
  difficulty: "Advanced",
  duration: 18,
  accent: C.violet,
  visualLabel: "Cone and coefficient correction",
  insightLabel: "Proof step",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 155 proof skeleton",
    steps: [
      "Set t=m(2mΔ+1)^m. Let b=Wλ∈Λ(W) with λ≥t1 and define b′=tW1.",
      "Then b−b′=W(λ−t1) belongs to cone(W), and b−b′∈Λ(W).",
      "Consider the zero-objective standard-form IP W x⁺−W x⁻=b−b′ with x⁺,x⁻≥0 integral. Lattice membership makes it feasible.",
      "Cone membership supplies an LP-feasible and hence LP-optimal point (y⁺,0).",
      "Apply Theorem 150 to [W,−W]. It has the same m and Δ, so there exists integer (z⁺,z⁻) with ∥z⁻∥₁≤t.",
      "Define μ=z⁺−z⁻+t1. Since each z⁻_i≤∥z⁻∥₁≤t, μ∈ℤ₊ⁿ, and Wμ=(b−b′)+tW1=b.",
      "Thus every lattice point with diagonal depth at least t belongs to intcone(W), proving t*≤t.",
    ],
  },
};

export default visualization;
