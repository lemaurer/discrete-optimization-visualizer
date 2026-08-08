import type {
  Marker3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const COLORS = {
  muted: "#7d898b",
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
};

function point2D(at: Point2D, label?: string, style: "integer" | "fractional" | "optimum" | "lattice" = "integer"): Primitive {
  return { kind: "point", at, label, style };
}

function line2D(from: Point2D, to: Point2D, label?: string, color = COLORS.violet): Primitive {
  return { kind: "line", from, to, label, style: "assignment", color, animate: true };
}

function label2D(at: Point2D, text: string, tone: "default" | "muted" | "accent" = "default"): Primitive {
  return { kind: "label", at, text, tone };
}

function scene2D(primitives: Primitive[], secondary: string): Scene {
  return {
    viewport: { x: [-0.7, 3.3], y: [-0.7, 3.3] },
    constraints: [],
    primitives,
    showGrid: true,
    showAxes: true,
    showLattice: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Doignon's theorem · proof objects in dimension 2",
      secondary,
    },
  };
}

function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: false,
    showAxes: false,
    showLattice: false,
    showVertices: true,
    scene3D: configuration,
  };
}

const witnesses2D: Array<{ p: Point2D; parity: string }> = [
  { p: [0, 0], parity: "EE" },
  { p: [1, 0], parity: "OE" },
  { p: [0, 1], parity: "EO" },
  { p: [1, 1], parity: "OO" },
  { p: [2, 2], parity: "EE" },
];

const hull2D: Primitive = {
  kind: "polygon",
  points: [[0, 0], [1, 0], [2, 2], [0, 1]],
  label: "conv(X)",
  style: "component",
};

const base2D = [
  hull2D,
  ...witnesses2D.map(({ p }, i) => point2D(p, `y${i + 1}`, i === 0 || i === 4 ? "optimum" : "integer")),
];

