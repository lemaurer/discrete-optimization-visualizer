import type { Mesh3D, Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS as COLORS,
  label2D,
  line2D,
  marker3D,
  plane3D,
  point2D,
  scene2D,
  scene3D,
} from "@/visualizations/helpers/tdi-scenes";

function polygon(points: Point2D[], label: string, style: "feasible" | "component" = "component"): Primitive {
  return { kind: "polygon", points, label, style };
}

function scene2(
  primitives: Primitive[],
  secondary: string,
  viewport = { x: [-0.2, 4.3] as [number, number], y: [-0.2, 4.7] as [number, number] },
) {
  return scene2D([], primitives, {
    viewport,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: true,
    caption: {
      primary: "Theorem 158 · forall–exist via cells",
      secondary,
    },
  });
}

const C2: Point2D[] = [[2, 1], [1, 3], [3, 2]];
const q2: Point2D[] = [[1, 2], [3, 2], [3, 4], [1, 4]];

function cMarkers2D(): Primitive[] {
  return C2.map((c, index) => point2D(c, `c${index + 1}`, "optimum"));
}

function halfIntegerArrangement2D(): Primitive[] {
  return [
    line2D([0.5, -0.15], [0.5, 4.6], "x₁=0.5", COLORS.muted),
    line2D([1.5, -0.15], [1.5, 4.6], "x₁=1.5", COLORS.orange),
    line2D([2.5, -0.15], [2.5, 4.6], "x₁=2.5", COLORS.muted),
    line2D([-0.15, 0.5], [4.2, 0.5], "x₂=0.5", COLORS.muted),
    line2D([-0.15, 1.5], [4.2, 1.5], "x₂=1.5", COLORS.aqua),
    line2D([-0.15, 2.5], [4.2, 2.5], "x₂=2.5", COLORS.muted),
  ];
}

function shiftedOrthants2D(): Primitive[] {
  return [
    polygon([[1.5, 0.5], [4.2, 0.5], [4.2, 4.6], [1.5, 4.6]], "(c₁−½1)+ℝ²₊"),
    polygon([[0.5, 2.5], [4.2, 2.5], [4.2, 4.6], [0.5, 4.6]], "(c₂−½1)+ℝ²₊"),
    polygon([[2.5, 1.5], [4.2, 1.5], [4.2, 4.6], [2.5, 4.6]], "(c₃−½1)+ℝ²₊"),
  ];
}

