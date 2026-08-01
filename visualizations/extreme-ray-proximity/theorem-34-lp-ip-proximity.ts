import type {
  Mesh3D,
  PlanePatch3D,
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

const prismFaces = [
  [0, 1, 2, 3],
  [4, 7, 6, 5],
  [0, 4, 5, 1],
  [1, 5, 6, 2],
  [2, 6, 7, 3],
  [3, 7, 4, 0],
];

const basePolygon: Array<[number, number]> = [
  [0, 0],
  [1, 1],
  [1.5, 2],
  [0, 2],
];

function prismVertices(z0 = 0, z1 = 1): Point3D[] {
  return [
    ...basePolygon.map(([x, y]) => [x, y, z0] as Point3D),
    ...basePolygon.map(([x, y]) => [x, y, z1] as Point3D),
  ];
}

function prismMesh(opacity = 0.2): Mesh3D {
  return {
    id: "proximity-prism",
    vertices: prismVertices(),
    faces: prismFaces,
    label: "P",
    color: "#79c9c0",
    edgeColor: "#10202a",
    opacity,
    style: "solid",
  };
}

const yStar3D: Point3D = [1.5, 2, 1];
const xHat3D: Point3D = [0, 0, 1];
const xStar3D: Point3D = [1, 1, 1];

const topFace: PlanePatch3D = {
  id: "optimal-top-face",
  points: basePolygon.map(([x, y]) => [x, y, 1] as Point3D),
  label: "optimal face x₃=1",
  color: "#f49a4a",
  opacity: 0.18,
};

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

function prismConfiguration(overrides: Partial<Scene3D> = {}): Scene3D {
  return {
    bounds: { x: [-0.35, 2.25], y: [-0.35, 2.65], z: [-0.25, 1.65] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.72, pitch: 0.48, distance: 5.8 },
    meshes: [prismMesh()],
    planes: [topFace],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "A genuine polyhedral prism with Δ=2",
      secondary: "the displayed LP and IP optima are vertices",
    },
    ...overrides,
  };
}

const coneConstraints: Scene["constraints"] = [
  { id: "cone-positive", a: -1, b: 0, limit: 0, label: "u₁≥0", color: "#79c9c0" },
  { id: "cone-lower", a: 1, b: -1, limit: 0, label: "u₂≥u₁", color: "#8f88dc" },
  { id: "cone-upper", a: -2, b: 1, limit: 0, label: "u₂≤2u₁", color: "#f49a4a" },
];

function coneScene(primitives: Primitive[] = []): Scene {
  return {
    viewport: { x: [-0.45, 3.3], y: [-0.45, 5.2] },
    constraints: coneConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "u₁", y: "u₂" },
    caption: {
      primary: "The sign-compatible cone from the row partition",
      secondary: "C=cone{(1,1),(1,2)} on the optimal face u₃=0",
    },
  };
}

const coneRayPrimitives: Primitive[] = [
  { kind: "vector", from: [0, 0], to: [3, 3], label: "u¹=(1,1)", color: "#8f88dc", animate: true },
  { kind: "vector", from: [0, 0], to: [2.5, 5], label: "u²=(1,2)", color: "#f49a4a", animate: true },
  { kind: "point", at: [1, 1], label: "primitive u¹", style: "integer" },
  { kind: "point", at: [1, 2], label: "primitive u²", style: "integer" },
];

