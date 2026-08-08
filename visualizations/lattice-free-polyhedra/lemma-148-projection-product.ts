import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  label2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  triangularPrismMesh,
} from "@/visualizations/helpers/lattice-free-scenes";

const stripLattice: Point2D[] = [];
for (let x = -1; x <= 2; x += 1) {
  for (let y = -2; y <= 2; y += 1) stripLattice.push([x,y]);
}

function stripScene(extra: Primitive[], secondary: string) {
  return scene2D(
    [
      polygon2D([[0,-2.5],[1,-2.5],[1,2.5],[0,2.5]], "S=K×ℝ", "component"),
      ...stripLattice.map((p) => point2D(p, undefined, "lattice")),
      ...extra,
    ],
    { primary: "Lemma 148 · projection/product reduction", secondary },
    {
      viewport: { x: [-1.2,2.2], y: [-2.7,2.7] },
      axisLabels: { x: "integer coordinate x", y: "continuous coordinate u" },
    },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "lem148-2d-statement",
    kicker: "Chapter 24 · Lemma 148 · n=1,d=1",
    title: "A maximal mixed lattice-free set must be a cylinder over its integer projection",
    description:
      "For S⊂ℝ^{n+d}, project orthogonally onto the n integer coordinates. If S is maximal, full-dimensional, and ℤⁿ-free, then the projection K is maximal ℤⁿ-free and S contains the entire ℝᵈ fiber over every point of K.",
    formula: "K=proj_{ℝⁿ}(S),   S=K×ℝᵈ",
    insight: "The lemma removes the continuous coordinates from the structural study of maximal lattice-free sets.",
    scene: stripScene([], "Example: n=1,d=1, K=[0,1], so S=[0,1]×ℝ."),
  },
  {
    id: "lem148-2d-interior-projection",
    kicker: "Proof step 1 · Project the interior",
    title: "The projection of interior(S) is interior(K)",
    description:
      "Orthogonal projection of a full-dimensional convex set is open relative to its image on interior points. Hence an integer point in interior(K) would lift to a point of interior(S) with an integer first coordinate.",
    formula: "proj(interior(S))=interior(K)",
    insight: "Because interior(S) avoids ℤⁿ×ℝᵈ, interior(K) must avoid ℤⁿ.",
    scene: stripScene(
      [
        label2D([0.15,1.9], "project vertically", "accent"),
        label2D([0.2,-2.25], "K=[0,1]", "accent"),
      ],
      "Interior points of the strip project to the open interval (0,1).",
    ),
  },
  {
    id: "lem148-2d-k-free",
    kicker: "Proof step 2 · K is ℤⁿ-free",
    title: "An interior integer point of K would contradict lattice-freeness of S",
    description:
      "If z∈interior(K)∩ℤⁿ, the interior projection property provides some continuous coordinate u with (z,u)∈interior(S), contradicting the definition of ℤⁿ-freeness.",
    formula: "interior(K)∩ℤⁿ=∅",
    insight: "The mixed-integer forbidden set projects to an ordinary lattice-free set.",
    scene: stripScene(
      [
        point2D([0,0], "boundary integer x=0 allowed", "integer"),
        point2D([1,0], "boundary integer x=1 allowed", "integer"),
        label2D([0.17,0.55], "no integer x strictly inside K", "accent"),
      ],
      "K is lattice-free in the ordinary one-dimensional lattice.",
    ),
  },
  {
    id: "lem148-2d-maximal-extension",
    kicker: "Proof step 3 · Enlarge the projection hypothetically",
    title: "Place K inside a maximal lattice-free set K′",
    description:
      "Let K′ be any maximal ℤⁿ-free set containing K. Then K′×ℝᵈ is also ℤⁿ-free, because its interior has an integer first coordinate exactly when interior(K′) does.",
    formula: "K⊆K′,   K′ maximal ℤⁿ-free ⇒ K′×ℝᵈ is ℤⁿ-free",
    insight: "Any enlargement in integer-coordinate space produces a valid cylindrical enlargement in the original mixed space.",
    scene: scene2D(
      [
        polygon2D([[-0.25,-2.5],[1.25,-2.5],[1.25,2.5],[-0.25,2.5]], "hypothetical K′×ℝ", "removed"),
        polygon2D([[0,-2.5],[1,-2.5],[1,2.5],[0,2.5]], "S", "component"),
        ...stripLattice.map((p) => point2D(p, undefined, "lattice")),
      ],
      { primary: "Hypothetical projection enlargement", secondary: "If K′ were strictly larger and still lattice-free, K′×ℝ would strictly contain S." },
      { viewport: { x: [-1.2,2.2], y: [-2.7,2.7] }, axisLabels: { x: "x", y: "u" } },
    ),
  },
  {
    id: "lem148-2d-maximality",
    kicker: "Proof step 4 · Use maximality of S",
    title: "The inclusion chain collapses to equality",
    description:
      "We always have S⊆K×ℝᵈ⊆K′×ℝᵈ. All sets on the right are ℤⁿ-free. Since S is maximal, neither inclusion can be strict.",
    formula: "S⊆K×ℝᵈ⊆K′×ℝᵈ and S maximal ⇒ S=K×ℝᵈ=K′×ℝᵈ",
    insight: "Therefore K=K′ is maximal and the original S is exactly the product cylinder claimed by the lemma.",
    scene: stripScene(
      [label2D([0.2,1.9], "maximality ⇒ no missing fibers", "accent")],
      "Conclusion: S is exactly [0,1]×ℝ and K=[0,1] is maximal lattice-free.",
    ),
  },
];