const stages2D: VisualizationStage[] = [
  {
    id: "thm158-2d-original",
    kicker: "Chapter 26.2 · Starting point",
    title: "The original forall–exist statement generalizes integer feasibility",
    description:
      "The chapter starts from a convex set Q⊆ℝᵐ and an integer matrix W. We ask whether every integer right-hand side b in Q admits some integer vector x satisfying Wx≤b. For Q={b}, this is ordinary integer feasibility.",
    formula: "∀ b∈Q∩ℤᵐ  ∃ x∈ℤⁿ  such that Wx≤b   (67)",
    insight:
      "The quantifiers make this substantially harder than solving one integer program: a single bad b disproves the statement.",
    scene: scene2(
      [
        polygon(q2, "Q", "feasible"),
        point2D([1, 2], "candidate b", "fractional"),
        label2D([1.25, 4.25], "many integer right-hand sides b must be certified", "accent"),
      ],
      "The geometry is in right-hand-side space ℝᵐ, not in the original x-variable space.",
    ),
  },
  {
    id: "thm158-2d-reduction",
    kicker: "Chapter 26.2 · Reduction stated in the notes",
    title: "The notes reduce (67) to finitely many dominance statements",
    description:
      "The notes cite [17] for a reduction of the general statement to finitely many simpler problems. For each such problem we are given Q and a finite set C⊆ℤᵐ and only need to decide whether every integer b∈Q dominates at least one c∈C. The reduction itself is not proved in the notes; Theorem 158 proves how to decide this reduced problem.",
    formula: "∀ b∈Q∩ℤᵐ  ∃ c∈C : c≤b   (68)",
    insight:
      "After the reduction, the existential domain is finite. Hyperplane arrangements are used to avoid checking infinitely many b individually.",
    scene: scene2(
      [polygon(q2, "Q", "feasible"), ...cMarkers2D(), label2D([0.75, 4.35], "finite C={(2,1),(1,3),(3,2)}", "accent")],
      "Running reduced instance: test whether every integer b in Q dominates one of three c-vectors.",
    ),
  },
  {
    id: "thm158-2d-counterexample",
    kicker: "Theorem 158 · Proof step 1",
    title: "Negate the statement: search for one counterexample b",
    description:
      "A counterexample is an integer b∈Q for which no c∈C satisfies c≤b. Equivalently, for every c there is at least one coordinate i with b_i<c_i. In the running example b=(1,2) is such a point.",
    formula: "b counterexample ⇔ ∀c∈C ∃i: bᵢ<cᵢ",
    insight:
      "The algorithm is a search for a bad right-hand side. If no cell contains one, the forall–exist statement is true.",
    scene: scene2(
      [
        polygon(q2, "Q", "feasible"),
        ...cMarkers2D(),
        point2D([1, 2], "b=(1,2): counterexample", "fractional"),
        label2D([1.25, 1.65], "no c≤b", "accent"),
      ],
      "For each c, at least one coordinate of b is too small.",
    ),
  },
  {
    id: "thm158-2d-half-shift",
    kicker: "Theorem 158 · Proof step 2",
    title: "Integrality lets us replace a strict comparison by a half-integer threshold",
    description:
      "Because b_i and c_i are integers, b_i<c_i is equivalent to b_i≤c_i−1/2. Therefore the only places where the truth of a coordinate comparison can change are the axis-parallel hyperplanes x_i=c_i−1/2.",
    formula: "bᵢ<cᵢ ⇔ bᵢ≤cᵢ−½  for bᵢ,cᵢ∈ℤ",
    insight:
      "The half-unit shift is exactly what makes every integer point lie strictly inside a cell rather than on one of the arrangement hyperplanes.",
    scene: scene2(
      [polygon(q2, "Q", "feasible"), ...halfIntegerArrangement2D(), point2D([1, 2], "b", "fractional")],
      "Arrangement (69): xᵢ=cᵢ−1/2 for every coordinate value appearing in C.",
    ),
  },
  {
    id: "thm158-2d-cells",
    kicker: "Theorem 158 · Proof step 3",
    title: "The half-integer hyperplanes create axis-aligned open cells",
    description:
      "For each coordinate i, sort the distinct values ℓ¹_i<⋯<ℓ^{k_i}_i occurring among c_i. A cell is selected by a tuple (j₁,…,j_m) and is the product of the corresponding open intervals between consecutive half-integer thresholds.",
    formula: "V={x: ℓ^{jᵢ}_i−½ < xᵢ < ℓ^{jᵢ+1}_i−½, i=1,…,m}",
    insight:
      "In the running 2D example there are three distinct values in each coordinate, so the arrangement has (3+1)(3+1)=16 cells.",
    scene: scene2(
      [
        ...halfIntegerArrangement2D(),
        polygon([[0.5, 1.5], [1.5, 1.5], [1.5, 2.5], [0.5, 2.5]], "cell V"),
        point2D([1, 2], "integer b inside V", "fractional"),
        label2D([0.7, 2.8], "V=(0.5,1.5)×(1.5,2.5)", "accent"),
      ],
      "Every integer point belongs to exactly one open cell.",
    ),
  },
  {
    id: "thm158-2d-orthants",
    kicker: "Theorem 158 · Proof step 4",
    title: "Dominance becomes membership in a union of shifted positive orthants",
    description:
      "For an integer b, the existence of c≤b is equivalent to b lying in the union U=⋃_{c∈C}((c−½1)+ℝᵐ₊). The arrangement hyperplanes are exactly the boundary hyperplanes of these shifted orthants.",
    formula: "U=⋃_{c∈C} ((c−½1)+ℝᵐ₊)",
    insight:
      "The reduced forall–exist statement is true exactly when every integer point of Q lies in U.",
    scene: scene2(
      [
        ...shiftedOrthants2D(),
        ...halfIntegerArrangement2D(),
        ...cMarkers2D(),
        point2D([1, 2], "outside U", "fractional"),
      ],
      "The shifted orthants cover the right-hand sides that dominate at least one c.",
    ),
  },
  {
    id: "thm158-2d-cell-constant",
    kicker: "Theorem 158 · Proof step 5",
    title: "Inside one cell, dominance status cannot change",
    description:
      "No boundary of any shifted orthant crosses the interior of a cell. Consequently each open cell V is either fully contained in U or completely disjoint from U. This is the crucial compression from infinitely many points to finitely many cells.",
    formula: "for every cell V:  V⊆U  or  V∩U=∅",
    insight:
      "Therefore Step A can classify a whole cell by testing an arbitrary single point from its interior.",
    scene: scene2(
      [
        ...shiftedOrthants2D(),
        ...halfIntegerArrangement2D(),
        polygon([[0.5, 1.5], [1.5, 1.5], [1.5, 2.5], [0.5, 2.5]], "uncovered cell V"),
        point2D([1, 2], "test point", "fractional"),
        label2D([0.6, 2.85], "V∩U=∅", "accent"),
      ],
      "The cell containing (1,2) is completely disjoint from the shifted-orthant union.",
    ),
  },
  {
    id: "thm158-2d-step-a",
    kicker: "Theorem 158 · Algorithm step A",
    title: "First discard every cell that is already covered by U",
    description:
      "For each cell V, test an arbitrary point. If it lies in one shifted orthant, then the entire cell is contained in U and cannot contain a counterexample. Only uncovered cells proceed to the integer-feasibility test.",
    formula: "Step A: test whether V⊆U using one arbitrary point in V",
    insight:
      "The arrangement makes this constant-on-cells test correct; without the half-integer boundaries a cell could straddle a dominance threshold.",
    scene: scene2(
      [
        ...shiftedOrthants2D(),
        ...halfIntegerArrangement2D(),
        polygon([[0.5, 1.5], [1.5, 1.5], [1.5, 2.5], [0.5, 2.5]], "survives Step A"),
        label2D([0.65, 2.82], "uncovered ⇒ run Step B", "accent"),
      ],
      "Covered cells are certified safe immediately.",
    ),
  },
  {
    id: "thm158-2d-step-b",
    kicker: "Theorem 158 · Algorithm step B",
    title: "On an uncovered cell, solve one fixed-dimensional integer-feasibility problem",
    description:
      "If V is not contained in U, test whether V∩Q∩ℤᵐ is nonempty. Any feasible integer point is automatically outside U, hence is a counterexample. Here (1,2) belongs to V∩Q∩ℤ², so the running statement is false.",
    formula: "Step B: decide V∩Q∩ℤᵐ≠∅   (71)",
    insight:
      "The geometry first identifies a uniform uncovered region; integer programming is then used only to ask whether Q contains an integer point in that region.",
    scene: scene2(
      [
        polygon(q2, "Q", "feasible"),
        ...halfIntegerArrangement2D(),
        polygon([[0.5, 1.5], [1.5, 1.5], [1.5, 2.5], [0.5, 2.5]], "V"),
        point2D([1, 2], "counterexample found", "optimum"),
        label2D([1.35, 2.15], "(1,2)∈V∩Q∩ℤ²", "accent"),
      ],
      "A feasible point in (71) terminates the search with a counterexample.",
    ),
  },
  {
    id: "thm158-2d-correctness",
    kicker: "Theorem 158 · Correctness",
    title: "Scanning all cells is equivalent to scanning all integer b∈Q",
    description:
      "Every integer point lies in exactly one cell. Covered cells contain no counterexample; an uncovered cell contains a counterexample exactly when (71) is feasible. Thus the algorithm finds a counterexample if and only if one exists.",
    formula: "no uncovered cell with V∩Q∩ℤᵐ≠∅ ⇔ (68) is true",
    insight:
      "The arrangement is a finite certificate structure for an infinite universal quantifier.",
    scene: scene2(
      [
        polygon(q2, "Q", "feasible"),
        ...shiftedOrthants2D(),
        ...halfIntegerArrangement2D(),
        label2D([1.3, 4.35], "finite cell scan replaces ∀ b", "accent"),
      ],
      "Cell classification + integer feasibility gives an exact decision procedure.",
    ),
  },
  {
    id: "thm158-2d-complexity",
    kicker: "Theorem 158 · Cell count and runtime",
    title: "The coordinate bound on C bounds the number of cells",
    description:
      "By construction the number of cells is ∏_{i=1}^m(k_i+1). The reduction guarantees ∥C∥∞≤(mΔ)^{O(m)}, so each coordinate can assume at most (mΔ)^{O(m)} relevant values. Multiplying over m coordinates gives (mΔ)^{O(m²)} cells. The fixed-dimensional IP test per uncovered cell is dominated by this bound.",
    formula: "#cells=∏ᵢ(kᵢ+1) ≤ (mΔ)^{O(m²)}",
    insight:
      "This proves the runtime claimed by Theorem 158 for the reduced forall–exist statement (68).",
    scene: scene2(
      [
        ...halfIntegerArrangement2D(),
        label2D([0.35, 4.2], "2D toy instance: 4×4=16 cells", "accent"),
        label2D([0.35, 3.7], "general: ∏(kᵢ+1)", "default"),
        label2D([0.35, 3.25], "≤ (mΔ)^{O(m²)}", "accent"),
      ],
      "The product structure of the axis-parallel arrangement is what makes the counting transparent.",
    ),
  },
];

