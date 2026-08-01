import type {
  Mesh3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
} from "@/engine/types";
import type {
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const coneConstraints: Scene["constraints"] = [
  { id: "upper", a: -2, b: 1, limit: 0, label: "−2x₁+x₂≤0", color: "#f49a4a" },
  { id: "lower", a: 1, b: -2, limit: 0, label: "x₁−2x₂≤0", color: "#8f88dc" },
];

function coneScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-1.1, 6.3], y: [-1.1, 6.3] },
    constraints: coneConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    primitives,
    caption: {
      primary: "Proof cone C={x:Ax≤0}",
      secondary: "selected primitive extreme ray u=(1,2), Δ=3",
    },
    ...overrides,
  };
}

const lemma32ProofStages: VisualizationStage[] = [
  {
    id: "l32-proof-extreme-ray",
    kicker: "Proof step 1 · Select an extreme ray",
    title: "Start with one primitive integral extreme direction",
    description:
      "Following the notes, fix an extreme ray u of C and normalize it to the first lattice point on that ray. We use u=(1,2).",
    formula: "u∈C∩ℤⁿ primitive and extreme",
    insight:
      "The ray extends forever, but the proof only needs its primitive generator.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [3, 6], label: "ray ℝ₊u", color: "#f49a4a", animate: true },
      { kind: "point", at: [1, 2], label: "primitive u=(1,2)", style: "integer" },
    ]),
  },
  {
    id: "l32-proof-tight-rows",
    kicker: "Proof step 2 · Tight subsystem",
    title: "Extreme means that enough rows are tight",
    description:
      "On the support of u, choose n−1 linearly independent tight rows. In two dimensions, the single equation −2x₁+x₂=0 leaves exactly the one-dimensional nullspace spanned by u.",
    formula: "A′u=0,   rank(A′)=|I|−1",
    insight:
      "This is the geometric-to-linear-algebra transition in the proof.",
    scene: coneScene([
      { kind: "line", from: [-0.45, -0.9], to: [3.1, 6.2], label: "tight row A′u=0", style: "constraint", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [1, 2], label: "null direction u", color: "#f49a4a", animate: true },
    ], { showFeasibleRegion: false }),
  },
  {
    id: "l32-proof-largest-coordinate",
    kicker: "Proof step 3 · Choose the largest coordinate",
    title: "Delete the column of a maximum coordinate",
    description:
      "Choose j with |uⱼ|=‖u‖∞. Here j=2 because |u₂|=2. Deleting column j from the tight system leaves a square matrix A′₀.",
    formula: "j∈argmaxᵢ|uᵢ|,   A′₀=A′ without column j",
    insight:
      "The maximum coordinate is the one the determinant construction will control directly.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [1, 2], label: "u=(1,2)", color: "#f49a4a", animate: true },
      { kind: "line", from: [0, 2], to: [1, 2], label: "|u₁|=1", style: "objective", color: "#8f88dc" },
      { kind: "line", from: [1, 0], to: [1, 2], label: "|u₂|=‖u‖∞=2", style: "cut", color: "#e27c89" },
      { kind: "label", at: [3.4, 4.9], text: "delete column j=2", tone: "accent" },
    ], { showFeasibleRegion: false, showConstraints: false }),
  },
  {
    id: "l32-proof-cramer",
    kicker: "Proof step 4 · Determinant vector",
    title: "Cramer’s rule builds another integral null vector",
    description:
      "The notes construct u′ from determinants of A′₀ and the column-replacement matrices. Every coordinate of u′ is therefore an absolute subdeterminant of A.",
    formula: "u′ⱼ=det(A′₀),   u′ᵢ=−det(A′ᵢ)",
    insight:
      "This is where Δ enters: each determinant coordinate has magnitude at most Δ.",
    scene: coneScene([
      { kind: "polygon", points: [[0, 0], [1, 0], [1, 2], [0, 2]], label: "determinant coordinates", style: "integer-hull" },
      { kind: "vector", from: [0, 0], to: [1, 2], label: "u′=(1,2)", color: "#f49a4a", animate: true },
      { kind: "line", from: [0, 2], to: [1, 2], label: "|det(A′₂)|=1", style: "objective", color: "#8f88dc" },
      { kind: "line", from: [1, 0], to: [1, 2], label: "|det(A′₀)|=2", style: "cut", color: "#e27c89" },
    ], { showFeasibleRegion: false, showConstraints: false }),
  },
  {
    id: "l32-proof-one-dimensional",
    kicker: "Proof step 5 · Same nullspace",
    title: "The determinant vector must be a multiple of u",
    description:
      "The nullspace of A′ is one-dimensional, so u′=λu. Both vectors are integral and u is primitive, hence λ is an integer with |λ|≥1.",
    formula: "u′=λu,   λ∈ℤ,   |λ|≥1",
    insight:
      "Primitive normalization prevents u from being longer than the determinant vector.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [1, 2], label: "primitive u", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [2, 4], label: "possible u′=2u", color: "#8f88dc", animate: true },
      { kind: "point", at: [1, 2], label: "first lattice point", style: "integer" },
    ], { showFeasibleRegion: false, showConstraints: false }),
  },
  {
    id: "l32-proof-bound",
    kicker: "Proof step 6 · Conclude",
    title: "The largest primitive coordinate is at most Δ",
    description:
      "Because u′ is a determinant vector and u′=λu with |λ|≥1, the primitive generator cannot have a larger infinity norm than u′.",
    formula: "‖u‖∞≤‖u′‖∞=|det(A′₀)|≤Δ",
    insight:
      "The proof turns an unbounded geometric edge into a bounded arithmetic direction.",
    scene: coneScene([
      { kind: "polygon", points: [[-3, -3], [3, -3], [3, 3], [-3, 3]], label: "‖x‖∞≤Δ", style: "integer-hull", fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]] },
      { kind: "vector", from: [0, 0], to: [3, 6], label: "unbounded ray", color: "#f49a4a", animate: true },
      { kind: "point", at: [1, 2], label: "u lies in Δ-box", style: "optimum" },
    ], { showFeasibleRegion: false, showConstraints: false }),
  },
];

