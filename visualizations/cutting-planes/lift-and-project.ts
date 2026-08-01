import type {
  Mesh3D,
  Point2D,
  Point3D,
  Scene,
  Scene3D,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationStage,
} from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-0.15, 1.25],
  y: [-0.15, 1.25],
};

const relaxationConstraints: Scene["constraints"] = [
  {
    id: "x1-lower",
    a: -1,
    b: 0,
    limit: 0,
    label: "x₁ ≥ 0",
    color: "#79c9c0",
  },
  {
    id: "x1-upper",
    a: 1,
    b: 0,
    limit: 1,
    label: "x₁ ≤ 1",
    color: "#79c9c0",
  },
  {
    id: "x2-lower",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#d4ef77",
  },
  {
    id: "x2-upper",
    a: 0,
    b: 1,
    limit: 1,
    label: "x₂ ≤ 1",
    color: "#d4ef77",
  },
  {
    id: "diagonal",
    a: 1,
    b: 1,
    limit: 1.5,
    label: "x₁+x₂ ≤ 3/2",
    color: "#8f88dc",
  },
];

const projectedConstraints: Scene["constraints"] = [
  ...relaxationConstraints,
  {
    id: "lift-project-cut",
    a: 0.5,
    b: 1,
    limit: 1,
    label: "½x₁+x₂ ≤ 1",
    color: "#f28b45",
  },
];

const relaxationPolygon: Point2D[] = [
  [0, 0],
  [1, 0],
  [1, 0.5],
  [0.5, 1],
  [0, 1],
];

const projectedPolygon: Point2D[] = [
  [0, 0],
  [1, 0],
  [1, 0.5],
  [0, 1],
];

const liftedVertices: Point3D[] = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 0, 0],
  [1, 0.5, 0.5],
];

const projectedVertices: Point3D[] = liftedVertices.map(
  ([x1, x2]) => [x1, x2, 0] as Point3D,
);

const tetrahedronFaces = [
  [0, 1, 2],
  [0, 1, 3],
  [0, 2, 3],
  [1, 2, 3],
];

function baseScene(overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints: relaxationConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    axisTicks: { x: 0.25, y: 0.25 },
    caption: {
      primary: "LP relaxation P",
      secondary: "x₁ is required to be binary",
    },
    ...overrides,
  };
}

function liftedScene(
  configuration: Partial<Scene3D> = {},
): Scene {
  return {
    viewport,
    constraints: [],
    showGrid: true,
    showLattice: false,
    showVertices: true,
    scene3D: {
      bounds: {
        x: [-0.1, 1.2],
        y: [-0.1, 1.2],
        z: [-0.08, 0.75],
      },
      axisLabels: {
        x: "x₁",
        y: "x₂",
        z: "y₂=x₁x₂",
      },
      camera: {
        yaw: -0.72,
        pitch: 0.58,
        distance: 5.5,
      },
      verticalScale: 1.7,
      showGround: true,
      showIntegerLattice: false,
      ...configuration,
    },
  };
}

const liftedHull: Mesh3D = {
  id: "lifted-hull",
  vertices: liftedVertices,
  faces: tetrahedronFaces,
  label: "linearized lift M₁",
  style: "split-hull",
  color: "#8f88dc",
  edgeColor: "#10202a",
  opacity: 0.28,
};