const stages2D: VisualizationStage[] = [
  {
    id: "doignon-2d-statement",
    kicker: "Chapter 24 · Theorem 144 · 2D",
    title: "Integer infeasibility has a certificate using at most 2ⁿ inequalities",
    description:
      "For n=2 the bound is 2²=4. If a polyhedron contains no integer point, some subsystem of at most four of its inequalities already contains no integer point.",
    formula: "P∩ℤⁿ=∅ ⇒ ∃I, |I|≤2ⁿ, {x:A_Ix≤b_I}∩ℤⁿ=∅",
    insight:
      "The proof is an integer Helly argument. The number 2ⁿ comes from the 2ⁿ coordinate-wise parity classes of ℤⁿ.",
    scene: scene2D([
      ...base2D,
      label2D([2.0, 0.35], "n=2 ⇒ 4 parity classes", "accent"),
    ], "The five displayed points are schematic proof witnesses; the contradiction shows that a genuine minimal system cannot have five essential inequalities."),
  },
  {
    id: "doignon-2d-minimal-counterexample",
    kicker: "Proof step 1 · Minimalize the system",
    title: "Assume more than 2ⁿ inequalities are all essential",
    description:
      "Assume m>2ⁿ and discard redundant inequalities until removing any remaining inequality restores an integer point. This is the minimal-counterexample reduction used in the notes.",
    formula: "∀j ∃xʲ∈ℤⁿ: aᵢᵀxʲ≤bᵢ for every i≠j",
    insight:
      "Each inequality j receives its own integer witness xʲ that satisfies every other inequality and must violate inequality j.",
    scene: scene2D([
      ...base2D,
      ...witnesses2D.map(({ p }, i) => label2D([p[0] + 0.08, p[1] + 0.18], `x${i + 1}`, "accent")),
    ], "Hypothetical m=5>4 essential inequalities produce five distinct remove-one-constraint witnesses."),
  },
  {
    id: "doignon-2d-finite-y",
    kicker: "Proof step 2 · Build the finite integer set Y",
    title: "Take all integer points in the convex hull of the witnesses",
    description:
      "Set X={x¹,…,xᵐ} and Y=conv(X)∩ℤⁿ. Because conv(X) is a bounded polytope, Y is finite. It contains every xʲ, so it contains more than 2ⁿ integer points.",
    formula: "X={x¹,…,xᵐ},   Y=conv(X)∩ℤⁿ={y¹,…,yᵗ}",
    insight:
      "This finite set is crucial: the proof will maximize a finite tuple of threshold values and then use parity inside Y.",
    scene: scene2D([
      hull2D,
      ...[[0,0],[1,0],[0,1],[1,1],[2,2],[1,2],[2,1]].map((p, i) => point2D(p as Point2D, i < 5 ? `Y` : undefined, "lattice")),
    ], "Y is finite because it is the lattice-point set of a bounded convex hull."),
  },
  {
    id: "doignon-2d-delta-sets",
    kicker: "Proof step 3 · Project Y onto every row normal",
    title: "For every inequality collect all attained integer row values",
    description:
      "For each row i define Δᵢ={aᵢᵀy:y∈Y}. Since aᵢ and y are integral, every value in Δᵢ is an integer; since Y is finite, Δᵢ is finite.",
    formula: "Δᵢ={aᵢᵀy:y∈Y}⊂ℤ",
    insight:
      "The proof converts geometry into finitely many one-dimensional threshold choices δᵢ∈Δᵢ.",
    scene: scene2D([
      ...base2D,
      line2D([0,0],[2.7,0.9], "aᵢ direction", COLORS.orange),
      label2D([1.75, 1.2], "project Y → Δᵢ⊂ℤ", "accent"),
    ], "The line is schematic: Δᵢ records the scalar products aᵢᵀy, not Euclidean projection coordinates."),
  },
  {
    id: "doignon-2d-thresholds",
    kicker: "Proof step 4 · Choose forbidden thresholds",
    title: "Choose δᵢ>bᵢ so that no point of Y lies strictly below every threshold",
    description:
      "The notes first show such thresholds exist, taking the smallest attained value above bᵢ. Then they consider all tuples satisfying (1) δᵢ>bᵢ and (2) no y∈Y has aᵢᵀy<δᵢ for every i.",
    formula: "(1) δᵢ>bᵢ   and   (2) ¬∃y∈Y: aᵢᵀy<δᵢ ∀i",
    insight:
      "Condition (2) is the invariant that the final midpoint will contradict.",
    scene: scene2D([
      ...base2D,
      label2D([1.75, 2.75], "δ=(δ₁,…,δₘ)", "accent"),
      label2D([1.55, 2.42], "no y∈Y is strict for every row", "muted"),
    ], "Threshold space is abstract; the geometric set Y remains fixed while the δᵢ values are varied."),
  },
  {
    id: "doignon-2d-maximal-thresholds",
    kicker: "Proof step 5 · Maximize the threshold tuple",
    title: "Pick a feasible threshold tuple with maximal total sum",
    description:
      "Among all tuples satisfying (1) and (2), maximize δ₁+⋯+δₘ. Maximality forces a witness yⁱ for every coordinate i: row i is tight at δᵢ, while every other row is strictly below its threshold.",
    formula: "aᵢᵀyⁱ=δᵢ,   a_kᵀyⁱ<δ_k for k≠i",
    insight:
      "If no such yⁱ existed for some i, δᵢ could be increased to the next value in Δᵢ without violating condition (2), contradicting maximality.",
    scene: scene2D([
      ...base2D,
      ...witnesses2D.map(({ p }, i) => label2D([p[0] + 0.1, p[1] - 0.22], `y${i + 1}: own row tight`, "accent")),
    ], "Important: the displayed witnesses encode the maximality property abstractly. For yⁱ, strictness is required for k≠i."),
  },
  {
    id: "doignon-2d-parity",
    kicker: "Proof step 6 · Pigeonhole on parity",
    title: "More than 2ⁿ witnesses force two with identical parity",
    description:
      "In ℤ² there are only four parity vectors: (E,E), (O,E), (E,O), and (O,O). With five witnesses, two must belong to the same class.",
    formula: "m>2ⁿ ⇒ ∃k≠ℓ: yᵏ≡yˡ (mod 2)",
    insight:
      "Here y¹=(0,0) and y⁵=(2,2) are both even-even. This is exactly where the constant 2ⁿ enters the proof.",
    scene: scene2D([
      hull2D,
      ...witnesses2D.map(({ p, parity }, i) => point2D(p, `y${i + 1} · ${parity}`, i === 0 || i === 4 ? "optimum" : "integer")),
      line2D([0,0],[2,2], "same parity pair", COLORS.rose),
    ], "Four parity classes cannot accommodate five witnesses without a collision."),
  },
  {
    id: "doignon-2d-midpoint",
    kicker: "Proof step 7 · Take the midpoint",
    title: "Equal parity makes the midpoint integral, and convexity keeps it in Y",
    description:
      "For same-parity witnesses yᵏ,yˡ, every coordinate of their sum is even. Hence y=(yᵏ+yˡ)/2 is integral. Since both endpoints lie in conv(X), convexity puts y in conv(X), hence y∈Y.",
    formula: "y=½(yᵏ+yˡ)∈ℤⁿ∩conv(X)=Y",
    insight:
      "In the displayed 2D collision, ½((0,0)+(2,2))=(1,1).",
    scene: scene2D([
      hull2D,
      point2D([0,0], "yᵏ=(0,0)", "optimum"),
      point2D([2,2], "yˡ=(2,2)", "optimum"),
      line2D([0,0],[2,2], "average", COLORS.rose),
      point2D([1,1], "y=(1,1)∈Y∩ℤ²", "fractional"),
    ], "Parity gives integrality; convexity gives membership in Y."),
  },
  {
    id: "doignon-2d-contradiction",
    kicker: "Proof step 8 · Contradict condition (2)",
    title: "The midpoint is strictly below every threshold",
    description:
      "For row k, yᵏ is at δ_k but yˡ is strictly below δ_k, so their average is strictly below δ_k. The same holds for row ℓ. For every other row both endpoints are strict, so the average is strict as well.",
    formula: "aᵢᵀy<δᵢ for every i",
    insight:
      "Thus y∈Y satisfies exactly what condition (2) forbids. The assumption m>2ⁿ is impossible, proving Theorem 144.",
    scene: scene2D([
      hull2D,
      point2D([1,1], "forbidden y∈Y", "optimum"),
      label2D([1.45, 1.35], "aᵢᵀy<δᵢ ∀i", "accent"),
      label2D([1.45, 0.95], "contradiction to (2)", "accent"),
    ], "Conclusion: a minimal integer-infeasible subsystem has at most 2²=4 inequalities in dimension two."),
  },
];

