import type {
  Marker3D,
  Mesh3D,
  PlanePatch3D,
  Point3D,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";
import type {
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const COLORS = {
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
  lime: "#d4ef77",
  muted: "#7d898b",
};

const boxFaces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
];

const octahedronFaces = [
  [0, 2, 4],
  [2, 1, 4],
  [1, 3, 4],
  [3, 0, 4],
  [2, 0, 5],
  [1, 2, 5],
  [3, 1, 5],
  [0, 3, 5],
];

const add3 = (left: Point3D, right: Point3D): Point3D => [
  left[0] + right[0],
  left[1] + right[1],
  left[2] + right[2],
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

function segment(
  id: string,
  from: Point3D,
  to: Point3D,
  label: string,
  color: string,
  options: Partial<Segment3D> = {},
): Segment3D {
  return {
    id,
    from,
    to,
    label,
    color,
    width: 3,
    animate: true,
    ...options,
  };
}

function basisSegments(
  basis: [Point3D, Point3D, Point3D],
  prefix: string,
  labels: [string, string, string] = ["b₁", "b₂", "b₃"],
): Segment3D[] {
  return [
    segment(`${prefix}-b1`, [0, 0, 0], basis[0], labels[0], COLORS.orange),
    segment(`${prefix}-b2`, [0, 0, 0], basis[1], labels[1], COLORS.aqua),
    segment(`${prefix}-b3`, [0, 0, 0], basis[2], labels[2], COLORS.violet),
  ];
}

function parallelepipedVertices(
  basis: [Point3D, Point3D, Point3D],
  origin: Point3D = [0, 0, 0],
): Point3D[] {
  const [first, second, third] = basis;
  return [
    origin,
    add3(origin, first),
    add3(add3(origin, first), second),
    add3(origin, second),
    add3(origin, third),
    add3(add3(origin, first), third),
    add3(add3(add3(origin, first), second), third),
    add3(add3(origin, second), third),
  ];
}

function parallelepiped(
  id: string,
  basis: [Point3D, Point3D, Point3D],
  label: string,
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return {
    id,
    vertices: parallelepipedVertices(basis),
    faces: boxFaces,
    label,
    color: COLORS.lime,
    opacity: 0.22,
    ...options,
  };
}

function cube(
  id: string,
  center: Point3D,
  radius: number,
  label: string,
  options: Partial<Mesh3D> = {},
): Mesh3D {
  const [x, y, z] = center;
  return {
    id,
    vertices: [
      [x - radius, y - radius, z - radius],
      [x + radius, y - radius, z - radius],
      [x + radius, y + radius, z - radius],
      [x - radius, y + radius, z - radius],
      [x - radius, y - radius, z + radius],
      [x + radius, y - radius, z + radius],
      [x + radius, y + radius, z + radius],
      [x - radius, y + radius, z + radius],
    ],
    faces: boxFaces,
    label,
    color: COLORS.aqua,
    opacity: 0.2,
    ...options,
  };
}

function octahedron(
  id: string,
  radius: number,
  label: string,
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return {
    id,
    vertices: [
      [radius, 0, 0],
      [-radius, 0, 0],
      [0, radius, 0],
      [0, -radius, 0],
      [0, 0, radius],
      [0, 0, -radius],
    ],
    faces: octahedronFaces,
    label,
    color: COLORS.rose,
    opacity: 0.24,
    ...options,
  };
}

function coordinatePlane(
  id: string,
  axis: "x" | "y" | "z",
  value: number,
  radius: number,
  label: string,
  color: string,
): PlanePatch3D {
  const points: Point3D[] =
    axis === "x"
      ? [
          [value, -radius, -radius],
          [value, radius, -radius],
          [value, radius, radius],
          [value, -radius, radius],
        ]
      : axis === "y"
        ? [
            [-radius, value, -radius],
            [radius, value, -radius],
            [radius, value, radius],
            [-radius, value, radius],
          ]
        : [
            [-radius, -radius, value],
            [radius, -radius, value],
            [radius, radius, value],
            [-radius, radius, value],
          ];
  return { id, points, label, color, opacity: 0.14, dashed: true };
}

const standardBasis: [Point3D, Point3D, Point3D] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const foundation3DStages: VisualizationStage[] = [
  {
    id: "foundation-3d-span",
    kicker: "3D example · Integer span",
    title: "Three basis vectors generate a spatial lattice",
    description:
      "The standard basis e₁,e₂,e₃ generates ℤ³. Rotate the scene to separate points that overlap in a flat projection.",
    formula: "L(B)={z₁b₁+z₂b₂+z₃b₃:z∈ℤ³}=ℤ³",
    insight:
      "In three dimensions the lattice is a discrete point cloud, not a stack of unrelated two-dimensional grids.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: basisSegments(standardBasis, "foundation"),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "The cubic lattice ℤ³", secondary: "Drag to rotate the three independent directions" },
    }),
  },
  {
    id: "foundation-3d-coordinates",
    kicker: "3D example · Lattice coordinates",
    title: "An integer coordinate triple traces a path through the basis",
    description:
      "The vector z=(2,−1,1) means two steps along b₁, one negative step along b₂, and one step along b₃.",
    formula: "x=2b₁−b₂+b₃=(2,−1,1)",
    insight:
      "The ambient point is the endpoint; the integer coefficient triple records how it is assembled in the chosen basis.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.8], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: [
        ...basisSegments(standardBasis, "foundation-coordinates"),
        segment("coordinate-step-1", [0, 0, 0], [2, 0, 0], "2b₁", COLORS.orange),
        segment("coordinate-step-2", [2, 0, 0], [2, -1, 0], "−b₂", COLORS.aqua),
        segment("coordinate-step-3", [2, -1, 0], [2, -1, 1], "+b₃", COLORS.violet),
      ],
      markers: [{ id: "coordinate-target", at: [2, -1, 1], label: "x=(2,−1,1)", style: "optimum" }],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Integer basis coordinates", secondary: "z=(2,−1,1)" },
    }),
  },
  {
    id: "foundation-3d-cell",
    kicker: "3D example · Fundamental parallelepiped",
    title: "One unit cube represents every residue class modulo ℤ³",
    description:
      "Let all three basis coefficients range from zero to one. Translated copies of the resulting cube tile all of space.",
    formula: "𝒫(B)={λ₁b₁+λ₂b₂+λ₃b₃:0≤λᵢ<1}",
    insight:
      "The two-dimensional fundamental parallelogram becomes a genuine volume with six faces.",
    scene: scene3D({
      bounds: { x: [-1.2, 2.2], y: [-1.2, 2.2], z: [-1.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [parallelepiped("foundation-cell", standardBasis, "𝒫(B)", { opacity: 0.32 })],
      segments: basisSegments(standardBasis, "foundation-cell-basis"),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Fundamental cube", secondary: "translations by ℤ³ tile ℝ³" },
    }),
  },
  {
    id: "foundation-3d-determinant",
    kicker: "3D example · Determinant and duality",
    title: "The cell volume is the determinant—and ℤ³ is self-dual",
    description:
      "The unit cube has volume one. Since B=I, the dual basis B⁻ᵀ is again I and the primal and dual lattices coincide.",
    formula: "vol(𝒫(B))=|det B|=1   ·   L*=L(B⁻ᵀ)=ℤ³",
    insight:
      "For a general lattice, the primal cell volume and dual cell volume multiply to one.",
    scene: scene3D({
      bounds: { x: [-1.2, 2.2], y: [-1.2, 2.2], z: [-1.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [parallelepiped("foundation-volume", standardBasis, "volume = 1", { color: COLORS.orange, opacity: 0.3 })],
      segments: basisSegments(standardBasis, "foundation-dual", ["b₁=b₁*", "b₂=b₂*", "b₃=b₃*"]),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Covolume and dual lattice", secondary: "det(L)=det(L*)=1 for ℤ³" },
    }),
  },
];

export const latticeFoundations3DExample: VisualizationExample = {
  id: "three-dimensional-lattice-foundations",
  title: "3D example — cubic lattice and cell",
  description:
    "Rotate ℤ³, trace integer basis coordinates, and inspect a genuine three-dimensional fundamental cell.",
  stages: foundation3DStages,
  proof: {
    title: "How the lattice definitions extend to three dimensions",
    steps: [
      "Three linearly independent vectors form a basis matrix B∈ℝ³ˣ³.",
      "Integer coefficient triples generate the discrete set L(B)=Bℤ³.",
      "Coefficients in [0,1)³ generate one fundamental parallelepiped.",
      "Its translated copies tile ℝ³ and its volume equals |det B|.",
      "The dual basis is B⁻ᵀ, so det(L*)=1/det(L).",
    ],
  },
};

const lllInput: [Point3D, Point3D, Point3D] = [
  [3, 0, 0],
  [4, 2, 0],
  [4, 4, 2],
];
const lllReduced: [Point3D, Point3D, Point3D] = [
  [3, 0, 0],
  [1, 2, 0],
  [-1, 0, 2],
];
const lllGso: [Point3D, Point3D, Point3D] = [
  [3, 0, 0],
  [0, 2, 0],
  [0, 0, 2],
];

const lll3DStages: VisualizationStage[] = [
  {
    id: "lll-3d-input",
    kicker: "3D example · Skew basis",
    title: "A spatial basis can be long and strongly correlated",
    description:
      "The three input vectors point through similar octants. Their parallelepiped has volume 12 but a poor shape.",
    formula: "B=[b₁ b₂ b₃], |det B|=12",
    insight:
      "In three dimensions reduction must control correlations against more than one earlier basis direction.",
    scene: scene3D({
      bounds: { x: [-2, 6], y: [-2, 6], z: [-2, 4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [parallelepiped("lll-input-cell", lllInput, "det = 12", { opacity: 0.16 })],
      segments: basisSegments(lllInput, "lll-input"),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Skew 3D basis", secondary: "same lattice volume, poor conditioning" },
    }),
  },
  {
    id: "lll-3d-gso",
    kicker: "3D example · Gram–Schmidt",
    title: "Gram–Schmidt exposes three orthogonal directions",
    description:
      "The analytic vectors b̃₁=(3,0,0), b̃₂=(0,2,0), b̃₃=(0,0,2) separate the successive new directions contributed by the basis.",
    formula: "b₂=(4/3)b̃₁+b̃₂   ·   b₃=(4/3)b̃₁+2b̃₂+b̃₃",
    insight:
      "The orthogonal vectors are bookkeeping directions, not generally lattice vectors themselves.",
    scene: scene3D({
      bounds: { x: [-2, 6], y: [-2, 6], z: [-2, 4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: [
        ...basisSegments(lllInput, "lll-original", ["b₁", "b₂", "b₃"]),
        ...basisSegments(lllGso, "lll-gso", ["b̃₁", "b̃₂", "b̃₃"]).map((item) => ({ ...item, width: 5, dashed: true })),
      ],
      caption: { primary: "Three-dimensional GSO", secondary: "orthogonal directions reveal the stored μ-coefficients" },
    }),
  },
  {
    id: "lll-3d-size-reduce",
    kicker: "3D example · Size reduction",
    title: "Integer column operations remove the large parallel components",
    description:
      "Replace b₂ by b₂−b₁ and b₃ by b₃−2b₂−b₁, using the updated second vector. The basis becomes shorter while the lattice remains unchanged.",
    formula: "b₂←b₂−b₁=(1,2,0), b₃←b₃−2b₂−b₁=(−1,0,2)",
    insight:
      "Each operation is unimodular, so every lattice point and the determinant are preserved.",
    scene: scene3D({
      bounds: { x: [-3, 5], y: [-3, 5], z: [-2, 4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        parallelepiped("lll-reduced-cell", lllReduced, "same det = 12", {
          fromVertices: parallelepipedVertices(lllInput),
          color: COLORS.aqua,
          opacity: 0.28,
        }),
      ],
      segments: basisSegments(lllReduced, "lll-reduced", ["b₁", "b₂−b₁", "reduced b₃"]),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Size-reduced spatial basis", secondary: "the cell shears without changing volume" },
    }),
  },
  {
    id: "lll-3d-invariant",
    kicker: "3D example · Reduction invariant",
    title: "The lattice and determinant stay fixed while the basis improves",
    description:
      "The final vectors span the same determinant-12 lattice, but their directions are visibly less correlated and their lengths are smaller.",
    formula: "L(B′)=L(B), |det B′|=|det B|=12",
    insight:
      "The full LLL algorithm interleaves these size reductions with Lovász tests and swaps in adjacent Gram–Schmidt directions.",
    scene: scene3D({
      bounds: { x: [-3, 5], y: [-3, 5], z: [-2, 4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [parallelepiped("lll-final-cell", lllReduced, "reduced cell · volume 12", { color: COLORS.violet, opacity: 0.24 })],
      segments: basisSegments(lllReduced, "lll-final", ["b′₁", "b′₂", "b′₃"]),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Reduced 3D basis", secondary: "shorter directions · unchanged lattice" },
    }),
  },
];

export const gramSchmidtLll3DExample: VisualizationExample = {
  id: "three-dimensional-gram-schmidt-lll",
  title: "3D example — Gram–Schmidt and reduction",
  description:
    "Rotate a skew three-vector basis, reveal its orthogonal GSO directions, and watch unimodular reductions shear the cell.",
  stages: lll3DStages,
  proof: {
    title: "Why the 3D reduction preserves the lattice",
    steps: [
      "Gram–Schmidt decomposes every bᵢ into earlier orthogonal components plus b̃ᵢ.",
      "Size reduction subtracts integer multiples of earlier basis vectors.",
      "Those column operations are unimodular and preserve Bℤ³.",
      "Their determinant is ±1, so the fundamental volume remains 12.",
      "LLL additionally uses Lovász tests and swaps to control the growth of the orthogonal lengths.",
    ],
  },
};

const minkowski3DStages: VisualizationStage[] = [
  {
    id: "minkowski-3d-body",
    kicker: "3D example · Convex body",
    title: "Use a centrally symmetric octahedron in the cubic lattice",
    description:
      "Let K={x:|x₁|+|x₂|+|x₃|≤2}. It is convex, centrally symmetric, and has volume 32/3.",
    formula: "vol(K)=4·2³/3=32/3>8=2³det(ℤ³)",
    insight:
      "In dimension three the Minkowski threshold is eight fundamental lattice volumes.",
    scene: scene3D({
      bounds: { x: [-2.6, 2.6], y: [-2.6, 2.6], z: [-2.6, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [octahedron("minkowski-k", 2, "K · volume 32/3")],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Minkowski body in ℝ³", secondary: "K=−K · convex · volume above 8" },
    }),
  },
  {
    id: "minkowski-3d-half",
    kicker: "3D example · Halve the body",
    title: "Scaling by one half divides three-dimensional volume by eight",
    description:
      "The half-body ½K has radius one and volume 4/3, still larger than the determinant-one fundamental cube.",
    formula: "vol(½K)=vol(K)/2³=4/3>1=det(ℤ³)",
    insight:
      "This is precisely the volume condition needed for the Blichfeldt folding collision.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        octahedron("minkowski-original-ghost", 2, "K", { style: "ghost", opacity: 0.08 }),
        octahedron("minkowski-half", 1, "½K · volume 4/3", { color: COLORS.violet, opacity: 0.34 }),
        cube("minkowski-cell", [0.5, 0.5, 0.5], 0.5, "fundamental cube · volume 1", { color: COLORS.aqua, opacity: 0.16 }),
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Half-body versus one cell", secondary: "4/3 > 1 forces an overlap after folding" },
    }),
  },
  {
    id: "minkowski-3d-difference",
    kicker: "3D example · Collision and difference",
    title: "A folded collision creates a nonzero lattice difference",
    description:
      "Choose x=(0.6,0.2,0.1) and y=(−0.4,0.2,0.1) in ½K. Their residues agree modulo ℤ³ because x−y=e₁.",
    formula: "x−y=(1,0,0)=e₁∈ℤ³∖{0}",
    insight:
      "Symmetry and convexity imply ½K−½K⊆K, so the lattice difference remains inside the original body.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [octahedron("minkowski-half-collision", 1, "½K", { color: COLORS.aqua, opacity: 0.22 })],
      segments: [segment("minkowski-difference", [-0.4, 0.2, 0.1], [0.6, 0.2, 0.1], "x−y=e₁", COLORS.rose)],
      markers: [
        { id: "minkowski-x", at: [0.6, 0.2, 0.1], label: "x", style: "optimum" },
        { id: "minkowski-y", at: [-0.4, 0.2, 0.1], label: "y", style: "fractional" },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Blichfeldt pair in 3D", secondary: "equal residues produce e₁" },
    }),
  },
  {
    id: "minkowski-3d-witness",
    kicker: "3D example · Lattice witness",
    title: "The octahedron contains a nonzero cubic lattice point",
    description:
      "The vector e₁ lies well inside K. The same argument guarantees a nonzero lattice point for every qualifying symmetric convex body, not only this octahedron.",
    formula: "e₁=(1,0,0)∈K∩ℤ³∖{0}",
    insight:
      "The theorem converts a global volume inequality into the existence of a discrete witness.",
    scene: scene3D({
      bounds: { x: [-2.6, 2.6], y: [-2.6, 2.6], z: [-2.6, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [octahedron("minkowski-final", 2, "K", { opacity: 0.26 })],
      segments: [segment("minkowski-witness", [0, 0, 0], [1, 0, 0], "nonzero witness e₁", COLORS.orange)],
      markers: [{ id: "minkowski-witness-point", at: [1, 0, 0], label: "e₁∈K∩L", style: "optimum" }],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Minkowski witness", secondary: "volume → collision → nonzero lattice point" },
    }),
  },
];

export const minkowski3DExample: VisualizationExample = {
  id: "three-dimensional-minkowski",
  title: "3D example — octahedral convex body",
  description:
    "Apply Minkowski’s theorem to a centrally symmetric octahedron in the cubic lattice and follow the halving proof spatially.",
  stages: minkowski3DStages,
  proof: {
    title: "Why the three-dimensional Minkowski example works",
    steps: [
      "The octahedron K is convex and centrally symmetric.",
      "Its volume 32/3 exceeds 2³det(ℤ³)=8.",
      "Halving divides volume by eight, so vol(½K)=4/3>1.",
      "Folding ½K into one unit cube forces two points to share a residue modulo ℤ³.",
      "Their nonzero lattice difference belongs to K because ½K−½K⊆K.",
    ],
  },
};

const anvTarget: Point3D = [1.35, -0.6, 2.4];
const anvZ3: Point3D = [0, 0, 2];
const anvZ2: Point3D = [0, -1, 2];
const anvZ1: Point3D = [1, -1, 2];

const anv3DStages: VisualizationStage[] = [
  {
    id: "anv-3d-input",
    kicker: "3D example · Initialize",
    title: "ANV starts with a target and three orthogonal basis directions",
    description:
      "For ℤ³ the reduced basis and its Gram–Schmidt orthogonalization are both e₁,e₂,e₃. Set z₄=0 and x₄=x.",
    formula: "x=(1.35,−0.60,2.40), z₄=0, x₄=x",
    insight:
      "The backward loop will eliminate the e₃, e₂, and e₁ coordinates in that order.",
    scene: scene3D({
      bounds: { x: [-2.2, 3.2], y: [-2.2, 3.2], z: [-1.2, 3.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: basisSegments(standardBasis, "anv-input", ["b̃₁=e₁", "b̃₂=e₂", "b̃₃=e₃"]),
      markers: [{ id: "anv-target", at: anvTarget, label: "x=x₄", style: "fractional" }],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "ANV input in ℝ³", secondary: "round Gram–Schmidt coordinates backwards" },
    }),
  },
  {
    id: "anv-3d-round-z",
    kicker: "3D example · i=3",
    title: "Round the e₃-coordinate 2.40 to 2",
    description:
      "The first backward step chooses two copies of b₃. The remainder λ₃=2−2.40=−0.40 removes the vertical coordinate from the next working vector.",
    formula: "[σ₃,₃]=2, λ₃=−0.40, z₃=2e₃, x₃=(1.35,−0.60,0)",
    insight:
      "After this update, x₃ lies in span(e₁,e₂).",
    scene: scene3D({
      bounds: { x: [-2.2, 3.2], y: [-2.2, 3.2], z: [-1.2, 3.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      planes: [coordinatePlane("anv-z-layer", "z", 2, 2.6, "chosen layer x₃=2", COLORS.violet)],
      segments: [segment("anv-z-remainder", [1.35, -0.6, 2], anvTarget, "0.40e₃", COLORS.rose)],
      markers: [
        { id: "anv-target-z", at: anvTarget, label: "x", style: "fractional" },
        { id: "anv-z3", at: anvZ3, label: "z₃=2e₃", style: "integer", animateFrom: [0, 0, 0] },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Backward round i=3", secondary: "the vertical coordinate is fixed first" },
    }),
  },
  {
    id: "anv-3d-round-y",
    kicker: "3D example · i=2",
    title: "Round the e₂-coordinate −0.60 to −1",
    description:
      "The nearest integer is −1, so λ₂=−1−(−0.60)=−0.40. The accumulator moves to z₂=(0,−1,2).",
    formula: "[σ₂,₂]=−1, λ₂=−0.40, z₂=(0,−1,2), x₂=(1.35,0,0)",
    insight:
      "Only the first Gram–Schmidt coordinate remains in the working vector.",
    scene: scene3D({
      bounds: { x: [-2.2, 3.2], y: [-2.2, 3.2], z: [-1.2, 3.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      planes: [coordinatePlane("anv-y-layer", "y", -1, 2.6, "chosen layer x₂=−1", COLORS.aqua)],
      segments: [segment("anv-z3-z2", anvZ3, anvZ2, "−e₂", COLORS.aqua)],
      markers: [
        { id: "anv-z3-old", at: anvZ3, label: "z₃", style: "integer" },
        { id: "anv-z2", at: anvZ2, label: "z₂=(0,−1,2)", style: "optimum", animateFrom: anvZ3 },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Backward round i=2", secondary: "the second coordinate is fixed next" },
    }),
  },
  {
    id: "anv-3d-round-x",
    kicker: "3D example · i=1",
    title: "Round the final coordinate 1.35 to 1",
    description:
      "The last multiplier is λ₁=1−1.35=−0.35. Adding e₁ completes the lattice accumulator at z₁=(1,−1,2).",
    formula: "[σ₁,₁]=1, λ₁=−0.35, z₁=(1,−1,2), x₁=0",
    insight:
      "The script invariant is visible: every processed orthogonal coordinate has vanished from the working vector.",
    scene: scene3D({
      bounds: { x: [-2.2, 3.2], y: [-2.2, 3.2], z: [-1.2, 3.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      planes: [coordinatePlane("anv-x-layer", "x", 1, 2.6, "chosen layer x₁=1", COLORS.orange)],
      segments: [segment("anv-z2-z1", anvZ2, anvZ1, "+e₁", COLORS.orange)],
      markers: [
        { id: "anv-z2-old", at: anvZ2, label: "z₂", style: "integer" },
        { id: "anv-z1", at: anvZ1, label: "z₁=b*", style: "optimum", animateFrom: anvZ2 },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Backward round i=1", secondary: "all three coordinates are now integral" },
    }),
  },
  {
    id: "anv-3d-output",
    kicker: "3D example · Return",
    title: "The returned point is the exact nearest lattice vector here",
    description:
      "The error vector is the bounded Gram–Schmidt combination −0.35e₁−0.40e₂−0.40e₃. Coordinate rounding is exact for the orthonormal cubic basis.",
    formula: "b*−x=(−0.35,−0.40,−0.40)=Σᵢλᵢb̃ᵢ",
    insight:
      "For a general reduced basis ANV is approximate, with factor √(2³−1)=√7 in dimension three.",
    scene: scene3D({
      bounds: { x: [-2.2, 3.2], y: [-2.2, 3.2], z: [-1.2, 3.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: [segment("anv-error", anvTarget, anvZ1, "b*−x", COLORS.rose)],
      markers: [
        { id: "anv-output-target", at: anvTarget, label: "x", style: "fractional" },
        { id: "anv-output", at: anvZ1, label: "b*=(1,−1,2)", style: "optimum" },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "ANV output in ℝ³", secondary: "exact for the orthonormal cubic basis" },
    }),
  },
];

export const anv3DExample: VisualizationExample = {
  id: "three-dimensional-anv",
  title: "3D example — three backward rounds",
  description:
    "Run the script’s ANV loop through e₃, e₂, and e₁ and track the spatial accumulator after every rounding.",
  stages: anv3DStages,
  proof: {
    title: "Why the 3D ANV execution works",
    steps: [
      "For ℤ³ the standard basis is already reduced and orthonormal.",
      "Iteration i=3 rounds 2.40 to 2 and removes the e₃ coordinate.",
      "Iteration i=2 rounds −0.60 to −1 and removes the e₂ coordinate.",
      "Iteration i=1 rounds 1.35 to 1 and leaves x₁=0.",
      "The accumulator is b*=(1,−1,2), and all |λᵢ|≤1/2.",
    ],
  },
};

function voronoiNeighborMarkers(): Marker3D[] {
  const points: Point3D[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  return points.map((at, index) => ({
    id: `voronoi-neighbor-${index}`,
    at,
    label: ["e₁", "−e₁", "e₂", "−e₂", "e₃", "−e₃"][index],
    style: "integer",
  }));
}

function voronoiTilingCubes(): Mesh3D[] {
  const meshes: Mesh3D[] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        meshes.push(
          cube(`voronoi-tile-${x}-${y}-${z}`, [x, y, z], 0.5, x === 0 && y === 0 && z === 0 ? "Vor(0)" : "", {
            color: x === 0 && y === 0 && z === 0 ? COLORS.rose : COLORS.aqua,
            opacity: x === 0 && y === 0 && z === 0 ? 0.28 : 0.07,
          }),
        );
      }
    }
  }
  return meshes;
}

const voronoi3DStages: VisualizationStage[] = [
  {
    id: "voronoi-3d-neighbors",
    kicker: "3D example · Nearest neighbors",
    title: "Six cubic-lattice neighbors surround the origin",
    description:
      "The closest nonzero vectors of ℤ³ are ±e₁, ±e₂, and ±e₃. Each lies across one future face of the origin’s Voronoi cell.",
    formula: "V={±e₁,±e₂,±e₃}",
    insight:
      "A three-dimensional Voronoi facet is a polygonal face rather than a line segment.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      segments: basisSegments(standardBasis, "voronoi-basis"),
      markers: [
        { id: "voronoi-origin", at: [0, 0, 0], label: "0", style: "optimum" },
        ...voronoiNeighborMarkers(),
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Relevant neighbors of 0", secondary: "one vector across each future face" },
    }),
  },
  {
    id: "voronoi-3d-bisectors",
    kicker: "3D example · Six half-spaces",
    title: "Perpendicular bisector planes carve out a cube",
    description:
      "The six distance comparisons become ±xᵢ≤1/2. Their intersection is the centered unit cube.",
    formula: "Vor(0)={x∈ℝ³:|x₁|,|x₂|,|x₃|≤1/2}",
    insight:
      "Every relevant vector contributes exactly one square facet.",
    scene: scene3D({
      bounds: { x: [-1.7, 1.7], y: [-1.7, 1.7], z: [-1.7, 1.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [cube("voronoi-center-cell", [0, 0, 0], 0.5, "Vor(0)", { color: COLORS.rose, opacity: 0.28 })],
      planes: [
        coordinatePlane("vor-x-plus", "x", 0.5, 1.2, "x₁=1/2", COLORS.orange),
        coordinatePlane("vor-x-minus", "x", -0.5, 1.2, "x₁=−1/2", COLORS.orange),
        coordinatePlane("vor-y-plus", "y", 0.5, 1.2, "x₂=1/2", COLORS.aqua),
        coordinatePlane("vor-y-minus", "y", -0.5, 1.2, "x₂=−1/2", COLORS.aqua),
        coordinatePlane("vor-z-plus", "z", 0.5, 1.2, "x₃=1/2", COLORS.violet),
        coordinatePlane("vor-z-minus", "z", -0.5, 1.2, "x₃=−1/2", COLORS.violet),
      ],
      markers: voronoiNeighborMarkers(),
      caption: { primary: "Cubic Voronoi cell", secondary: "six bisector planes · six relevant facets" },
    }),
  },
  {
    id: "voronoi-3d-tiling",
    kicker: "3D example · Tessellation",
    title: "Translated Voronoi cubes fill three-dimensional space",
    description:
      "Every z∈ℤ³ receives the cube z+[−1/2,1/2]³. The interiors are disjoint and the cells meet face-to-face.",
    formula: "ℝ³=⋃z∈ℤ³(z+Vor(0)), vol(Vor(0))=1=det(ℤ³)",
    insight:
      "Rotate the transparent block to see the interior cell surrounded on all six sides.",
    scene: scene3D({
      bounds: { x: [-1.7, 1.7], y: [-1.7, 1.7], z: [-1.7, 1.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: voronoiTilingCubes(),
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Voronoi tessellation of ℝ³", secondary: "27 displayed translates around the origin" },
    }),
  },
  {
    id: "voronoi-3d-cvp",
    kicker: "3D example · Closest vector",
    title: "Cell membership decodes the nearest cubic lattice point",
    description:
      "For q=(1.25,−0.70,0.40), coordinate rounding gives z=(1,−1,0). The residual q−z=(0.25,0.30,0.40) lies in Vor(0).",
    formula: "q−z∈[−1/2,1/2]³ ⇔ z∈CVP(q)",
    insight:
      "For a general lattice the cell need not be a cube, but the same translation test characterizes closest vectors.",
    scene: scene3D({
      bounds: { x: [-1.2, 2.2], y: [-1.7, 1.7], z: [-1.2, 1.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        cube("voronoi-cvp-origin", [0, 0, 0], 0.5, "Vor(0)", { color: COLORS.aqua, opacity: 0.14 }),
        cube("voronoi-cvp-cell", [1, -1, 0], 0.5, "z+Vor(0)", { color: COLORS.rose, opacity: 0.28 }),
      ],
      segments: [segment("voronoi-cvp-residual", [1, -1, 0], [1.25, -0.7, 0.4], "q−z", COLORS.rose)],
      markers: [
        { id: "voronoi-cvp-q", at: [1.25, -0.7, 0.4], label: "q", style: "fractional" },
        { id: "voronoi-cvp-z", at: [1, -1, 0], label: "z=CVP(q)", style: "optimum" },
        { id: "voronoi-cvp-residual-point", at: [0.25, 0.3, 0.4], label: "q−z∈Vor(0)", style: "integer", animateFrom: [1.25, -0.7, 0.4] },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: { primary: "Closest-vector decoding in ℝ³", secondary: "translate q into the origin cell" },
    }),
  },
];

export const voronoi3DExample: VisualizationExample = {
  id: "three-dimensional-voronoi",
  title: "3D example — cubic Voronoi cells",
  description:
    "Construct the centered Voronoi cube from six bisector planes, tile space, and decode a spatial closest-vector query.",
  stages: voronoi3DStages,
  proof: {
    title: "Why the cubic Voronoi cell is [−1/2,1/2]³",
    steps: [
      "The six shortest nonzero vectors of ℤ³ are ±e₁, ±e₂, and ±e₃.",
      "For v=eᵢ, the inequality vᵀx≤‖v‖²/2 becomes xᵢ≤1/2.",
      "For v=−eᵢ, it becomes xᵢ≥−1/2.",
      "Intersecting all six half-spaces gives the centered unit cube.",
      "Integer translates tile space, and q−z in that cube is equivalent to z being a closest lattice vector.",
    ],
  },
};
