import type {
  Mesh3D,
  Point3D,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";
import type { VisualizationDefinition, VisualizationStage } from "@/visualizations/types";

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
const badU: Point3D = [1.4, 0.6, 2];
const extractedV: Point3D = [1, 0, 1];
const remainderW: Point3D = [0.4, 0.6, 1];
const goodU: Point3D = [0.7, 0.8, 1.5];
const m = 3;
const delta = 1;

const truncatedCone: Mesh3D = {
  id: "multiplier-cone",
  vertices: [origin, [3, 0, 3], [0, 3, 3]],
  faces: [[0, 1, 2]],
  label: "C: w₁+w₂=w₃, w≥0",
  color: "#79c9c0",
  edgeColor: "#10202a",
  opacity: 0.24,
  style: "solid",
};

function raySegments(scale = 3): Segment3D[] {
  return [
    {
      id: "ray-r1",
      from: origin,
      to: [scale, 0, scale],
      label: "r¹=(1,0,1)",
      color: "#f49a4a",
      width: 3,
      animate: true,
    },
    {
      id: "ray-r2",
      from: origin,
      to: [0, scale, scale],
      label: "r²=(0,1,1)",
      color: "#8f88dc",
      width: 3,
      animate: true,
    },
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

function baseConfiguration(overrides: Partial<Scene3D> = {}): Scene3D {
  return {
    bounds: { x: [-0.4, 3.5], y: [-0.4, 3.5], z: [-0.4, 3.6] },
    axisLabels: { x: "u₁", y: "u₂", z: "u₃" },
    camera: { yaw: -0.78, pitch: 0.45, distance: 6.8 },
    meshes: [truncatedCone],
    segments: raySegments(),
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "Multiplier space ℝᵐ with m=3",
      secondary: "illustrative A_C=(1,1,−1)ᵀ, so Δ=1",
    },
    ...overrides,
  };
}

function additionParallelogram(
  v: Point3D,
  w: Point3D,
  u: Point3D,
): Segment3D[] {
  return [
    { id: "origin-v", from: origin, to: v, label: "v", color: "#f49a4a", width: 4, animate: true },
    { id: "origin-w", from: origin, to: w, label: "w", color: "#8f88dc", width: 4, animate: true },
    { id: "v-u", from: v, to: u, label: "+w", color: "#8f88dc", width: 3, dashed: true, animate: true },
    { id: "w-u", from: w, to: u, label: "+v", color: "#f49a4a", width: 3, dashed: true, animate: true },
  ];
}

const stages: VisualizationStage[] = [
  {
    id: "lemma51-multiplier-space",
    kicker: "Lemma 51 · Change of viewpoint",
    title: "The proof lives in multiplier space, not primal x-space",
    description:
      "A split inequality is encoded by a multiplier u∈ℝᵐ. Its sign pattern and the condition uᵀA_C=0 define a cone C of admissible multipliers. The displayed cone is the plane w₁+w₂=w₃ inside the nonnegative orthant.",
    formula: "C={w:wᵀA_C=0, wᵢ≤0 on M⁻, wᵢ≥0 on M⁺}",
    insight:
      "Lemma 51 bounds the coefficients used to combine the original constraints, rather than bounding a point of the primal polyhedron.",
    scene: scene3D(baseConfiguration()),
  },
  {
    id: "lemma51-extreme-rays",
    kicker: "Lemma 51 · Apply Lemma 32 again",
    title: "The multiplier cone also has determinant-bounded extreme rays",
    description:
      "The primitive generators r¹=(1,0,1) and r²=(0,1,1) are integral extreme rays. Since the continuous-column matrix A_C has largest subdeterminant Δ=1, Lemma 32 gives ‖rᵏ‖∞≤Δ.",
    formula: "‖rᵏ‖∞≤Δ",
    insight:
      "The same arithmetic ray bound from Lemma 32 now controls directions in ℝᵐ rather than directions in the original variable space ℝⁿ.",
    scene: scene3D(baseConfiguration({
      markers: [
        { id: "r1-primitive", at: r1, label: "primitive r¹", style: "integer" },
        { id: "r2-primitive", at: r2, label: "primitive r²", style: "integer" },
      ],
    })),
  },
  {
    id: "lemma51-caratheodory",
    kicker: "Lemma 51 · Carathéodory in ℝᵐ",
    title: "Any multiplier uses at most m extreme rays",
    description:
      "The candidate u is decomposed as u=Σμₖrᵏ. Carathéodory guarantees that at most m ray directions are needed, regardless of how many extreme rays the cone has.",
    formula: "u=Σₖ∈K μₖrᵏ,   |K|≤m",
    insight:
      "This is where the final factor m enters the bound, exactly as the factor n entered the proximity theorems.",
    scene: scene3D(baseConfiguration({
      markers: [
        { id: "bad-u", at: badU, label: "u=1.4r¹+0.6r²", style: "fractional", animateFrom: origin },
      ],
      segments: [
        ...raySegments(),
        { id: "bad-part-one", from: origin, to: [1.4, 0, 1.4], label: "1.4r¹", color: "#f49a4a", width: 4, animate: true },
        { id: "bad-part-two", from: [1.4, 0, 1.4], to: badU, label: "0.6r²", color: "#8f88dc", width: 4, animate: true },
      ],
    })),
  },
  {
    id: "lemma51-large-coefficient",
    kicker: "Lemma 51 · What if μₖ≥1?",
    title: "A full integral ray can be extracted",
    description:
      "Because μ₁=1.4, split off the integral vector v=r¹ and write u=v+w. The remainder w stays in the same sign cone and has smaller positive and negative parts coordinatewise.",
    formula: "u=v+w,   v∈C∩ℤᵐ∖{0},   w∈C",
    insight:
      "The parallelogram shows the algebraic decomposition that drives the domination argument.",
    scene: scene3D(baseConfiguration({
      meshes: [{ ...truncatedCone, opacity: 0.12 }],
      segments: additionParallelogram(extractedV, remainderW, badU),
      markers: [
        { id: "v", at: extractedV, label: "integral v=r¹", style: "integer" },
        { id: "w", at: remainderW, label: "remainder w", style: "optimum" },
        { id: "u", at: badU, label: "u=v+w", style: "fractional" },
      ],
    })),
  },
  {
    id: "lemma51-domination",
    kicker: "Lemma 51 · Undominated cuts",
    title: "Removing the integral part produces a stronger split inequality",
    description:
      "The fractional part f of uᵀb is unchanged after subtracting the integral multiplier v. Since w⁺≤u⁺ and w⁻≤u⁻, the split inequality generated by w dominates the one generated by u.",
    formula: "w⁺≤u⁺, w⁻≤u⁻ ⇒ cut(w) dominates cut(u)",
    insight:
      "Therefore an undominated split inequality cannot come from a multiplier decomposition containing one full extreme-ray copy.",
    scene: scene3D(baseConfiguration({
      meshes: [{ ...truncatedCone, opacity: 0.08 }],
      segments: [
        { id: "old-u", from: origin, to: badU, label: "dominated u", color: "#e27c89", width: 3, dashed: true, animate: true },
        { id: "strong-w", from: origin, to: remainderW, label: "dominating remainder w", color: "#8f88dc", width: 5, animate: true },
      ],
      markers: [
        { id: "old-u-marker", at: badU, label: "discard u", style: "fractional" },
        { id: "w-marker", at: remainderW, label: "keep w", style: "optimum", animateFrom: badU },
      ],
      caption: {
        primary: "Dominance removes large coefficients",
        secondary: "undominated ⇒ no decomposition coefficient reaches one",
      },
    })),
  },
  {
    id: "lemma51-undominated",
    kicker: "Lemma 51 · Coefficients below one",
    title: "An undominated multiplier uses only fractional ray pieces",
    description:
      "The remaining candidate u=0.7r¹+0.8r² has every coefficient below one. No nonzero integral extreme ray can be peeled off without leaving the chosen coefficient range.",
    formula: "undominated ⇒ 0≤μₖ<1",
    insight:
      "This is the exact analogue of stripping integer ray steps from an LP–IP displacement in Theorem 34.",
    scene: scene3D(baseConfiguration({
      meshes: [{ ...truncatedCone, opacity: 0.12 }],
      segments: [
        { id: "good-part-one", from: origin, to: [0.7, 0, 0.7], label: "0.7r¹", color: "#f49a4a", width: 4, animate: true },
        { id: "good-part-two", from: [0.7, 0, 0.7], to: goodU, label: "0.8r²", color: "#8f88dc", width: 4, animate: true },
      ],
      markers: [
        { id: "good-u", at: goodU, label: "undominated candidate u", style: "optimum", animateFrom: badU },
      ],
    })),
  },
  {
    id: "lemma51-mdeltabox",
    kicker: "Lemma 51 · Sum the ray bounds",
    title: "At most m short rays fit inside the mΔ-box",
    description:
      "Carathéodory supplies at most m terms, every coefficient is below one, and every primitive ray has ℓ∞-norm at most Δ. Their sum therefore lies inside the cube of radius mΔ.",
    formula: "‖u‖∞≤Σμₖ‖rᵏ‖∞≤mΔ",
    insight:
      "The cube is a finite arithmetic search region for all multipliers capable of defining undominated split inequalities.",
    scene: scene3D({
      bounds: { x: [-0.4, 3.5], y: [-0.4, 3.5], z: [-0.4, 3.6] },
      axisLabels: { x: "u₁", y: "u₂", z: "u₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.8 },
      meshes: [
        { ...truncatedCone, opacity: 0.1 },
        boxMesh("m-delta-box", [0, m * delta], [0, m * delta], [0, m * delta], {
          label: "‖u‖∞≤mΔ=3",
          color: "#8f88dc",
          opacity: 0.12,
          style: "split-hull",
          fromVertices: boxVertices([0, 0], [0, 0], [0, 0]),
        }),
      ],
      segments: raySegments(),
      markers: [
        { id: "bounded-u", at: goodU, label: "u inside mΔ-box", style: "optimum" },
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: {
        primary: "Bounded multiplier region",
        secondary: `m=${m}, Δ=${delta}, so ‖u‖∞≤${m * delta}`,
      },
    }),
  },
  {
    id: "lemma51-finiteness",
    kicker: "Lemma 51 · Why the bound matters",
    title: "Bounded multipliers lead to finitely many relevant split data",
    description:
      "Inside the bounded multiplier region, only finitely many integral split normals and right-hand sides can be induced. This is the finiteness step used immediately afterward to prove that the split closure is a rational polyhedron.",
    formula: "U={u:‖u‖∞≤mΔ} ⇒ finitely many induced (π,π₀)",
    insight:
      "Lemma 51 turns an infinite family of possible multipliers into a bounded search region without losing any undominated split inequality.",
    scene: scene3D({
      bounds: { x: [-0.4, 3.5], y: [-0.4, 3.5], z: [-0.4, 3.6] },
      axisLabels: { x: "u₁", y: "u₂", z: "u₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.8 },
      meshes: [
        boxMesh("finite-region", [0, 3], [0, 3], [0, 3], {
          label: "finite determinant window",
          color: "#79c9c0",
          opacity: 0.14,
          style: "integer-hull",
        }),
      ],
      markers: [
        { id: "candidate-a", at: [1, 0, 1], label: "integral ray", style: "integer" },
        { id: "candidate-b", at: [0, 1, 1], label: "integral ray", style: "integer" },
        { id: "candidate-u", at: goodU, label: "undominated u", style: "optimum" },
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x", "y", "z"],
      caption: {
        primary: "Bridge to Theorem 52",
        secondary: "bounded u produces finitely many integral split pairs",
      },
    }),
  },
];

const visualization: VisualizationDefinition = {
  id: "lemma-51-multiplier-bound",
  title: "Lemma 51 — Bounding Split Multipliers",
  shortTitle: "Lemma 51: multiplier bound",
  chapter: "Extreme-ray proximity",
  order: 4,
  description:
    "Move into multiplier space, decompose a split multiplier into determinant-bounded extreme rays, and see why undominated cuts force all ray coefficients below one and hence ‖u‖∞≤mΔ.",
  difficulty: "Advanced",
  duration: 20,
  accent: "#e27c89",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages,
  proof: {
    title: "Why an undominated split multiplier is bounded by mΔ",
    steps: [
      "Fix the sign sets M⁻={i:uᵢ<0} and M⁺={i:uᵢ≥0}, and define the multiplier cone C by wᵀA_C=0 together with these coordinate signs.",
      "Let r¹,…,rᵗ be the primitive integral extreme rays of C. Applying Lemma 32 to the defining matrix gives ‖rᵏ‖∞≤Δ.",
      "Carathéodory writes u=Σₖ∈K μₖrᵏ with |K|≤m.",
      "If some μₖ≥1, set v=rᵏ and w=u−v. Then v is a nonzero integral cone vector and w remains in C.",
      "The integrality assumptions make vᵀA integral on the integer variables and vᵀb integral, so u and w have the same fractional part f.",
      "Because w has the same sign pattern with w⁺≤u⁺ and w⁻≤u⁻, the split inequality generated by w dominates the one generated by u.",
      "Undominatedness therefore forces μₖ<1 for every used ray.",
      "Finally ‖u‖∞≤Σμₖ‖rᵏ‖∞≤mΔ.",
    ],
  },
};

export default visualization;
