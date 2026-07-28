import type {
  Mesh3D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const coefficientConstraints: Scene["constraints"] = [
  { id: "mu1", a: -1, b: 0, limit: 0, label: "μ₁≥0", color: "#f49a4a" },
  { id: "mu2", a: 0, b: -1, limit: 0, label: "μ₂≥0", color: "#8f88dc" },
];

function coefficientScene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.35, 2.25], y: [-0.35, 2.05] },
    constraints: coefficientConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "μ₁", y: "μ₂" },
    primitives,
    caption: {
      primary: "Ray-coefficient coordinates",
      secondary: "u=μ₁r¹+μ₂r² with r¹=(1,0,1), r²=(0,1,1)",
    },
    ...overrides,
  };
}

const coefficientStages: VisualizationStage[] = [
  {
    id: "l51-coeff-rays",
    kicker: "Lemma 51 · Coordinate view",
    title: "Describe the multiplier by its extreme-ray coefficients",
    description:
      "Instead of beginning with a tilted sheet in three dimensions, use coordinates (μ₁,μ₂). Every point in the first quadrant represents the multiplier u=μ₁r¹+μ₂r².",
    formula: "u=μ₁r¹+μ₂r²,   μ₁,μ₂≥0",
    insight:
      "This is a coordinate chart for the multiplier cone, so the decomposition is visible without perspective distortion.",
    scene: coefficientScene([
      { kind: "vector", from: [0, 0], to: [2, 0], label: "copies of r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [0, 1.8], label: "copies of r²", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "l51-coeff-large",
    kicker: "Lemma 51 · Large coefficient",
    title: "A coefficient crossing one contains a full integral ray",
    description:
      "The candidate u=1.4r¹+0.6r² is represented by the point (1.4,0.6). Since μ₁≥1, one complete copy of the integral ray r¹ can be extracted.",
    formula: "u=1.4r¹+0.6r²=r¹+(0.4r¹+0.6r²)",
    insight:
      "The vertical line μ₁=1 is the threshold at which an integral ray copy becomes available.",
    scene: coefficientScene([
      { kind: "line", from: [1, -0.2], to: [1, 1.9], label: "μ₁=1", style: "cut", color: "#e27c89" },
      { kind: "point", at: [1.4, 0.6], label: "candidate u", style: "fractional" },
      { kind: "vector", from: [0, 0], to: [1.4, 0], label: "1.4r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [1.4, 0], to: [1.4, 0.6], label: "+0.6r²", color: "#8f88dc", animate: true },
    ]),
  },
  {
    id: "l51-coeff-extract",
    kicker: "Lemma 51 · Extract and dominate",
    title: "Move one unit left to the remainder multiplier",
    description:
      "Subtracting r¹ changes the coefficient point from (1.4,0.6) to (0.4,0.6). In multiplier space this is u=v+w with integral v=r¹ and remainder w.",
    formula: "v=r¹,   w=0.4r¹+0.6r²,   u=v+w",
    insight:
      "Because the remainder has smaller positive and negative parts, its split inequality dominates the one produced by u.",
    scene: coefficientScene([
      { kind: "point", at: [1.4, 0.6], label: "dominated u", style: "fractional" },
      { kind: "point", at: [0.4, 0.6], label: "remainder w", style: "optimum", animateFrom: [1.4, 0.6] },
      { kind: "vector", from: [1.4, 0.6], to: [0.4, 0.6], label: "subtract one r¹", color: "#e27c89", animate: true },
      { kind: "line", from: [1, -0.2], to: [1, 1.9], label: "integral threshold", style: "cut", color: "#e27c89" },
    ]),
  },
  {
    id: "l51-coeff-unit-square",
    kicker: "Lemma 51 · Undominated region",
    title: "Undominated multipliers use only fractional ray pieces",
    description:
      "If either coefficient reached one, a full integral ray could be removed and a dominating inequality would remain. Therefore every undominated candidate lies in the half-open unit square of coefficient space.",
    formula: "undominated ⇒ 0≤μₖ<1",
    insight:
      "The infinite first quadrant collapses to one bounded coefficient cell.",
    scene: coefficientScene([
      {
        kind: "polygon",
        points: [[0, 0], [1, 0], [1, 1], [0, 1]],
        label: "0≤μ₁,μ₂<1",
        style: "integer-hull",
        fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
      },
      { kind: "point", at: [0.7, 0.8], label: "undominated candidate", style: "optimum" },
      { kind: "point", at: [1.4, 0.6], label: "excluded: μ₁≥1", style: "fractional" },
    ]),
  },
  {
    id: "l51-coeff-bound",
    kicker: "Lemma 51 · Convert coefficients to norm",
    title: "At most m bounded ray fragments produce the mΔ estimate",
    description:
      "Carathéodory uses at most m rays. Each coefficient is below one and each primitive ray has norm at most Δ. Summing the fragments gives the multiplier bound.",
    formula: "‖u‖∞≤Σμₖ‖rᵏ‖∞≤mΔ",
    insight:
      "The unit coefficient cell is the visual reason the infinite multiplier cone yields only a finite norm window.",
    scene: coefficientScene([
      {
        kind: "polygon",
        points: [[0, 0], [1, 0], [1, 1], [0, 1]],
        label: "all coefficients below one",
        style: "integer-hull",
      },
      { kind: "vector", from: [0, 0], to: [0.7, 0], label: "0.7r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0.7, 0], to: [0.7, 0.8], label: "+0.8r²", color: "#8f88dc", animate: true },
      { kind: "point", at: [0.7, 0.8], label: "u", style: "optimum" },
      { kind: "label", at: [1.65, 1.55], text: "|K|≤m and ‖rᵏ‖∞≤Δ", tone: "accent" },
    ]),
  },
];

const boxFaces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
];

function boxVertices(
  x: [number, number],
  y: [number, number],
  z: [number, number],
): Point3D[] {
  return [
    [x[0], y[0], z[0]],
    [x[1], y[0], z[0]],
    [x[1], y[1], z[0]],
    [x[0], y[1], z[0]],
    [x[0], y[0], z[1]],
    [x[1], y[0], z[1]],
    [x[1], y[1], z[1]],
    [x[0], y[1], z[1]],
  ];
}

function boxMesh(
  id: string,
  x: [number, number],
  y: [number, number],
  z: [number, number],
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return {
    id,
    vertices: boxVertices(x, y, z),
    faces: boxFaces,
    style: "solid",
    ...options,
  };
}

const origin: Point3D = [0, 0, 0];
const r1: Point3D = [1, 0, 1];
const r2: Point3D = [0, 1, 1];
const largeU: Point3D = [1.4, 0.6, 2];
const remainder: Point3D = [0.4, 0.6, 1];
const goodU: Point3D = [0.7, 0.8, 1.5];

const multiplierSheet: Mesh3D = {
  id: "multiplier-sheet",
  vertices: [origin, [2.7, 0, 2.7], [0, 2.7, 2.7]],
  faces: [[0, 1, 2]],
  label: "C: u₁+u₂=u₃, u≥0",
  color: "#79c9c0",
  edgeColor: "#10202a",
  opacity: 0.2,
  style: "solid",
};

function rays(scale = 2.7): Segment3D[] {
  return [
    { id: "r1", from: origin, to: [scale, 0, scale], label: "r¹=(1,0,1)", color: "#f49a4a", width: 4, animate: true },
    { id: "r2", from: origin, to: [0, scale, scale], label: "r²=(0,1,1)", color: "#8f88dc", width: 4, animate: true },
  ];
}

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

function multiplierConfiguration(overrides: Partial<Scene3D> = {}): Scene3D {
  return {
    bounds: { x: [-0.3, 3.25], y: [-0.3, 3.25], z: [-0.3, 3.25] },
    axisLabels: { x: "u₁", y: "u₂", z: "u₃" },
    camera: { yaw: -0.72, pitch: 0.36, distance: 6.4 },
    meshes: [multiplierSheet],
    segments: rays(),
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "Actual multiplier cone in ℝ³",
      secondary: "a two-dimensional cone appears as a triangular sheet because u₁+u₂=u₃",
    },
    ...overrides,
  };
}

const multiplier3DStages: VisualizationStage[] = [
  {
    id: "l51-3d-sheet",
    kicker: "Lemma 51 · Actual multiplier space",
    title: "The cone is a flat sheet because of the equality uᵀA_C=0",
    description:
      "For A_C=(1,1,−1)ᵀ, admissible nonnegative multipliers satisfy u₁+u₂=u₃. The cone is therefore two-dimensional inside ℝ³; the triangular sheet is the exact truncated geometry, not a malformed solid.",
    formula: "C={u≥0:u₁+u₂=u₃}",
    insight:
      "The equality removes one dimension. Rotating the scene makes the two-dimensional nature of the multiplier cone clear.",
    scene: scene3D(multiplierConfiguration()),
  },
  {
    id: "l51-3d-rays",
    kicker: "Lemma 51 · Primitive rays",
    title: "The sheet is generated by two short integral edge directions",
    description:
      "The boundary edges have primitive generators r¹=(1,0,1) and r²=(0,1,1). Here Δ=1, so both satisfy the Lemma 32 bound exactly.",
    formula: "‖r¹‖∞=‖r²‖∞=1=Δ",
    insight:
      "Multiplier-space extreme rays are controlled by the same determinant argument as primal-space rays.",
    scene: scene3D(multiplierConfiguration({
      markers: [
        { id: "r1-marker", at: r1, label: "primitive r¹", style: "integer" },
        { id: "r2-marker", at: r2, label: "primitive r²", style: "integer" },
      ],
    })),
  },
  {
    id: "l51-3d-extract",
    kicker: "Lemma 51 · Integral extraction",
    title: "The decomposition u=r¹+w is a visible parallelogram",
    description:
      "The multiplier u=(1.4,0.6,2) contains one complete r¹. The remaining multiplier w=(0.4,0.6,1) stays on the same sheet.",
    formula: "u=r¹+w",
    insight:
      "The 3D geometry agrees exactly with the simple leftward move in coefficient coordinates.",
    scene: scene3D(multiplierConfiguration({
      meshes: [{ ...multiplierSheet, opacity: 0.1 }],
      segments: [
        { id: "ov", from: origin, to: r1, label: "r¹", color: "#f49a4a", width: 4, animate: true },
        { id: "ow", from: origin, to: remainder, label: "w", color: "#8f88dc", width: 4, animate: true },
        { id: "vu", from: r1, to: largeU, label: "+w", color: "#8f88dc", width: 3, dashed: true, animate: true },
        { id: "wu", from: remainder, to: largeU, label: "+r¹", color: "#f49a4a", width: 3, dashed: true, animate: true },
      ],
      markers: [
        { id: "u", at: largeU, label: "dominated u", style: "fractional" },
        { id: "w", at: remainder, label: "dominating remainder w", style: "optimum" },
      ],
    })),
  },
  {
    id: "l51-3d-good",
    kicker: "Lemma 51 · Undominated candidate",
    title: "Only fractional pieces remain on each extreme ray",
    description:
      "The candidate u=0.7r¹+0.8r² has both coefficients below one and lies near the origin on the multiplier sheet.",
    formula: "u=(0.7,0.8,1.5),   0≤μ₁,μ₂<1",
    insight:
      "The multiplier remains on the exact cone while the coefficient restriction makes its norm bounded.",
    scene: scene3D(multiplierConfiguration({
      meshes: [{ ...multiplierSheet, opacity: 0.1 }],
      segments: [
        { id: "good1", from: origin, to: [0.7, 0, 0.7], label: "0.7r¹", color: "#f49a4a", width: 4, animate: true },
        { id: "good2", from: [0.7, 0, 0.7], to: goodU, label: "+0.8r²", color: "#8f88dc", width: 4, animate: true },
      ],
      markers: [{ id: "good", at: goodU, label: "undominated candidate", style: "optimum" }],
    })),
  },
  {
    id: "l51-3d-cube",
    kicker: "Lemma 51 · mΔ cube",
    title: "All undominated multipliers lie in a finite norm cube",
    description:
      "With m=3 and Δ=1, the theorem gives ‖u‖∞≤3. The large translucent cube is the universal mΔ region; the actual candidate lies much closer to the origin.",
    formula: "‖u‖∞≤mΔ=3",
    insight:
      "Bounding the multiplier norm leaves only finitely many relevant integral split pairs, which is the bridge to Theorem 52.",
    scene: scene3D({
      bounds: { x: [-0.3, 3.25], y: [-0.3, 3.25], z: [-0.3, 3.25] },
      axisLabels: { x: "u₁", y: "u₂", z: "u₃" },
      camera: { yaw: -0.72, pitch: 0.36, distance: 6.4 },
      meshes: [
        { ...multiplierSheet, opacity: 0.08 },
        boxMesh("mdelta-cube", [0, 3], [0, 3], [0, 3], {
          label: "‖u‖∞≤mΔ",
          color: "#8f88dc",
          edgeColor: "#8f88dc",
          opacity: 0.08,
          style: "split-hull",
          fromVertices: boxVertices([0, 0], [0, 0], [0, 0]),
        }),
      ],
      segments: rays(),
      markers: [{ id: "good", at: goodU, label: "undominated u", style: "optimum" }],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: {
        primary: "Universal multiplier window",
        secondary: "m=3, Δ=1, so radius mΔ=3",
      },
    }),
  },
];

const coefficientExample: VisualizationExample = {
  id: "coefficient-plane",
  title: "2D coefficient plane — see μk<1 directly",
  description:
    "A perspective-free view of extraction, dominance, and the half-open unit cell containing all undominated coefficient vectors.",
  stages: coefficientStages,
};

const multiplierExample: VisualizationExample = {
  id: "actual-multiplier-space",
  title: "3D multiplier space — exact cone and mΔ cube",
  description:
    "Rotate the true lower-dimensional multiplier cone, inspect its primitive rays, and place the undominated candidate inside the universal norm cube.",
  stages: multiplier3DStages,
};

const visualization: VisualizationDefinition = {
  id: "lemma-51-multiplier-bound",
  title: "Lemma 51 — Bounding Split Multipliers",
  shortTitle: "Lemma 51: multiplier bound",
  chapter: "Extreme-ray proximity",
  order: 4,
  description:
    "Switch between a clear coefficient chart and the exact 3D multiplier cone to understand extraction, domination, μk<1, and the final mΔ bound.",
  difficulty: "Advanced",
  duration: 20,
  accent: "#e27c89",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: coefficientStages,
  examples: [coefficientExample, multiplierExample],
  proof: {
    title: "Why an undominated split multiplier is bounded by mΔ",
    steps: [
      "The sign restrictions and uᵀA_C=0 define a rational cone C in multiplier space.",
      "Its primitive integral extreme rays rᵏ satisfy ‖rᵏ‖∞≤Δ by Lemma 32 applied to the continuous-column system.",
      "Carathéodory writes u=Σₖ∈Kμₖrᵏ with |K|≤m.",
      "If μⱼ≥1, extract the integral multiplier v=rʲ and write u=v+w with w∈C.",
      "The fractional part relevant to the split is unchanged, while w⁺≤u⁺ and w⁻≤u⁻, so the inequality generated by w dominates that generated by u.",
      "Undominatedness therefore forces every μₖ<1.",
      "Finally ‖u‖∞≤Σμₖ‖rᵏ‖∞≤mΔ, leaving a bounded finite search region for relevant split multipliers.",
    ],
  },
};

export default visualization;
