import type {
  Mesh3D,
  PlanePatch3D,
  Point3D,
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
const firstRayCorner: Point3D = [1.5, 1.5, 1];

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
      secondary: "we choose the fractional LP optimum y* at a vertex of the optimal face",
    },
    ...overrides,
  };
}

const prismStages: VisualizationStage[] = [
  {
    id: "t34-prism-vertex-optimum",
    kicker: "Theorem 34 · Vertex optimum",
    title: "Choose the LP optimum at a fractional vertex",
    description:
      "The objective maximizes x₃. The entire top face is optimal, but the displayed LP optimum y*=(3/2,2,1) is one of its vertices, not an interior point. The integer optima x̂=(0,0,1) and x*=(1,1,1) are also vertices of P.",
    formula: "max{x₃:x∈P},   y*=(3/2,2,1)",
    insight:
      "A linear program always has an optimal vertex when an optimum exists. The theorem is stronger and also applies to nonvertex optimal points, but the example deliberately uses a vertex.",
    scene: scene3D(prismConfiguration({
      markers: [
        { id: "ystar", at: yStar3D, label: "fractional LP vertex y*", style: "fractional" },
        { id: "xhat", at: xHat3D, label: "integer optimal vertex x̂", style: "integer" },
        { id: "xstar", at: xStar3D, label: "nearby integer vertex x*", style: "optimum" },
      ],
    })),
  },
  {
    id: "t34-prism-displacement",
    kicker: "Theorem 34 · Difference cone",
    title: "The optimal vertices are connected by safe cone directions",
    description:
      "From x̂, the two primitive directions u¹=(1,1,0) and u²=(0,1,0) remain on the optimal face. Their nonnegative combinations contain the displacement from x̂ to y*.",
    formula: "y*−x̂=1.5u¹+0.5u²",
    insight:
      "The shape is a prism rather than a box, so the extreme directions visibly follow actual edges of the optimal face.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.11)],
      markers: [
        { id: "xhat", at: xHat3D, label: "x̂", style: "integer" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "u1", from: xHat3D, to: [1, 1, 1], label: "u¹=(1,1,0)", color: "#f49a4a", width: 4, animate: true },
        { id: "u2", from: xHat3D, to: [0, 1, 1], label: "u²=(0,1,0)", color: "#8f88dc", width: 4, animate: true },
        { id: "difference", from: xHat3D, to: yStar3D, label: "y*−x̂", color: "#e27c89", width: 3, dashed: true, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-caratheodory",
    kicker: "Theorem 34 · Carathéodory",
    title: "Only two primitive rays are needed here",
    description:
      "The displacement is drawn as a broken path: first 1.5 copies of u¹, then 0.5 copies of u². In general Carathéodory guarantees at most n rays.",
    formula: "y*−x̂=1.5u¹+0.5u²,   k=2≤n=3",
    insight:
      "Lemma 32 bounds each primitive ray by Δ; Carathéodory bounds how many different ray directions appear.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.1)],
      markers: [
        { id: "xhat", at: xHat3D, label: "x̂", style: "integer" },
        { id: "corner", at: firstRayCorner, label: "x̂+1.5u¹", style: "vertex" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "part1", from: xHat3D, to: firstRayCorner, label: "1.5u¹", color: "#f49a4a", width: 4, animate: true },
        { id: "part2", from: firstRayCorner, to: yStar3D, label: "0.5u²", color: "#8f88dc", width: 4, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-strip",
    kicker: "Theorem 34 · Strip a full ray",
    title: "One integral ray step lands on another optimal vertex",
    description:
      "Since the coefficient of u¹ is 1.5, absorb one complete integral copy into x̂. The new point x*=x̂+u¹=(1,1,1) is again feasible, integral, optimal, and a vertex of this prism.",
    formula: "x*=x̂+u¹,   y*−x*=0.5u¹+0.5u²",
    insight:
      "This geometry makes the coefficient reduction literal: a full edge step moves from one optimal vertex to another.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.1)],
      markers: [
        { id: "old", at: xHat3D, label: "old x̂", style: "integer" },
        { id: "new", at: xStar3D, label: "new optimal vertex x*", style: "optimum", animateFrom: xHat3D },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "full-step", from: xHat3D, to: xStar3D, label: "one full u¹", color: "#f49a4a", width: 5, animate: true },
        { id: "remainder", from: xStar3D, to: yStar3D, label: "fractional remainder", color: "#e27c89", width: 4, dashed: true, animate: true },
      ],
    })),
  },
  {
    id: "t34-prism-bound",
    kicker: "Theorem 34 · Proximity bound",
    title: "The remainder is a sum of short fractional ray pieces",
    description:
      "Both remaining coefficients are below one. Here the actual ℓ∞ gap is one, while the universal theorem gives nΔ=3·2=6.",
    formula: "‖y*−x*‖∞=1≤Σλᵢ‖uᵢ‖∞≤nΔ=6",
    insight:
      "The universal bound is deliberately coarse: it depends only on dimension and subdeterminants, not on the detailed shape of this particular prism.",
    scene: scene3D(prismConfiguration({
      meshes: [prismMesh(0.09)],
      markers: [
        { id: "xstar", at: xStar3D, label: "x*", style: "optimum" },
        { id: "ystar", at: yStar3D, label: "y*", style: "fractional" },
      ],
      segments: [
        { id: "gap", from: xStar3D, to: yStar3D, label: "0.5u¹+0.5u²", color: "#e27c89", width: 5, animate: true },
      ],
      caption: {
        primary: "Actual gap 1; theorem radius nΔ=6",
        secondary: "both selected optima are vertices",
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

const uniqueY: [number, number] = [1.5, 1.5];
const uniqueX: [number, number] = [2, 1];

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
  title: "3D prism — strip a full ray between vertices",
  description:
    "A natural prism where the chosen fractional LP optimum, the initial integer optimum, and the improved nearby integer optimum are all vertices.",
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
    "Compare vertex optima in natural polyhedra, decompose their displacement into determinant-bounded rays, and absorb full integral steps until only an nΔ-bounded remainder remains.",
  difficulty: "Advanced",
  duration: 20,
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
