import type { Constraint, Point2D, Primitive, Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const viewport: Scene["viewport"] = { x: [-1, 5], y: [-1, 5.5] };

const polygon: Point2D[] = [
  [1.2, 0.2],
  [1.8, 0.8],
  [3.4, 3.4],
  [3.2, 4.2],
  [2.6, 3.6],
  [1.4, 1.4],
];

const colors = ["#f49a4a", "#7ecbc4", "#d4ef77", "#a7a0ed", "#e88d99", "#79c9c0"];

const constraints: Constraint[] = polygon.map((point, index) => {
  const next = polygon[(index + 1) % polygon.length];
  const dx = next[0] - point[0];
  const dy = next[1] - point[1];
  return {
    id: `facet-${index + 1}`,
    a: dy,
    b: -dx,
    limit: dy * point[0] - dx * point[1],
    label: `facet ${index + 1}`,
    color: colors[index],
  };
});

const center: Point2D = [2.55, 2.35];
const basis: [Point2D, Point2D] = [[1, 1], [1, 2]];
const dualBasis: [Point2D, Point2D] = [[2, -1], [-1, 1]];
const roundedCandidate: Point2D = [1, 0];
const flatDirection: Point2D = dualBasis[1];

function latticePoints(): Primitive[] {
  const points: Primitive[] = [];
  for (let x = -1; x <= 5; x += 1) {
    for (let y = -1; y <= 5; y += 1) {
      points.push({ kind: "point", at: [x, y], style: "lattice" });
    }
  }
  return points;
}

function vector(to: Point2D, label: string, color: string): Primitive {
  return { kind: "vector", from: [0, 0], to, label, color, animate: true };
}

function slice(delta: number, color = "#e88d99"): Primitive {
  return {
    kind: "line",
    from: [-1, -1 + delta],
    to: [5, 5 + delta],
    label: `H${delta}: −x₁+x₂=${delta}`,
    style: "cut",
    color,
    animate: true,
  };
}

function baseScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints,
    primitives: [...latticePoints(), ...primitives],
    showFeasibleRegion: true,
    showConstraints: true,
    showGrid: true,
    showLattice: false,
    showVertices: true,
    caption: {
      primary: "FIXIP in dimension n=2",
      secondary: "Ellipsoid rounding · lattice reduction · recursive slices",
    },
    ...overrides,
  };
}

function treeScene(primitives: Primitive[], detail: string): Scene {
  return {
    viewport: { x: [0, 10], y: [0, 7] },
    constraints: [],
    primitives,
    showFeasibleRegion: false,
    showConstraints: false,
    showGrid: false,
    showAxes: false,
    caption: { primary: "FIXIP recursion tree", secondary: detail },
  };
}

const treeEdge = (from: Point2D, to: Point2D, label?: string, rejected = false): Primitive => ({
  kind: "line",
  from,
  to,
  label,
  style: rejected ? "graph-edge-rejected" : "graph-edge",
  color: rejected ? "#e88d99" : "#79c9c0",
  animate: true,
});

const treeNode = (
  at: Point2D,
  label: string,
  style: "graph-node" | "graph-node-active" | "graph-node-invalid" = "graph-node",
): Primitive => ({ kind: "point", at, label, style });

