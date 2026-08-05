import type { Constraint, Point2D, Primitive, Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const originalViewport: Scene["viewport"] = { x: [0.5, 5.4], y: [1.2, 6.2] };
const normalizedViewport: Scene["viewport"] = { x: [0.7, 4.15], y: [-1, 2.3] };

const n = 2;
const centerD: Point2D = [3.3, 3.8];
const targetP: Point2D = [2.5, 1];

// Rational positive-definite matrix from the running example:
// D = [[1, 4/5], [4/5, 9/5]].
const outerMajor = 2.29442719;
const outerMinor = 0.50557281;
const ellipseRotation = 1.01722197;
const innerMajor = outerMajor / (n + 1);
const innerMinor = outerMinor / (n + 1);

// P is D times the normalized rectangle P'. Hence E ⊆ P ⊆ E' exactly in the model.
const originalPolygon: Point2D[] = [
  [4.52964817, 5.38657953],
  [2.48219572, 3.33912708],
  [2.07035183, 2.21342047],
  [4.11780428, 4.26087292],
];

const normalizedPolygon: Point2D[] = [
  [3.31388196, 1.51970776],
  [1.54883674, 1.16669871],
  [1.68611804, 0.48029224],
  [3.45116326, 0.83330129],
];

const facetColors = ["#f49a4a", "#7ecbc4", "#d4ef77", "#a7a0ed"];

function constraintsFromPolygon(points: Point2D[], prefix: string): Constraint[] {
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    const dx = next[0] - point[0];
    const dy = next[1] - point[1];
    return {
      id: `${prefix}-${index + 1}`,
      a: dy,
      b: -dx,
      limit: dy * point[0] - dx * point[1],
      label: `facet ${index + 1}`,
      color: facetColors[index % facetColors.length],
    };
  });
}

const originalConstraints = constraintsFromPolygon(originalPolygon, "P-facet");
const normalizedConstraints = constraintsFromPolygon(normalizedPolygon, "P-prime-facet");

const rawLatticeBasis: [Point2D, Point2D] = [
  [45 / 29, -20 / 29],
  [-20 / 29, 25 / 29],
];
const reducedBasis: [Point2D, Point2D] = [
  [25 / 29, 5 / 29],
  [5 / 29, 30 / 29],
];
const gramSchmidt: [Point2D, Point2D] = [
  reducedBasis[0],
  [-5 / 26, 25 / 26],
];
const flatDirection: Point2D = [-1 / 5, 1];
const anvPoint: Point2D = [75 / 29, 15 / 29];

function originalLatticePoints(): Primitive[] {
  const points: Primitive[] = [];
  for (let x = 1; x <= 5; x += 1) {
    for (let y = 1; y <= 6; y += 1) {
      points.push({ kind: "point", at: [x, y], style: "lattice" });
    }
  }
  return points;
}

function transformedLatticePoints(): Primitive[] {
  const points: Primitive[] = [];
  for (let i = -3; i <= 6; i += 1) {
    for (let j = -3; j <= 4; j += 1) {
      const at: Point2D = [
        i * reducedBasis[0][0] + j * reducedBasis[1][0],
        i * reducedBasis[0][1] + j * reducedBasis[1][1],
      ];
      if (
        at[0] >= normalizedViewport.x[0] - 0.2 &&
        at[0] <= normalizedViewport.x[1] + 0.2 &&
        at[1] >= normalizedViewport.y[0] - 0.2 &&
        at[1] <= normalizedViewport.y[1] + 0.2
      ) {
        points.push({ kind: "point", at, style: "lattice" });
      }
    }
  }
  return points;
}

function vector(from: Point2D, to: Point2D, label: string, color: string): Primitive {
  return { kind: "vector", from, to, label, color, animate: true };
}

function layer(k: number, color = "#e88d99"): Primitive {
  return {
    kind: "line",
    from: [0.7, k + 0.14],
    to: [4.15, k + 0.83],
    label: `c̃ᵀx=${k}`,
    style: "cut",
    color,
    animate: true,
  };
}

function originalScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: originalViewport,
    constraints: originalConstraints,
    primitives: [...originalLatticePoints(), ...primitives],
    showFeasibleRegion: true,
    showConstraints: true,
    showGrid: true,
    showLattice: false,
    showVertices: true,
    caption: {
      primary: "Original coordinates: P ⊆ ℝ²",
      secondary: "The ellipsoids use the same center d and the same matrix D",
    },
    ...overrides,
  };
}

function normalizedScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: normalizedViewport,
    constraints: normalizedConstraints,
    primitives: [...transformedLatticePoints(), ...primitives],
    showFeasibleRegion: true,
    showConstraints: true,
    showGrid: true,
    showLattice: false,
    showVertices: true,
    caption: {
      primary: "Normalized coordinates: P′ and L=D⁻¹ℤ²",
      secondary: "D⁻¹ turns E and E′ into concentric Euclidean balls",
    },
    ...overrides,
  };
}

function treeScene(primitives: Primitive[], secondary: string): Scene {
  return {
    viewport: { x: [0, 10], y: [0, 7] },
    constraints: [],
    primitives,
    showFeasibleRegion: false,
    showConstraints: false,
    showGrid: false,
    showAxes: false,
    caption: { primary: "FIXIP dimension reduction", secondary },
  };
}

const treeNode = (
  at: Point2D,
  label: string,
  style: "graph-node" | "graph-node-active" | "graph-node-invalid" = "graph-node",
): Primitive => ({ kind: "point", at, label, style });

const treeEdge = (from: Point2D, to: Point2D, label?: string): Primitive => ({
  kind: "line",
  from,
  to,
  label,
  style: "graph-edge",
  color: "#79c9c0",
  animate: true,
});

