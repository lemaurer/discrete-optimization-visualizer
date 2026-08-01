import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

interface ConeExampleData {
  id: string;
  title: string;
  description: string;
  viewport: Scene["viewport"];
  constraints: Scene["constraints"];
  rays: Array<{
    primitive: Point2D;
    displayEnd: Point2D;
    label: string;
    color: string;
  }>;
  selectedRay: Point2D;
  selectedEquation: string;
  selectedLine: [Point2D, Point2D];
  determinantLabels: [string, string];
  delta: number;
  matrixLabel: string;
}

function baseScene(data: ConeExampleData, overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: data.viewport,
    constraints: data.constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Rational cone C={x:Ax≤0}",
      secondary: `${data.matrixLabel}; Δ=${data.delta}`,
    },
    ...overrides,
  };
}

function rayPrimitives(data: ConeExampleData, extra: Primitive[] = []): Primitive[] {
  return [
    ...data.rays.flatMap<Primitive>((ray, index) => [
      {
        kind: "vector",
        from: [0, 0],
        to: ray.displayEnd,
        label: `ray ${ray.label}`,
        color: ray.color,
        animate: true,
      },
      {
        kind: "point",
        at: ray.primitive,
        label: `primitive u${index + 1}=${ray.label}`,
        style: "integer",
      },
    ]),
    ...extra,
  ];
}

function deltaSquare(delta: number, style: "feasible" | "integer-hull" = "feasible"): Primitive {
  return {
    kind: "polygon",
    points: [[-delta, -delta], [delta, -delta], [delta, delta], [-delta, delta]],
    label: "‖x‖∞≤Δ",
    style,
    fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
  };
}

function buildStages(data: ConeExampleData): VisualizationStage[] {
  const [selectedX, selectedY] = data.selectedRay;
  return [
    {
      id: `${data.id}-cone`,
      kicker: "Lemma 32 · Cone geometry",
      title: "A homogeneous integer system creates a clean wedge",
      description:
        "The feasible region is an unbounded cone with two visible boundary edges. Those boundary edges, not the interior directions, are its extreme rays.",
      formula: "C={x∈ℝⁿ:Ax≤0}",
      insight:
        "The cone itself is infinite. The arithmetic statement concerns one canonical lattice vector on each edge.",
      scene: baseScene(data),
    },
    {
      id: `${data.id}-primitive`,
      kicker: "Lemma 32 · Primitive generators",
      title: "Mark the first lattice point on every extreme ray",
      description:
        "Each highlighted point is the shortest nonzero integral vector on its ray. Every other integral point on that edge is a positive integer multiple of it.",
      formula: "u primitive ⇔ gcd(u₁,…,uₙ)=1",
      insight:
        "Primitive normalization separates the finite arithmetic direction from the infinite geometric ray.",
      scene: baseScene(data, { primitives: rayPrimitives(data) }),
    },
    {
      id: `${data.id}-multiples`,
      kicker: "Lemma 32 · Unbounded multiples",
      title: "The ray is unbounded although its generator is small",
      description:
        "The rose points show larger multiples of one primitive generator. They leave every fixed box, while the primitive vector itself remains unchanged.",
      formula: "u,2u,3u,…∈ray(u)",
      insight:
        "Lemma 32 bounds the coordinates of u, not the distance to arbitrary points further along the same ray.",
      scene: baseScene(data, {
        primitives: rayPrimitives(data, [
          { kind: "point", at: [2 * selectedX, 2 * selectedY], label: "2u", style: "fractional" },
          { kind: "point", at: [3 * selectedX, 3 * selectedY], label: "3u", style: "fractional" },
        ]),
      }),
    },
    {
      id: `${data.id}-tight-system`,
      kicker: "Lemma 32 · Tight equations",
      title: "A boundary ray is the null direction of a tight subsystem",
      description:
        `For the selected ray u=(${selectedX},${selectedY}), the boundary equation ${data.selectedEquation} is tight. In two dimensions, one independent tight equation leaves a one-dimensional nullspace.`,
      formula: "A′u=0,   rank(A′)=|I|−1",
      insight:
        "Extreme-ray geometry converts into a nearly square integer linear system.",
      scene: baseScene(data, {
        showFeasibleRegion: false,
        primitives: [
          {
            kind: "line",
            from: data.selectedLine[0],
            to: data.selectedLine[1],
            label: data.selectedEquation,
            style: "constraint",
            color: "#f49a4a",
          },
          { kind: "vector", from: [0, 0], to: data.selectedRay, label: `u=(${selectedX},${selectedY})`, color: "#f49a4a", animate: true },
          { kind: "point", at: data.selectedRay, label: "primitive generator", style: "integer" },
        ],
      }),
    },
    {
      id: `${data.id}-cramer`,
      kicker: "Lemma 32 · Cramer’s rule",
      title: "The generator coordinates are subdeterminants",
      description:
        "After deleting one column, Cramer’s rule constructs an integral null vector whose coordinates are determinants of square submatrices. Primitive division can only make the coordinates smaller.",
      formula: "u′ⱼ=det(A′₀),   u′ᵢ=−det(A′ᵢ),   u′=λu",
      insight:
        `For this ray the displayed coordinate lengths are ${data.determinantLabels[0]} and ${data.determinantLabels[1]}, each at most Δ=${data.delta}.`,
      scene: baseScene(data, {
        showFeasibleRegion: false,
        showConstraints: false,
        primitives: [
          {
            kind: "polygon",
            points: [[0, 0], [selectedX, 0], [selectedX, selectedY], [0, selectedY]],
            label: "determinant coordinates",
            style: "integer-hull",
          },
          { kind: "vector", from: [0, 0], to: data.selectedRay, label: `u=(${selectedX},${selectedY})`, color: "#f49a4a", animate: true },
          { kind: "line", from: [selectedX, 0], to: data.selectedRay, label: data.determinantLabels[1], style: "cut" },
          { kind: "line", from: [0, selectedY], to: data.selectedRay, label: data.determinantLabels[0], style: "objective", color: "#8f88dc" },
          { kind: "label", at: [data.delta + 0.6, data.delta + 0.5], text: `all minors ≤ Δ=${data.delta}`, tone: "accent" },
        ],
      }),
    },
    {
      id: `${data.id}-delta-box`,
      kicker: "Lemma 32 · Determinant window",
      title: "Every primitive extreme generator lies in the Δ-box",
      description:
        "The square is the ℓ∞ ball of radius Δ. The cone continues beyond it, but the first primitive lattice vector on every extreme ray is trapped inside.",
      formula: "‖u‖∞≤Δ",
      insight:
        "Determinants provide a finite arithmetic window around the origin even when the feasible geometry is unbounded.",
      scene: baseScene(data, {
        showFeasibleRegion: false,
        showConstraints: false,
        primitives: [deltaSquare(data.delta), ...rayPrimitives(data)],
        caption: {
          primary: "Primitive rays inside the determinant window",
          secondary: `Δ=max absolute square subdeterminant=${data.delta}`,
        },
      }),
    },
  ];
}