const prismFaces = [
  [0, 1, 2, 3],
  [4, 7, 6, 5],
  [0, 4, 5, 1],
  [1, 5, 6, 2],
  [2, 6, 7, 3],
  [3, 7, 4, 0],
];
const prismBase: Array<[number, number]> = [[0, 0], [1, 1], [1.5, 2], [0, 2]];
function prismVertices(z0 = 0, z1 = 1): Point3D[] {
  return [
    ...prismBase.map(([x, y]) => [x, y, z0] as Point3D),
    ...prismBase.map(([x, y]) => [x, y, z1] as Point3D),
  ];
}
function prism(opacity = 0.16): Mesh3D {
  return { id: "proof-prism", vertices: prismVertices(), faces: prismFaces, label: "P", color: "#79c9c0", edgeColor: "#10202a", opacity, style: "solid" };
}
function scene3D(configuration: Scene3D): Scene {
  return { viewport: { x: [0, 1], y: [0, 1] }, constraints: [], showGrid: true, showLattice: true, showVertices: true, scene3D: configuration };
}
function prismScene(overrides: Partial<Scene3D> = {}): Scene {
  return scene3D({
    bounds: { x: [-0.35, 2.2], y: [-0.35, 2.6], z: [-0.2, 1.55] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.72, pitch: 0.48, distance: 5.8 },
    meshes: [prism()],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: { primary: "Proof path for Theorem 34", secondary: "all displayed optima are vertices" },
    ...overrides,
  });
}
const xHat: Point3D = [0, 0, 1];
const yStar: Point3D = [1.5, 2, 1];
const xStar: Point3D = [1, 1, 1];
const firstCorner: Point3D = [1.5, 1.5, 1];