const cubePoints: Array<{ p: Point3D; parity: string }> = [
  { p: [0,0,0], parity: "EEE" },
  { p: [1,0,0], parity: "OEE" },
  { p: [0,1,0], parity: "EOE" },
  { p: [0,0,1], parity: "EEO" },
  { p: [1,1,0], parity: "OOE" },
  { p: [1,0,1], parity: "OEO" },
  { p: [0,1,1], parity: "EOO" },
  { p: [1,1,1], parity: "OOO" },
  { p: [2,2,2], parity: "EEE" },
];

function marker3D(id: string, at: Point3D, label?: string, style: "integer" | "fractional" | "optimum" = "integer", radius = 0.075): Marker3D {
  return { id, at, label, style, radius };
}

function segment3D(id: string, from: Point3D, to: Point3D, label: string, color = COLORS.violet): Segment3D {
  return { id, from, to, label, color, width: 4, animate: true };
}

function proofScene3D(markers: Marker3D[], segments: Segment3D[], secondary: string): Scene {
  return scene3D({
    bounds: { x: [-0.35, 2.45], y: [-0.35, 2.45], z: [-0.35, 2.45] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.8, pitch: 0.48, distance: 5.5 },
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "Doignon's theorem · parity mechanism in dimension 3",
      secondary,
    },
  });
}

