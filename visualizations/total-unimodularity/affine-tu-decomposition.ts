import type {
  Mesh3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const triangleConstraints: Scene["constraints"] = [
  { id: "nonnegative-x1", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "nonnegative-x2", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "non-tu-row", a: 2, b: 1, limit: 3, label: "2x₁+x₂≤3", color: "#e27c89" },
];

function scene2D(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.45, 3.45], y: [-0.45, 3.55] },
    constraints: triangleConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "One-row affine TU decomposition",
      secondary: "A=Ã+UW and only d=Wx=x₁+x₂ is required to be integral",
    },
    ...overrides,
  };
}

function diagonalSegment(d: number, xMax: number, color: string): Primitive {
  return {
    kind: "line",
    from: [0, d],
    to: [xMax, d - xMax],
    label: `P${d}: x₁+x₂=${d}`,
    style: "cut",
    color,
  };
}

const affineProofStages: VisualizationStage[] = [
  {
    id: "affine-tu-start-fractional",
    kicker: "Definition 29 · Motivation",
    title: "Begin with a non-TU inequality that creates a fractional vertex",
    description:
      "The row (2,1) is not totally unimodular because it contains the 1×1 minor 2. With b=3, the relaxation has the fractional vertex (3/2,0).",
    formula: "P={x≥0:2x₁+x₂≤3}",
    insight:
      "The goal is not to force both x₁ and x₂ to be integer. We look for one aggregate measurement whose integrality repairs the relaxation.",
    scene: scene2D([
      { kind: "point", at: [0, 0], label: "integer vertex", style: "integer" },
      { kind: "point", at: [0, 3], label: "integer vertex", style: "integer" },
      { kind: "point", at: [1.5, 0], label: "fractional vertex (3/2,0)", style: "fractional" },
    ]),
  },
  {
    id: "affine-tu-matrix-split",
    kicker: "Definition 29 · Matrix decomposition",
    title: "Split A into a TU backbone and a low-rank correction",
    description:
      "For the full inequality matrix, write A=Ã+UW with W=(1,1). The correction UW changes only the first row, turning the TU row (1,0) into the non-TU row (2,1).",
    formula: "A=[[2,1],[-1,0],[0,-1]]=Ã+[1,0,0]ᵀ[1,1]",
    insight:
      "The matrix W records the one linear combination that carries all non-TU behavior.",
    scene: scene2D([
      { kind: "label", at: [2.45, 3.15], text: "Ã rows: (1,0), (−1,0), (0,−1)", tone: "muted" },
      { kind: "label", at: [2.45, 2.8], text: "U=(1,0,0)ᵀ", tone: "muted" },
      { kind: "label", at: [2.45, 2.45], text: "W=(1,1)", tone: "accent" },
      { kind: "vector", from: [0, 0], to: [1, 0], label: "Ã first row", color: "#79c9c0", animate: true },
      { kind: "vector", from: [1, 0], to: [2, 1], label: "+UW correction", color: "#e27c89", animate: true },
    ], { showFeasibleRegion: false, showConstraints: false, showVertices: false }),
  },
  {
    id: "affine-tu-stacked-tu",
    kicker: "Definition 29 · TU certificate",
    title: "Stack W underneath the backbone and recover total unimodularity",
    description:
      "The rows of [Ã;W] are (1,0), (−1,0), (0,−1), and (1,1). Every square minor is 0 or ±1, so this stacked matrix is TU.",
    formula: "[Ã;W] is totally unimodular",
    insight:
      "Affine TU dimension one means one aggregate integer variable is enough to expose TU slices.",
    scene: scene2D([
      { kind: "label", at: [1.7, 2.85], text: "[Ã;W]", tone: "accent" },
      { kind: "label", at: [1.7, 2.45], text: "( 1   0 )", tone: "muted" },
      { kind: "label", at: [1.7, 2.1], text: "(−1   0 )", tone: "muted" },
      { kind: "label", at: [1.7, 1.75], text: "( 0  −1 )", tone: "muted" },
      { kind: "label", at: [1.7, 1.4], text: "( 1   1 )", tone: "accent" },
      { kind: "label", at: [1.7, 0.8], text: "all minors ∈{0,±1}", tone: "accent" },
    ], { showFeasibleRegion: false, showConstraints: false, showVertices: false }),
  },
  {
    id: "affine-tu-one-integer-measurement",
    kicker: "Theorem 30 · Mixed integrality",
    title: "Require only the aggregate d=Wx=x₁+x₂ to be integral",
    description:
      "The feasible points with Wx∈ℤ lie on the four diagonal slices d=0,1,2,3. The variables themselves remain continuous along each slice.",
    formula: "S=conv{x∈P:x₁+x₂∈ℤ}",
    insight:
      "One integer measurement replaces two coordinatewise integrality constraints.",
    scene: scene2D([
      diagonalSegment(0, 0, "#79c9c0"),
      diagonalSegment(1, 1, "#8f88dc"),
      diagonalSegment(2, 1, "#f49a4a"),
      diagonalSegment(3, 0, "#e27c89"),
      { kind: "label", at: [2.15, 2.75], text: "d=0,1,2,3", tone: "accent" },
    ]),
  },
  {
    id: "affine-tu-lift-d",
    kicker: "Theorem 30 · Lift",
    title: "Introduce d=Wx and inspect one fixed integer fiber",
    description:
      "Fix d=2. Substituting A=Ã+UW into Ax≤b gives Ãx≤b−Ud together with Wx=d. This is exactly the fiber P₂.",
    formula: "P_d={x:Ãx≤b−Ud, Wx=d}",
    insight:
      "Fixing d converts the low-rank correction UW x into the integral right-hand-side shift Ud.",
    scene: scene2D([
      diagonalSegment(2, 1, "#f49a4a"),
      { kind: "point", at: [0, 2], label: "integral endpoint", style: "integer" },
      { kind: "point", at: [1, 1], label: "integral endpoint", style: "integer" },
      { kind: "point", at: [0.45, 1.55], label: "continuous point in P₂", style: "fractional" },
      { kind: "label", at: [2.3, 2.8], text: "b−Ud is integral", tone: "accent" },
    ]),
  },
  {
    id: "affine-tu-fiber-integrality",
    kicker: "Theorem 30 · TU fiber",
    title: "Every integer fiber is an integral polyhedron",
    description:
      "The defining matrix of P_d is assembled from Ã and W. Since [Ã;W] is TU and b−Ud,d are integral, each nonempty fiber has integral vertices.",
    formula: "P_d=conv(P_d∩ℤⁿ)",
    insight:
      "This is the central proof step: mixed integrality partitions the non-TU relaxation into TU slices.",
    scene: scene2D([
      diagonalSegment(0, 0, "#79c9c0"),
      diagonalSegment(1, 1, "#8f88dc"),
      diagonalSegment(2, 1, "#f49a4a"),
      diagonalSegment(3, 0, "#e27c89"),
      ...([[0,0],[0,1],[1,0],[0,2],[1,1],[0,3]] as Point2D[]).map<Primitive>((at) => ({
        kind: "point",
        at,
        label: "fiber endpoint",
        style: "integer",
      })),
    ]),
  },
  {
    id: "affine-tu-convexify-union",
    kicker: "Theorem 30 · Convexify all fibers",
    title: "The convex hull of the integral fibers is itself integral",
    description:
      "Take the union over all d∈ℤ and convexify. Here the result is the quadrilateral with vertices (0,0),(1,0),(1,1),(0,3), exactly the integer hull of P.",
    formula: "S=conv(⋃_{d∈ℤ}P_d)=conv(S∩ℤⁿ)",
    insight:
      "Although each fiber contains continuous points, every fiber is generated by integer points, so their global convex hull is integral.",
    scene: scene2D([
      {
        kind: "polygon",
        points: [[0,0],[1,0],[1,1],[0,3]],
        label: "S=integer hull",
        style: "integer-hull",
        fromPoints: [[0,0],[1.5,0],[0,3],[0,3]],
      },
      ...([[0,0],[1,0],[1,1],[0,3]] as Point2D[]).map<Primitive>((at) => ({
        kind: "point",
        at,
        label: "integral vertex",
        style: "integer",
      })),
      { kind: "point", at: [1.5,0], label: "fractional LP vertex removed", style: "fractional" },
    ]),
  },
  {
    id: "affine-tu-property-three",
    kicker: "Theorem 30 · Integer-hull formulation",
    title: "One aggregate integrality condition models the full integer hull",
    description:
      "Because W is integral, every integer point satisfies Wx∈ℤ. The theorem proves the reverse convex-hull inclusion, so the mixed-integer formulation is exact.",
    formula: "conv(P∩ℤⁿ)=conv{x∈P:Wx∈ℤ}",
    insight:
      "Affine TU dimension measures how many aggregate integer variables are needed: zero means A is already TU, while k<n can be much cheaper than requiring every coordinate to be integer.",
    scene: scene2D([
      {
        kind: "polygon",
        points: [[0,0],[1,0],[1,1],[0,3]],
        label: "both convex hulls coincide",
        style: "integer-hull",
      },
      { kind: "label", at: [2.05, 2.65], text: "2 original variables", tone: "muted" },
      { kind: "label", at: [2.05, 2.3], text: "only 1 integer row W", tone: "accent" },
    ]),
  },
];