const theorem34ProofStages: VisualizationStage[] = [
  {
    id: "t34-proof-fix-optima",
    kicker: "Proof step 1 · Fix two optima",
    title: "Choose the LP optimum y* and an arbitrary IP optimum x̂",
    description:
      "The notes begin with the chosen continuous optimum and any integer optimum. They may be far apart even though they have the same objective value.",
    formula: "y*∈argmax(LP),   x̂∈argmax(IP)",
    insight:
      "The proof will replace x̂ by another integer optimum closer to y*.",
    scene: prismScene({ markers: [
      { id: "xhat", at: xHat, label: "arbitrary IP optimum x̂", style: "integer" },
      { id: "ystar", at: yStar, label: "chosen LP optimum y*", style: "fractional" },
    ], segments: [{ id: "difference", from: xHat, to: yStar, label: "d=y*−x̂", color: "#e27c89", width: 4, animate: true }] }),
  },
  {
    id: "t34-proof-row-partition",
    kicker: "Proof step 2 · Compare every row",
    title: "Partition inequalities by how their slack changes",
    description:
      "For each row, compare Aᵢy* with Aᵢx̂. The two index sets determine which directions may increase or decrease each row while remaining sign-compatible with d=y*−x̂.",
    formula: "M₁={i:Aᵢy*<Aᵢx̂},   M₂={i:Aᵢy*≥Aᵢx̂}",
    insight:
      "This row partition is the exact sign information used in the notes to define the cone.",
    scene: prismScene({ meshes: [prism(0.08)], markers: [
      { id: "xhat", at: xHat, label: "x̂", style: "integer" },
      { id: "ystar", at: yStar, label: "y*", style: "fractional" },
    ], segments: [
      { id: "lower-slack", from: xHat, to: [0, 2, 1], label: "rows whose value increases", color: "#8f88dc", width: 3, animate: true },
      { id: "upper-slack", from: xHat, to: [1.5, 1.5, 1], label: "rows whose value decreases", color: "#f49a4a", width: 3, animate: true },
    ] }),
  },
  {
    id: "t34-proof-cone",
    kicker: "Proof step 3 · Sign-compatible cone",
    title: "The displacement lies in a cone of safe directions",
    description:
      "The row signs define a cone C containing d. In this example its relevant extreme directions on the optimal face are u¹=(1,1,0) and u²=(0,1,0).",
    formula: "C={u:Aᵢu≤0 on M₁, Aᵢu≥0 on M₂}",
    insight:
      "Remark 33 says that every partial nonnegative ray combination bounded by d remains feasible from x̂.",
    scene: prismScene({ meshes: [prism(0.08)], markers: [{ id: "xhat", at: xHat, label: "x̂", style: "integer" }], segments: [
      { id: "u1", from: xHat, to: [1, 1, 1], label: "primitive u¹", color: "#f49a4a", width: 4, animate: true },
      { id: "u2", from: xHat, to: [0, 1, 1], label: "primitive u²", color: "#8f88dc", width: 4, animate: true },
      { id: "d", from: xHat, to: yStar, label: "d∈C", color: "#e27c89", width: 3, dashed: true, animate: true },
    ] }),
  },
  {
    id: "t34-proof-caratheodory",
    kicker: "Proof step 4 · Extreme-ray decomposition",
    title: "Carathéodory uses at most n bounded rays",
    description:
      "Write d as a nonnegative combination of primitive integral extreme rays. Here d=1.5u¹+0.5u² and only two directions are used although n=3.",
    formula: "d=Σᵢ₌₁ᵏλᵢuᵢ,   k≤n,   ‖uᵢ‖∞≤Δ",
    insight:
      "Carathéodory controls the number of summands; Lemma 32 controls each summand.",
    scene: prismScene({ meshes: [prism(0.08)], markers: [
      { id: "xhat", at: xHat, label: "x̂", style: "integer" },
      { id: "corner", at: firstCorner, label: "x̂+1.5u¹", style: "vertex" },
      { id: "ystar", at: yStar, label: "y*", style: "fractional" },
    ], segments: [
      { id: "part1", from: xHat, to: firstCorner, label: "1.5u¹", color: "#f49a4a", width: 4, animate: true },
      { id: "part2", from: firstCorner, to: yStar, label: "0.5u²", color: "#8f88dc", width: 4, animate: true },
    ] }),
  },
  {
    id: "t34-proof-strip",
    kicker: "Proof step 5 · Absorb integer parts",
    title: "Move x̂ by every full integral ray copy",
    description:
      "Since λ₁=1.5, absorb one copy of u¹ into x̂. Remark 33 preserves feasibility, integrality is automatic, and the objective argument in the notes preserves optimality.",
    formula: "x*=x̂+Σ⌊λᵢ⌋uᵢ,   y*−x*=Σ(λᵢ−⌊λᵢ⌋)uᵢ",
    insight:
      "The far optimum x̂ is replaced by a new optimal integer vertex x*=(1,1,1).",
    scene: prismScene({ meshes: [prism(0.08)], markers: [
      { id: "old", at: xHat, label: "old x̂", style: "integer" },
      { id: "new", at: xStar, label: "new IP optimum x*", style: "optimum", animateFrom: xHat },
      { id: "ystar", at: yStar, label: "y*", style: "fractional" },
    ], segments: [
      { id: "integer", from: xHat, to: xStar, label: "⌊1.5⌋u¹", color: "#f49a4a", width: 5, animate: true },
      { id: "remainder", from: xStar, to: yStar, label: "0.5u¹+0.5u²", color: "#e27c89", width: 4, dashed: true, animate: true },
    ] }),
  },
  {
    id: "t34-proof-bound",
    kicker: "Proof step 6 · Sum the remainder",
    title: "Every remaining coefficient is below one",
    description:
      "After all integer parts are absorbed, at most n coefficients remain and each lies in [0,1). Summing their determinant-bounded rays gives the proximity estimate.",
    formula: "‖y*−x*‖∞≤Σλᵢ‖uᵢ‖∞≤kΔ≤nΔ",
    insight:
      "This is exactly the final inequality chain in the notes.",
    scene: prismScene({ meshes: [prism(0.08)], markers: [
      { id: "xstar", at: xStar, label: "x*", style: "optimum" },
      { id: "ystar", at: yStar, label: "y*", style: "fractional" },
    ], segments: [{ id: "gap", from: xStar, to: yStar, label: "bounded fractional remainder", color: "#e27c89", width: 5, animate: true }], caption: { primary: "Theorem 34 proved", secondary: "extreme-ray bound + Carathéodory + coefficient stripping" } }),
  },
];