function boxBetween(id: string, lower: Point3D, upper: Point3D, label: string, opacity = 0.12): Mesh3D {
  const [x0, y0, z0] = lower;
  const [x1, y1, z1] = upper;
  return {
    id,
    vertices: [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
    ],
    faces: [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],
    label,
    color: COLORS.violet,
    opacity,
    style: "ghost",
  };
}

const x05: Point3D[] = [[0.5,0,0],[0.5,4,0],[0.5,4,4],[0.5,0,4]];
const x15: Point3D[] = [[1.5,0,0],[1.5,4,0],[1.5,4,4],[1.5,0,4]];
const y05: Point3D[] = [[0,0.5,0],[4,0.5,0],[4,0.5,4],[0,0.5,4]];
const y25: Point3D[] = [[0,2.5,0],[4,2.5,0],[4,2.5,4],[0,2.5,4]];
const z05: Point3D[] = [[0,0,0.5],[4,0,0.5],[4,4,0.5],[0,4,0.5]];
const z25: Point3D[] = [[0,0,2.5],[4,0,2.5],[4,4,2.5],[0,4,2.5]];

function arrangementPlanes3D() {
  return [
    plane3D("x05", x05, "x₁=0.5", COLORS.muted, 0.06),
    plane3D("x15", x15, "x₁=1.5", COLORS.orange, 0.09),
    plane3D("y05", y05, "x₂=0.5", COLORS.muted, 0.06),
    plane3D("y25", y25, "x₂=2.5", COLORS.aqua, 0.09),
    plane3D("z05", z05, "x₃=0.5", COLORS.muted, 0.06),
    plane3D("z25", z25, "x₃=2.5", COLORS.violet, 0.09),
  ];
}