const prismStages: VisualizationStage[] = [
  {
    id: "t34-prism-vertex-optimum",
    kicker: "Theorem 34 · Vertex optimum",
    title: "Choose the LP optimum at a fractional vertex",
    description:
      "The objective maximizes x₃. The entire top face is optimal, but the displayed LP optimum y*=(3/2,2,1) is one of its vertices. The integer optima x̂=(0,0,1) and x*=(1,1,1) are also vertices.",
    formula: "max{x₃:x∈P},   y*=(3/2,2,1)",
    insight:
      "The proof compares x̂ and y* and then moves to displacement space, where the cone has its apex at the origin.",
    scene: scene3D(prismConfiguration({
      markers: [
        { id: "ystar", at: yStar3D, label: "fractional LP vertex y*", style: "fractional" },
        { id: "xhat", at: xHat3D, label: "integer optimal vertex x̂", style: "integer" },
        { id: "xstar", at: xStar3D, label: "nearby integer vertex x*", style: "optimum" },
      ],
    })),
  },
  {
    id: "t34-prism-explicit-cone",
    kicker: "Theorem 34 · Build C",
    title: "The row comparison produces an explicit wedge in displacement space",
    description:
      "On the optimal face, comparing every row at y* and x̂ gives u₁≥0, u₂≥u₁, and u₂≤2u₁. Their intersection is the shaded cone C.",
    formula: "C={u:u₁≥0, u₁≤u₂≤2u₁, u₃=0}",
    insight:
      "This is the actual cone used by the proof. Its primitive extreme rays are (1,1,0) and (1,2,0).",
    scene: coneScene([
      ...coneRayPrimitives,
      { kind: "vector", from: [0, 0], to: [1.5, 2], label: "d=y*−x̂∈C", color: "#e27c89", animate: true },
      { kind: "point", at: [1.5, 2], label: "d=(3/2,2)", style: "optimum" },
    ]),
  },
  {
    id: "t34-prism-translate-cone",
    kicker: "Theorem 34 · Translate directions back to x̂",
    title: "The two cone rays follow the two edges leaving x̂ on the optimal face",
    description:
      "Translating u¹=(1,1,0) and u²=(1,2,0) to x̂ shows the geometric meaning of the displacement cone inside the original prism.",
    formula: "y*−x̂=u¹+(1/2)u²",
    insight:
      "The entire translated cone need not lie in P. Remark 33 only guarantees partial combinations bounded by the coefficients of y*−x̂.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.1)],
      markers: [
        { id: "xhat", at: xHat3D, label: "x̂", style: "integer" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "u1", from: xHat3D, to: [1, 1, 1], label: "u¹=(1,1,0)", color: "#8f88dc", width: 4, animate: true },
        { id: "u2", from: xHat3D, to: [1, 2, 1], label: "u²=(1,2,0)", color: "#f49a4a", width: 4, animate: true },
        { id: "difference", from: xHat3D, to: yStar3D, label: "d∈C", color: "#e27c89", width: 3, dashed: true, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-caratheodory",
    kicker: "Theorem 34 · Carathéodory",
    title: "Only two primitive rays are needed here",
    description:
      "The displacement is drawn as a broken path: one full copy of u¹ followed by one half copy of u². In general Carathéodory guarantees at most n rays.",
    formula: "y*−x̂=u¹+(1/2)u²,   k=2≤n=3",
    insight:
      "Lemma 32 bounds each primitive ray by Δ; Carathéodory bounds how many different ray directions appear.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.1)],
      markers: [
        { id: "xhat", at: xHat3D, label: "x̂", style: "integer" },
        { id: "corner", at: xStar3D, label: "x̂+u¹=x*", style: "optimum" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "part1", from: xHat3D, to: xStar3D, label: "u¹", color: "#8f88dc", width: 4, animate: true },
        { id: "part2", from: xStar3D, to: yStar3D, label: "(1/2)u²", color: "#f49a4a", width: 4, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-strip",
    kicker: "Theorem 34 · Strip a full ray",
    title: "The full integral ray copy becomes part of the new integer optimum",
    description:
      "Absorb the coefficient-one copy of u¹ into x̂. The new point x*=x̂+u¹=(1,1,1) is feasible, integral, optimal, and a vertex of the prism.",
    formula: "x*=x̂+u¹,   y*−x*=(1/2)u²",
    insight:
      "After stripping, the entire remaining displacement is a fractional piece of one primitive cone ray.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.1)],
      markers: [
        { id: "old", at: xHat3D, label: "old x̂", style: "integer" },
        { id: "new", at: xStar3D, label: "new optimal vertex x*", style: "optimum", animateFrom: xHat3D },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "full-step", from: xHat3D, to: xStar3D, label: "one full u¹", color: "#8f88dc", width: 5, animate: true },
        { id: "remainder", from: xStar3D, to: yStar3D, label: "(1/2)u²", color: "#e27c89", width: 4, dashed: true, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-bound",
    kicker: "Theorem 34 · Proximity bound",
    title: "The remainder is a short fractional ray piece",
    description:
      "The remaining coefficient is below one. Here the actual ℓ∞ gap is one, while the universal theorem gives nΔ=3·2=6.",
    formula: "‖y*−x*‖∞=1=‖(1/2)u²‖∞≤nΔ=6",
    insight:
      "The universal bound is deliberately coarse because it depends only on dimension and subdeterminants.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.09)],
      markers: [
        { id: "xstar", at: xStar3D, label: "x*", style: "optimum" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "gap", from: xStar3D, to: yStar3D, label: "(1/2)u²", color: "#e27c89", width: 5, animate: true },
      ],
      caption: {
        primary: "Actual gap 1; theorem radius nΔ=6",
        secondary: "cone ray u²=(1,2,0), remaining coefficient 1/2",
      },
    })),
  },
];

const uniqueConstraints: Scene["constraints"] = [
  { id: "x-nonnegative", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "y-nonnegative", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "right", a: 1, b: 0, limit: 2, label: "x₁≤2", color: "#8f88dc" },
  { id: "cap", a: 1, b: 1, limit: 3, label: "x₁+x₂≤3", color: "#f49a4a" },
  { id: "diagonal", a: -1, b: 1, limit: 0, label: "x₂≤x₁", color: "#e27c89" },
];

const uniqueY: Point2D = [1.5, 1.5];
const uniqueX: Point2D = [2, 1];

function uniqueScene(overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.4, 2.5], y: [-0.4, 2.15] },
    constraints: uniqueConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showLattice: true,
    showVertices: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Unique fractional LP vertex",
      secondary: "maximize x₂; Δ=2 and nΔ=4",
    },
    ...overrides,
  };
}