function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: true,
    showLattice: true,
    showVertices: true,
    scene3D: configuration,
  };
}

const cubeVertices: Point3D[] = [
  [0,0,0],[1,0,0],[1,1,0],[0,1,0],
  [0,0,1],[1,0,1],[1,1,1],[0,1,1],
];

const cubeFaces = [
  [0,1,2,3],[4,7,6,5],[0,4,5,1],
  [1,5,6,2],[2,6,7,3],[3,7,4,0],
];

const evenVertices: Point3D[] = [[0,0,0],[1,1,0],[1,0,1],[0,1,1]];
const oddVertices: Point3D[] = [[1,0,0],[0,1,0],[0,0,1],[1,1,1]];

const cubeMesh: Mesh3D = {
  id: "unit-cube",
  vertices: cubeVertices,
  faces: cubeFaces,
  label: "[0,1]³",
  color: "#79c9c0",
  edgeColor: "#10202a",
  opacity: 0.12,
  style: "solid",
};

const parityMesh: Mesh3D = {
  id: "even-parity-tetrahedron",
  vertices: evenVertices,
  faces: [[0,1,2],[0,3,1],[0,2,3],[1,3,2]],
  label: "even parity polytope",
  color: "#8f88dc",
  edgeColor: "#10202a",
  opacity: 0.24,
  style: "split-hull",
};

