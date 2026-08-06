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
  lime: "#d4ef77",
};

const ORIGIN: Point3D = [0, 0, 0];
const V1: Point3D = [1, 0, 0];
const V2: Point3D = [0, 1, 0];
const V3: Point3D = [1, 1, 2];
const H: Point3D = [1, 1, 1];
const HILBERT_BASIS: Point3D[] = [V1, V2, V3, H];

const tetrahedronFaces = [
  [0, 1, 2],
  [0, 1, 3],
  [0, 2, 3],
  [1, 2, 3],
];

const boxFaces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
];

function add3(a: Point3D, b: Point3D): Point3D {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale3(lambda: number, v: Point3D): Point3D {
  return [lambda * v[0], lambda * v[1], lambda * v[2]];
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

function segment3D(
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

function marker3D(
  id: string,
  at: Point3D,
  label?: string,
  style: Marker3D["style"] = "integer",
  radius = 0.065,
): Marker3D {
  return { id, at, label, style, radius };
}

function truncatedConeMesh(scale: number, id: string, opacity = 0.18): Mesh3D {
  return {
    id,
    vertices: [ORIGIN, scale3(scale, V1), scale3(scale, V2), scale3(scale, V3)],
    faces: tetrahedronFaces,
    label: `truncated cone: λ₁+λ₂+λ₃≤${scale}`,
    color: COLORS.lime,
    edgeColor: COLORS.muted,
    opacity,
    style: "ghost",
  };
}

function parallelepipedVertices(): Point3D[] {
  return [
    ORIGIN,
    V1,
    add3(V1, V2),
    V2,
    V3,
    add3(V1, V3),
    add3(add3(V1, V2), V3),
    add3(V2, V3),
  ];
}

function remainderCellMesh(): Mesh3D {
  return {
    id: "igs3d-remainder-cell",
    vertices: parallelepipedVertices(),
    faces: boxFaces,
    label: "P={Σλᵢvᵢ:0≤λᵢ≤1}",
    color: COLORS.lime,
    edgeColor: COLORS.violet,
    opacity: 0.24,
    style: "solid",
  };
}

function coneCoordinates(point: Point3D): [number, number, number] {
  const lambda3 = point[2] / 2;
  return [point[0] - lambda3, point[1] - lambda3, lambda3];
}

function coneLatticeMarkers(scale: number): Marker3D[] {
  const markers: Marker3D[] = [];
  const upper = Math.ceil(2 * scale);

  for (let x = 0; x <= upper; x += 1) {
    for (let y = 0; y <= upper; y += 1) {
      for (let z = 0; z <= upper * 2; z += 1) {
        const candidate: Point3D = [x, y, z];
        const [lambda1, lambda2, lambda3] = coneCoordinates(candidate);
        if (
          lambda1 < -1e-9 ||
          lambda2 < -1e-9 ||
          lambda3 < -1e-9 ||
          lambda1 + lambda2 + lambda3 > scale + 1e-9
        ) {
          continue;
        }
        markers.push(
          marker3D(
            `igs3d-cone-${scale}-${x}-${y}-${z}`,
            candidate,
            x === 0 && y === 0 && z === 0 ? "0" : undefined,
            "integer",
            x === 0 && y === 0 && z === 0 ? 0.085 : 0.05,
          ),
        );
      }
    }
  }
  return markers;
}

function basisSegments(prefix: string): Segment3D[] {
  return [
    segment3D(`${prefix}-v1`, ORIGIN, V1, "v₁=(1,0,0)", COLORS.orange),
    segment3D(`${prefix}-v2`, ORIGIN, V2, "v₂=(0,1,0)", COLORS.aqua),
    segment3D(`${prefix}-v3`, ORIGIN, V3, "v₃=(1,1,2)", COLORS.violet),
    segment3D(`${prefix}-h`, ORIGIN, H, "h=(1,1,1)", COLORS.rose, { width: 5 }),
  ];
}

const coneBounds: Scene3D["bounds"] = {
  x: [-0.5, 4.0],
  y: [-0.5, 4.0],
  z: [-0.5, 6.5],
};

const hilbert3DStages: VisualizationStage[] = [
  {
    id: "igs3d-cone-input",
    kicker: "Chapter 21 · Genuine 3D cone",
    title: "Start with three primitive extreme rays",
    description:
      "The displayed tetrahedron is the bounded truncation λ₁+λ₂+λ₃≤3 of the full cone C=cone(v₁,v₂,v₃). The point cloud consists exactly of the lattice points satisfying this truncation.",
    formula: "v₁=(1,0,0), v₂=(0,1,0), v₃=(1,1,2),   |det[v₁ v₂ v₃]|=2",
    insight:
      "The determinant two already signals that the ray lattice has index two in the ambient lattice points of the cone.",
    scene: scene3D({
      bounds: coneBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.48, distance: 10.5 },
      meshes: [truncatedConeMesh(3, "igs3d-cone-input-mesh")],
      segments: [
        segment3D("igs3d-input-v1", ORIGIN, V1, "v₁", COLORS.orange),
        segment3D("igs3d-input-v2", ORIGIN, V2, "v₂", COLORS.aqua),
        segment3D("igs3d-input-v3", ORIGIN, V3, "v₃", COLORS.violet),
      ],
      markers: coneLatticeMarkers(3),
      showAxes: true,
      showGround: true,
      caption: {
        primary: "A simplicial rational cone in ℝ³",
        secondary: "Only a finite truncation is drawn; the cone continues along all three rays.",
      },
    }),
  },
  {
    id: "igs3d-rays-miss-h",
    kicker: "Chapter 21 · Extreme rays are insufficient",
    title: "The interior lattice point h cannot be generated integrally by the rays",
    description:
      "The point h=(1,1,1) lies in the cone because it is the midpoint combination of all three rays. Since the three rays are linearly independent, these coefficients are unique and nonintegral.",
    formula: "h=½v₁+½v₂+½v₃,   so h∉ℤ₊v₁+ℤ₊v₂+ℤ₊v₃",
    insight:
      "This is the three-dimensional analogue of the two-dimensional gap between real conic generation and integral generation.",
    scene: scene3D({
      bounds: coneBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.48, distance: 10.5 },
      meshes: [truncatedConeMesh(3, "igs3d-rays-fail-mesh")],
      segments: [
        segment3D("igs3d-fail-v1", ORIGIN, V1, "v₁", COLORS.orange),
        segment3D("igs3d-fail-v2", ORIGIN, V2, "v₂", COLORS.aqua),
        segment3D("igs3d-fail-v3", ORIGIN, V3, "v₃", COLORS.violet),
        segment3D("igs3d-fail-h", ORIGIN, H, "h=½(v₁+v₂+v₃)", COLORS.rose, {
          dashed: true,
          width: 5,
        }),
      ],
      markers: [
        ...coneLatticeMarkers(3),
        marker3D("igs3d-missing-h", H, "missing h=(1,1,1)", "fractional", 0.12),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "The ray monoid misses an interior lattice point",
        secondary: "Real coefficients (1/2,1/2,1/2) cannot be replaced by nonnegative integers.",
      },
    }),
  },
  {
    id: "igs3d-hilbert-basis",
    kicker: "Chapter 21 · Unique integral basis",
    title: "Adding h gives the complete Hilbert basis",
    description:
      "Every integer point x in the cone has λ₃=x₃/2. If x₃ is even, all three ray coefficients are integral. If x₃ is odd, each coefficient is a half-integer at least 1/2; subtracting h leaves nonnegative integral ray coefficients.",
    formula: "H(C)={v₁,v₂,v₃,h},   h=(1,1,1)",
    insight:
      "Thus the four displayed vectors generate C∩ℤ³, and each is indecomposable. Because C is pointed, Theorem 128 makes this basis unique.",
    scene: scene3D({
      bounds: coneBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.48, distance: 10.5 },
      meshes: [truncatedConeMesh(3, "igs3d-hilbert-mesh")],
      segments: basisSegments("igs3d-hilbert"),
      markers: [
        ...coneLatticeMarkers(3),
        ...HILBERT_BASIS.map((basisPoint, index) =>
          marker3D(
            `igs3d-hilbert-marker-${index}`,
            basisPoint,
            index === 3 ? "new Hilbert vector" : undefined,
            "optimum",
            index === 3 ? 0.12 : 0.09,
          ),
        ),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Exact Hilbert basis of the three-dimensional cone",
        secondary: "Parity of x₃ decides whether the residue is 0 or h.",
      },
    }),
  },
];