const uniqueVertexStages: VisualizationStage[] = [
  {
    id: "t34-unique-polytope",
    kicker: "Theorem 34 · Unique optimum",
    title: "A linear objective reaches its maximum at one fractional vertex",
    description:
      "The slanted quadrilateral is a nondegenerate polytope. Maximizing x₂ gives the unique LP optimum y*=(3/2,3/2), the top vertex. The best integer value is attained at the LP vertex x*=(2,1).",
    formula: "max{x₂:x∈P},   y*=(3/2,3/2),   x*=(2,1)",
    insight:
      "This example has no optimal edge at all: both displayed optima are vertices, and the LP optimum is unique.",
    scene: uniqueScene({
      objective: { vector: [0, 1], label: "c=e₂" },
      primitives: [
        { kind: "point", at: uniqueY, label: "unique LP vertex y*", style: "fractional" },
        { kind: "point", at: uniqueX, label: "integer optimal vertex x*", style: "optimum" },
      ],
    }),
  },
  {
    id: "t34-unique-gap",
    kicker: "Theorem 34 · Direct proximity",
    title: "The nearby integer optimum is visible without an optimal face",
    description:
      "The displacement from x* to y* is (−1/2,1/2). Its ℓ∞ norm is 1/2, far below the universal radius nΔ=4.",
    formula: "y*−x*=(−1/2,1/2),   ‖y*−x*‖∞=1/2≤4",
    insight:
      "The theorem does not require a flat set of optima; the proximity phenomenon is already present at a unique fractional LP vertex.",
    scene: uniqueScene({
      primitives: [
        {
          kind: "polygon",
          points: [[1.5, 1], [2, 1], [2, 1.5], [1.5, 1.5]],
          label: "actual ℓ∞ gap box",
          style: "integer-hull",
          fromPoints: [uniqueY, uniqueY, uniqueY, uniqueY],
        },
        { kind: "point", at: uniqueY, label: "y*", style: "fractional" },
        { kind: "point", at: uniqueX, label: "x*", style: "optimum" },
        { kind: "vector", from: uniqueX, to: uniqueY, label: "distance 1/2", color: "#e27c89", animate: true },
      ],
    }),
  },
  {
    id: "t34-unique-conclusion",
    kicker: "Theorem 34 · General statement",
    title: "Vertex examples illustrate a theorem valid for every LP optimum",
    description:
      "We selected optimal vertices because they make the geometry clean. The theorem itself says that for every LP-optimal point y*, including points inside an optimal face, some IP optimum lies within nΔ.",
    formula: "∀y*∈argmax(LP) ∃x*∈argmax(IP): ‖y*−x*‖∞≤nΔ",
    insight:
      "Optimal vertices are sufficient for solving an LP, but the quantified proximity theorem is intentionally stronger.",
    scene: uniqueScene({
      primitives: [
        { kind: "point", at: uniqueY, label: "chosen optimal vertex y*", style: "fractional" },
        { kind: "point", at: uniqueX, label: "nearby integer vertex x*", style: "optimum" },
        { kind: "vector", from: uniqueX, to: uniqueY, label: "≤nΔ", color: "#8f88dc", animate: true },
      ],
    }),
  },
];

const prismExample: VisualizationExample = {
  id: "vertex-prism",
  title: "3D prism — explicit proof cone and ray stripping",
  description:
    "A natural prism where the row-sign cone is drawn separately in displacement space and then translated back to the optimal face.",
  stages: prismStages,
};

const uniqueExample: VisualizationExample = {
  id: "unique-fractional-vertex",
  title: "2D polytope — unique fractional optimum vertex",
  description:
    "A compact polygon with a unique fractional LP-optimal vertex and an integer-optimal LP vertex nearby.",
  stages: uniqueVertexStages,
};

const proof = {
  title: "Why a suitable integer optimum is at most nΔ away",
  steps: [
    "Fix an LP optimum y* and any IP optimum x̂, then construct the sign-compatible cone containing y*−x̂.",
    "Write y*−x̂=Σᵢ₌₁ᵏλᵢuᵢ using primitive integral extreme rays; Carathéodory gives k≤n.",
    "Lemma 32 gives ‖uᵢ‖∞≤Δ for every used ray.",
    "Whenever λⱼ≥1, absorb a full integral copy of uⱼ into x̂. Sign compatibility preserves feasibility and the objective argument preserves optimality.",
    "After all full ray steps have been absorbed, every remaining coefficient lies in [0,1).",
    "Therefore ‖y*−x*‖∞≤Σλᵢ‖uᵢ‖∞≤kΔ≤nΔ.",
    "The proof works for every optimal y*, although an optimal vertex can always be chosen when one only needs to solve the LP.",
  ],
};

const visualization: VisualizationDefinition = {
  id: "theorem-34-lp-ip-proximity",
  title: "Theorem 34 — LP–IP Proximity",
  shortTitle: "Theorem 34: proximity",
  chapter: "Extreme-ray proximity",
  order: 2,
  description:
    "Compare vertex optima, build the sign-compatible cone explicitly from the row partition, decompose the displacement into determinant-bounded rays, and absorb full integral steps until only an nΔ-bounded remainder remains.",
  difficulty: "Advanced",
  duration: 22,
  accent: "#8f88dc",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: prismStages,
  examples: [prismExample, uniqueExample],
  proof,
};

export default visualization;