function parityConfiguration(overrides: Partial<Scene3D> = {}): Scene3D {
  return {
    bounds: { x: [-0.25,1.3], y: [-0.25,1.3], z: [-0.25,1.3] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.72, pitch: 0.48, distance: 4.7 },
    meshes: [cubeMesh],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: {
      primary: "Example 31: even parity in the 3-cube",
      secondary: "one lifted integer variable records half the support size",
    },
    ...overrides,
  };
}

const parityStages: VisualizationStage[] = [
  {
    id: "affine-tu-parity-cube",
    kicker: "Example 31 · Binary cube",
    title: "Start with all eight binary vertices",
    description:
      "The even parity polytope is the convex hull of 0–1 vectors whose support has even cardinality. Four cube vertices are even and four are odd.",
    formula: "P_even=conv{x∈{0,1}³:Σxᵢ is even}",
    insight:
      "Coordinatewise integrality alone gives the whole cube. Parity is one additional global arithmetic condition.",
    scene: scene3D(parityConfiguration({
      markers: [
        ...evenVertices.map((at, index) => ({ id: `even-${index}`, at, label: "even support", style: "integer" as const })),
        ...oddVertices.map((at, index) => ({ id: `odd-${index}`, at, label: "odd support", style: "fractional" as const })),
      ],
    })),
  },
  {
    id: "affine-tu-parity-one-measurement",
    kicker: "Example 31 · One integer measurement",
    title: "Parity is detected by one aggregate quantity",
    description:
      "For a binary vector, even support is equivalent to one-half of the coordinate sum being integral. Thus a single aggregate integrality condition distinguishes the two classes.",
    formula: "(1/2)(x₁+x₂+x₃)∈ℤ",
    insight:
      "This is the conceptual payoff of affine TU decomposition: a global combinatorial restriction can be encoded with far fewer integer variables than coordinates.",
    scene: scene3D(parityConfiguration({
      markers: [
        ...evenVertices.map((at, index) => ({ id: `keep-${index}`, at, label: "half-sum integer", style: "optimum" as const })),
        ...oddVertices.map((at, index) => ({ id: `drop-${index}`, at, label: "half-sum half-integral", style: "fractional" as const })),
      ],
    })),
  },
  {
    id: "affine-tu-parity-lift",
    kicker: "Example 31 · Lifted formulation",
    title: "Introduce one integer variable z for the support count",
    description:
      "The notes use the lifted equation x₁+x₂+x₃+2z=0 with z∈ℤ. The matrix decomposes into a TU part plus the rank-one correction [2;−2]W, where W selects z.",
    formula: "x₁+x₂+x₃+2z=0,   z∈ℤ",
    insight:
      "The original x variables remain continuous in the lifted mixed-integer formulation; only the single variable z is declared integer.",
    scene: scene3D(parityConfiguration({
      markers: evenVertices.map((at, index) => ({
        id: `lifted-${index}`,
        at,
        label: `z=−${(at[0]+at[1]+at[2])/2}`,
        style: "optimum" as const,
      })),
      caption: {
        primary: "One lifted integer variable",
        secondary: "W=(0,0,0,1) selects z",
      },
    })),
  },
  {
    id: "affine-tu-parity-hull",
    kicker: "Example 31 · Projection",
    title: "Convexifying and projecting leaves the even-parity tetrahedron",
    description:
      "Theorem 30 makes the lifted convex hull integral. Projecting onto x produces the tetrahedron with exactly the four even binary vertices.",
    formula: "proj_x(Q)=P_even",
    insight:
      "Projection preserves polyhedrality, while affine TU decomposition supplies integrality before the projection.",
    scene: scene3D(parityConfiguration({
      meshes: [cubeMesh, parityMesh],
      markers: evenVertices.map((at, index) => ({ id: `parity-${index}`, at, label: "even vertex", style: "optimum" as const })),
      caption: {
        primary: "Even parity polytope",
        secondary: "conv{000,110,101,011}",
      },
    })),
  },
];