const stages = [
  {
    id: "input",
    kicker: "01 · Fixed-dimension IP",
    title: "FIXIP asks whether a rational polytope contains a lattice point",
    description:
      "The input is K={x∈ℝⁿ:Ax≤b}. Here n=2 is fixed. The highlighted lattice points are the only acceptable solutions; continuous feasibility alone is not enough.",
    formula: "FIXIP(A,b): find x∈K∩ℤⁿ, or certify K∩ℤⁿ=∅",
    insight: "The polynomial running time is measured in the encoding length of A and b while n remains constant.",
    scene: baseScene(),
  },
  {
    id: "recursive-contract",
    kicker: "02 · Recursive contract",
    title: "Every call either returns an integer point or returns EMPTY",
    description:
      "The algorithm may replace one n-dimensional problem by several problems of dimension n−1. Every child uses the same contract, so the result can be propagated upward.",
    formula: "FIXIPₙ(K) ∈ (K∩ℤⁿ) ∪ {EMPTY}",
    insight: "Correctness follows by covering every possible integer point with the enumerated affine slices.",
    scene: treeScene([
      treeNode([5, 5.8], "FIXIP₂(K)", "graph-node-active"),
      treeEdge([5, 5.55], [2.2, 3.5], "δ=−1"),
      treeEdge([5, 5.55], [5, 3.5], "δ=0"),
      treeEdge([5, 5.55], [7.8, 3.5], "δ=1"),
      treeNode([2.2, 3.2], "FIXIP₁(K₋₁)"),
      treeNode([5, 3.2], "FIXIP₁(K₀)"),
      treeNode([7.8, 3.2], "FIXIP₁(K₁)"),
    ], "dimension drops along every edge"),
  },
  {
    id: "base-case",
    kicker: "03 · Base case n=1",
    title: "In one dimension, feasibility is just an integer-in-interval test",
    description:
      "A one-dimensional rational polytope is an interval [ℓ,u]. It contains an integer exactly when the first integer above ℓ does not exceed u.",
    formula: "K=[ℓ,u]:  ⌈ℓ⌉≤⌊u⌋  ⇔  K∩ℤ≠∅",
    insight: "The recursion bottoms out without further branching.",
    scene: treeScene([
      { kind: "line", from: [1.5, 3.5], to: [8.5, 3.5], style: "constraint", color: "#10202a" },
      { kind: "line", from: [3.1, 3.5], to: [6.8, 3.5], style: "cut", color: "#a7a0ed", label: "[ℓ,u]" },
      ...[2, 3, 4, 5, 6, 7, 8].map((x): Primitive => ({ kind: "point", at: [x, 3.5], label: `${x - 2}`, style: x === 5 ? "graph-node-active" : "lattice" })),
      { kind: "label", at: [5, 5.2], text: "⌈ℓ⌉=1 ≤ 4=⌊u⌋", tone: "accent" },
    ], "the exact stopping rule in dimension one"),
  },
  {
    id: "dimension-check",
    kicker: "04 · Preprocessing",
    title: "First remove equations and detect lower-dimensional input",
    description:
      "If K lies in a proper affine subspace, FIXIP parameterizes that subspace and immediately reduces dimension. Our example is full-dimensional, so the main routine continues.",
    formula: "dim(K)<n  ⇒  x=d+B′y,  y∈ℝᵈⁱᵐ⁽ᴷ⁾",
    insight: "Full dimensionality is needed before computing an inner ellipsoid.",
    scene: baseScene([{ kind: "label", at: [2.4, 4.85], text: "dim(K)=2 · continue", tone: "accent" }]),
  },
  {
    id: "ellipsoid-rounding",
    kicker: "05 · Ellipsoid rounding",
    title: "Sandwich the polytope between two concentric ellipsoids",
    description:
      "A polynomial-time rounding routine finds a center a and an ellipsoid E whose fixed-dimensional dilation covers K. This converts the shape of K into a norm.",
    formula: "a+E ⊆ K ⊆ a+αₙE   with αₙ depending only on n",
    insight: "The inner ellipsoid measures the long and thin directions of the polytope without enumerating lattice points.",
    scene: baseScene([
      { kind: "ellipse", at: center, radiusX: 1.05, radiusY: 0.27, rotation: Math.PI / 4, label: "a+E", color: "#a7a0ed", opacity: 0.11 },
      { kind: "ellipse", at: center, radiusX: 2.35, radiusY: 0.82, rotation: Math.PI / 4, label: "a+α₂E", color: "#79c9c0", opacity: 0.025, dashed: true },
      { kind: "point", at: center, label: "center a", style: "fractional" },
    ]),
  },
  {
    id: "ellipsoid-norm",
    kicker: "06 · Adapted geometry",
    title: "The ellipsoid defines the norm used by lattice reduction",
    description:
      "If E={x:xᵀD⁻¹x≤1}, then ‖z‖E=√(zᵀD⁻¹z). A vector along the long axis is short in this norm; a vector crossing the thin axis is expensive.",
    formula: "‖z‖E=√(zᵀD⁻¹z)",
    insight: "This is how the continuous shape of K tells LLL which lattice directions matter.",
    scene: baseScene([
      { kind: "ellipse", at: center, radiusX: 1.05, radiusY: 0.27, rotation: Math.PI / 4, label: "unit ball of ‖·‖E", color: "#a7a0ed", opacity: 0.11 },
      { kind: "vector", from: center, to: [3.25, 3.05], label: "cheap direction", color: "#79c9c0", animate: true },
      { kind: "vector", from: center, to: [2.25, 2.65], label: "expensive direction", color: "#e88d99", animate: true },
    ]),
  },
  {
    id: "lll-basis",
    kicker: "07 · LLL reduction",
    title: "Reduce ℤ² in the ellipsoid norm",
    description:
      "LLL returns the unimodular basis b₁=(1,1), b₂=(1,2). The first vector follows the long axis; the second supplies the independent thin component.",
    formula: "B=[b₁ b₂]=[[1,1],[1,2]],   det(B)=1",
    insight: "Unimodularity means Λ(B)=ℤ²: the basis changes coordinates but not the lattice.",
    scene: baseScene([
      { kind: "ellipse", at: center, radiusX: 1.05, radiusY: 0.27, rotation: Math.PI / 4, label: "E", color: "#a7a0ed", opacity: 0.08 },
      vector(basis[0], "b₁=(1,1)", "#f49a4a"),
      vector(basis[1], "b₂=(1,2)", "#79c9c0"),
    ]),
  },
  {
    id: "dual-basis",
    kicker: "08 · Dual coordinates",
    title: "Compute the dual basis to read lattice layers",
    description:
      "The dual vectors satisfy ⟨bᵢ*,bⱼ⟩=1 for i=j and 0 otherwise. The last dual vector will become the branching direction.",
    formula: "B⁻ᵀ=[b₁* b₂*]=[[2,−1],[−1,1]],   b₂*=(−1,1)",
    insight: "Because b₂* is integral, every lattice point lies on one integer-valued hyperplane b₂*ᵀx=δ.",
    scene: baseScene([
      vector(dualBasis[0], "b₁*=(2,−1)", "#d4ef77"),
      vector(dualBasis[1], "b₂*=(−1,1)", "#e88d99"),
      { kind: "label", at: [3.1, 5], text: "BᵀB*=I", tone: "accent" },
    ]),
  },
  {
    id: "center-coordinates",
    kicker: "09 · Nearest-plane attempt",
    title: "Express the ellipsoid center in the reduced basis",
    description:
      "Solve a=λ₁b₁+λ₂b₂. For a=(2.55,2.35), the coordinates are λ=(2.75,−0.20). FIXIP first tries the coefficient-wise floor prescribed by the algorithm.",
    formula: "λ=B⁻¹a=(2.75,−0.20)",
    insight: "This cheap candidate often succeeds and avoids all recursion.",
    scene: baseScene([
      vector([2, 2], "2b₁", "#f49a4a"),
      { kind: "vector", from: [2, 2], to: center, label: "0.75b₁−0.20b₂", color: "#a7a0ed", animate: true },
      { kind: "point", at: center, label: "a=(2.55,2.35)", style: "fractional" },
    ]),
  },
  {
    id: "rounded-candidate",
    kicker: "10 · Fast membership test",
    title: "Floor the basis coordinates and test the lattice candidate",
    description:
      "Flooring gives (2,−1), hence x*=2b₁−b₂=(1,0). It is integral but violates K, so FIXIP must expose the thin lattice direction instead.",
    formula: "x*=Σᵢ⌊λᵢ⌋bᵢ=2b₁−b₂=(1,0)∉K",
    insight: "Failure is useful: together with LLL reduction it implies that only boundedly many layers can intersect K.",
    scene: baseScene([
      { kind: "point", at: roundedCandidate, animateFrom: center, label: "x*=(1,0) · rejected", style: "graph-node-invalid" },
      { kind: "line", from: roundedCandidate, to: center, label: "round basis coordinates", style: "graph-edge-rejected", color: "#e88d99", animate: true },
    ]),
  },
  {
    id: "flat-direction",
    kicker: "11 · Flachheitsrichtung",
    title: "Choose c=b₂* as the integral branching direction",
    description:
      "The last dual vector is orthogonal to b₁, the long reduced-basis direction. Its level sets therefore cut across the thin direction of K.",
    formula: "c=bₙ*=b₂*=(−1,1),   cᵀb₁=0,   cᵀb₂=1",
    insight: "This is geometric branching: FIXIP branches on parallel lattice hyperplanes, not necessarily on a coordinate variable.",
    scene: baseScene([
      vector(flatDirection, "c=(−1,1)", "#e88d99"),
      slice(-1, "#7ecbc4"),
      slice(0, "#a7a0ed"),
      slice(1, "#d4ef77"),
    ]),
  },
  {
    id: "integer-width",
    kicker: "12 · Bounded width",
    title: "Optimize cᵀx over K to obtain the possible layer indices",
    description:
      "Two LPs give the minimum and maximum layer value. Since c is integral, an integer point can occur only for integer δ between the rounded endpoints.",
    formula: "δmin=⌈minₓ∈K cᵀx⌉=−1,   δmax=⌊maxₓ∈K cᵀx⌋=1",
    insight: "LLL and ellipsoid rounding bound δmax−δmin by a function of n alone.",
    scene: baseScene([
      slice(-1, "#7ecbc4"),
      slice(1, "#d4ef77"),
      { kind: "vector", from: [1.5, 0.5], to: [2.9, 3.9], label: "width w(K,c)=2", color: "#e88d99", animate: true },
    ]),
  },
  {
    id: "enumerate-layers",
    kicker: "13 · Finite branching",
    title: "Enumerate every integer hyperplane that can meet K",
    description:
      "Only H−1, H0, and H1 need recursive calls. All other lattice layers miss K, so no integer point can hide outside these three branches.",
    formula: "δ∈{−1,0,1},   Hδ={x∈ℝ²:cᵀx=δ}",
    insight: "The number of children is independent of the numerical size of the input when n is fixed.",
    scene: baseScene([slice(-1, "#7ecbc4"), slice(0, "#a7a0ed"), slice(1, "#d4ef77")]),
  },
  {
    id: "branch-minus-one",
    kicker: "14 · Branch δ=−1",
    title: "Intersect K with the first affine lattice hyperplane",
    description:
      "The slice H−1 has parameterization x=(t,t−1). Its intersection with K is the short segment 1.2≤t≤1.8.",
    formula: "K₋₁=K∩{−x₁+x₂=−1}={ (t,t−1):1.2≤t≤1.8 }",
    insight: "The two-dimensional polytope has become a one-dimensional rational interval.",
    scene: baseScene([
      slice(-1),
      { kind: "line", from: [1.2, 0.2], to: [1.8, 0.8], label: "K₋₁", style: "objective", color: "#e88d99", animate: true },
    ]),
  },
  {
    id: "hnf-minus-one",
    kicker: "15 · Hermite normal form",
    title: "HNF converts the affine slice into integer coordinates",
    description:
      "For c=(−1,1), HNF supplies offset d−1=(0,−1) and basis B′=(1,1). Every integer point on H−1 is d−1+B′t with t∈ℤ.",
    formula: "H₋₁∩ℤ²=d₋₁+Λ(B′),   d₋₁=(0,−1),   B′=(1,1)",
    insight: "HNF preserves the complete lattice structure while eliminating one dimension.",
    scene: baseScene([
      slice(-1),
      { kind: "point", at: [0, -1], label: "d₋₁", style: "integer" },
      { kind: "vector", from: [0, -1], to: [1, 0], label: "B′=(1,1)", color: "#79c9c0", animate: true },
      ...[[1, 0], [2, 1], [3, 2], [4, 3]].map((at): Primitive => ({ kind: "point", at: at as Point2D, style: "integer" })),
    ]),
  },
  {
    id: "reject-minus-one",
    kicker: "16 · Recursive base case",
    title: "The first child is empty over the integers",
    description:
      "The reduced interval is [1.2,1.8]. It contains no integer t because ⌈1.2⌉=2>1=⌊1.8⌋. The child returns EMPTY.",
    formula: "FIXIP₁([1.2,1.8])=EMPTY",
    insight: "Continuous intersection is not enough: the slice is nonempty, but it contains no lattice point.",
    scene: treeScene([
      treeNode([5, 5.7], "FIXIP₂(K)"),
      treeEdge([5, 5.45], [3, 3.5], "δ=−1", true),
      treeNode([3, 3.2], "[1.2,1.8]", "graph-node-invalid"),
      { kind: "label", at: [3, 1.7], text: "EMPTY · no integer t", tone: "accent" },
    ], "first branch pruned exactly"),
  },
  {
    id: "branch-zero",
    kicker: "17 · Branch δ=0",
    title: "The next slice contains diagonal lattice points",
    description:
      "For δ=0, HNF gives d0=(0,0), B′=(1,1), and x=(t,t). Intersecting with K yields 1.4≤t≤3.4.",
    formula: "K₀={ (t,t):1.4≤t≤3.4 },   t∈ℤ",
    insight: "The reduced interval contains t=2 and t=3, so the recursive call can return immediately.",
    scene: baseScene([
      slice(0, "#a7a0ed"),
      { kind: "line", from: [1.4, 1.4], to: [3.4, 3.4], label: "K₀", style: "objective", color: "#a7a0ed", animate: true },
      { kind: "point", at: [2, 2], label: "t=2", style: "optimum" },
      { kind: "point", at: [3, 3], label: "t=3", style: "integer" },
    ]),
  },
  {
    id: "return-solution",
    kicker: "18 · Return through recursion",
    title: "Lift the one-dimensional answer back to the original IP",
    description:
      "The base case returns t=2. HNF lifts it to x=d0+B′t=(2,2), which satisfies Ax≤b and is integral. FIXIP₂ returns the same point.",
    formula: "t=2  ⇒  x=(0,0)+(1,1)·2=(2,2)∈K∩ℤ²",
    insight: "Once one child succeeds, the remaining layer δ=1 need not be explored.",
    scene: treeScene([
      treeNode([5, 5.8], "FIXIP₂(K)", "graph-node-active"),
      treeEdge([5, 5.55], [2.3, 3.5], "δ=−1", true),
      treeEdge([5, 5.55], [5, 3.5], "δ=0"),
      treeEdge([5, 5.55], [7.7, 3.5], "δ=1 · skipped"),
      treeNode([2.3, 3.2], "EMPTY", "graph-node-invalid"),
      treeNode([5, 3.2], "t=2", "graph-node-active"),
      treeNode([7.7, 3.2], "not explored"),
      treeEdge([5, 2.95], [5, 1.3], "lift x=d₀+B′t"),
      treeNode([5, 1], "x=(2,2)", "graph-node-active"),
    ], "successful child returns an integer point"),
  },
  {
    id: "polynomiality",
    kicker: "19 · Why fixed dimension matters",
    title: "Depth is n and branching depends only on n",
    description:
      "Every recursive step reduces dimension by one. Ellipsoid rounding and LLL bound the number of δ-values by f(n), so for fixed n the recursion tree has constant-size exponent and all remaining work is polynomial.",
    formula: "T(n)≤N(n)·T(n−1)+poly(⟨A,b⟩),   n fixed",
    insight: "If n were part of the input, the dimension-dependent branching factor would no longer be a constant.",
    scene: treeScene([
      treeNode([5, 6], "dimension n", "graph-node-active"),
      treeEdge([5, 5.75], [3.5, 4.5], "≤N(n) branches"),
      treeEdge([5, 5.75], [6.5, 4.5]),
      treeNode([3.5, 4.2], "dimension n−1"),
      treeNode([6.5, 4.2], "dimension n−1"),
      treeEdge([3.5, 3.95], [3.5, 2.6], "…"),
      treeEdge([6.5, 3.95], [6.5, 2.6], "…"),
      treeNode([3.5, 2.3], "dimension 1"),
      treeNode([6.5, 2.3], "dimension 1"),
      { kind: "label", at: [5, 1], text: "depth exactly n", tone: "accent" },
    ], "bounded branching · decreasing dimension"),
  },
];