const stages: VisualizationStage[] = [
  {
    id: "lift-project-relaxation",
    kicker: "01 · LP relaxation",
    title: "Start from a relaxation with a fractional binary variable",
    description:
      "The LP optimum x̄=(1/2,1) is feasible in P, but x₁ is supposed to be binary. Lift-and-project will use that single missing 0–1 condition to strengthen P.",
    formula:
      "P={x∈ℝ² : 0≤x₁≤1, 0≤x₂≤1, x₁+x₂≤3/2}",
    insight:
      "The red vertex is legal for the LP and illegal for the mixed 0–1 problem.",
    scene: baseScene({
      primitives: [
        {
          kind: "point",
          at: [0.5, 1],
          label: "x̄=(½,1)",
          style: "fractional",
        },
        {
          kind: "label",
          at: [0.28, 0.48],
          text: "P",
          tone: "accent",
        },
      ],
    }),
  },
  {
    id: "lift-project-disjunction",
    kicker: "02 · Choose a binary coordinate",
    title: "Split P into the two branches x₁=0 and x₁=1",
    description:
      "Every feasible 0–1 point lies on one branch. The fractional vertex lies strictly between them and has no right to survive unless it can be reconstructed by convexification.",
    formula: "P⁰=P∩{x₁=0},   P¹=P∩{x₁=1}",
    insight:
      "This is the same disjunction used by branching, but lift-and-project turns it into a cut before creating child nodes.",
    scene: baseScene({
      primitives: [
        {
          kind: "line",
          from: [0, 0],
          to: [0, 1],
          label: "P⁰",
          style: "graph-edge",
          color: "#79c9c0",
          animate: true,
        },
        {
          kind: "line",
          from: [1, 0],
          to: [1, 0.5],
          label: "P¹",
          style: "graph-edge",
          color: "#f28b45",
          animate: true,
        },
        {
          kind: "point",
          at: [0.5, 1],
          label: "between the branches",
          style: "fractional",
        },
      ],
      caption: {
        primary: "Binary disjunction",
        secondary: "keep x₁=0 or x₁=1",
      },
    }),
  },
  {
    id: "lift-project-products",
    kicker: "03 · Lift",
    title: "Multiply by x₁ and 1−x₁, then linearize the products",
    description:
      "For each slack b−Ax≥0, multiply once by x₁ and once by 1−x₁. Substituting y₂=x₁x₂ and x₁²=x₁ turns the nonlinear system into a linear polyhedron M₁ in a higher-dimensional space.",
    formula:
      "x₁(b−Ax)≥0, (1−x₁)(b−Ax)≥0  →  y₂=x₁x₂, x₁²=x₁",
    insight:
      "On branch x₁=0 we have y₂=0; on branch x₁=1 we have y₂=x₂. The extra axis separates these two product rules.",
    scene: liftedScene({
      segments: [
        {
          id: "lifted-branch-zero",
          from: [0, 0, 0],
          to: [0, 1, 0],
          label: "x₁=0 ⇒ y₂=0",
          color: "#79c9c0",
          width: 4,
          animate: true,
        },
        {
          id: "lifted-branch-one",
          from: [1, 0, 0],
          to: [1, 0.5, 0.5],
          label: "x₁=1 ⇒ y₂=x₂",
          color: "#f28b45",
          width: 4,
          animate: true,
        },
      ],
      markers: [
        {
          id: "branch-zero-top",
          at: [0, 1, 0],
          label: "lift(P⁰)",
          color: "#79c9c0",
        },
        {
          id: "branch-one-top",
          at: [1, 0.5, 0.5],
          label: "lift(P¹)",
          color: "#f28b45",
        },
      ],
      caption: {
        primary: "Lifted product space (x₁,x₂,y₂)",
        secondary: "drag to see the two branch segments separate",
      },
    }),
  },
  {
    id: "lift-project-convexify",
    kicker: "04 · Linear lifted relaxation",
    title: "Convexify the lifted branch copies",
    description:
      "The linearized inequalities describe a convex body joining the two lifted branches. In this example it is a tetrahedron: the higher-dimensional object M₁ that contains every lifted mixed-binary point.",
    formula: "M₁=conv(lift(P⁰)∪lift(P¹))",
    insight:
      "The lift makes the disjunction linear: instead of handling a union directly, we work with one convex polyhedron in a larger space.",
    scene: liftedScene({
      meshes: [liftedHull],
      segments: [
        {
          id: "hull-branch-zero",
          from: [0, 0, 0],
          to: [0, 1, 0],
          label: "lift(P⁰)",
          color: "#79c9c0",
          width: 3.5,
        },
        {
          id: "hull-branch-one",
          from: [1, 0, 0],
          to: [1, 0.5, 0.5],
          label: "lift(P¹)",
          color: "#f28b45",
          width: 3.5,
        },
      ],
      caption: {
        primary: "M₁ in the lifted space",
        secondary: "one convex tetrahedron replaces a two-branch union",
      },
    }),
  },
  {
    id: "lift-project-projection",
    kicker: "05 · Project",
    title: "Drop the product coordinate and keep only x",
    description:
      "Project M₁ vertically onto the original (x₁,x₂)-plane. The animation collapses the lifted tetrahedron onto a tighter quadrilateral.",
    formula: "L₁(P)=projₓ(M₁)=conv(P⁰∪P¹)",
    insight:
      "Projection removes the auxiliary product variable but preserves every x that has some feasible lifted witness y₂.",
    scene: liftedScene({
      meshes: [
        {
          id: "projected-lift-hull",
          vertices: projectedVertices,
          fromVertices: liftedVertices,
          faces: [
            [0, 1, 3],
            [0, 3, 2],
          ],
          label: "projₓ(M₁)",
          style: "integer-hull",
          color: "#f28b45",
          edgeColor: "#10202a",
          opacity: 0.34,
        },
      ],
      segments: [
        {
          id: "projection-ray",
          from: [1, 0.5, 0.5],
          to: [1, 0.5, 0],
          label: "forget y₂",
          color: "#e27c89",
          dashed: true,
          animate: true,
        },
      ],
      caption: {
        primary: "Projection back to x-space",
        secondary: "the lifted hull collapses onto the orange region",
      },
    }),
  },
  {
    id: "lift-project-cut",
    kicker: "06 · Read the new inequality",
    title: "The projection exposes a cut that removes x̄",
    description:
      "The upper edge of the projected hull is a new valid inequality. It is tight at the top of both binary branches and violated by the old fractional LP vertex.",
    formula: "½x₁+x₂≤1,   but   ½·½+1=5/4>1",
    insight:
      "The cut is stronger than the original relaxation and preserves every feasible point with x₁∈{0,1}.",
    scene: baseScene({
      constraints: projectedConstraints,
      showConstraints: false,
      showFeasibleRegion: false,
      primitives: [
        {
          kind: "polygon",
          points: relaxationPolygon,
          label: "old P",
          style: "removed",
        },
        {
          kind: "polygon",
          points: projectedPolygon,
          label: "L₁(P)=projₓ(M₁)",
          style: "integer-hull",
        },
        {
          kind: "line",
          from: [0, 1],
          to: [1, 0.5],
          label: "½x₁+x₂=1",
          style: "cut",
          color: "#f28b45",
          animate: true,
        },
        {
          kind: "point",
          at: [0.5, 1],
          label: "x̄ is cut off",
          style: "fractional",
        },
      ],
      caption: {
        primary: "Lift-and-project cut",
        secondary: "the red cap disappears; all binary points remain",
      },
    }),
  },
  {
    id: "lift-project-round",
    kicker: "07 · One complete round",
    title: "Repeat the construction for every binary coordinate",
    description:
      "For each j, choose the disjunction xⱼ=0 or xⱼ=1, lift and linearize, project back, and intersect the result with the current relaxation. Re-solving the LP reveals whether another separating cut is needed.",
    formula: "Pᴸᴾ=⋂ⱼ∈J Lⱼ(P),   conv(S)⊆Pᴸᴾ⊆P",
    insight:
      "One round enforces each binary coordinate through convexification without enumerating all 2^|J| assignments.",
    scene: baseScene({
      constraints: projectedConstraints,
      showConstraints: false,
      showFeasibleRegion: false,
      primitives: [
        {
          kind: "polygon",
          points: projectedPolygon,
          label: "current lift-and-project closure",
          style: "integer-hull",
        },
        {
          kind: "line",
          from: [0, 1],
          to: [1, 0.5],
          label: "cut from coordinate j=1",
          style: "cut",
          color: "#f28b45",
        },
        {
          kind: "point",
          at: [0, 1],
          label: "binary survivor",
          style: "integer",
        },
        {
          kind: "point",
          at: [1, 0.5],
          label: "binary survivor",
          style: "integer",
        },
      ],
      caption: {
        primary: "Lift-and-project closure",
        secondary: "choose j → lift → linearize → project → intersect",
      },
    }),
  },
];