const closedCellIntegerPoints: Point3D[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [1, 1, 1],
  [1, 1, 2],
  [2, 1, 2],
  [1, 2, 2],
  [2, 2, 2],
];

const decompositionBounds: Scene3D["bounds"] = {
  x: [-0.5, 7.0],
  y: [-0.5, 7.0],
  z: [-0.5, 13.5],
};

const gordan3DStages: VisualizationStage[] = [
  {
    id: "igs3d-gordan-cell",
    kicker: "Chapter 21 · Theorem 127 in ℝ³",
    title: "Coefficient remainders live in one bounded parallelepiped",
    description:
      "The closed cell P={Σλᵢvᵢ:0≤λᵢ≤1} is drawn as a parallelepiped. Its integer points are finite. For the canonical half-open cell 0≤λᵢ<1, only 0 and h remain as remainder representatives.",
    formula: "P∩ℤ³ is finite,   P°ₕₐₗ𝒻∩ℤ³={0,h}",
    insight:
      "This is Gordan's floor-and-remainder proof made spatial: the unbounded cone is reduced to finitely many lattice residues in a bounded cell.",
    scene: scene3D({
      bounds: { x: [-0.5, 2.7], y: [-0.5, 2.7], z: [-0.5, 2.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.82, pitch: 0.52, distance: 8.5 },
      meshes: [remainderCellMesh()],
      segments: [
        segment3D("igs3d-cell-v1", ORIGIN, V1, "v₁", COLORS.orange),
        segment3D("igs3d-cell-v2", ORIGIN, V2, "v₂", COLORS.aqua),
        segment3D("igs3d-cell-v3", ORIGIN, V3, "v₃", COLORS.violet),
      ],
      markers: closedCellIntegerPoints.map((candidate, index) => {
        const canonical = index === 0 || index === 4;
        return marker3D(
          `igs3d-cell-point-${index}`,
          candidate,
          index === 0 ? "0" : index === 4 ? "h" : undefined,
          canonical ? "optimum" : "integer",
          canonical ? 0.12 : 0.06,
        );
      }),
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Gordan remainder cell",
        secondary: "The mesh is drawn closed; the canonical half-open residue set is {0,h}.",
      },
    }),
  },
  {
    id: "igs3d-gordan-decomposition",
    kicker: "Chapter 21 · Floor the coefficients",
    title: "An arbitrary cone lattice point is a residue plus integral ray steps",
    description:
      "For x=(5,4,5), the unique real ray coefficients are (5/2,3/2,5/2). Flooring them gives (2,1,2), and the remaining point is h.",
    formula: "(5,4,5)=h+2v₁+v₂+2v₃",
    insight:
      "The infinite family of cone lattice points is generated by the finite remainder set together with the original integral ray generators.",
    scene: scene3D({
      bounds: decompositionBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.45, distance: 13.5 },
      meshes: [truncatedConeMesh(6.5, "igs3d-gordan-large-cone", 0.08)],
      segments: [
        segment3D("igs3d-dec-1", ORIGIN, [2, 0, 0], "2v₁", COLORS.orange),
        segment3D("igs3d-dec-2", [2, 0, 0], [2, 1, 0], "+v₂", COLORS.aqua),
        segment3D("igs3d-dec-3", [2, 1, 0], [4, 3, 4], "+2v₃", COLORS.violet),
        segment3D("igs3d-dec-4", [4, 3, 4], [5, 4, 5], "+h", COLORS.rose, {
          width: 5,
        }),
      ],
      markers: [
        marker3D("igs3d-dec-origin", ORIGIN, "0", "integer", 0.08),
        marker3D("igs3d-dec-residue", H, "remainder h", "optimum", 0.1),
        marker3D("igs3d-dec-target", [5, 4, 5], "x=(5,4,5)", "optimum", 0.13),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Concrete Gordan decomposition",
        secondary: "λ=(2.5,1.5,2.5), floors=(2,1,2), residue h.",
      },
    }),
  },
];