const visualization: VisualizationDefinition = {
  id: "fixip-algorithm",
  title: "FIXIP: Integer Programming in Fixed Dimension",
  shortTitle: "FIXIP algorithm",
  chapter: "Lattice theory",
  order: 6,
  description:
    "Follow Lenstra’s fixed-dimension integer-programming algorithm from ellipsoid rounding and LLL reduction through flatness branching, HNF, and recursive dimension reduction.",
  difficulty: "Advanced",
  duration: 24,
  accent: "#a7a0ed",
  visualLabel: "FIXIP geometry",
  insightLabel: "FIXIP invariant",
  controls: { constraints: true, grid: true, lattice: false, vertices: true, labels: true },
  stages,
  proof: {
    title: "Why is FIXIP correct and polynomial for fixed n?",
    steps: [
      "Preprocessing parameterizes lower-dimensional input, so the main routine may assume K is full-dimensional.",
      "Ellipsoid rounding finds a+E⊆K⊆a+αₙE and turns E into a norm that records the shape of K.",
      "LLL produces a reduced unimodular basis B of ℤⁿ in this ellipsoid norm; flooring the coordinates of a gives a first integer candidate.",
      "If that candidate is infeasible, the last dual vector c=bₙ* exposes a thin integral direction whose width is bounded solely as a function of n.",
      "Every integer x has cᵀx∈ℤ, so every possible solution lies on one of the finitely many enumerated hyperplanes cᵀx=δ.",
      "HNF writes each affine lattice slice as dδ+Λ(B′), converting it into an integer program of dimension n−1 without losing any lattice point.",
      "Induction proves correctness: a successful child lifts to K∩ℤⁿ; if every child is EMPTY, the complete layer cover proves K∩ℤⁿ=∅.",
      "The recursion depth is n and the number of children depends only on n. With n fixed, ellipsoid, LLL, HNF, and LP subroutines are polynomial in the input encoding length.",
    ],
  },
};

export default visualization;
