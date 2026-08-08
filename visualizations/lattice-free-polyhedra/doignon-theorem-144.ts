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
  octahedronMesh,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  vector2D,
} from "@/visualizations/helpers/lattice-free-scenes";

const diamond: Point2D[] = [
  [-0.25, 0.5],
  [0.5, -0.25],
  [1.25, 0.5],
  [0.5, 1.25],
];

const rows2D = [
  {
    id: "1",
    a: [-1, -1] as Point2D,
    b: -0.25,
    delta: 0,
    witness: [0, 0] as Point2D,
    parity: "EE",
    line: [[-0.75, 1], [1, -0.75]] as [Point2D, Point2D],
    label: "a₁=(-1,-1), b₁=-1/4",
  },
  {
    id: "2",
    a: [1, -1] as Point2D,
    b: 0.75,
    delta: 1,
    witness: [1, 0] as Point2D,
    parity: "OE",
    line: [[-0.25, -1], [2, 1.25]] as [Point2D, Point2D],
    label: "a₂=(1,-1), b₂=3/4",
  },
  {
    id: "3",
    a: [-1, 1] as Point2D,
    b: 0.75,
    delta: 1,
    witness: [0, 1] as Point2D,
    parity: "EO",
    line: [[-1, -0.25], [1.25, 2]] as [Point2D, Point2D],
    label: "a₃=(-1,1), b₃=3/4",
  },
  {
    id: "4",
    a: [1, 1] as Point2D,
    b: 1.75,
    delta: 2,
    witness: [1, 1] as Point2D,
    parity: "OO",
    line: [[-0.25, 2], [2, -0.25]] as [Point2D, Point2D],
    label: "a₄=(1,1), b₄=7/4",
  },
];

const center2D: Point2D = [0.5, 0.5];