const skewData: ConeExampleData = {
  id: "skew-delta-three",
  title: "Skew cone — Δ=3",
  description:
    "A visibly asymmetric rational wedge with primitive generators (2,1) and (1,2), showing a nontrivial determinant bound.",
  viewport: { x: [-1.1, 6.4], y: [-1.1, 6.4] },
  constraints: [
    { id: "upper", a: -2, b: 1, limit: 0, label: "−2x₁+x₂≤0", color: "#f49a4a" },
    { id: "lower", a: 1, b: -2, limit: 0, label: "x₁−2x₂≤0", color: "#8f88dc" },
  ],
  rays: [
    { primitive: [2, 1], displayEnd: [6, 3], label: "(2,1)", color: "#8f88dc" },
    { primitive: [1, 2], displayEnd: [3, 6], label: "(1,2)", color: "#f49a4a" },
  ],
  selectedRay: [1, 2],
  selectedEquation: "−2x₁+x₂=0",
  selectedLine: [[-0.45, -0.9], [3.15, 6.3]],
  determinantLabels: ["|det|=1", "|det|=2"],
  delta: 3,
  matrixLabel: "A=[(−2,1);(1,−2)]",
};

const unimodularData: ConeExampleData = {
  id: "unimodular-delta-one",
  title: "Unimodular cone — Δ=1",
  description:
    "A clean wedge bounded by the x-axis and diagonal, where every primitive ray coordinate is already at most one.",
  viewport: { x: [-1.1, 6.2], y: [-1.1, 6.2] },
  constraints: [
    { id: "bottom", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#8f88dc" },
    { id: "diagonal", a: -1, b: 1, limit: 0, label: "x₂≤x₁", color: "#f49a4a" },
  ],
  rays: [
    { primitive: [1, 0], displayEnd: [6, 0], label: "(1,0)", color: "#8f88dc" },
    { primitive: [1, 1], displayEnd: [5.6, 5.6], label: "(1,1)", color: "#f49a4a" },
  ],
  selectedRay: [1, 1],
  selectedEquation: "−x₁+x₂=0",
  selectedLine: [[-0.8, -0.8], [6, 6]],
  determinantLabels: ["|det|=1", "|det|=1"],
  delta: 1,
  matrixLabel: "A=[(0,−1);(−1,1)]",
};

const skewStages = buildStages(skewData);
const unimodularStages = buildStages(unimodularData);

const examples: VisualizationExample[] = [
  {
    id: skewData.id,
    title: skewData.title,
    description: skewData.description,
    stages: skewStages,
  },
  {
    id: unimodularData.id,
    title: unimodularData.title,
    description: unimodularData.description,
    stages: unimodularStages,
  },
];

const visualization: VisualizationDefinition = {
  id: "lemma-32-extreme-ray-bound",
  title: "Lemma 32 — Extreme Rays and Δ",
  shortTitle: "Lemma 32: ray bound",
  chapter: "Extreme-ray proximity",
  order: 1,
  description:
    "Compare two rational cones and see how tight equations, primitive normalization, and Cramer’s rule place every primitive extreme direction inside an ℓ∞ box of radius Δ.",
  difficulty: "Intermediate",
  duration: 15,
  accent: "#f49a4a",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: skewStages,
  examples,
  proof: {
    title: "Why an extreme ray is bounded by the largest subdeterminant",
    steps: [
      "Normalize the integral extreme ray u so gcd(u₁,…,uₙ)=1.",
      "The support I of u admits |I|−1 independent tight rows A′ with A′u=0.",
      "Choose j∈I with |uⱼ|=‖u‖∞ and delete column j to obtain a square matrix A′₀.",
      "Cramer’s rule constructs an integral null vector u′ whose coordinates are determinants of square submatrices of A.",
      "The nullspace is one-dimensional, so u′=λu for an integer λ≥1.",
      "Thus ‖u‖∞≤‖u′‖∞=|det(A′₀)|≤Δ.",
    ],
  },
};

export default visualization;