const all3DMarkers = cubePoints.map(({ p }, i) => marker3D(`w-${i}`, p, `y${i + 1}`, i === 0 || i === 8 ? "optimum" : "integer"));

const stages3D: VisualizationStage[] = [
  {
    id: "doignon-3d-statement",
    kicker: "Chapter 24 · Theorem 144 · 3D",
    title: "In dimension three, at most eight inequalities are needed",
    description:
      "The theorem gives the bound 2³=8. The nine displayed witnesses represent the hypothetical situation m>8 that the proof rules out.",
    formula: "P∩ℤ³=∅ ⇒ some subsystem of at most 2³=8 inequalities is already integer-infeasible",
    insight:
      "The proof is dimension-independent; the 3D picture makes the eight parity classes literally visible as the 2×2×2 parity cube.",
    scene: proofScene3D(all3DMarkers, [], "Nine schematic witnesses are shown only to visualize the contradiction argument."),
  },
  {
    id: "doignon-3d-minimal",
    kicker: "Proof steps 1–2 · Essential constraints and finite Y",
    title: "Minimality gives one integer witness per inequality, then Y makes the set finite",
    description:
      "After minimalizing the infeasible system, removing inequality j gives xʲ∈ℤ³ satisfying every other row. Set X={xʲ} and Y=conv(X)∩ℤ³; Y is finite and contains all witnesses.",
    formula: "∀j ∃xʲ∈ℤ³: aᵢᵀxʲ≤bᵢ (i≠j),   Y=conv(X)∩ℤ³",
    insight:
      "The proof needs finiteness only to make the later threshold maximization well defined.",
    scene: proofScene3D(all3DMarkers, [], "Think of the markers as members of the finite set Y."),
  },
  {
    id: "doignon-3d-thresholds",
    kicker: "Proof steps 3–5 · Δᵢ and maximal δ",
    title: "Replace geometry by finitely many integer threshold values",
    description:
      "For each row i form Δᵢ={aᵢᵀy:y∈Y}. Choose δᵢ∈Δᵢ with δᵢ>bᵢ so that no y∈Y is strict for every row, and maximize δ₁+⋯+δₘ. Maximality gives a witness yⁱ with equality in row i and strictness in every other row.",
    formula: "aᵢᵀyⁱ=δᵢ,   a_kᵀyⁱ<δ_k for k≠i",
    insight:
      "These threshold witnesses are the objects whose parity is compared in the final combinatorial step.",
    scene: proofScene3D(
      cubePoints.map(({ p }, i) => marker3D(`delta-${i}`, p, `y${i + 1}: row ${i + 1} tight`, i === 0 || i === 8 ? "optimum" : "integer")),
      [],
      "The δ-values live in row-value space; the 3D marker positions only represent the associated yⁱ∈Y.",
    ),
  },
  {
    id: "doignon-3d-parity-cube",
    kicker: "Proof step 6 · 2³ parity classes",
    title: "The eight cube corners represent all parity classes of ℤ³",
    description:
      "Parity is the vector of coordinates modulo two. There are exactly 2³=8 possibilities. With nine yⁱ, two share a parity vector.",
    formula: "m>2³ ⇒ ∃k≠ℓ: yᵏ≡yˡ (mod 2)",
    insight:
      "The origin and (2,2,2) both have parity (E,E,E), so they form the highlighted collision pair.",
    scene: proofScene3D(
      cubePoints.map(({ p, parity }, i) => marker3D(`parity-${i}`, p, parity, i === 0 || i === 8 ? "optimum" : "integer")),
      [segment3D("collision", [0,0,0], [2,2,2], "same parity EEE", COLORS.rose)],
      "Eight classes, nine witnesses: pigeonhole forces a repeated parity class.",
    ),
  },
  {
    id: "doignon-3d-midpoint",
    kicker: "Proof step 7 · Integral midpoint",
    title: "Same parity makes the midpoint another lattice point in Y",
    description:
      "The coordinate sums are even, hence the midpoint is integral. Convexity of conv(X) then puts it back in Y.",
    formula: "½((0,0,0)+(2,2,2))=(1,1,1)∈Y∩ℤ³",
    insight:
      "This is the entire reason parity is used rather than a generic pigeonhole coloring.",
    scene: proofScene3D(
      [
        marker3D("left", [0,0,0], "yᵏ", "optimum", 0.09),
        marker3D("right", [2,2,2], "yˡ", "optimum", 0.09),
        marker3D("mid", [1,1,1], "y=(yᵏ+yˡ)/2", "fractional", 0.11),
      ],
      [segment3D("average", [0,0,0], [2,2,2], "midpoint", COLORS.rose)],
      "The midpoint belongs simultaneously to ℤ³ and conv(X).",
    ),
  },
  {
    id: "doignon-3d-contradiction",
    kicker: "Proof step 8 · Final contradiction",
    title: "Averaging the two threshold witnesses makes every row strict",
    description:
      "For rows k and ℓ one endpoint is tight and the other strict, so the midpoint is strict. For every other row both endpoints are strict. Thus aᵢᵀy<δᵢ for all i, contradicting condition (2).",
    formula: "y∈Y and aᵢᵀy<δᵢ ∀i  ⇒ contradiction",
    insight:
      "Therefore no minimal integer-infeasible system can contain more than 2ⁿ inequalities.",
    scene: proofScene3D(
      [marker3D("forbidden", [1,1,1], "forbidden y∈Y", "optimum", 0.12)],
      [],
      "Conclusion for n=3: at most eight inequalities are needed.",
    ),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "doignon-proof-2d",
    title: "2D proof walkthrough",
    description: "A complete stage-by-stage visualization of the proof with five hypothetical witnesses and four parity classes.",
    stages: stages2D,
  },
  {
    id: "doignon-proof-3d",
    title: "3D parity walkthrough",
    description: "The same proof in dimension three, where the eight parity classes appear as the corners of a parity cube.",
    stages: stages3D,
  },
];