const pentagonConstraints: Scene["constraints"] = [
  { id: "left", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "bottom", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "right", a: 1, b: 0, limit: 5, label: "x₁≤5", color: "#8f88dc" },
  { id: "top", a: 0, b: 1, limit: 4, label: "x₂≤4", color: "#8f88dc" },
  { id: "cap", a: 1, b: 1, limit: 7, label: "x₁+x₂≤7", color: "#f49a4a" },
];
function pentagonScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return { viewport: { x: [-0.6, 5.7], y: [-0.6, 4.8] }, constraints: pentagonConstraints, showGrid: true, showConstraints: true, showFeasibleRegion: true, showVertices: true, showLattice: true, axisLabels: { x: "x₁", y: "x₂" }, primitives, caption: { primary: "Proof path for Theorem 35", secondary: "z=(1,1), optimal vertex ŷ=(5,2)" }, ...overrides };
}
function displacementScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return { viewport: { x: [-0.5, 4.7], y: [-0.5, 3.5] }, constraints: [
    { id: "lower", a: 0, b: -1, limit: 0, label: "u₂≥0", color: "#8f88dc" },
    { id: "upper", a: -2, b: 1, limit: 0, label: "u₂≤2u₁", color: "#f49a4a" },
  ], showGrid: true, showConstraints: true, showFeasibleRegion: true, showVertices: false, showLattice: true, axisLabels: { x: "u₁", y: "u₂" }, primitives, caption: { primary: "Minimal improving displacement in a sign-compatible cone", secondary: "u¹=(1,0), u²=(1,2), Δ=2" }, ...overrides };
}