const caratheodory3DStages: VisualizationStage[] = [
  {
    id: "igs3d-caratheodory-target",
    kicker: "Chapter 22 · Integer Carathéodory in dimension three",
    title: "A lattice point can require three distinct Hilbert vectors",
    description:
      "The target x=(2,3,3) has the unique nonnegative integer representation x=v₂+v₃+h in this Hilbert basis. The parity equation 2c+d=3 forces d=1,c=1, and then the first two coordinates force the remaining coefficients.",
    formula: "(2,3,3)=v₂+v₃+h",
    insight:
      "This concrete point uses exactly n=3 distinct generators, illustrating what a genuinely three-dimensional sparse integral representation looks like.",
    scene: scene3D({
      bounds: coneBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.48, distance: 10.5 },
      meshes: [truncatedConeMesh(3, "igs3d-caratheodory-cone")],
      segments: [
        segment3D("igs3d-car-v2", ORIGIN, V2, "v₂", COLORS.aqua),
        segment3D("igs3d-car-v3", V2, add3(V2, V3), "+v₃", COLORS.violet),
        segment3D("igs3d-car-h", add3(V2, V3), [2, 3, 3], "+h", COLORS.rose, {
          width: 5,
        }),
      ],
      markers: [
        ...coneLatticeMarkers(3),
        marker3D("igs3d-car-target", [2, 3, 3], "x=(2,3,3)", "optimum", 0.13),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Three-generator integer decomposition",
        secondary: "The support is {v₂,v₃,h}; no two-generator representation exists.",
      },
    }),
  },
  {
    id: "igs3d-caratheodory-bound",
    kicker: "Chapter 22 · Theorem 131",
    title: "The theorem controls support, not coefficient size",
    description:
      "In dimension three, the lecture theorem guarantees a representation using at most 2n−1=5 Hilbert vectors; the exercise strengthens this to 2n−2=4. This example happens to need only three distinct vectors, although multiplicities in other points can be arbitrarily large.",
    formula: "n=3: support≤5 in Theorem 131, support≤4 in the strengthened exercise",
    insight:
      "The displayed path separates multiplicity from support: each colored direction counts once regardless of how many copies are used.",
    scene: scene3D({
      bounds: decompositionBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.45, distance: 13.5 },
      meshes: [truncatedConeMesh(6.5, "igs3d-car-support-cone", 0.08)],
      segments: [
        segment3D("igs3d-car-s1", ORIGIN, [0, 1, 0], "1·v₂", COLORS.aqua),
        segment3D("igs3d-car-s2", [0, 1, 0], [3, 4, 6], "3·v₃", COLORS.violet),
        segment3D("igs3d-car-s3", [3, 4, 6], [5, 6, 8], "2·h", COLORS.rose),
      ],
      markers: [marker3D("igs3d-car-large-target", [5, 6, 8], "support size 3", "optimum", 0.13)],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Support counts distinct generators",
        secondary: "1·v₂+3·v₃+2·h still has support size three.",
      },
    }),
  },
];