function theoremScene2D(extra: Primitive[], secondary: string, includeRows = true) {
  return scene2D(
    [
      polygon2D(diamond, "P", "component"),
      ...(includeRows
        ? rows2D.map((r, i) =>
            line2D(r.line[0], r.line[1], i < 2 ? r.label : undefined, i % 2 === 0 ? C.orange : C.aqua, "constraint"),
          )
        : []),
      ...extra,
    ],
    {
      primary: "Theorem 144 · one exact running polyhedron",
      secondary,
    },
    { viewport: { x: [-1.05, 2.2], y: [-1.05, 2.2] } },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "doignon-2d-start",
    kicker: "Chapter 24 · Theorem 144 · 2D",
    title: "Start with an actual integer-empty polyhedron, not schematic witness points",
    description:
      "The running example is the full-dimensional diamond cut out by four essential rows plus one redundant row x₁≤2. It contains no integer point. The fifth row is deliberately redundant so that the first proof operation—minimalizing the system—is visible on a genuine polyhedron.",
    formula:
      "A=[(-1,-1);(1,-1);(-1,1);(1,1)],  b=(-1/4,3/4,3/4,7/4),  plus a₅=(1,0), b₅=2",
    insight:
      "The row vector aᵢ is the normal of the boundary aᵢᵀx=bᵢ; increasing aᵢᵀx points toward the forbidden side of the inequality aᵢᵀx≤bᵢ.",
    scene: theoremScene2D(
      [
        line2D([2, -1], [2, 2], "redundant row a₅=(1,0)", C.rose, "cut"),
        label2D([-0.65, 1.78], "P∩ℤ²=∅", "accent"),
        point2D([0, 0], undefined, "lattice"),
        point2D([1, 0], undefined, "lattice"),
        point2D([0, 1], undefined, "lattice"),
        point2D([1, 1], undefined, "lattice"),
      ],
      "P is the shaded diamond. The nearest four lattice points all lie outside it.",
    ),
  },
  {
    id: "doignon-2d-minimalize",
    kicker: "Proof step 1 · Minimal integer-infeasible subsystem",
    title: "Delete redundant rows until every remaining inequality is essential",
    description:
      "Removing row 5 changes nothing, so it is discarded. The remaining four-row system is inclusion-minimal integer-infeasible: deleting row i makes the displayed integer witness xⁱ feasible.",
    formula:
      "x¹=(0,0), x²=(1,0), x³=(0,1), x⁴=(1,1);  a_kᵀxⁱ≤b_k for k≠i, while aᵢᵀxⁱ>bᵢ",
    insight:
      "This is exactly the object used in the proof. If a minimal system had m>2²=4 rows, it would produce more than four such witnesses.",
    scene: theoremScene2D(
      rows2D.map((r, i) => point2D(r.witness, `x${i + 1} · remove row ${i + 1}`, "optimum")),
      "Each corner of the unit square witnesses the necessity of one row.",
    ),
  },
  {
    id: "doignon-2d-row-normals",
    kicker: "Proof step 2 · What the aᵢ really are",
    title: "The four normals are explicit and their feasible sides are visible",
    description:
      "Each row is a linear functional aᵢᵀx≤bᵢ. The arrows show the actual row normals. For example a₂=(1,−1) measures x₁−x₂; its boundary is x₁−x₂=3/4 and the feasible diamond lies on the lower-value side.",
    formula:
      "a₁=(-1,-1), a₂=(1,-1), a₃=(-1,1), a₄=(1,1)",
    insight:
      "There is no generic 'projection direction' hidden here: Δᵢ below is simply the finite set of scalar values aᵢᵀy attained by y∈Y.",
    scene: theoremScene2D(
      rows2D.map((r, i) =>
        vector2D(center2D, [center2D[0] + 0.42 * r.a[0], center2D[1] + 0.42 * r.a[1]], `a${i + 1}`, i % 2 === 0 ? C.orange : C.aqua),
      ),
      "Normals point toward increasing left-hand side; P lies behind every boundary.",
    ),
  },
  {
    id: "doignon-2d-build-y",
    kicker: "Proof step 3 · X and Y",
    title: "Take the convex hull of the remove-one-row witnesses and keep its lattice points",
    description:
      "Set X={x¹,…,xᵐ} and Y=conv(X)∩ℤⁿ. In the running example conv(X) is the unit square and its only lattice points are the four corners.",
    formula: "X={x¹,…,xᵐ},   Y=conv(X)∩ℤⁿ",
    insight:
      "Y is finite because conv(X) is bounded. Every original witness xⁱ belongs to Y.",
    scene: scene2D(
      [
        polygon2D([[0,0],[1,0],[1,1],[0,1]], "conv(X)", "integer-hull"),
        ...rows2D.map((r, i) => point2D(r.witness, `x${i + 1}`, "optimum")),
        label2D([1.18, 1.45], "Y={0,1}²", "accent"),
      ],
      { primary: "Finite proof set Y", secondary: "For this exact example, Y consists of four points." },
      { viewport: { x: [-0.7, 2], y: [-0.7, 2] } },
    ),
  },
  {
    id: "doignon-2d-deltas",
    kicker: "Proof step 4 · Δᵢ and δᵢ",
    title: "Evaluate every row normal on the finite set Y",
    description:
      "For each row define Δᵢ={aᵢᵀy:y∈Y} and let δᵢ be the smallest attained value strictly larger than bᵢ. All quantities can be computed explicitly in the running example.",
    formula:
      "Δ₁={−2,−1,0}, δ₁=0;  Δ₂=Δ₃={−1,0,1}, δ₂=δ₃=1;  Δ₄={0,1,2}, δ₄=2",
    insight:
      "Because aᵢ is integral and y is integral, each Δᵢ⊂ℤ. The strict gap bᵢ<δᵢ is what turns '<δᵢ' back into the original inequality on integer points.",
    scene: theoremScene2D(
      [
        ...rows2D.map((r, i) => point2D(r.witness, `a${i + 1}ᵀx${i + 1}=δ${i + 1}=${r.delta}`, "optimum")),
        label2D([-0.72, 1.82], "δ=(0,1,1,2)", "accent"),
      ],
      "Each row's first forbidden integer level is attained at its own remove-one-row witness.",
    ),
  },
  {
    id: "doignon-2d-maximal-delta",
    kicker: "Proof step 5 · Maximize Σδᵢ",
    title: "Maximal thresholds force one yⁱ with its own row tight and all other rows strict",
    description:
      "Among all threshold tuples satisfying δᵢ>bᵢ and forbidding a point that is strict for every row, the proof maximizes Σδᵢ. Then for each i there must be yⁱ∈Y with aᵢᵀyⁱ=δᵢ and a_kᵀyⁱ<δ_k for every k≠i.",
    formula: "aᵢᵀyⁱ=δᵢ,   a_kᵀyⁱ<δ_k  (k≠i)",
    insight:
      "Otherwise δᵢ could be raised to the next value of Δᵢ while preserving the forbidden-threshold condition, contradicting maximality.",
    scene: theoremScene2D(
      rows2D.map((r, i) => point2D(r.witness, `y${i + 1}: row ${i + 1} tight`, "optimum")),
      "The running example already exhibits exactly the yⁱ pattern required by the abstract proof.",
    ),
  },
  {
    id: "doignon-2d-bound-is-tight",
    kicker: "Proof step 6 · Parity at the boundary m=4",
    title: "With exactly four witnesses, every parity class can occur once",
    description:
      "The four yⁱ of the running example occupy the four componentwise parity classes of ℤ². Therefore no parity collision is forced when m=4, which is why the theorem cannot prove a smaller universal bound.",
    formula: "EE, OE, EO, OO  — exactly 2² classes",
    insight:
      "This concrete stage also explains why the next step must assume m>4. There is no genuine five-row minimal counterexample to draw—that is precisely what the theorem proves cannot exist.",
    scene: scene2D(
      [
        polygon2D([[0,0],[1,0],[1,1],[0,1]], "Y", "integer-hull"),
        ...rows2D.map((r, i) => point2D(r.witness, `y${i + 1} · ${r.parity}`, "optimum")),
      ],
      { primary: "No collision at the sharp bound", secondary: "Four witnesses can occupy four different parity classes." },
      { viewport: { x: [-0.6, 1.7], y: [-0.6, 1.7] } },
    ),
  },
  {
    id: "doignon-2d-hypothetical-collision",
    kicker: "Proof step 7 · Contradiction branch m>4",
    title: "A hypothetical fifth yⁱ must repeat one of the four parity classes",
    description:
      "From this point the proof is necessarily abstract: assume a minimal counterexample with m>4 existed. Its maximal-threshold witnesses y¹,…,yᵐ would contain two points yᵏ,yˡ with the same coordinate parities. The schematic fifth point below represents that impossible branch, not an extra row of the running diamond.",
    formula: "m>2² ⇒ ∃k≠ℓ: yᵏ≡yˡ (mod 2)",
    insight:
      "Equal parity means yᵏ+yˡ is even componentwise, so their midpoint is another lattice point.",
    scene: scene2D(
      [
        polygon2D([[0,0],[1,0],[2,2],[0,1]], "abstract conv(X)", "component"),
        point2D([0,0], "yᵏ · EE", "optimum"),
        point2D([1,0], "OE", "integer"),
        point2D([0,1], "EO", "integer"),
        point2D([1,1], "OO", "integer"),
        point2D([2,2], "yˡ · EE (hypothetical fifth)", "optimum"),
        line2D([0,0],[2,2], "same parity", C.rose, "assignment"),
      ],
      { primary: "Abstract parity collision under m>4", secondary: "This scene is the contradiction assumption, deliberately separated from the concrete diamond." },
      { viewport: { x: [-0.6, 2.6], y: [-0.6, 2.6] } },
    ),
  },
  {
    id: "doignon-2d-midpoint-contradiction",
    kicker: "Proof step 8 · Integral midpoint and contradiction",
    title: "The midpoint lies in Y and becomes strict for every threshold",
    description:
      "Set y=(yᵏ+yˡ)/2. Equal parity makes y integral, and convexity puts y in conv(X), hence y∈Y. For row k, yᵏ is tight while yˡ is strict; for row ℓ the roles reverse; every other row is strict at both endpoints. Averaging therefore makes every row strict.",
    formula: "y=½(yᵏ+yˡ)∈Y,   aᵢᵀy<δᵢ for every i",
    insight:
      "This contradicts the defining threshold condition. Hence an inclusion-minimal integer-infeasible subsystem has at most 2ⁿ rows.",
    scene: scene2D(
      [
        polygon2D([[0,0],[1,0],[2,2],[0,1]], "abstract conv(X)", "component"),
        point2D([0,0], "yᵏ", "optimum"),
        point2D([2,2], "yˡ", "optimum"),
        line2D([0,0],[2,2], "average", C.rose, "assignment"),
        point2D([1,1], "y=(1,1) ∈ Y∩ℤ²", "fractional"),
        label2D([1.25,0.65], "aᵢᵀy<δᵢ ∀i", "accent"),
      ],
      { primary: "Final contradiction", secondary: "Parity gives integrality; convexity gives membership; threshold strictness gives the contradiction." },
      { viewport: { x: [-0.6, 2.6], y: [-0.6, 2.6] } },
    ),
  },
];