const theorem35ProofStages: VisualizationStage[] = [
  {
    id: "t35-proof-witness",
    kicker: "Proof step 1 · Certify nonoptimality",
    title: "Choose an optimal integer point ŷ beyond z",
    description:
      "The proof begins with a nonoptimal feasible integer point z and any optimal integer point ŷ. Their difference belongs to the sign-compatible cone constructed from the row comparison.",
    formula: "z∈P∩ℤⁿ nonoptimal,   ŷ∈argmax(IP),   ŷ−z∈C",
    insight:
      "The distant optimum only certifies that an improving integral displacement exists.",
    scene: pentagonScene([
      { kind: "point", at: [1, 1], label: "nonoptimal z", style: "integer" },
      { kind: "point", at: [5, 2], label: "optimal vertex ŷ", style: "optimum" },
      { kind: "vector", from: [1, 1], to: [5, 2], label: "ŷ−z", color: "#e27c89", animate: true },
    ], { objective: { vector: [2, 1], label: "c=(2,1)" } }),
  },
  {
    id: "t35-proof-minimal",
    kicker: "Proof step 2 · Choose minimum ray mass",
    title: "Among improving integral displacements, minimize Σλᵢ",
    description:
      "The notes do not necessarily decompose the full vector ŷ−z. They choose an improving integral d=Σλᵢuᵢ with the smallest possible total coefficient mass.",
    formula: "min{Σλᵢ:d=Σλᵢuᵢ∈ℤⁿ, cᵀd>0}",
    insight:
      "This minimality is the engine behind both case contradictions.",
    scene: displacementScene([
      { kind: "vector", from: [0, 0], to: [4, 0], label: "extreme ray u¹=(1,0)", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0, 0], to: [2, 4], label: "extreme ray u²=(1,2)", color: "#f49a4a", animate: true },
      { kind: "point", at: [2, 1], label: "integral improving d", style: "integer" },
    ]),
  },
  {
    id: "t35-proof-caratheodory",
    kicker: "Proof step 3 · Reduce the support",
    title: "Carathéodory keeps at most n used rays",
    description:
      "Represent the chosen d with primitive integral extreme rays and discard unnecessary directions. Lemma 32 gives ‖uᵢ‖∞≤Δ and Carathéodory gives k≤n.",
    formula: "d=Σᵢ₌₁ᵏλᵢuᵢ,   k≤n,   ‖uᵢ‖∞≤Δ",
    insight:
      "Only the coefficient sizes remain to be controlled.",
    scene: displacementScene([
      { kind: "vector", from: [0, 0], to: [1.5, 0], label: "1.5u¹", color: "#8f88dc", animate: true },
      { kind: "vector", from: [1.5, 0], to: [2, 1], label: "0.5u²", color: "#f49a4a", animate: true },
      { kind: "point", at: [2, 1], label: "d=1.5u¹+0.5u²", style: "integer" },
    ]),
  },
  {
    id: "t35-proof-case-positive",
    kicker: "Proof step 4 · Case cᵀuʲ>0",
    title: "An improving full ray is already the desired local move",
    description:
      "If some λⱼ≥1 and its primitive ray has positive objective gain, then z+uʲ is feasible, integral, improving, and at distance at most Δ.",
    formula: "λⱼ≥1, cᵀuʲ>0 ⇒ y=z+uʲ, ‖y−z‖∞≤Δ",
    insight:
      "This case finishes the theorem immediately.",
    scene: pentagonScene([
      { kind: "point", at: [1, 1], label: "z", style: "integer" },
      { kind: "point", at: [2, 1], label: "z+u¹ improves", style: "integer", animateFrom: [1, 1] },
      { kind: "vector", from: [1, 1], to: [2, 1], label: "primitive ray step", color: "#f49a4a", animate: true },
    ], { objective: { vector: [2, 1], label: "c=(2,1)" } }),
  },
  {
    id: "t35-proof-case-neutral",
    kicker: "Proof step 5 · Case cᵀuʲ≤0",
    title: "A nonimproving full ray can be removed",
    description:
      "For the second branch use c=e₂, so u¹=(1,0) is neutral. Removing one copy changes d=(2,1) to d′=(1,1), which remains integral and strictly improving but has smaller total ray mass.",
    formula: "d′=d−u¹,   cᵀd′≥cᵀd>0",
    insight:
      "This contradicts the defining minimality of d.",
    scene: displacementScene([
      { kind: "point", at: [2, 1], label: "old d", style: "integer" },
      { kind: "point", at: [1, 1], label: "smaller improving d′", style: "optimum", animateFrom: [2, 1] },
      { kind: "vector", from: [2, 1], to: [1, 1], label: "subtract u¹", color: "#e27c89", animate: true },
      { kind: "line", from: [-0.3, 0], to: [4.5, 0], label: "cᵀu=0 for c=e₂", style: "objective", color: "#8f88dc" },
    ]),
  },
  {
    id: "t35-proof-small-coefficients",
    kicker: "Proof step 6 · Conclude λᵢ<1",
    title: "Both cases exclude every coefficient of size at least one",
    description:
      "If λⱼ≥1, either the theorem is already proved by a short improving ray, or minimality is contradicted by removing that ray. Hence the remaining hard case has λᵢ<1 for all i.",
    formula: "0≤λᵢ<1 for every used ray",
    insight:
      "The proof has now reduced a global improvement to fewer than one copy of at most n primitive rays.",
    scene: displacementScene([
      { kind: "vector", from: [0, 0], to: [0.5, 0], label: "0.5u¹", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0.5, 0], to: [1, 1], label: "0.5u²", color: "#f49a4a", animate: true },
      { kind: "point", at: [1, 1], label: "minimal integral d", style: "optimum" },
    ]),
  },
  {
    id: "t35-proof-bound",
    kicker: "Proof step 7 · Sum the bounds",
    title: "The minimum improving displacement lies in the nΔ-box",
    description:
      "The final estimate is the same three-factor product as in Theorem 34: fewer than one copy, at most n directions, and norm at most Δ per primitive ray.",
    formula: "‖d‖∞≤Σλᵢ‖uᵢ‖∞≤kΔ≤nΔ",
    insight:
      "Therefore every nonoptimal integer point has a bounded local improving witness.",
    scene: displacementScene([
      { kind: "polygon", points: [[0, 0], [4, 0], [4, 4], [0, 4]], label: "‖d‖∞≤nΔ", style: "integer-hull", fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]] },
      { kind: "point", at: [1, 1], label: "improving integral d", style: "optimum" },
    ]),
  },
];

function coefficientScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return { viewport: { x: [-0.3, 2.15], y: [-0.3, 1.9] }, constraints: [
    { id: "mu1", a: -1, b: 0, limit: 0, label: "μ₁≥0", color: "#f49a4a" },
    { id: "mu2", a: 0, b: -1, limit: 0, label: "μ₂≥0", color: "#8f88dc" },
  ], showGrid: true, showConstraints: true, showFeasibleRegion: true, showVertices: false, showLattice: true, axisLabels: { x: "μ₁", y: "μ₂" }, primitives, caption: { primary: "Proof coordinates for Lemma 51", secondary: "u=μ₁r¹+μ₂r²" }, ...overrides };
}

const lemma51ProofStages: VisualizationStage[] = [
  {
    id: "l51-proof-sign-cone",
    kicker: "Proof step 1 · Freeze the sign pattern",
    title: "Build the multiplier cone from M⁻ and M⁺",
    description:
      "The notes fix the signs of u and define C by wᵀA_C=0 together with wᵢ≤0 on M⁻ and wᵢ≥0 on M⁺. In coefficient coordinates this is the nonnegative quadrant.",
    formula: "C={w:wᵀA_C=0, wᵢ≤0 on M⁻, wᵢ≥0 on M⁺}",
    insight:
      "Working in one sign cone makes positive and negative parts monotone under subtraction.",
    scene: coefficientScene([
      { kind: "vector", from: [0, 0], to: [2, 0], label: "copies of r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [0, 1.7], label: "copies of r²", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "l51-proof-rays",
    kicker: "Proof step 2 · Apply Lemma 32",
    title: "Every primitive multiplier ray has norm at most Δ",
    description:
      "Let r¹,…,rᵗ be the primitive integral extreme rays of C. Applying Lemma 32 to the continuous-column system gives the determinant bound in multiplier space.",
    formula: "‖rᵏ‖∞≤Δ",
    insight:
      "The same atomic ray estimate now controls constraint multipliers rather than primal movements.",
    scene: coefficientScene([
      { kind: "point", at: [1, 0], label: "one r¹", style: "integer" },
      { kind: "point", at: [0, 1], label: "one r²", style: "integer" },
      { kind: "vector", from: [0, 0], to: [2, 0], label: "extreme ray r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [0, 1.7], label: "extreme ray r²", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "l51-proof-case-a",
    kicker: "Proof step 3 · Rule out case (a)",
    title: "Suppose u contains a nonzero integral cone vector v",
    description:
      "The notes first consider u=v+w with v∈C∩ℤᵐ∖{0}. The example u=1.4r¹+0.6r² contains the full integral vector v=r¹ and remainder w=0.4r¹+0.6r².",
    formula: "u=v+w,   v∈C∩ℤᵐ∖{0},   w∈C",
    insight:
      "This case is handled before invoking Carathéodory.",
    scene: coefficientScene([
      { kind: "point", at: [1.4, 0.6], label: "u", style: "fractional" },
      { kind: "point", at: [0.4, 0.6], label: "w", style: "optimum" },
      { kind: "vector", from: [1.4, 0.6], to: [0.4, 0.6], label: "subtract integral v=r¹", color: "#e27c89", animate: true },
    ]),
  },
  {
    id: "l51-proof-fractional-part",
    kicker: "Proof step 4 · Preserve the split",
    title: "Subtracting v preserves the relevant fractional part",
    description:
      "Because (vᵀA)_I and vᵀb are integral, u and w induce the same split index and the same fractional value f. The remainder also satisfies w⁺≤u⁺ and w⁻≤u⁻.",
    formula: "f={uᵀb}={wᵀb},   w⁺≤u⁺,   w⁻≤u⁻",
    insight:
      "The inequality from w has no larger left-hand coefficients and therefore dominates the one from u.",
    scene: coefficientScene([
      { kind: "point", at: [1.4, 0.6], label: "dominated u", style: "fractional" },
      { kind: "point", at: [0.4, 0.6], label: "dominating w", style: "optimum", animateFrom: [1.4, 0.6] },
      { kind: "line", from: [1, -0.2], to: [1, 1.75], label: "one integral ray threshold", style: "cut", color: "#e27c89" },
      { kind: "label", at: [1.2, 1.45], text: "case (a) contradicts undominatedness", tone: "accent" },
    ]),
  },
  {
    id: "l51-proof-caratheodory",
    kicker: "Proof step 5 · Case (b)",
    title: "Now decompose u with at most m extreme rays",
    description:
      "Only after excluding case (a), the notes use Carathéodory to write u=Σμₖrᵏ with at most m nonzero coefficients.",
    formula: "u=Σₖ∈Kμₖrᵏ,   |K|≤m",
    insight:
      "This ordering matters: the impossibility of case (a) will force every coefficient below one.",
    scene: coefficientScene([
      { kind: "vector", from: [0, 0], to: [0.7, 0], label: "0.7r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0.7, 0], to: [0.7, 0.8], label: "+0.8r²", color: "#8f88dc", animate: true },
      { kind: "point", at: [0.7, 0.8], label: "candidate u", style: "optimum" },
    ]),
  },
  {
    id: "l51-proof-mu-small",
    kicker: "Proof step 6 · Use the excluded case",
    title: "Any μₖ≥1 would recreate case (a)",
    description:
      "If μⱼ≥1, take v=rʲ and w=u−rʲ. Both remain in C and v is a nonzero integral cone vector, exactly the decomposition already ruled out.",
    formula: "case (a) impossible ⇒ μₖ<1 for every k",
    insight:
      "Undominatedness reduces the infinite coefficient quadrant to the unit cell.",
    scene: coefficientScene([
      { kind: "polygon", points: [[0, 0], [1, 0], [1, 1], [0, 1]], label: "0≤μₖ<1", style: "integer-hull", fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]] },
      { kind: "point", at: [0.7, 0.8], label: "allowed", style: "optimum" },
      { kind: "point", at: [1.4, 0.6], label: "excluded", style: "fractional" },
    ]),
  },
  {
    id: "l51-proof-bound",
    kicker: "Proof step 7 · Sum the ray bounds",
    title: "At most m fractional ray pieces give ‖u‖∞≤mΔ",
    description:
      "The conclusion is the direct product of the three estimates: |K|≤m, μₖ<1, and ‖rᵏ‖∞≤Δ.",
    formula: "‖u‖∞≤Σₖ∈Kμₖ‖rᵏ‖∞≤mΔ",
    insight:
      "The bounded multiplier window is then used to prove that only finitely many undominated split inequalities are needed.",
    scene: coefficientScene([
      { kind: "polygon", points: [[0, 0], [1, 0], [1, 1], [0, 1]], label: "fractional coefficient cell", style: "integer-hull" },
      { kind: "point", at: [0.7, 0.8], label: "u", style: "optimum" },
      { kind: "label", at: [1.25, 1.45], text: "|K|≤m · μₖ<1 · ‖rᵏ‖∞≤Δ", tone: "accent" },
    ]),
  },
];

export const lemma32ProofExample: VisualizationExample = {
  id: "proof-from-notes-lemma-32",
  title: "Proof from the notes — tight rows to Δ",
  description: "Follow the proof in the lecture-note order: tight subsystem, maximum coordinate, Cramer determinant vector, primitive scaling, and the final bound.",
  stages: lemma32ProofStages,
};

export const theorem34ProofExample: VisualizationExample = {
  id: "proof-from-notes-theorem-34",
  title: "Proof from the notes — row cone to nΔ",
  description: "Follow the exact proximity proof route: row comparison, sign-compatible cone, Carathéodory decomposition, integral ray absorption, and the nΔ remainder.",
  stages: theorem34ProofStages,
};

export const theorem35ProofExample: VisualizationExample = {
  id: "proof-from-notes-theorem-35",
  title: "Proof from the notes — minimal improving mass",
  description: "Follow both cases of the proof: an improving full ray ends the argument, while a nonimproving full ray contradicts minimality when removed.",
  stages: theorem35ProofStages,
};

export const lemma51ProofExample: VisualizationExample = {
  id: "proof-from-notes-lemma-51",
  title: "Proof from the notes — exclude case (a), then bound",
  description: "Follow Lemma 51 in its original order: sign cone, determinant-bounded rays, dominance contradiction, Carathéodory, μk<1, and mΔ.",
  stages: lemma51ProofStages,
};