const GRAVER_POSITIVE: Point3D[] = [
  [2, -1, 0],
  [0, -1, 2],
  [1, 0, -1],
  [1, -1, 1],
];
const GRAVER_BASIS: Point3D[] = [
  ...GRAVER_POSITIVE,
  ...GRAVER_POSITIVE.map((g) => scale3(-1, g)),
];

const kernelPlane: PlanePatch3D = {
  id: "igs3d-kernel-plane",
  points: [
    [-6, 2, 2],
    [2, -2, 2],
    [6, -2, -2],
    [-2, 2, -2],
  ],
  label: "ker([1 2 1])",
  color: COLORS.lime,
  opacity: 0.2,
};

function kernelMarkers(): Marker3D[] {
  const markers: Marker3D[] = [];
  for (let x1 = -4; x1 <= 4; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -4; x3 <= 4; x3 += 1) {
        if (x1 + 2 * x2 + x3 !== 0) continue;
        markers.push(
          marker3D(
            `igs3d-kernel-${x1}-${x2}-${x3}`,
            [x1, x2, x3],
            x1 === 0 && x2 === 0 && x3 === 0 ? "0" : undefined,
            "integer",
            x1 === 0 && x2 === 0 && x3 === 0 ? 0.09 : 0.05,
          ),
        );
      }
    }
  }
  return markers;
}

function feasibleMarkers(): Marker3D[] {
  const markers: Marker3D[] = [];
  for (let x1 = 0; x1 <= 8; x1 += 1) {
    for (let x2 = 0; x2 <= 4; x2 += 1) {
      for (let x3 = 0; x3 <= 8; x3 += 1) {
        if (x1 + 2 * x2 + x3 !== 8) continue;
        markers.push(marker3D(`igs3d-feasible-${x1}-${x2}-${x3}`, [x1, x2, x3], undefined, "integer", 0.055));
      }
    }
  }
  return markers;
}

const feasibleTriangleMesh: Mesh3D = {
  id: "igs3d-feasible-triangle",
  vertices: [
    [8, 0, 0],
    [0, 4, 0],
    [0, 0, 8],
  ],
  faces: [[0, 1, 2]],
  label: "x₁+2x₂+x₃=8, x≥0",
  color: COLORS.lime,
  edgeColor: COLORS.violet,
  opacity: 0.22,
  style: "solid",
};

const graverBounds: Scene3D["bounds"] = {
  x: [-6.5, 6.5],
  y: [-2.8, 2.8],
  z: [-4.8, 4.8],
};