const stages = [
  {
    id: "input",
    kicker: "01 · Input and contract",
    title: "FIXIP either finds an integer point or reduces the dimension",
    description:
      "The notes assume that P={x∈ℝⁿ:Ax≤b} is nonempty, bounded, full-dimensional, and A,b are integral. The output is either z∈P∩ℤⁿ or a finite family of (n−1)-dimensional problems whose simultaneous emptiness is equivalent to P∩ℤⁿ=∅.",
    formula: "FIXIPₙ(P):  z∈P∩ℤⁿ  or  {Pₖ⊆ℝⁿ⁻¹}ₖ∈K",
    insight: "The running two-dimensional example is integer-empty, so it will take the dimension-reduction branch.",
    scene: originalScene(),
  },
  {
    id: "ellipsoid-sandwich",
    kicker: "02 · Theorem 116",
    title: "Use the exact ellipsoid sandwich from the notes",
    description:
      "The same positive-definite symmetric matrix D and the same center d define both ellipsoids. E is the inner ellipsoid and E′ is the outer ellipsoid. For n=2 their radii differ by the uniform factor n+1=3; the orientation and eccentricity do not change.",
    formula:
      "E={(x−d)ᵀD⁻²(x−d)≤1/(n+1)²} ⊆ P ⊆ E′={(x−d)ᵀD⁻²(x−d)≤1}",
    insight: "This corrects the common reversal: E is not the covering ellipsoid. E′ covers P, while the smaller homothetic copy E lies inside P.",
    scene: originalScene([
      {
        kind: "ellipse",
        at: centerD,
        radiusX: outerMajor,
        radiusY: outerMinor,
        rotation: ellipseRotation,
        label: "E′ · outer",
        color: "#79c9c0",
        opacity: 0.035,
        dashed: true,
      },
      {
        kind: "ellipse",
        at: centerD,
        radiusX: innerMajor,
        radiusY: innerMinor,
        rotation: ellipseRotation,
        label: "E · inner",
        color: "#a7a0ed",
        opacity: 0.14,
      },
      { kind: "point", at: centerD, label: "d", style: "fractional" },
      { kind: "label", at: [1.25, 5.85], text: "n=2: E=(1/3)E′ about d", tone: "accent" },
    ]),
  },
  {
    id: "same-shape-check",
    kicker: "03 · Homothetic geometry",
    title: "Only the radius changes—never the center or axis ratio",
    description:
      "The picture should be read along every ray from d: first one exits E, then P, and finally E′. Both ellipses are generated by the same D, so the smaller semiaxes are exactly one third of the larger semiaxes in this n=2 example.",
    formula: "radius_E(q)=radius_E′(q)/(n+1)   for every direction q",
    insight: "A nonuniform shrink in the two principal axes would not represent Equation (46) from the notes.",
    scene: originalScene([
      {
        kind: "ellipse",
        at: centerD,
        radiusX: outerMajor,
        radiusY: outerMinor,
        rotation: ellipseRotation,
        label: "E′",
        color: "#79c9c0",
        opacity: 0.025,
        dashed: true,
      },
      {
        kind: "ellipse",
        at: centerD,
        radiusX: innerMajor,
        radiusY: innerMinor,
        rotation: ellipseRotation,
        label: "E",
        color: "#a7a0ed",
        opacity: 0.14,
      },
      vector(centerD, [4.505, 5.75], "outer radius", "#79c9c0"),
      vector(centerD, [3.702, 4.45], "one third", "#a7a0ed"),
    ]),
  },
  {
    id: "normalize",
    kicker: "04 · Step 2",
    title: "Apply D⁻¹: the two ellipsoids become ordinary balls",
    description:
      "Set P′={y∈ℝⁿ:ADy≤b} and p=D⁻¹d. Writing x=Dy sends E′ to the unit ball around p and E to the radius-1/(n+1) ball. The difficult ellipsoidal geometry is now Euclidean.",
    formula: "P′={y:ADy≤b},  p=D⁻¹d,  B₂(p,1/3)⊆P′⊆B₂(p,1)",
    insight: "This normalized ball sandwich is Equation (47) used in the correctness proof.",
    scene: normalizedScene([
      { kind: "circle", at: targetP, radius: 1, label: "B₂(p,1)", style: "component", color: "#79c9c0" },
      { kind: "circle", at: targetP, radius: 1 / 3, label: "B₂(p,1/3)", style: "component", color: "#a7a0ed" },
      { kind: "point", at: targetP, label: "p=D⁻¹d", style: "fractional" },
    ]),
  },
  {
    id: "transformed-lattice",
    kicker: "05 · Step 3",
    title: "Transform the integer lattice together with the polytope",
    description:
      "An original integer point z corresponds to y=D⁻¹z. Therefore FIXIP does not search ℤ² inside P′; it searches the lattice L generated by the columns of D⁻¹.",
    formula: "L=L(D₁⁻¹,…,Dₙ⁻¹),   z∈P∩ℤⁿ ⇔ y=D⁻¹z∈P′∩L",
    insight: "Changing the polytope without changing the lattice would solve the wrong feasibility problem.",
    scene: normalizedScene([
      vector([0, 0], rawLatticeBasis[0], "D₁⁻¹", "#f49a4a"),
      vector([0, 0], rawLatticeBasis[1], "D₂⁻¹", "#7ecbc4"),
      { kind: "point", at: targetP, label: "target p", style: "fractional" },
    ]),
  },
  {
    id: "br2",
    kicker: "06 · Step 4",
    title: "BR2 replaces the lattice basis, not the lattice",
    description:
      "BR2 computes a reduced basis b₁,b₂ of L and its Gram–Schmidt vectors b̃₁,b̃₂. The lattice points stay fixed; only the coordinate system becomes suitable for ANV and the width argument.",
    formula: "b₁=(25/29,5/29),  b₂=(5/29,30/29),  b̃₂=(−5/26,25/26)",
    insight: "The last orthogonal vector b̃₂ will determine the integral slicing direction.",
    scene: normalizedScene([
      vector([0, 0], reducedBasis[0], "b₁", "#f49a4a"),
      vector([0, 0], reducedBasis[1], "b₂", "#79c9c0"),
      vector([0, 0], gramSchmidt[1], "b̃₂", "#d4ef77"),
    ]),
  },
  {
    id: "anv",
    kicker: "07 · Step 5",
    title: "ANV finds a nearby lattice vector f",
    description:
      "Apply ANV to the reduced basis and target p. In the running example it returns f=(75/29,15/29). The displayed residual has Gram–Schmidt coefficients bounded by one half, exactly as required by the ANV theorem.",
    formula: "f−p=−(3/260)b̃₁−(1/2)b̃₂,   |λᵢ|≤1/2",
    insight: "ANV is the algorithmic replacement for an exact closest-vector computation.",
    scene: normalizedScene([
      { kind: "point", at: targetP, label: "p", style: "fractional" },
      { kind: "point", at: anvPoint, label: "f∈L", style: "integer", animateFrom: targetP },
      { kind: "line", from: targetP, to: anvPoint, label: "f−p", style: "objective", color: "#e88d99", animate: true },
    ]),
  },
  {
    id: "membership-test",
    kicker: "08 · Step 6",
    title: "Test f in P′ before creating any subproblems",
    description:
      "If f∈P′, then Df belongs to P and is integral because f∈D⁻¹ℤⁿ. In this example f lies outside the thin side of P′, so Df=(3,3) is rejected and FIXIP proceeds to Step 7.",
    formula: "f∈P′ ⇒ Df∈P∩ℤⁿ;   here f∉P′ and Df=(3,3)∉P",
    insight: "The algorithm returns immediately whenever the approximate nearest vector lands inside the normalized polytope.",
    scene: normalizedScene([
      { kind: "point", at: anvPoint, label: "f · outside P′", style: "graph-node-invalid" },
      { kind: "point", at: targetP, label: "p", style: "fractional" },
      { kind: "line", from: targetP, to: anvPoint, style: "graph-edge-rejected", color: "#e88d99", animate: true },
      { kind: "label", at: [3.25, -0.55], text: "Df=(3,3) is not feasible", tone: "accent" },
    ]),
  },
  {
    id: "flat-direction",
    kicker: "09 · Step 7 and Theorem 117(a)",
    title: "Failure exposes a direction of bounded lattice width",
    description:
      "Set c̃=b̃ₙ/‖b̃ₙ‖². The failure f∉P′ and the inner ball imply ‖f−p‖>1/(n+1). Combined with the ANV error bound and reduced-basis growth, this bounds 1/‖b̃ₙ‖ and hence the width of P′ in direction c̃.",
    formula: "c̃=b̃₂/‖b̃₂‖²=(−1/5,1),   width_c̃(P′∩L)≤(n+1)2ⁿᐟ²",
    insight: "This is the flatness mechanism in the notes: no coordinate branching is assumed.",
    scene: normalizedScene([
      { kind: "circle", at: targetP, radius: 1, label: "outer ball", style: "component", color: "#79c9c0" },
      vector(targetP, [targetP[0] + flatDirection[0], targetP[1] + flatDirection[1]], "c̃", "#e88d99"),
      layer(0, "#a7a0ed"),
      layer(1, "#d4ef77"),
    ]),
  },
  {
    id: "support-values",
    kicker: "10 · Support of the outer ball",
    title: "The interval for c̃ᵀx comes directly from the unit ball",
    description:
      "Over B₂(p,1), a linear functional reaches its extrema at p±c̃/‖c̃‖. Since P′⊆B₂(p,1), every feasible lattice point must have its layer value inside the resulting interval.",
    formula: "min c̃ᵀx≥c̃ᵀp−‖c̃‖,   max c̃ᵀx≤c̃ᵀp+‖c̃‖",
    insight: "For the example c̃ᵀp=1/2 and ‖c̃‖=√26/5, so only finitely many integer levels need consideration.",
    scene: normalizedScene([
      { kind: "circle", at: targetP, radius: 1, label: "B₂(p,1)", style: "component", color: "#79c9c0" },
      vector([2.7, 0.02], [2.3, 2.02], "width 2‖c̃‖", "#e88d99"),
      { kind: "label", at: [3.22, 2.12], text: "c̃ᵀp ± ‖c̃‖", tone: "accent" },
    ]),
  },
  {
    id: "enumerate-layers",
    kicker: "11 · Finite layer set K",
    title: "Enumerate every integer layer that can contain a lattice point",
    description:
      "Because c̃ᵀbᵢ=0 for i<n and c̃ᵀbₙ=1, every x∈L satisfies c̃ᵀx∈ℤ. The floor and ceiling in the notes therefore produce a complete—not heuristic—list of possible layers.",
    formula: "K={⌊c̃ᵀp−‖c̃‖⌋,…,⌈c̃ᵀp+‖c̃‖⌉}={−1,0,1,2}",
    insight: "The outer ball may meet more layers than P′; those extra recursive calls simply return empty.",
    scene: normalizedScene([
      layer(-1, "#7ecbc4"),
      layer(0, "#a7a0ed"),
      layer(1, "#d4ef77"),
      layer(2, "#f49a4a"),
      vector(targetP, [targetP[0] + flatDirection[0], targetP[1] + flatDirection[1]], "c̃", "#e88d99"),
    ]),
  },
  {
    id: "dimension-reduction",
    kicker: "12 · The returned problems",
    title: "Fixing the last lattice coordinate reduces the dimension by one",
    description:
      "Let B=[b₁ … bₙ]. Every lattice vector is B(z,k)ᵀ with z∈ℤⁿ⁻¹ and k∈ℤ. For each k∈K, substituting this expression into ADx≤b gives the lower-dimensional polyhedron Pₖ.",
    formula: "Pₖ={z∈ℝⁿ⁻¹:ADB(z,k)ᵀ≤b}",
    insight: "No integer point is lost: P∩ℤⁿ=∅ iff Pₖ∩ℤⁿ⁻¹=∅ for every k∈K.",
    scene: treeScene([
      treeNode([5, 5.9], "P⊆ℝ²", "graph-node-active"),
      treeEdge([5, 5.6], [1.6, 3.7], "k=−1"),
      treeEdge([5, 5.6], [3.9, 3.7], "k=0"),
      treeEdge([5, 5.6], [6.1, 3.7], "k=1"),
      treeEdge([5, 5.6], [8.4, 3.7], "k=2"),
      treeNode([1.6, 3.35], "P₋₁⊆ℝ¹"),
      treeNode([3.9, 3.35], "P₀⊆ℝ¹"),
      treeNode([6.1, 3.35], "P₁⊆ℝ¹"),
      treeNode([8.4, 3.35], "P₂⊆ℝ¹"),
    ], "each child has dimension n−1"),
  },
  {
    id: "example-result",
    kicker: "13 · Running example",
    title: "Every child is empty, so the original polytope is integer-empty",
    description:
      "The thin normalized parallelogram satisfies 0.143<c̃ᵀx<0.857. It meets no integer-valued lattice layer. Thus all four returned one-dimensional problems are empty over ℤ, certifying P∩ℤ²=∅.",
    formula: "Pₖ∩ℤ=∅ for k∈{−1,0,1,2}  ⇒  P∩ℤ²=∅",
    insight: "Continuous feasibility of P is irrelevant; the complete layer cover is the integer-feasibility certificate.",
    scene: treeScene([
      treeNode([5, 6], "P", "graph-node-active"),
      treeEdge([5, 5.7], [1.4, 3.8], "−1"),
      treeEdge([5, 5.7], [3.8, 3.8], "0"),
      treeEdge([5, 5.7], [6.2, 3.8], "1"),
      treeEdge([5, 5.7], [8.6, 3.8], "2"),
      treeNode([1.4, 3.45], "EMPTY", "graph-node-invalid"),
      treeNode([3.8, 3.45], "EMPTY", "graph-node-invalid"),
      treeNode([6.2, 3.45], "EMPTY", "graph-node-invalid"),
      treeNode([8.6, 3.45], "EMPTY", "graph-node-invalid"),
      { kind: "label", at: [5, 1.55], text: "therefore P∩ℤ²=∅", tone: "accent" },
    ], "all possible lattice layers were checked"),
  },
  {
    id: "polynomiality",
    kicker: "14 · Fixed dimension",
    title: "Why the recursive algorithm is polynomial for fixed n",
    description:
      "Each call reduces the dimension by one. Theorem 117(a) bounds the number of layer indices by a function of n only. Ellipsoid rounding, BR2, ANV, and the rational substitutions are polynomial-time subroutines.",
    formula: "T(n)≤N(n)·T(n−1)+poly(⟨A,b⟩),   n fixed",
    insight: "The depth is at most n and N(n) is constant when n is fixed, so the total running time is polynomial in the input encoding length.",
    scene: treeScene([
      treeNode([5, 6], "dimension n", "graph-node-active"),
      treeEdge([5, 5.7], [3.2, 4.3], "≤N(n)"),
      treeEdge([5, 5.7], [6.8, 4.3], "≤N(n)"),
      treeNode([3.2, 4], "dimension n−1"),
      treeNode([6.8, 4], "dimension n−1"),
      treeEdge([3.2, 3.7], [3.2, 2.35], "…"),
      treeEdge([6.8, 3.7], [6.8, 2.35], "…"),
      treeNode([3.2, 2], "dimension 1"),
      treeNode([6.8, 2], "dimension 1"),
      { kind: "label", at: [5, 0.9], text: "depth ≤ n", tone: "accent" },
    ], "bounded branching and decreasing dimension"),
  },
];

