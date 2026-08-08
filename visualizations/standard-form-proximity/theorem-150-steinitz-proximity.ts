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

function numberLineScene(extra: Primitive[], secondary: string) {
  return scene2D(
    [line2D([-4.5,0],[4.5,0], "row/image space ℝ", C.muted, "constraint"), ...extra],
    { primary: "Theorem 150 · Steinitz proof in image space", secondary },
    { viewport: { x: [-4.8,4.8], y: [-1.2,2.8] }, axisLabels: { x: "raw partial sum Δpₖ", y: "" }, showLattice: false },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "th150-2d-statement",
    kicker: "Chapter 25 · Theorem 150 · m=1 running example",
    title: "Standard form admits a proximity bound depending on m and Δ, not directly on n",
    description:
      "Use the exact near-tight family with a=3: A=[4 3], b=9 and objective c=(4.2,3). The LP optimum is x*=(9/4,0), while the integer optimum is z*=(0,3). Here m=1 and Δ=4.",
    formula: "∥z*−x*∥₁=21/4=5.25 ≤ m(2mΔ+1)^m=9",
    insight:
      "The theorem asserts existence of an integer optimum close to the chosen LP optimum. The proof converts the displacement into a bounded zero-sum sequence in row space.",
    scene: scene2D(
      [
        line2D([0,3],[2.25,0], "4x₁+3x₂=9", C.aqua, "constraint"),
        point2D([2.25,0], "x*=(9/4,0)", "fractional"),
        point2D([0,3], "z*=(0,3)", "optimum"),
        line2D([2.25,0],[0,3], "d=z*−x*", C.violet),
      ],
      { primary: "Actual two-variable standard-form instance", secondary: "The LP and IP optima are separated by L1-distance 5.25." },
      { viewport: { x: [-0.6,3.0], y: [-0.6,3.6] }, objective: { vector: [4.2,3], label: "c" } },
    ),
  },
  {
    id: "th150-2d-minimal-optimum",
    kicker: "Proof step 1 · Choose the closest integer optimum",
    title: "Among all integer optima choose z* minimizing t=∥x*−z*∥₁",
    description:
      "Set d=z*−x*=(-9/4,3). Minimality of t is the contradiction target at the end: any nonzero integral conformal kernel block with zero objective gain would produce a closer optimum.",
    formula: "d=(-9/4,3),   t=|−9/4|+3=21/4",
    insight: "The proof does not choose an arbitrary integer optimum; the minimum-distance tie-break is essential.",
    scene: scene2D(
      [
        point2D([2.25,0], "x*", "fractional"), point2D([0,3], "closest optimal z*", "optimum"),
        line2D([2.25,0],[0,3], "t=21/4", C.orange),
      ],
      { primary: "Closest optimal integer solution", secondary: "Later, a repeated partial sum would contradict this choice." },
      { viewport: { x: [-0.6,3.0], y: [-0.6,3.6] } },
    ),
  },
  {
    id: "th150-2d-multiset-x",
    kicker: "Proof step 2 · Integral part of d",
    title: "Encode integer displacement by copies of signed columns",
    description:
      "For d₁<0, take floor(−d₁)=2 copies of −A₁=−4. For d₂>0, take floor(d₂)=3 copies of A₂=3. Thus X={−4,−4,3,3,3} and s=5.",
    formula: "X={−4,−4,3,3,3},   s=5 ≤ t=5.25 ≤ s+m=6",
    insight: "Multiplicity records L1-mass. Each vector has infinity norm at most Δ.",
    scene: numberLineScene([
      point2D([-4,0], "−A₁ (two copies)", "integer"),
      point2D([3,0], "A₂ (three copies)", "integer"),
      label2D([-3.8,1.4], "×2", "accent"), label2D([2.8,1.4], "×3", "accent"),
    ], "X represents all full integer units of d."),
  },
  {
    id: "th150-2d-residue",
    kicker: "Proof step 3 · Fractional basic residue",
    title: "The only fractional part lies on basic coordinates and is repaired by at most m vectors",
    description:
      "B={1}. The remaining fraction of d₁ is −1/4, so r=4(d₁−ceil(d₁))=−1. With m=1 take Y={−1}.",
    formula: "r=−1,   Y={−1},   X̃=X∪Y={−4,−4,3,3,3,−1}",
    insight: "Adding Y makes the sequence sum exactly to zero while preserving the Δ bound.",
    scene: numberLineScene([
      point2D([-4,0], "X", "integer"), point2D([3,0], "X", "integer"),
      point2D([-1,0], "r₁=−1", "optimum"), label2D([-0.75,1.15], "fractional residue", "accent"),
    ], "Now Σ X̃=0 and every element lies in [−Δ,Δ]."),
  },
  {
    id: "th150-2d-steinitz",
    kicker: "Proof step 4 · Apply Steinitz",
    title: "Reorder the zero-sum multiset so every partial sum stays in a bounded box",
    description:
      "A valid order is 3,−4,3,−4,3,−1. The raw partial sums are 3,−1,2,−2,1,0, all inside [−mΔ,mΔ]=[−4,4].",
    formula: "Δpₖ∈ℤ∩[−mΔ,mΔ],   at most 2mΔ+1=9 states",
    insight: "In general row space ℝ^m has only (2mΔ+1)^m possible integral partial-sum states.",
    scene: numberLineScene([
      ...([-4,-3,-2,-1,0,1,2,3,4] as number[]).map((x) => point2D([x,0], undefined, "lattice")),
      ...([3,-1,2,-2,1,0] as number[]).map((x,i) => point2D([x,0], `p${i+1}`, i===5 ? "optimum" : "integer")),
      label2D([-2.5,2.0], "Steinitz box: 9 possible integer states", "accent"),
    ], "The sequence is long in variable space but trapped in a finite state box in row space."),
  },
  {
    id: "th150-2d-repeat",
    kicker: "Proof step 5 · What a repeated state means",
    title: "Equal partial sums isolate a zero-sum consecutive block",
    description:
      "If Δp_k=Δp_l for k<l, then the vectors between them sum to zero. Translating their multiplicities back to variables yields a nonzero conformal displacement d̃ with Ad̃=0, |d̃_i|≤|d_i| and d̃_i d_i≥0.",
    formula: "Δp_k=Δp_l ⇒ Σ_{j=k+1}^l x̃_{π_j}=0 ⇒ A d̃=0",
    insight: "Conformality ensures both d̃ and d−d̃ point in the same coordinate signs as d, so removing d̃ moves z* strictly toward x*.",
    scene: scene2D(
      [
        point2D([0.8,1.5], "state w at k", "optimum"), point2D([3.2,1.5], "same state w at l", "optimum"),
        line2D([0.8,1.5],[3.2,1.5], "zero-sum block X̃(k,l)", C.rose),
        label2D([1.25,0.65], "block ↔ conformal d̃ with A d̃=0", "accent"),
      ],
      { primary: "Repeated-state mechanism", secondary: "This is a proof mechanism; the small running sequence need not itself repeat." },
      { viewport: { x: [0,4.2], y: [0,2.4] }, showLattice: false, axisLabels: { x: "ordered position", y: "state" } },
    ),
  },
  {
    id: "th150-2d-lemma151",
    kicker: "Proof step 6 · Use Lemma 151",
    title: "Both pieces are admissible kernel directions, so neither can improve the objective",
    description:
      "The proof shows d̃ and d̄=d−d̃ belong to the cone C from Lemma 151. Hence cᵀd̃≤0 and cᵀd̄≤0. Since cᵀd=0 between two optima, both inequalities are equalities.",
    formula: "cᵀd=0=cᵀd̃+cᵀd̄,   cᵀd̃,cᵀd̄≤0 ⇒ cᵀd̃=cᵀd̄=0",
    insight: "If d̃ is integral, z*−d̃ is therefore another integer optimum, but closer to x*.",
    scene: scene2D(
      [
        vector2D([0.5,1.0],[2.0,1.8], "d̃", C.orange), vector2D([2.0,1.8],[3.5,1.0], "d̄", C.aqua),
        label2D([0.7,0.35], "both objective gains ≤0", "accent"),
      ],
      { primary: "Objective-sign split", secondary: "Lemma 151 turns a combinatorial zero-sum block into an optimality contradiction." },
      { viewport: { x: [0,4.2], y: [0,2.5] }, showLattice: false },
    ),
  },
  {
    id: "th150-2d-visit-bound",
    kicker: "Proof step 7 · At most m visits per state",
    title: "A state cannot be visited m+1 times",
    description:
      "Between v visits there are v−1 disjoint zero-sum blocks plus the remainder. Only the m residue vectors in Y can prevent a block from corresponding to an integral displacement. If v≥m+1, one resulting nonzero displacement is integral and yields the forbidden closer optimum.",
    formula: "visits per state ≤m",
    insight: "This is the subtle factor m multiplying the number of states.",
    scene: scene2D(
      [
        point2D([0.6,1.3], "w", "optimum"), point2D([1.6,1.3], "w", "optimum"), point2D([2.6,1.3], "w", "optimum"),
        line2D([0.6,1.3],[1.6,1.3], "block", C.orange), line2D([1.6,1.3],[2.6,1.3], "block", C.aqua),
        label2D([0.5,0.45], "more than m visits ⇒ one Y-free integral block", "accent"),
      ],
      { primary: "Counting repeated visits", secondary: "The diagram is schematic; the counting argument is dimension-independent." },
      { viewport: { x: [0,3.5], y: [0,2.2] }, showLattice: false },
    ),
  },
  {
    id: "th150-2d-final",
    kicker: "Proof step 8 · Count states",
    title: "Finite state box × at most m visits gives the proximity bound",
    description:
      "There are (2mΔ+1)^m integral vectors in [−mΔ,mΔ]^m. Each can occur at most m times, while t≤s+m. Therefore t≤m(2mΔ+1)^m.",
    formula: "t≤s+m≤m(2mΔ+1)^m",
    insight: "For the running instance: m=1, Δ=4, so 5.25≤9. Crucially the bound contains no direct dependence on n.",
    scene: numberLineScene([
      ...([-4,-3,-2,-1,0,1,2,3,4] as number[]).map((x) => point2D([x,0], undefined, "integer")),
      label2D([-3.2,2.0], "9 states × 1 visit = 9", "accent"),
      label2D([-2.1,1.25], "actual distance t=5.25", "default"),
    ], "Theorem 150 follows from bounded states and bounded repetition."),
  },
];

