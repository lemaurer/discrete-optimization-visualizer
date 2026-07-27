import type {
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

function tetrahedron(
  id: string,
  vertices: Point3D[],
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return {
    id,
    vertices,
    faces: tetrahedronFaces,
    style: "solid",
    ...options,
  };
}

function xPlane(
  id: string,
  value: number,
  yMax: number,
  zMax: number,
  label: string,
  color = "#e27c89",
): PlanePatch3D {
  return {
    id,
    points: [
      [value, 0, 0],
      [value, yMax, 0],
      [value, yMax, zMax],
      [value, 0, zMax],
    ],
    label,
    color,
    opacity: 0.2,
    dashed: true,
  };
}

function yPlane(
  id: string,
  value: number,
  xMax: number,
  zMax: number,
  label: string,
  color = "#8f88dc",
): PlanePatch3D {
  return {
    id,
    points: [
      [0, value, 0],
      [xMax, value, 0],
      [xMax, value, zMax],
      [0, value, zMax],
    ],
    label,
    color,
    opacity: 0.2,
    dashed: true,
  };
}

function sumPlane(
  id: string,
  value: number,
  zMax: number,
  label: string,
  color = "#f49a4a",
): PlanePatch3D {
  return {
    id,
    points: [
      [0, value, 0],
      [value, 0, 0],
      [value, 0, zMax],
      [0, value, zMax],
    ],
    label,
    color,
    opacity: 0.18,
    dashed: true,
  };
}

const geometryTetrahedron: Point3D[] = [
  [0, 0, 0],
  [4, 0, 0],
  [0, 4, 0],
  [0, 0, 4],
];

const geometry3DStages: VisualizationStage[] = [
  {
    id: "geometry-3d-polyhedron",
    kicker: "3D example · Halfspaces",
    title: "A polyhedron can occupy three-dimensional space",
    description:
      "The four inequalities x₁≥0, x₂≥0, x₃≥0, and x₁+x₂+x₃≤4 carve out a tetrahedron. Drag the picture to see that its triangular faces are genuine two-dimensional facets.",
    formula: "P={x∈ℝ³₊ : x₁+x₂+x₃≤4}",
    insight:
      "The two-dimensional polygon from the original lesson is the special case n=2; in n=3 the boundary consists of polygonal faces.",
    scene: scene3D({
      bounds: { x: [-0.25, 4.5], y: [-0.25, 4.5], z: [-0.25, 4.5] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("geometry-tetrahedron", geometryTetrahedron, {
          label: "P",
          color: "#d4ef77",
          opacity: 0.34,
        }),
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: {
        primary: "Three-dimensional tetrahedron",
        secondary: "Drag to rotate the four facets",
      },
    }),
  },
  {
    id: "geometry-3d-facets",
    kicker: "3D example · Active constraints",
    title: "A face is where one inequality becomes tight",
    description:
      "The highlighted plane x₁+x₂+x₃=4 supports the slanted facet. The remaining three facets lie in the coordinate planes.",
    formula: "F={x∈P : x₁+x₂+x₃=4}",
    insight:
      "At a generic vertex in ℝ³, three linearly independent inequalities are tight.",
    scene: scene3D({
      bounds: { x: [-0.25, 4.5], y: [-0.25, 4.5], z: [-0.25, 4.5] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("geometry-tetrahedron", geometryTetrahedron, {
          label: "P",
          color: "#79c9c0",
          opacity: 0.22,
        }),
      ],
      planes: [
        {
          id: "supporting-facet",
          points: [geometryTetrahedron[1], geometryTetrahedron[2], geometryTetrahedron[3]],
          label: "x₁+x₂+x₃=4",
          color: "#e27c89",
          opacity: 0.38,
        },
      ],
      caption: {
        primary: "Facet and supporting plane",
        secondary: "The plane touches P without cutting through it",
      },
    }),
  },
  {
    id: "geometry-3d-integrality",
    kicker: "3D example · Integer lattice",
    title: "Integer optimization keeps only lattice points",
    description:
      "The ground grid and lattice markers make the discrete structure visible. The same distinction between relaxation and integer hull persists in every dimension.",
    formula: "Pᴵ=conv(P∩ℤ³)",
    insight:
      "Rotation is important: lattice points that overlap in one view separate when the camera moves.",
    scene: scene3D({
      bounds: { x: [-0.25, 4.5], y: [-0.25, 4.5], z: [-0.25, 4.5] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("geometry-tetrahedron", geometryTetrahedron, {
          label: "LP relaxation",
          color: "#d4ef77",
          opacity: 0.26,
        }),
      ],
      markers: [
        { id: "integer-vertex", at: [0, 0, 4], label: "integer vertex", style: "integer" },
        { id: "interior-lattice", at: [1, 1, 1], label: "integer feasible point", style: "integer" },
      ],
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: {
        primary: "Integer lattice in ℝ³",
        secondary: "Use the lattice and vertex switches independently",
      },
    }),
  },
];

export const polyhedronGeometry3DExample: VisualizationExample = {
  id: "three-dimensional-tetrahedron",
  title: "3D tetrahedron — rotate the polyhedron",
  description:
    "Inspect a genuine three-dimensional polyhedron, its supporting facet, vertices, and integer lattice.",
  stages: geometry3DStages,
  proof: {
    title: "How the 2D definitions extend to 3D",
    steps: [
      "Each inequality still defines one closed halfspace.",
      "Their intersection is a polyhedron in ℝ³.",
      "A facet is a two-dimensional face obtained by making one supporting inequality tight.",
      "A vertex is typically determined by three independent tight inequalities.",
      "The integer hull is still the convex hull of all feasible lattice points.",
    ],
  },
};

const closureOriginal: Point3D[] = [
  [0, 0, 0],
  [2.6, 0, 0],
  [0, 2.4, 0],
  [0, 0, 2.2],
];

const xCutVertices: Point3D[] = [
  [0, 0, 0],
  [0, 2.4, 0],
  [0, 0, 2.2],
  [2, 0, 0],
  [2, 0.553846, 0],
  [2, 0, 0.507692],
];

const xCutFaces = [
  [0, 1, 4, 3],
  [0, 3, 5, 2],
  [0, 2, 1],
  [1, 2, 5, 4],
  [3, 4, 5],
];

const removedXCap: Point3D[] = [
  [2.6, 0, 0],
  [2, 0, 0],
  [2, 0.553846, 0],
  [2, 0, 0.507692],
];

const twoCutVertices: Point3D[] = [
  [0, 0, 0],
  [2, 0, 0],
  [0, 2, 0],
  [0, 0, 2.2],
  [2, 0, 0.507692],
  [2, 0.553846, 0],
  [0.433333, 2, 0],
  [0, 2, 0.366667],
];

const twoCutFaces = [
  [4, 5, 1],
  [6, 7, 2],
  [4, 1, 0],
  [4, 3, 0],
  [7, 2, 0],
  [7, 3, 0],
  [6, 2, 0],
  [6, 1, 0],
  [6, 5, 1],
  [6, 4, 3],
  [6, 7, 3],
  [6, 4, 5],
];

const closure3DStages: VisualizationStage[] = [
  {
    id: "closure-3d-input",
    kicker: "3D split closure · Input",
    title: "Start with a fractional tetrahedron",
    description:
      "The right intercept is 2.6 and the upper x₂ intercept is 2.4. Coordinate integrality suggests the splits x₁≤2 or x₁≥3 and x₂≤2 or x₂≥3.",
    formula: "P=conv{(0,0,0),(2.6,0,0),(0,2.4,0),(0,0,2.2)}",
    insight:
      "The split strips are now slabs between parallel planes rather than strips between lines.",
    scene: scene3D({
      bounds: { x: [-0.2, 3.25], y: [-0.2, 3.0], z: [-0.2, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("closure-input", closureOriginal, {
          label: "P",
          color: "#d4ef77",
          opacity: 0.32,
        }),
      ],
      caption: {
        primary: "Three-dimensional split closure example",
        secondary: "A split strip becomes a slab",
      },
    }),
  },
  {
    id: "closure-3d-x-strip",
    kicker: "3D split closure · Split 1",
    title: "Lift 2<x₁<3 into a forbidden slab",
    description:
      "The two red planes are x₁=2 and x₁=3. Since x₁ is integral, no integer point can lie strictly between them.",
    formula: "π=(1,0,0),  π₀=2",
    insight:
      "The cap with 2<x₁≤2.6 is fractional in the selected split coordinate.",
    scene: scene3D({
      bounds: { x: [-0.2, 3.25], y: [-0.2, 3.0], z: [-0.2, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("closure-input", closureOriginal, {
          label: "P",
          color: "#d4ef77",
          opacity: 0.24,
        }),
      ],
      planes: [
        xPlane("x-lower", 2, 2.7, 2.4, "x₁=2"),
        xPlane("x-upper", 3, 2.7, 2.4, "x₁=3"),
      ],
      caption: {
        primary: "Split slab 2<x₁<3",
        secondary: "The plane x₁=3 lies beyond the tetrahedron",
      },
    }),
  },
  {
    id: "closure-3d-x-remove",
    kicker: "3D split closure · Remove",
    title: "Remove the x₁-cap and keep the closed side",
    description:
      "The red tetrahedral cap is the portion of P inside the forbidden slab. It fades out while the remaining polyhedron stays feasible.",
    formula: "P⁽e₁,2⁾=conv(P∩{x₁≤2} ∪ P∩{x₁≥3})",
    insight:
      "Here the second side is empty, so this split polyhedron is simply P∩{x₁≤2}.",
    scene: scene3D({
      bounds: { x: [-0.2, 3.25], y: [-0.2, 3.0], z: [-0.2, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        {
          id: "x-survivor",
          vertices: xCutVertices,
          faces: xCutFaces,
          label: "surviving split polyhedron",
          style: "survivor",
          opacity: 0.34,
        },
        tetrahedron("x-removed-cap", removedXCap, {
          label: "removed cap",
          style: "removed",
          opacity: 0.28,
        }),
      ],
      planes: [xPlane("x-lower", 2, 2.7, 2.4, "x₁=2")],
      caption: {
        primary: "First split polyhedron",
        secondary: "The new triangular facet lies in x₁=2",
      },
    }),
    navigation: { closure: 1, split: 1, milestone: "split" },
  },
  {
    id: "closure-3d-second-split",
    kicker: "3D split closure · Split 2",
    title: "Intersect with the analogous x₂ split",
    description:
      "The violet slab 2<x₂<3 removes the second fractional cap. A closure intersects the polyhedra produced by the different splits.",
    formula: "S=P⁽e₁,2⁾∩P⁽e₂,2⁾",
    insight:
      "The final green polyhedron satisfies both x₁≤2 and x₂≤2 while preserving all integer feasible points.",
    scene: scene3D({
      bounds: { x: [-0.2, 3.25], y: [-0.2, 3.0], z: [-0.2, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        tetrahedron("closure-input-ghost", closureOriginal, {
          label: "original P",
          style: "ghost",
          opacity: 0.09,
        }),
        {
          id: "two-split-intersection",
          vertices: twoCutVertices,
          faces: twoCutFaces,
          label: "intersection of two split polyhedra",
          color: "#4f8b62",
          edgeColor: "#10202a",
          opacity: 0.34,
          style: "split-hull",
        },
      ],
      planes: [
        xPlane("x-final", 2, 2.7, 2.4, "x₁=2", "#e27c89"),
        yPlane("y-final", 2, 2.8, 2.4, "x₂=2", "#8f88dc"),
      ],
      caption: {
        primary: "Displayed 3D split closure",
        secondary: "Intersection of two split polyhedra",
      },
    }),
    navigation: { closure: 1, split: 2, milestone: "closure" },
  },
];

export const splitClosure3DExample: VisualizationExample = {
  id: "three-dimensional-split-closure",
  title: "3D split closure — slabs and caps",
  description:
    "See split strips become three-dimensional slabs, remove fractional caps, and intersect the resulting split polyhedra.",
  stages: closure3DStages,
  proof: {
    title: "Why the 3D split remains valid",
    steps: [
      "For π=e₁, every mixed-integer point has integral value πᵀx=x₁.",
      "No integral value lies strictly between 2 and 3.",
      "Removing the open slab therefore removes no integer feasible point.",
      "Convexifying the two closed sides produces one split polyhedron.",
      "Intersecting split polyhedra from different directions gives a tighter closure approximation.",
    ],
  },
};

const membershipBoxVertices: Point3D[] = [
  [0, 0, 0],
  [2, 0, 0],
  [2, 2, 0],
  [0, 2, 0],
  [0, 0, 2],
  [2, 0, 2],
  [2, 2, 2],
  [0, 2, 2],
];
const membershipX: Point3D = [0.4, 1, 1];
const membershipY: Point3D = [1, 1.4, 0.8];
const membershipZ: Point3D = [0, 0.733333, 1.133333];

const membership3DStages: VisualizationStage[] = [
  {
    id: "membership-3d-setup",
    kicker: "3D membership · Setup",
    title: "Put x inside a three-dimensional split slab",
    description:
      "Only x₁ is used by the split. The other coordinates remain visible so it is clear that projection onto the split coordinate does not mean deleting the continuous geometry.",
    formula: "π=(1,0,0),  π₀=0,  α=πᵀx−π₀=0.4",
    insight:
      "The point x has x₁=0.4 and therefore lies inside 0<x₁<1.",
    scene: scene3D({
      bounds: { x: [-0.25, 2.3], y: [-0.25, 2.3], z: [-0.25, 2.3] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        {
          id: "membership-box",
          vertices: membershipBoxVertices,
          faces: boxFaces,
          label: "P",
          color: "#d4ef77",
          opacity: 0.16,
          style: "ghost",
        },
      ],
      planes: [
        xPlane("membership-left", 0, 2, 2, "x₁=0"),
        xPlane("membership-right", 1, 2, 2, "x₁=1"),
      ],
      markers: [
        { id: "membership-x", at: membershipX, label: "x", style: "fractional" },
      ],
      caption: {
        primary: "Membership certificate in ℝ³",
        secondary: "The red slab is 0<x₁<1",
      },
    }),
  },
  {
    id: "membership-3d-witness",
    kicker: "3D membership · Witness",
    title: "Choose a right-side witness y",
    description:
      "The witness lies on x₁=1 and remains inside P. Its second and third coordinates do not need to be integral for this split.",
    formula: "y=(1,1.4,0.8)∈P∩{x₁≥1}",
    insight:
      "The split tests πᵀy=y₁=1; it does not project the point onto its height 0.8.",
    scene: scene3D({
      bounds: { x: [-0.25, 2.3], y: [-0.25, 2.3], z: [-0.25, 2.3] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        {
          id: "membership-box",
          vertices: membershipBoxVertices,
          faces: boxFaces,
          label: "P",
          color: "#d4ef77",
          opacity: 0.13,
          style: "ghost",
        },
      ],
      planes: [
        xPlane("membership-left", 0, 2, 2, "π₁: x₁=0"),
        xPlane("membership-right", 1, 2, 2, "π₂: x₁=1"),
      ],
      markers: [
        { id: "membership-x", at: membershipX, label: "x", style: "fractional" },
        {
          id: "membership-y",
          at: membershipY,
          animateFrom: membershipX,
          label: "y∈π₂",
          style: "optimum",
        },
      ],
      caption: {
        primary: "Choose y on the right side",
        secondary: "Only the x₁-coordinate determines the split side",
      },
    }),
  },
  {
    id: "membership-3d-segment",
    kicker: "3D membership · Convex combination",
    title: "Construct z and place x on the segment [z,y]",
    description:
      "With α=0.4, the formula z=(x−αy)/(1−α) gives a point on the left split plane. The segment is the geometric membership certificate.",
    formula: "x=(1−α)z+αy,  z=(0,0.733,1.133)",
    insight:
      "The same proof as in 2D works in any dimension; only the drawing becomes genuinely spatial.",
    scene: scene3D({
      bounds: { x: [-0.25, 2.3], y: [-0.25, 2.3], z: [-0.25, 2.3] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [
        {
          id: "membership-box",
          vertices: membershipBoxVertices,
          faces: boxFaces,
          label: "P",
          color: "#d4ef77",
          opacity: 0.1,
          style: "ghost",
        },
      ],
      planes: [
        xPlane("membership-left", 0, 2, 2, "π₁: x₁=0"),
        xPlane("membership-right", 1, 2, 2, "π₂: x₁=1"),
      ],
      segments: [
        {
          id: "membership-segment",
          from: membershipY,
          to: membershipZ,
          label: "x lies on this segment",
          color: "#8f88dc",
          width: 3,
          animate: true,
        },
      ],
      markers: [
        { id: "membership-x", at: membershipX, label: "x", style: "fractional" },
        { id: "membership-y", at: membershipY, label: "y∈π₂", style: "optimum" },
        {
          id: "membership-z",
          at: membershipZ,
          animateFrom: membershipX,
          label: "z∈π₁",
          style: "integer",
        },
      ],
      caption: {
        primary: "3D convex-combination certificate",
        secondary: "Rotate until the three points visibly align",
      },
    }),
  },
];

export const splitMembership3DExample: VisualizationExample = {
  id: "three-dimensional-membership",
  title: "3D membership — witness segment",
  description:
    "Use a box in ℝ³ to separate the split coordinate from the two coordinates that remain visible after projection.",
  stages: membership3DStages,
  proof: {
    title: "Why the segment is a valid certificate",
    steps: [
      "The split uses π=(1,0,0), so only x₁ determines the split side.",
      "The chosen witness y satisfies y₁=1 and lies in P.",
      "Define z=(x−αy)/(1−α) with α=x₁=0.4.",
      "Then z₁=0 and z remains in P.",
      "Consequently x is a convex combination of a left-side and a right-side feasible point.",
    ],
  },
};

const infiniteA: Point3D = [0, 0, 0];
const infiniteB: Point3D = [2, 0, 0];
const infiniteC: Point3D = [0, 2, 0];
const infiniteD: Point3D = [0.5, 0.5, 0.5];
const infiniteE2: Point3D = [1 / 3, 1, 1 / 3];
const infiniteE1: Point3D = [1, 1 / 3, 1 / 3];
const coordinateIntersectionApex: Point3D = [0.75, 0.75, 0.25];
const schematicClosureApex: Point3D = [0.63, 0.63, 0.12];
const schematicSecondApex: Point3D = [0.67, 0.67, 0.06];

const rightX2PieceVertices: Point3D[] = [
  infiniteC,
  [0, 1, 0],
  [1, 1, 0],
  infiniteE2,
];

function infiniteBaseMesh(): Mesh3D {
  return {
    id: "infinite-integer-hull",
    vertices: [infiniteA, infiniteB, infiniteC],
    faces: [[0, 1, 2]],
    label: "conv(F): y=0",
    style: "integer-hull",
    opacity: 0.38,
  };
}

function infiniteTetrahedron(
  id: string,
  apex: Point3D,
  label: string,
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return tetrahedron(id, [infiniteA, infiniteB, infiniteC, apex], {
    label,
    color: "#79c9c0",
    opacity: 0.28,
    ...options,
  });
}

const infinite3DStages: VisualizationStage[] = [
  {
    id: "infinite-3d-original",
    kicker: "Infinite rank · Full 3D model",
    title: "The counterexample is a tetrahedron in (x₁,x₂,y)",
    description:
      "The base y=0 is the mixed-integer hull. The LP relaxation has the additional fractional apex (1/2,1/2,1/2). Rotate the tetrahedron before looking at any projection.",
    formula: "P=conv{(0,0,0),(2,0,0),(0,2,0),(1/2,1/2,1/2)}",
    insight:
      "x₁ and x₂ are integer variables; y is continuous and is drawn vertically.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("infinite-original", infiniteD, "LP relaxation P"),
        infiniteBaseMesh(),
      ],
      markers: [
        { id: "original-apex", at: infiniteD, label: "fractional apex (1/2,1/2,1/2)", style: "fractional" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Cook–Kannan–Schrijver counterexample in ℝ³",
        secondary: "The orange triangle is the entire mixed-integer hull",
      },
    }),
  },
  {
    id: "infinite-3d-x2-split",
    kicker: "Infinite rank · One exact split",
    title: "Apply π=(0,1,0): split on x₂",
    description:
      "The planes x₂=0 and x₂=1 bound the forbidden slab. The old apex has x₂=1/2 and is removed, but points on the plane x₂=1 can still have positive y.",
    formula: "x₂≤0  ∨  x₂≥1",
    insight:
      "Projection onto π means reading the horizontal coordinate x₂—not reading the height y.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("infinite-original", infiniteD, "P", {
          opacity: 0.2,
        }),
        infiniteBaseMesh(),
      ],
      planes: [
        yPlane("x2-zero", 0, 2, 0.58, "x₂=0", "#e27c89"),
        yPlane("x2-one", 1, 2, 0.58, "x₂=1", "#e27c89"),
      ],
      markers: [
        { id: "old-apex", at: infiniteD, label: "removed: x₂=1/2", style: "fractional" },
        { id: "survivor", at: infiniteE2, label: "survives: (1/3,1,1/3)", style: "optimum" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Exact x₂ split in three dimensions",
        secondary: "The point at x₂=1 lies on the closed right side",
      },
    }),
    navigation: { closure: 1, split: 1 },
  },
  {
    id: "infinite-3d-x2-pieces",
    kicker: "Infinite rank · Surviving pieces",
    title: "The right piece still reaches y=1/3",
    description:
      "On the left side x₂≤0 only the base edge remains. On the right side x₂≥1, a tetrahedral piece remains whose upper vertex is (1/3,1,1/3).",
    formula: "(1/3,1,1/3)∈P∩{x₂≥1}",
    insight:
      "This is the direct answer to why the split does not leave only y=0.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        tetrahedron("right-x2-piece", rightX2PieceVertices, {
          label: "P∩{x₂≥1}",
          color: "#8f88dc",
          opacity: 0.36,
          style: "survivor",
        }),
        infiniteBaseMesh(),
      ],
      segments: [
        {
          id: "left-edge",
          from: infiniteA,
          to: infiniteB,
          label: "P∩{x₂≤0}",
          color: "#79c9c0",
          width: 5,
        },
      ],
      planes: [yPlane("x2-one", 1, 2, 0.58, "x₂=1", "#e27c89")],
      markers: [
        { id: "surviving-apex", at: infiniteE2, label: "positive height y=1/3", style: "optimum" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Two closed sides after deleting 0<x₂<1",
        secondary: "The right side already contains a positive-y point",
      },
    }),
    navigation: { closure: 1, split: 1 },
  },
  {
    id: "infinite-3d-x2-convexify",
    kicker: "Infinite rank · Convexify",
    title: "Convexification creates a lower tetrahedron",
    description:
      "Taking the convex hull of the left edge and right tetrahedral piece gives a new tetrahedron with apex (1/3,1,1/3). The old height 1/2 decreases, but it does not become zero.",
    formula: "P⁽e₂,0⁾=conv(P∩{x₂≤0}∪P∩{x₂≥1})",
    insight:
      "A split removes the old apex and then reconnects the surviving sides by convex combinations.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("old-infinite", infiniteD, "old P", {
          style: "ghost",
          opacity: 0.08,
        }),
        infiniteTetrahedron("x2-split-hull", infiniteE2, "x₂ split polyhedron", {
          color: "#8f88dc",
          style: "split-hull",
          opacity: 0.34,
          fromVertices: [infiniteA, infiniteB, infiniteC, infiniteD],
        }),
        infiniteBaseMesh(),
      ],
      markers: [
        { id: "new-x2-apex", at: infiniteE2, animateFrom: infiniteD, label: "new apex y=1/3", style: "optimum" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "One exact split polyhedron",
        secondary: "Positive height remains after convexification",
      },
    }),
    navigation: { closure: 1, split: 1, milestone: "split" },
  },
  {
    id: "infinite-3d-x1-split",
    kicker: "Infinite rank · Symmetric split",
    title: "The x₁ split leaves a mirror-image apex",
    description:
      "Applying x₁≤0 or x₁≥1 to the same input produces the symmetric point (1,1/3,1/3). A split closure must intersect these different split polyhedra.",
    formula: "π=(1,0,0),  π₀=0",
    insight:
      "Different π directions remove different parts of the tetrahedron.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("x2-hull-ghost", infiniteE2, "x₂ split", {
          style: "ghost",
          opacity: 0.11,
        }),
        infiniteTetrahedron("x1-hull", infiniteE1, "x₁ split", {
          color: "#79c9c0",
          style: "split-hull",
          opacity: 0.32,
        }),
        infiniteBaseMesh(),
      ],
      planes: [
        xPlane("x1-zero", 0, 2, 0.58, "x₁=0", "#79c9c0"),
        xPlane("x1-one", 1, 2, 0.58, "x₁=1", "#79c9c0"),
      ],
      markers: [
        { id: "x1-apex", at: infiniteE1, label: "x₁-split apex", style: "optimum" },
        { id: "x2-apex", at: infiniteE2, label: "x₂-split apex", style: "fractional" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Two different split polyhedra",
        secondary: "The closure keeps only their intersection",
      },
    }),
    navigation: { closure: 1, split: 2, milestone: "split" },
  },
  {
    id: "infinite-3d-coordinate-intersection",
    kicker: "Infinite rank · Intersect displayed splits",
    title: "Even both coordinate splits leave positive height",
    description:
      "The exact intersection of the two displayed coordinate split polyhedra is the tetrahedron with apex (3/4,3/4,1/4). Thus even after enforcing both directions, the region is not the base y=0.",
    formula: "P⁽e₁,0⁾∩P⁽e₂,0⁾=conv{A,B,C,(3/4,3/4,1/4)}",
    insight:
      "The closure intersects all splits, so it is smaller still—but this exact intermediate intersection makes the surviving mechanism visible.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("coordinate-intersection", coordinateIntersectionApex, "intersection of x₁ and x₂ split polyhedra", {
          color: "#4f8b62",
          style: "split-hull",
          opacity: 0.36,
        }),
        infiniteBaseMesh(),
      ],
      segments: [
        {
          id: "coordinate-gap",
          from: [coordinateIntersectionApex[0], coordinateIntersectionApex[1], 0],
          to: coordinateIntersectionApex,
          label: "remaining height 1/4",
          color: "#e27c89",
          width: 3,
          animate: true,
        },
      ],
      markers: [
        { id: "coordinate-apex", at: coordinateIntersectionApex, label: "still y=1/4>0", style: "fractional" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Exact intersection of the two coordinate splits",
        secondary: "This is not yet the complete split closure",
      },
    }),
    navigation: { closure: 1, split: 2 },
  },
  {
    id: "infinite-3d-full-closure",
    kicker: "Infinite rank · Full split closure",
    title: "All other split directions shrink it further, not to y=0",
    description:
      "The complete split closure also intersects split polyhedra for π=(p,q,0) with arbitrary integers p,q. The exact algebraic shape is not reconstructed here; the smaller green tetrahedron is explicitly schematic. The lecture theorem guarantees that some positive-y point still survives.",
    formula: "Pˢᵖˡⁱᵗ=⋂(π,π₀)P⁽π,π₀⁾  and  Pˢᵖˡⁱᵗ≠conv(F)",
    insight:
      "The important visual fact is the remaining vertical gap, not the displayed schematic apex coordinate.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("coordinate-intersection-ghost", coordinateIntersectionApex, "two displayed splits", {
          style: "ghost",
          opacity: 0.09,
        }),
        infiniteTetrahedron("schematic-full-closure", schematicClosureApex, "schematic full closure", {
          color: "#4f8b62",
          style: "split-hull",
          opacity: 0.34,
        }),
        infiniteBaseMesh(),
      ],
      segments: [
        {
          id: "closure-gap",
          from: [schematicClosureApex[0], schematicClosureApex[1], 0],
          to: schematicClosureApex,
          label: "theorem: some y>0 remains",
          color: "#e27c89",
          width: 3,
          animate: true,
        },
      ],
      markers: [
        { id: "closure-apex", at: schematicClosureApex, label: "schematic survivor", style: "fractional" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Full closure: qualitative 3D picture",
        secondary: "Schematic shape; nonzero height is the rigorous lecture conclusion",
      },
    }),
    navigation: { closure: 1, milestone: "closure" },
  },
  {
    id: "infinite-3d-repeat",
    kicker: "Infinite rank · Repeat",
    title: "Every finite round can shrink the height again",
    description:
      "A second schematic closure is drawn lower than the first. The lecture example states that this continues for every finite number of rounds: the gap can become small without ever vanishing at a finite index.",
    formula: "(Pˢᵖˡⁱᵗ)ᵏ≠conv(F)  for every finite k",
    insight:
      "Infinite split rank means no finite stopping round—not that the closures fail to become progressively tighter.",
    scene: scene3D({
      bounds: { x: [-0.2, 2.25], y: [-0.2, 2.25], z: [-0.08, 0.66] },
      verticalScale: 2.6,
      axisLabels: { x: "x₁", y: "x₂", z: "y" },
      meshes: [
        infiniteTetrahedron("closure-one-ghost", schematicClosureApex, "schematic closure 1", {
          style: "ghost",
          opacity: 0.1,
        }),
        infiniteTetrahedron("closure-two", schematicSecondApex, "schematic later closure", {
          color: "#8f88dc",
          style: "split-hull",
          opacity: 0.34,
          fromVertices: [infiniteA, infiniteB, infiniteC, schematicClosureApex],
        }),
        infiniteBaseMesh(),
      ],
      segments: [
        {
          id: "later-gap",
          from: [schematicSecondApex[0], schematicSecondApex[1], 0],
          to: schematicSecondApex,
          label: "still positive after a finite round",
          color: "#e27c89",
          width: 3,
          animate: true,
        },
      ],
      markers: [
        { id: "later-apex", at: schematicSecondApex, animateFrom: schematicClosureApex, label: "smaller, but not zero", style: "optimum" },
      ],
      integerAxes: ["x", "y"],
      caption: {
        primary: "Repeated split closures",
        secondary: "The final two tetrahedra are qualitative, not exact coordinates",
      },
    }),
    navigation: { closure: 2, milestone: "closure" },
  },
];

export const infiniteRank3DExample: VisualizationExample = {
  id: "infinite-rank-three-dimensional",
  title: "Infinite rank in 3D — see the actual splits",
  description:
    "Rotate the original tetrahedron, apply an exact x₂ split, inspect the surviving positive-y piece, and distinguish exact displayed split intersections from schematic full-closure snapshots.",
  stages: infinite3DStages,
  proof: {
    title: "What is exact and what is schematic in the 3D lesson",
    steps: [
      "The original tetrahedron and its mixed-integer hull y=0 are exact.",
      "The x₂ split and the surviving point (1/3,1,1/3) are exact.",
      "Its split polyhedron has exact apex (1/3,1,1/3); the x₁ split is the symmetric statement.",
      "The intersection of those two coordinate split polyhedra has exact apex (3/4,3/4,1/4).",
      "The full split closure also uses every other integral direction π=(p,q,0).",
      "The final green closure tetrahedra are qualitative placeholders; the rigorous fact from Lecture Example 54 is only that every finite closure still differs from conv(F).",
    ],
  },
};