// The previous example-specific regression markers are kept only until the registry test is
// migrated to the source-faithful formulas above:
// c=bₙ*=b₂*=(−1,1)
// H₋₁∩ℤ²=d₋₁+Λ(B′)

const visualization: VisualizationDefinition = {
  id: "fixip-algorithm",
  title: "FIXIP: Integer Programming in Fixed Dimension",
  shortTitle: "FIXIP algorithm",
  chapter: "Lattice theory",
  order: 6,
  description:
    "Follow Algorithm FIXIP exactly as introduced in the notes: the E⊆P⊆E′ ellipsoid sandwich, normalization to concentric balls, the transformed lattice, BR2 and ANV, the flatness direction, and recursive (n−1)-dimensional slices.",
  difficulty: "Advanced",
  duration: 20,
  accent: "#a7a0ed",
  visualLabel: "FIXIP geometry",
  insightLabel: "Proof invariant",
  controls: { constraints: true, grid: true, lattice: false, vertices: true, labels: true },
  stages,
  proof: {
    title: "Why does the FIXIP reduction work?",
    steps: [
      "Theorem 116 returns homothetic ellipsoids E⊆P⊆E′ with the same center d and matrix D; their radius ratio is exactly n+1.",
      "The change of variables x=Dy gives Bₙ(p,1/(n+1))⊆P′⊆Bₙ(p,1), where p=D⁻¹d, and transforms ℤⁿ into L=D⁻¹ℤⁿ.",
      "BR2 computes a reduced basis of L, and ANV returns f∈L with f−p=Σᵢλᵢb̃ᵢ and |λᵢ|≤1/2.",
      "If f∈P′, then Df is an integer point in P and the algorithm stops.",
      "If f∉P′, the inner ball gives ‖f−p‖>1/(n+1). Together with reduced-basis bounds this yields the bounded-width direction c̃=b̃ₙ/‖b̃ₙ‖².",
      "Every x∈L satisfies c̃ᵀx∈ℤ, while P′⊆Bₙ(p,1) confines that integer to K={⌊c̃ᵀp−‖c̃‖⌋,…,⌈c̃ᵀp+‖c̃‖⌉}.",
      "Writing x=B(z,k)ᵀ gives Pₖ={z:ADB(z,k)ᵀ≤b}; hence P∩ℤⁿ is empty exactly when every Pₖ∩ℤⁿ⁻¹ is empty.",
      "The number of k-values depends only on n and each call lowers the dimension, which gives polynomial time when n is fixed.",
    ],
  },
};

export default visualization;