const graver3DStages: VisualizationStage[] = [
  {
    id: "igs3d-graver-kernel-plane",
    kicker: "Chapter 22 · Actual three-dimensional kernel",
    title: "The integer kernel is a lattice inside a plane",
    description:
      "For A=[1 2 1], the kernel is the two-dimensional plane x₁+2x₂+x₃=0 embedded in ℝ³. The markers show its integer points directly, without projecting them to two coordinates.",
    formula: "ker(A)∩ℤ³={h∈ℤ³:h₁+2h₂+h₃=0}",
    insight:
      "The Graver construction partitions this plane lattice by ambient orthants and takes the Hilbert basis in each resulting pointed cone.",
    scene: scene3D({
      bounds: graverBounds,
      axisLabels: { x: "h₁", y: "h₂", z: "h₃" },
      camera: { yaw: 0.7, pitch: 0.38, distance: 13 },
      planes: [kernelPlane],
      markers: kernelMarkers(),
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Integer kernel lattice in its true ambient space",
        secondary: "Every marker satisfies h₁+2h₂+h₃=0.",
      },
    }),
  },
  {
    id: "igs3d-graver-basis",
    kicker: "Chapter 22 · Definition 133 and Example 134",
    title: "Eight primitive orthant-compatible moves form the Graver basis",
    description:
      "The four displayed moves and their negatives are the Hilbert-basis elements obtained across the orthant cones of the kernel plane.",
    formula: "G[A]=±{(2,−1,0),(0,−1,2),(1,0,−1),(1,−1,1)}",
    insight:
      "Every integer kernel displacement is a conformal nonnegative integer combination of the highlighted moves from its own orthant.",
    scene: scene3D({
      bounds: graverBounds,
      axisLabels: { x: "h₁", y: "h₂", z: "h₃" },
      camera: { yaw: 0.7, pitch: 0.38, distance: 13 },
      planes: [kernelPlane],
      segments: GRAVER_BASIS.map((g, index) =>
        segment3D(
          `igs3d-graver-vector-${index}`,
          ORIGIN,
          g,
          index < 4 ? `g${index + 1}` : `−g${index - 3}`,
          index < 4 ? COLORS.violet : COLORS.aqua,
          { width: 4 },
        ),
      ),
      markers: [
        ...kernelMarkers(),
        ...GRAVER_BASIS.map((g, index) =>
          marker3D(`igs3d-graver-marker-${index}`, g, index === 0 ? "Graver moves" : undefined, "optimum", 0.1),
        ),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Graver basis in ℝ³",
        secondary: "Primitive signed moves on the kernel plane.",
      },
    }),
  },
  {
    id: "igs3d-graver-augmentation",
    kicker: "Chapter 22 · Theorem 135",
    title: "A Graver move gives a feasible improving path on the constraint plane",
    description:
      "Maximize x₁ subject to x₁+2x₂+x₃=8 and x≥0. Starting at (0,4,0), repeatedly add g=(2,−1,0). Each step remains on the feasible triangle and increases x₁ by two.",
    formula: "(0,4,0)→(2,3,0)→(4,2,0)→(6,1,0)→(8,0,0)",
    insight:
      "The path is now shown in the original three variables rather than in the projected (x₂,x₃)-coordinates.",
    scene: scene3D({
      bounds: { x: [-0.5, 8.8], y: [-0.5, 4.8], z: [-0.5, 8.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.45, distance: 15 },
      meshes: [feasibleTriangleMesh],
      segments: [
        segment3D("igs3d-aug-1", [0, 4, 0], [2, 3, 0], "g", COLORS.violet),
        segment3D("igs3d-aug-2", [2, 3, 0], [4, 2, 0], "g", COLORS.violet),
        segment3D("igs3d-aug-3", [4, 2, 0], [6, 1, 0], "g", COLORS.violet),
        segment3D("igs3d-aug-4", [6, 1, 0], [8, 0, 0], "g", COLORS.violet),
      ],
      markers: [
        ...feasibleMarkers(),
        marker3D("igs3d-aug-start", [0, 4, 0], "start", "fractional", 0.12),
        marker3D("igs3d-aug-optimum", [8, 0, 0], "optimum", "optimum", 0.13),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "Graver augmentation on a three-dimensional feasible set",
        secondary: "Every arrow is the same kernel move g=(2,−1,0).",
      },
    }),
  },
  {
    id: "igs3d-graver-optimality",
    kicker: "Chapter 22 · Finite optimality certificate",
    title: "At the optimum, every improving Graver direction is blocked",
    description:
      "At x*=(8,0,0), a move with positive x₁-component would require at least one negative component in x₂ or x₃. Hence no improving Graver move remains feasible.",
    formula: "x* optimal ⇔ no h∈G[A] with cᵀh>0 and x*+h feasible",
    insight:
      "Theorem 135 converts global optimality into finitely many local feasibility checks against the Graver basis.",
    scene: scene3D({
      bounds: { x: [-0.5, 9.8], y: [-1.8, 4.8], z: [-1.8, 8.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: 0.78, pitch: 0.45, distance: 16 },
      meshes: [feasibleTriangleMesh],
      segments: [
        segment3D("igs3d-blocked-g", [8, 0, 0], [10, -1, 0], "x*+g leaves x≥0", COLORS.rose, {
          dashed: true,
          width: 5,
        }),
      ],
      markers: [
        ...feasibleMarkers(),
        marker3D("igs3d-certificate-optimum", [8, 0, 0], "x*", "optimum", 0.14),
      ],
      showAxes: true,
      showGround: true,
      caption: {
        primary: "No feasible improving Graver step",
        secondary: "The candidate x* therefore has a finite certificate of optimality.",
      },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "three-dimensional-hilbert-basis",
    title: "3D cone whose extreme rays miss a lattice point",
    description:
      "A determinant-two simplicial cone with the exact Hilbert basis {v₁,v₂,v₃,h}.",
    stages: hilbert3DStages,
    proof: {
      title: "Why the four vectors form the exact integral basis",
      steps: [
        "For x∈C∩ℤ³, the unique ray coefficient λ₃ equals x₃/2.",
        "If x₃ is even, λ₃ is integral and λ₁=x₁−λ₃, λ₂=x₂−λ₃ are nonnegative integers.",
        "If x₃ is odd, all three coefficients are half-integers at least 1/2. Subtracting h removes 1/2 from every coefficient and leaves a nonnegative integral ray combination.",
        "The four vectors are indecomposable; pointedness then gives uniqueness of the integral basis.",
      ],
    },
  },
  {
    id: "three-dimensional-gordan-cell",
    title: "Gordan's bounded remainder construction in 3D",
    description:
      "The full coefficient parallelepiped and a concrete floor-and-remainder decomposition.",
    stages: gordan3DStages,
  },
  {
    id: "three-dimensional-integer-caratheodory",
    title: "Integer Carathéodory in 3D",
    description:
      "A target requiring three distinct Hilbert vectors and a visual distinction between support and multiplicity.",
    stages: caratheodory3DStages,
  },
  {
    id: "three-dimensional-graver-basis",
    title: "Graver basis and augmentation in the original 3D variables",
    description:
      "The kernel plane, all eight Graver moves, a feasible integer triangle, and an augmentation path.",
    stages: graver3DStages,
    proof: {
      title: "Why the augmentation step certifies nonoptimality",
      steps: [
        "The displacement from a feasible point to a better feasible point belongs to ker(A)∩ℤ³.",
        "Within its orthant it decomposes into nonnegative integer multiples of Graver moves.",
        "At least one constituent move improves the objective.",
        "Sign compatibility keeps one such move between the two feasible points componentwise, so the move remains feasible.",
      ],
    },
  },
];

const visualization: VisualizationDefinition = {
  id: "integral-generating-sets-three-dimensional",
  title: "Integral Generating Sets in Three Dimensions",
  shortTitle: "Integral generating sets · 3D",
  chapter: "Integral generating sets",
  order: 2,
  description:
    "Genuine three-dimensional examples for Chapters 21 and 22: an exact Hilbert basis beyond the extreme rays, Gordan's bounded remainder cell, integer Carathéodory support, and Graver augmentation in the original variables.",
  difficulty: "Advanced",
  duration: 20,
  accent: COLORS.rose,
  visualLabel: "Three-dimensional geometry",
  insightLabel: "Integral consequence",
  controls: {
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: hilbert3DStages,
  examples,
  proof: {
    title: "What the 3D gallery adds",
    steps: [
      "A determinant-two cone where the primitive extreme rays provably fail to generate all cone lattice points.",
      "The actual three-dimensional Gordan remainder parallelepiped and a floor decomposition.",
      "A dimension-three integer Carathéodory representation with exactly three distinct generators.",
      "The Graver kernel plane and augmentation path displayed in the original three variables.",
    ],
  },
};

export default visualization;