const proofExample: VisualizationExample = {
  id: "one-row-affine-tu",
  title: "One-row decomposition of a non-TU triangle",
  description:
    "Follow Definition 29 and every step of Theorem 30: matrix split, integer fibers, TU integrality, and convexification.",
  stages: affineProofStages,
};

const parityExample: VisualizationExample = {
  id: "parity-polytope",
  title: "Parity polytope with one lifted integer variable",
  description:
    "Visualize Example 31 in dimension three: one aggregate parity measurement selects four vertices of the cube.",
  stages: parityStages,
};

const visualization: VisualizationDefinition = {
  id: "affine-tu-decomposition",
  title: "Definition 29 and Theorem 30 — Affine TU Decomposition",
  shortTitle: "Affine TU decomposition",
  chapter: "Total unimodularity",
  order: 2,
  description:
    "Decompose a non-TU matrix into a TU backbone plus a low-rank correction, fix the few aggregate integer measurements, and see why every resulting fiber is integral.",
  difficulty: "Advanced",
  duration: 22,
  accent: "#e27c89",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: affineProofStages,
  examples: [proofExample, parityExample],
  proof: {
    title: "The proof of Theorem 30 from the notes",
    steps: [
      "Start from an affine TU decomposition A=Ã+UW with W∈{0,±1}^{k×n} and [Ã;W] totally unimodular.",
      "Let S=conv{x:Ax≤b, Wx∈ℤᵏ} and introduce the lifted integer vector d=Wx.",
      "For a fixed d∈ℤᵏ, define P_d={x:Ãx≤b−Ud, Wx=d}={x:Ax≤b, Wx=d}.",
      "The right-hand sides b−Ud and d are integral.",
      "Because the defining matrix is built from [Ã;W], every P_d is an integral polyhedron.",
      "Therefore S=conv(⋃_d P_d)=conv(⋃_d(P_d∩ℤⁿ))=conv(S∩ℤⁿ), so S is integral.",
      "Since W is integral, P∩ℤⁿ is contained in {x∈P:Wx∈ℤᵏ}; integrality of S gives equality of their convex hulls.",
      "The number k is the number of aggregate integer variables needed by the reformulation.",
    ],
  },
};

export default visualization;