const xStar3D: Point3D = [1.5,1.5,0];
const zStar3D: Point3D = [1,1,1];

function imageWalk2D(extra: Primitive[], secondary: string) {
  return scene2D(
    [line2D([-2.5,0],[2.5,0], undefined, C.muted), line2D([0,-2.5],[0,2.5], undefined, C.muted), ...extra],
    { primary: "3D variable example · 2D row/image space", secondary },
    { viewport: { x: [-2.7,2.7], y: [-2.7,2.7] }, axisLabels: { x: "row 1", y: "row 2" }, showLattice: true },
  );
}

const stages3D: VisualizationStage[] = [
  {
    id: "th150-3d-setup",
    kicker: "Theorem 150 · genuine 3D variable example",
    title: "Start with a three-variable standard-form problem, not a decorative extrusion",
    description:
      "Take A=[[2,0,1],[0,2,1]], b=(3,3), c=(1,1,0). The feasible line is x(t)=((3−t)/2,(3−t)/2,t), 0≤t≤3. The LP optimum is x*=(1.5,1.5,0), and z*=(1,1,1) is an integer optimum.",
    formula: "m=2, Δ=2, d=z*−x*=(-1/2,-1/2,1), t=2",
    insight: "The proof starts in ℝ³ variable space but the Steinitz sequence lives in ℝ² row space because m=2.",
    scene: scene3D({
      bounds: { x: [-0.3,2], y: [-0.3,2], z: [-0.3,3.4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.82, pitch: 0.45, distance: 5.2 },
      markers: [marker3D("lp", xStar3D, "x* LP", "fractional", 0.1), marker3D("ip", zStar3D, "z* IP", "optimum", 0.1), marker3D("end", [0,0,3], "other endpoint", "integer", 0.06)],
      segments: [segment3D("feas", xStar3D, [0,0,3], "Ax=b, x≥0", C.aqua, { width: 5, animate: false }), segment3D("disp", xStar3D, zStar3D, "d", C.violet)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Actual feasible set in ℝ³", secondary: "The proximity distance is measured in variable space: ∥d∥₁=2." },
    }),
  },
  {
    id: "th150-3d-multisets",
    kicker: "Proof steps 2–3 · X, r, Y",
    title: "Map the displacement into row space and separate integer from fractional mass",
    description:
      "Only d₃=1 contributes a full unit, so X={(1,1)}=A₃. The fractional basic components give r=(-1,-1). Split r into m=2 bounded integral vectors Y={(-1,0),(0,-1)}.",
    formula: "X̃={(1,1),(-1,0),(0,-1)},   ΣX̃=0",
    insight: "Every vector has infinity norm at most Δ=2. The construction is the exact Chapter-25 construction for this instance.",
    scene: imageWalk2D([
      point2D([1,1], "X: A₃", "integer"), point2D([-1,0], "r₁", "optimum"), point2D([0,-1], "r₂", "optimum"),
      vector2D([0,0],[1,1], "(1,1)", C.violet), vector2D([0,0],[-1,0], "", C.orange), vector2D([0,0],[0,-1], "", C.aqua),
    ], "The three row-space vectors sum exactly to zero."),
  },
  {
    id: "th150-3d-steinitz",
    kicker: "Proof step 4 · Steinitz in ℝ²",
    title: "The reordered partial sums stay inside the mΔ box",
    description:
      "Order (1,1),(-1,0),(0,-1). The raw partial sums are (1,1),(0,1),(0,0), all in [-4,4]². In general Steinitz gives ∥p_k∥∞≤m after scaling by Δ.",
    formula: "Δpₖ∈ℤ²∩[-mΔ,mΔ]²",
    insight: "A 3D optimization problem has become a finite-state walk in 2D because the matrix has only two equations.",
    scene: imageWalk2D([
      point2D([0,0], "p₀", "integer"), point2D([1,1], "p₁", "integer"), point2D([0,1], "p₂", "integer"), point2D([0,0], "p₃", "optimum"),
      line2D([0,0],[1,1], "A₃", C.violet), line2D([1,1],[0,1], "r₁", C.orange), line2D([0,1],[0,0], "r₂", C.aqua),
    ], "The geometry now lives in row space, exactly as in the proof."),
  },
  {
    id: "th150-3d-repeat",
    kicker: "Proof steps 5–7 · Repetition contradiction",
    title: "Repeated row-space states would produce a conformal kernel block in the original three variables",
    description:
      "Equal partial sums give a zero-sum block, hence A d̃=0. Sign compatibility with d puts d̃ and d−d̃ in the cone of Lemma 151. If one such block is integral, subtracting it from z* preserves feasibility and optimality but decreases the L1-distance to x*.",
    formula: "repeat ⇒ A d̃=0, d̃⊑d; integral d̃ ⇒ z*−d̃ is a closer optimum",
    insight: "At most m residue vectors Y can obstruct integrality, so no state can be visited more than m times.",
    scene: imageWalk2D([
      point2D([-1,1], "w · visit 1", "optimum"), point2D([1,1], "w · visit 2", "optimum"),
      line2D([-1,1],[1,1], "zero-sum block ↔ d̃", C.rose),
      label2D([-1.7,-0.6], "Lemma 151: cᵀd̃≤0", "accent"),
    ], "Schematic contradiction mechanism, now explicitly tied back to the 3D variable displacement."),
  },
  {
    id: "th150-3d-count",
    kicker: "Proof step 8 · Final count",
    title: "Count row-space states, not variable-space coordinates",
    description:
      "For m=2, Δ=2 there are (2mΔ+1)^m=9²=81 possible integral partial-sum states, each visited at most m=2 times. Thus the theorem gives t≤162; the concrete instance has t=2.",
    formula: "t≤m(2mΔ+1)^m=2·9²=162",
    insight: "The numerical theorem bound is deliberately worst-case. Its structural achievement is independence from the number n of variables.",
    scene: imageWalk2D([
      point2D([1,1], "actual p₁", "integer"), point2D([0,1], "actual p₂", "integer"), point2D([0,0], "actual p₃", "optimum"),
      label2D([-2.25,-1.65], "81 states × ≤2 visits", "accent"),
    ], "The actual walk uses only three states; the proof allows all states in the box."),
  },
];

const examples: VisualizationExample[] = [
  { id: "th150-2d", title: "2D · m=1 complete proof walkthrough", stages: stages2D },
  { id: "th150-3d", title: "3D variables · m=2 complete proof walkthrough", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "theorem-150-steinitz-proximity",
  title: "Theorem 150 — Steinitz Proximity for Standard-Form IPs",
  shortTitle: "Standard-form proximity · Thm 150",
  chapter: "Standard-form proximity",
  order: 2,
  description:
    "A complete visualization of Theorem 150: choose the closest integer optimum, encode its displacement by signed columns, repair the fractional basic residue, apply Steinitz, turn repeated partial sums into conformal kernel directions, invoke Lemma 151, and count states.",
  difficulty: "Advanced",
  duration: 24,
  accent: C.violet,
  visualLabel: "Variable space ↔ row space",
  insightLabel: "Proof mechanism",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 150 proof skeleton",
    steps: [
      "Choose an optimal integer z* minimizing t=∥z*−x*∥₁ and write d=z*−x*.",
      "Create X from floor(d_i) copies of A_i for d_i>0 and floor(−d_i) copies of −A_i for d_i<0. Then s=|X| satisfies s≤t≤s+m.",
      "Collect the remaining fractional basic contribution in r and decompose r into at most m integral vectors r_i with infinity norm at most Δ. Set X̃=X∪Y; then ΣX̃=0.",
      "Apply Steinitz to X̃/Δ. The raw partial sums Δp_k are integral and lie in [−mΔ,mΔ]^m, so only (2mΔ+1)^m states are possible.",
      "Equal partial sums isolate a zero-sum block corresponding to a nonzero conformal kernel displacement d̃. Both d̃ and d−d̃ lie in the cone from Lemma 151.",
      "Lemma 151 gives nonpositive objective gain for both pieces. If an isolated block is integral, subtracting it from z* yields another integer optimum strictly closer to x*, contradicting the choice of z*.",
      "A state therefore appears at most m times: among m+1 visits, the m residue vectors Y cannot contaminate all induced blocks/remainder.",
      "Hence t≤s+m≤m(2mΔ+1)^m.",
    ],
  },
};

export default visualization;