const visualization: VisualizationDefinition = {
  id: "lift-and-project",
  title: "Lift-and-Project Cutting-Plane Algorithm",
  shortTitle: "Lift-and-project",
  chapter: "Cutting planes",
  order: 7,
  description:
    "Follow one complete Balas–Ceria–Cornuéjols round: split a fractional binary coordinate, lift products into a linear space, convexify, project, and read off the separating cut.",
  difficulty: "Advanced",
  duration: 14,
  accent: "#8f88dc",
  visualLabel: "Lift → project",
  insightLabel: "Algorithmic insight",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages,
  proof: {
    title: "Why is the projected inequality valid?",
    steps: [
      "Every mixed-binary feasible point satisfies x₁=0 or x₁=1, so it belongs to P₀∪P₁.",
      "Multiplication by the nonnegative factors x₁ and 1−x₁ preserves every original slack inequality on the binary set.",
      "Replacing x₁x₂ by y₂ and x₁² by x₁ gives a linear lifted system containing every lifted mixed-binary point.",
      "Convexification in the lifted space therefore preserves all lifted feasible 0–1 points.",
      "Projection forgets only auxiliary coordinates, so every original mixed-binary point remains in projₓ(M₁).",
      "In the example, the projected upper facet is ½x₁+x₂≤1, while x̄=(½,1) violates it.",
    ],
  },
};

export default visualization;