const center3D: Point3D = [0.5, 0.5, 0.5];
const radius3D = 1.25;
const cubeWitnesses3D: Array<{
  p: Point3D;
  a: Point3D;
  subset: string;
  size: number;
  parity: string;
}> = [];

for (let x = 0; x <= 1; x += 1) {
  for (let y = 0; y <= 1; y += 1) {
    for (let z = 0; z <= 1; z += 1) {
      const p: Point3D = [x, y, z];
      const a: Point3D = [2 * x - 1, 2 * y - 1, 2 * z - 1];
      const subset = [x ? "1" : "", y ? "2" : "", z ? "3" : ""].filter(Boolean).join(",") || "∅";
      const parity = `${x ? "O" : "E"}${y ? "O" : "E"}${z ? "O" : "E"}`;
      cubeWitnesses3D.push({ p, a, subset, size: x + y + z, parity });
    }
  }
}

function normalEndpoint(a: Point3D): Point3D {
  return [center3D[0] + 0.46 * a[0], center3D[1] + 0.46 * a[1], center3D[2] + 0.46 * a[2]];
}

function theoremScene3D(
  extraMarkers: ReturnType<typeof marker3D>[],
  extraSegments: ReturnType<typeof segment3D>[],
  secondary: string,
  meshes = [octahedronMesh("P", center3D, radius3D, "P", "ghost", 0.2)],
) {
  return scene3D({
    bounds: { x: [-1.0, 2.25], y: [-1.0, 2.25], z: [-1.0, 2.25] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.78, pitch: 0.48, distance: 5.8 },
    meshes,
    markers: extraMarkers,
    segments: extraSegments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: { primary: "Theorem 144 · exact 3D analogue", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "doignon-3d-start",
    kicker: "Chapter 24 · Theorem 144 · 3D",
    title: "The 3D running polyhedron is an actual integer-empty octahedron",
    description:
      "Use one row for every sign vector a_I∈{−1,+1}³, with a_I=2χᴵ−1 and b_I=|I|−1/4. Their intersection is the L1-ball ||x−(1/2,1/2,1/2)||₁≤5/4. It is full-dimensional and contains no lattice point. Add x₁≤2 as one visible redundant ninth row before minimalization.",
    formula: "a_I=2χᴵ−1,  b_I=|I|−1/4,  I⊆{1,2,3}",
    insight:
      "The nearest lattice points are the eight cube vertices; each is at L1-distance 3/2 from the center, strictly outside the radius 5/4 octahedron.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`start-${i}`, w.p, i === 7 ? "nearest lattice points" : undefined, "integer", 0.05)),
      [segment3D("redundant", [2,-0.6,-0.6], [2,1.6,1.6], "redundant x₁≤2", C.rose, { dashed: true })],
      "The shaded octahedron is P; cube-corner lattice points surround it but none lie inside.",
    ),
  },
  {
    id: "doignon-3d-minimalize",
    kicker: "Proof step 1 · Minimalize",
    title: "After removing the redundant row, all eight sign inequalities are essential",
    description:
      "Deleting the row indexed by I makes χᴵ feasible. Thus the eight cube vertices are exact remove-one-row witnesses xᴵ, just as the four unit-square corners were in 2D.",
    formula: "a_Jᵀχᴵ≤b_J for J≠I,   but a_Iᵀχᴵ=|I|>|I|−1/4=b_I",
    insight:
      "This is a genuine minimal integer-infeasible system at the Doignon bound 2³=8.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`w-${i}`, w.p, `x^${w.subset}`, "optimum", 0.065)),
      [],
      "Every one of the eight facets has its own cube-vertex witness.",
    ),
  },
  {
    id: "doignon-3d-normals",
    kicker: "Proof step 2 · Actual row normals",
    title: "Every facet normal is one explicit sign vector a_I",
    description:
      "The eight rows are not arbitrary arrows: a_I has +1 exactly on coordinates in I and −1 on the complement. The corresponding boundary is a_Iᵀx=|I|−1/4, and the feasible octahedron lies on the ≤ side.",
    formula: "I={1,3}: a_I=(1,−1,1), b_I=7/4;   I=∅: a_∅=(−1,−1,−1), b_∅=−1/4",
    insight:
      "The sign pattern of a_I points directly toward the cube vertex χᴵ that becomes feasible when that facet is removed.",
    scene: theoremScene3D(
      [],
      cubeWitnesses3D.map((w, i) =>
        segment3D(`n-${i}`, center3D, normalEndpoint(w.a), i === 0 || i === 5 ? `a_${w.subset}` : "", i % 2 === 0 ? C.orange : C.aqua, { width: 3 }),
      ),
      "Eight facet normals radiate from the center toward their corresponding remove-one-row witnesses.",
    ),
  },
  {
    id: "doignon-3d-y",
    kicker: "Proof step 3 · X and Y",
    title: "conv(X) is the unit cube and Y consists of its eight lattice vertices",
    description:
      "The witness set X is exactly {0,1}³. Therefore conv(X)=[0,1]³ and Y=conv(X)∩ℤ³={0,1}³.",
    formula: "X={χᴵ:I⊆{1,2,3}},   Y=[0,1]³∩ℤ³={0,1}³",
    insight:
      "This is the 3D counterpart of the unit square in the 2D proof walkthrough.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`y-${i}`, w.p, `x^${w.subset}`, "optimum", 0.06)),
      [],
      "Y is shown as the eight integer corners of the translucent unit cube.",
      [boxMesh("convX", [0,0,0], [1,1,1], "conv(X)", "integer-hull", 0.12)],
    ),
  },
  {
    id: "doignon-3d-delta",
    kicker: "Proof step 4 · Δ_I and δ_I",
    title: "The first attained integer level above b_I is δ_I=|I|",
    description:
      "For a_I=2χᴵ−1, the maximum of a_Iᵀy over y∈{0,1}³ is attained uniquely at y=χᴵ and equals |I|. Since b_I=|I|−1/4, the smallest value in Δ_I above b_I is exactly δ_I=|I|.",
    formula: "Δ_I={a_Iᵀy:y∈Y},   δ_I=min{w∈Δ_I:w>b_I}=|I|",
    insight:
      "Thus every cube vertex already satisfies the maximal-threshold witness pattern: its own row is tight at δ_I and every other row is strict.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`d-${i}`, w.p, i === 5 ? `y^${w.subset}: δ=${w.size}` : undefined, i === 5 ? "optimum" : "integer", i === 5 ? 0.1 : 0.045)),
      [segment3D("selected-normal", center3D, normalEndpoint(cubeWitnesses3D[5].a), "selected a_I", C.orange)],
      "Selected example: I={1,3}, y^I=(1,0,1), a_Iᵀy^I=2=δ_I.",
    ),
  },
  {
    id: "doignon-3d-maximal",
    kicker: "Proof step 5 · Maximal Σδ_I",
    title: "The same maximality argument now has eight concrete y^I witnesses",
    description:
      "In the abstract proof the threshold tuple is chosen to maximize its total sum. The running octahedron realizes the resulting condition exactly: for each I, y^I=χᴵ is tight only for its own threshold and strict for all others.",
    formula: "a_Iᵀy^I=δ_I,   a_Jᵀy^I<δ_J for J≠I",
    insight:
      "The 3D example is therefore not merely a parity cube; it models every object used before the final pigeonhole step.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`m-${i}`, w.p, `y^${w.subset}`, "optimum", 0.06)),
      [],
      "Eight exact threshold witnesses, one per row.",
      [boxMesh("Ybox", [0,0,0], [1,1,1], "Y", "ghost", 0.08)],
    ),
  },
  {
    id: "doignon-3d-parity-bound",
    kicker: "Proof step 6 · Parity at m=8",
    title: "At the sharp bound, the eight witnesses occupy all eight parity classes once",
    description:
      "The parity vector of a cube vertex is the vertex itself modulo two. Hence the eight y^I realize EEE,OEE,EOE,EEO,OOE,OEO,EOO,OOO exactly once. No collision is forced at m=8.",
    formula: "2³=8 parity classes",
    insight:
      "This is the exact 3D analogue of the four-class unit-square picture in 2D.",
    scene: theoremScene3D(
      cubeWitnesses3D.map((w, i) => marker3D(`p-${i}`, w.p, w.parity, "optimum", 0.065)),
      [],
      "All parity classes are used once; the theorem only contradicts m>8.",
      [boxMesh("parity-cube", [0,0,0], [1,1,1], "parity cube", "ghost", 0.08)],
    ),
  },
  {
    id: "doignon-3d-collision",
    kicker: "Proof step 7 · Hypothetical ninth witness",
    title: "If m>8, a ninth maximal-threshold witness must repeat a parity class",
    description:
      "This is again the abstract contradiction branch, not an extra facet of the octahedron. Represent a hypothetical ninth witness by (2,2,2), which repeats parity EEE with (0,0,0). Equal parity makes their midpoint integral.",
    formula: "m>8 ⇒ yᵏ≡yˡ (mod 2),   y=½(yᵏ+yˡ)∈ℤ³",
    insight:
      "Separating this schematic branch from the concrete octahedron avoids the false impression that a genuine nine-row minimal counterexample exists.",
    scene: scene3D({
      bounds: { x: [-0.4,2.4], y: [-0.4,2.4], z: [-0.4,2.4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.48, distance: 5.6 },
      meshes: [boxMesh("abstract-hull", [0,0,0], [2,2,2], "abstract conv(X)", "ghost", 0.06)],
      markers: [
        ...cubeWitnesses3D.map((w, i) => marker3D(`a-${i}`, w.p, i === 0 ? "yᵏ · EEE" : undefined, i === 0 ? "optimum" : "integer", i === 0 ? 0.09 : 0.04)),
        marker3D("ninth", [2,2,2], "yˡ · EEE (hypothetical ninth)", "optimum", 0.1),
      ],
      segments: [segment3D("collision", [0,0,0], [2,2,2], "same parity", C.rose)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Abstract m>8 parity collision", secondary: "The ninth point represents the contradiction assumption, not the running octahedron." },
    }),
  },
  {
    id: "doignon-3d-midpoint",
    kicker: "Proof step 8 · Final contradiction",
    title: "The integral midpoint is strict for every threshold",
    description:
      "For the colliding pair, y=(yᵏ+yˡ)/2 lies in Y by integrality and convexity. Row k averages one tight and one strict endpoint; row ℓ does the same; every other row averages two strict endpoints. Hence a_iᵀy<δ_i for all rows, contradicting condition (2).",
    formula: "y∈Y∩ℤ³ and a_iᵀy<δ_i for all i  ⇒ contradiction",
    insight: "Therefore every minimal integer-infeasible subsystem in dimension three has at most eight rows.",
    scene: scene3D({
      bounds: { x: [-0.4,2.4], y: [-0.4,2.4], z: [-0.4,2.4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.48, distance: 5.6 },
      meshes: [boxMesh("abstract-hull-final", [0,0,0], [2,2,2], "abstract conv(X)", "ghost", 0.05)],
      markers: [
        marker3D("left", [0,0,0], "yᵏ", "optimum", 0.09),
        marker3D("right", [2,2,2], "yˡ", "optimum", 0.09),
        marker3D("mid", [1,1,1], "y=(1,1,1)", "fractional", 0.12),
      ],
      segments: [segment3D("average", [0,0,0], [2,2,2], "midpoint", C.rose)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Final Doignon contradiction in 3D", secondary: "Parity + convexity + threshold strictness rule out a ninth essential row." },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "doignon-proof-2d",
    title: "2D · exact polyhedron + full proof",
    description: "A full-dimensional four-facet integer-empty diamond, explicit aᵢ,bᵢ, witnesses, Δᵢ, δᵢ, and the abstract m>4 contradiction.",
    stages: stages2D,
  },
  {
    id: "doignon-proof-3d",
    title: "3D · exact octahedron + full proof",
    description: "The same proof objects in three dimensions: an eight-facet integer-empty octahedron, cube witnesses, exact normals and thresholds, then the m>8 parity contradiction.",
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
    "A rigorous visualization of Theorem 144. Both examples begin with an actual integer-empty polyhedron and explicit row normals. The proof then follows the notes through minimalization, X and Y, Δᵢ and δᵢ, maximal thresholds, parity, the integral midpoint, and the final contradiction.",
  difficulty: "Advanced",
  duration: 24,
  accent: C.violet,
  visualLabel: "Exact proof geometry",
  insightLabel: "Why the step works",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 144 proof skeleton",
    steps: [
      "Start from P={x:Ax≤b} with P∩ℤⁿ=∅ and remove redundant rows until the system is inclusion-minimal integer-infeasible. Then removing row i yields an integer witness xⁱ satisfying every other row and violating row i.",
      "Let X={x¹,…,xᵐ} and Y=conv(X)∩ℤⁿ. The set Y is finite and contains every xⁱ.",
      "For each row i define Δᵢ={aᵢᵀy:y∈Y}. Choose δᵢ∈Δᵢ with δᵢ>bᵢ so that no y∈Y is strictly below every δᵢ, and maximize Σδᵢ.",
      "Maximality implies that for every i there is yⁱ∈Y with aᵢᵀyⁱ=δᵢ and a_kᵀyⁱ<δ_k for all k≠i.",
      "If m>2ⁿ, two y-witnesses have the same componentwise parity. Their midpoint is integral and remains in Y by convexity.",
      "The midpoint is strict for every threshold: for the two selected rows one endpoint is tight and the other strict; for all other rows both endpoints are strict. This contradicts the threshold condition.",
      "Hence every integer-infeasible system has an integer-infeasible subsystem with at most 2ⁿ inequalities.",
    ],
  },
};

export default visualization;