const C3: Point3D[] = [[2,1,1],[1,3,1],[1,1,3]];

const stages3D: VisualizationStage[] = [
  {
    id: "thm158-3d-reduced",
    kicker: "Theorem 158 · 3D reduced problem",
    title: "The reduced dominance statement lives directly in right-hand-side space ℝ³",
    description:
      "Use the finite set C={(2,1,1),(1,3,1),(1,1,3)} and a box-shaped convex set Q. The task is still exactly (68): every integer b∈Q must dominate at least one c componentwise.",
    formula: "∀b∈Q∩ℤ³ ∃c∈C:c≤b",
    insight:
      "This example mirrors the 2D proof rather than replacing it with an unrelated 3D picture.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      meshes: [boxBetween("q3", [1,2,2], [3,3.6,3.6], "Q", 0.12)],
      markers: C3.map((c,index)=>marker3D(`c${index}`, c, `c${index+1}`, "optimum", 0.07)),
      caption: { primary: "Reduced forall–exist problem (68)", secondary: "Q and C are now subsets of ℝ³." },
    }),
  },
  {
    id: "thm158-3d-counterexample",
    kicker: "Proof step 1 · Counterexample",
    title: "b=(1,2,2) fails to dominate all three candidate generators",
    description:
      "For c₁ its first coordinate is too small; for c₂ its second coordinate is too small; for c₃ its third coordinate is too small. Hence no c≤b, and this b is a concrete counterexample if it lies in Q.",
    formula: "∀c∈C ∃i:bᵢ<cᵢ",
    insight:
      "The proof now constructs a finite arrangement that can find exactly such a b without enumerating all of Q∩ℤ³ upfront.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      meshes: [boxBetween("q3b", [1,2,2], [3,3.6,3.6], "Q", 0.1)],
      markers: [
        ...C3.map((c,index)=>marker3D(`cc${index}`, c, `c${index+1}`, "integer", 0.06)),
        marker3D("bad-b", [1,2,2], "b=(1,2,2)", "fractional", 0.1),
      ],
      caption: { primary: "A bad right-hand side", secondary: "No c∈C is componentwise ≤ b." },
    }),
  },
  {
    id: "thm158-3d-halfplanes",
    kicker: "Proof steps 2–3 · Half-integer arrangement",
    title: "Axis-parallel planes at cᵢ−1/2 partition ℝ³ into boxes",
    description:
      "The distinct coordinate values of C are turned into half-integer threshold planes. Along b₁ the relevant values are 1 and 2; along b₂ and b₃ they are 1 and 3. Thus this toy arrangement has (2+1)³=27 open cells.",
    formula: "xᵢ=cᵢ−½;  #cells=∏ᵢ(kᵢ+1)=3·3·3=27",
    insight:
      "The highlighted box containing b=(1,2,2) is the 3D analogue of the highlighted rectangle in the 2D walkthrough.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      planes: arrangementPlanes3D(),
      meshes: [boxBetween("cell-v", [0.5,0.5,0.5], [1.5,2.5,2.5], "cell V containing b", 0.17)],
      markers: [marker3D("b-cell", [1,2,2], "b", "fractional", 0.09)],
      caption: { primary: "27 axis-aligned cells", secondary: "Every integer point lies strictly inside exactly one cell." },
    }),
  },
  {
    id: "thm158-3d-orthants",
    kicker: "Proof steps 4–5 · Shifted orthants",
    title: "Each c creates an upper orthant, and every cell is uniformly covered or uncovered",
    description:
      "Truncate the three sets (c−½1)+ℝ³₊ to the displayed box. Their boundary planes are part of the arrangement, so no cell interior can cross from covered to uncovered. The status is constant on each cell.",
    formula: "U=⋃_{c∈C}((c−½1)+ℝ³₊);  V⊆U or V∩U=∅",
    insight:
      "The cell containing (1,2,2) is outside all three shifted orthants, so it survives Step A.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      planes: arrangementPlanes3D(),
      meshes: [
        boxBetween("u1", [1.5,0.5,0.5], [4,4,4], "shifted orthant c₁", 0.06),
        boxBetween("u2", [0.5,2.5,0.5], [4,4,4], "shifted orthant c₂", 0.06),
        boxBetween("u3", [0.5,0.5,2.5], [4,4,4], "shifted orthant c₃", 0.06),
        boxBetween("v-uncovered", [0.5,0.5,0.5], [1.5,2.5,2.5], "uncovered cell V", 0.16),
      ],
      markers: [marker3D("b-outside", [1,2,2], "outside U", "fractional", 0.09)],
      caption: { primary: "Cellwise-constant dominance", secondary: "Arrangement boundaries coincide with shifted-orthant boundaries." },
    }),
  },
  {
    id: "thm158-3d-step-ab",
    kicker: "Algorithm steps A and B",
    title: "Classify the cell, then ask whether it contains an integer point of Q",
    description:
      "Step A tests one point and declares this cell uncovered. Step B solves V∩Q∩ℤ³. Since b=(1,2,2) lies in both V and Q, the feasibility test succeeds and returns a counterexample.",
    formula: "V∩Q∩ℤ³≠∅ ⇒ counterexample found",
    insight:
      "The 3D logic is identical to the 2D algorithm: geometry compresses the universal search; fixed-dimensional IP certifies whether a relevant cell actually contains an integer right-hand side.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      planes: arrangementPlanes3D(),
      meshes: [
        boxBetween("q-step", [1,2,2], [3,3.6,3.6], "Q", 0.09),
        boxBetween("v-step", [0.5,0.5,0.5], [1.5,2.5,2.5], "V", 0.14),
      ],
      markers: [marker3D("answer", [1,2,2], "counterexample", "optimum", 0.11)],
      caption: { primary: "Step B succeeds", secondary: "b=(1,2,2)∈V∩Q∩ℤ³." },
    }),
  },
  {
    id: "thm158-3d-complexity",
    kicker: "Theorem 158 · Complexity",
    title: "The product cell count yields the (mΔ)^{O(m²)} bound",
    description:
      "The toy example has 27 cells. In general, the reduction bounds every c-coordinate by (mΔ)^{O(m)}, so each k_i is at most that large. The product of m factors is therefore (mΔ)^{O(m²)}. This dominates the fixed-dimensional IP work performed on uncovered cells.",
    formula: "∏_{i=1}^m(kᵢ+1) ≤ (mΔ)^{O(m²)}",
    insight:
      "This is the final counting step in the proof of Theorem 158.",
    scene: scene3D({
      bounds: { x: [0,4], y: [0,4], z: [0,4] },
      axisLabels: { x: "b₁", y: "b₂", z: "b₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.8 },
      planes: arrangementPlanes3D(),
      caption: { primary: "3×3×3=27 in the toy instance", secondary: "General product bound: (mΔ)^{O(m²)}." },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "theorem-158-2d",
    title: "2D · complete counterexample search",
    description:
      "Theorem 158 followed line by line in ℝ²: reduction target (68), negation, half-integer arrangement, shifted orthants, cellwise constancy, Steps A/B, correctness, and complexity.",
    stages: stages2D,
  },
  {
    id: "theorem-158-3d",
    title: "3D · proof-parallel box arrangement",
    description:
      "The same decision procedure in ℝ³ using axis-parallel half-integer planes, shifted positive orthants, a concrete uncovered cell, and the integer-feasibility test.",
    stages: stages3D,
  },
];

const visualization: VisualizationDefinition = {
  id: "hyperplane-arrangement-theorem-158",
  title: "Theorem 158 — Deciding Forall–Exist Statements",
  shortTitle: "Forall–exist · Thm 158",
  chapter: "Hyperplane arrangements",
  order: 3,
  description:
    "A proof-faithful visualization of the final theorem in the notes: turn the finite dominance problem (68) into an axis-parallel half-integer hyperplane arrangement, classify cells by shifted-orthant coverage, test uncovered cells for integer points of Q, and bound the number of cells by (mΔ)^{O(m²)}.",
  difficulty: "Advanced",
  duration: 32,
  accent: COLORS.aqua,
  controls: { constraints: false, grid: true, lattice: true, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 158 · proof structure from the notes",
    steps: [
      "The notes cite [17] for reducing the original statement (67) to finitely many problems of form (68); that reduction is not proved in Chapter 26.",
      "Negate (68): search for b∈Q∩ℤᵐ such that for every c∈C some coordinate satisfies b_i<c_i.",
      "Since b_i,c_i are integers, replace b_i<c_i by b_i≤c_i−1/2 and build all axis-parallel hyperplanes x_i=c_i−1/2.",
      "Sort the distinct c_i values in every coordinate. Their half-integer thresholds define product cells indexed by tuples (j₁,…,j_m).",
      "Define U=⋃_{c∈C}((c−(1/2)1)+ℝᵐ₊). Every cell is either entirely contained in U or disjoint from U.",
      "Step A: test an arbitrary point of V to decide whether the whole cell is covered. Covered cells cannot contain a counterexample.",
      "Step B: for each uncovered cell decide feasibility of V∩Q∩ℤᵐ. A feasible point is exactly a counterexample.",
      "Every integer b belongs to one cell, so scanning all cells is correct.",
      "The number of cells is ∏(k_i+1). The bound ∥C∥∞≤(mΔ)^{O(m)} implies k_i≤(mΔ)^{O(m)}, hence at most (mΔ)^{O(m²)} cells.",
      "The notes state that the fixed-dimensional integer-feasibility call for (71) takes (log m)^{O(m)} time, which is dominated by the cell-count bound. Therefore (68) is decidable in (mΔ)^{O(m²)} time.",
    ],
  },
};

export default visualization;