const triangle: [Point2D, Point2D, Point2D] = [[0,0],[2,0],[0,2]];
const prismBoundaryPoints: Point3D[] = [
  [1,0,-1],[1,0,0],[1,0,1],
  [0,1,-1],[0,1,0],[0,1,1],
  [1,1,-1],[1,1,0],[1,1,1],
];

const stages3D: VisualizationStage[] = [
  {
    id: "lem148-3d-product",
    kicker: "Lemma 148 · n=2,d=1",
    title: "A bounded maximal lattice-free triangle extrudes to an infinite mixed-integer prism",
    description:
      "Take K=conv{(0,0),(2,0),(0,2)} in the two integer coordinates and one continuous coordinate u. The theorem says a maximal ℤ²-free S with this projection must equal K×ℝ.",
    formula: "S=K×ℝ,   K=conv{(0,0),(2,0),(0,2)}",
    insight: "The displayed prism is truncated at u=±1.5 only for visualization; mathematically it extends indefinitely.",
    scene: scene3D({
      bounds: { x: [-0.4,2.4], y: [-0.4,2.4], z: [-1.8,1.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "u" },
      camera: { yaw: -0.8, pitch: 0.38, distance: 5.4 },
      meshes: [triangularPrismMesh("prism", triangle, -1.5, 1.5, "visible part of K×ℝ", "ghost", 0.2)],
      markers: prismBoundaryPoints.map((p,i) => marker3D(`p-${i}`, p, i === 4 ? "boundary lattice fiber" : undefined, "integer", 0.05)),
      segments: [segment3D("fiber", [0.7,0.6,-1.45], [0.7,0.6,1.45], "complete ℝ-fiber", C.violet)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y"],
      caption: { primary: "Projection K and free continuous fibers", secondary: "Integer restrictions apply only to x₁,x₂; u is continuous." },
    }),
  },
  {
    id: "lem148-3d-proof",
    kicker: "Lemma 148 · Proof in one picture",
    title: "Project, maximize K, re-extrude, then invoke maximality of S",
    description:
      "Projection preserves the interior obstruction, so K is ℤ²-free. A larger lattice-free K′ would make K′×ℝ a larger ℤ²-free set containing S, contradicting maximality.",
    formula: "proj(S)=K,   K⊆K′ ⇒ S⊆K×ℝ⊆K′×ℝ",
    insight: "The proof does not require boundedness; boundedness first appears in Lemma 149.",
    scene: scene3D({
      bounds: { x: [-0.4,2.4], y: [-0.4,2.4], z: [-1.8,1.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "u" },
      camera: { yaw: -0.8, pitch: 0.38, distance: 5.4 },
      meshes: [triangularPrismMesh("prism-proof", triangle, -1.5, 1.5, "S=K×ℝ", "solid", 0.17)],
      markers: [marker3D("mid", [0.7,0.6,0], "interior fiber", "fractional", 0.08)],
      segments: [
        segment3D("up", [0.7,0.6,0], [0.7,0.6,1.45], "+u", C.aqua),
        segment3D("down", [0.7,0.6,0], [0.7,0.6,-1.45], "−u", C.aqua),
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y"],
      caption: { primary: "Maximality forces all continuous fibers", secondary: "No continuous-coordinate geometry remains after projection." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "lem148-2d", title: "2D · n=1,d=1 proof", stages: stages2D },
  { id: "lem148-3d", title: "3D · n=2,d=1 prism", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "lemma-148-projection-product",
  title: "Lemma 148 — Project Away Continuous Coordinates",
  shortTitle: "Projection product · Lemma 148",
  chapter: "Lattice-free polyhedra",
  order: 5,
  description:
    "Visualizes the complete proof that a maximal full-dimensional ℤⁿ-free set in ℝ^{n+d} is the Cartesian product of a maximal ℤⁿ-free projection K⊂ℝⁿ with the entire continuous space ℝᵈ.",
  difficulty: "Intermediate",
  duration: 10,
  accent: C.aqua,
  visualLabel: "Projection and fibers",
  insightLabel: "Proof step",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Lemma 148 proof skeleton",
    steps: [
      "Let K be the orthogonal projection of S onto the n integer-coordinate directions. The projection of interior(S) equals interior(K).",
      "If interior(K) contained z∈ℤⁿ, some point (z,u) would lie in interior(S), contradicting ℤⁿ-freeness. Thus K is ℤⁿ-free.",
      "Let K′ be a maximal ℤⁿ-free set containing K. Then K′×ℝᵈ is also ℤⁿ-free.",
      "We have S⊆K×ℝᵈ⊆K′×ℝᵈ. Maximality of S forces both inclusions to be equalities.",
      "Hence S=K×ℝᵈ and K=K′ is maximal ℤⁿ-free.",
    ],
  },
};

export default visualization;