const visualization: VisualizationDefinition = {
  id: "doignon-theorem-144",
  title: "Theorem 144 — Doignon's Integer Helly Theorem",
  shortTitle: "Doignon · Theorem 144",
  chapter: "Lattice-free polyhedra",
  order: 1,
  description:
    "Visualizes every proof step of Theorem 144 from the notes: minimal integer-infeasibility, remove-one-row witnesses, the finite set Y, the Δᵢ and maximal δᵢ construction, parity pigeonhole, the integral midpoint, and the final contradiction.",
  difficulty: "Advanced",
  duration: 18,
  accent: COLORS.violet,
  visualLabel: "Proof geometry",
  insightLabel: "Why the step works",
  controls: {
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 144 proof skeleton",
    steps: [
      "Assume a minimal integer-infeasible system with m>2ⁿ inequalities. Removing row j yields an integer witness xʲ satisfying all other rows.",
      "Let X={x¹,…,xᵐ} and Y=conv(X)∩ℤⁿ. The set Y is finite and contains the witnesses.",
      "For each row i form the finite integer value set Δᵢ={aᵢᵀy:y∈Y}.",
      "Choose δᵢ∈Δᵢ with δᵢ>bᵢ and no y∈Y satisfying aᵢᵀy<δᵢ for every i; among all such tuples maximize Σᵢδᵢ.",
      "Maximality gives, for every i, a witness yⁱ∈Y with aᵢᵀyⁱ=δᵢ and a_kᵀyⁱ<δ_k for every k≠i.",
      "Since m>2ⁿ but ℤⁿ has only 2ⁿ parity classes, two witnesses yᵏ,yˡ have the same componentwise parity.",
      "Their midpoint y=(yᵏ+yˡ)/2 is integral and belongs to Y by convexity.",
      "For every row i the midpoint satisfies aᵢᵀy<δᵢ, contradicting the defining threshold condition. Hence m≤2ⁿ.",
    ],
  },
};

export default visualization;
