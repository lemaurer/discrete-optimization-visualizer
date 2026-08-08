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
const enlargedTriangle: [Point2D, Point2D, Point2D] = [[0,0],[2.3,0],[0,2.3]];
const prismBoundaryPoints: Point3D[] = [
  [1,0,-1],[1,0,0],[1,0,1],
  [0,1,-1],[0,1,0],[0,1,1],
  [1,1,-1],[1,1,0],[1,1,1],
];
const projectionLattice: Point3D[] = [
  [0,0,-1.55],[1,0,-1.55],[2,0,-1.55],
  [0,1,-1.55],[1,1,-1.55],[0,2,-1.55],
];

function prismScene3D(
  meshes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["meshes"],
  markers: ReturnType<typeof marker3D>[],
  segments: ReturnType<typeof segment3D>[],
  secondary: string,
  planes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["planes"] = [],
) {
  return scene3D({
    bounds: { x: [-0.45,2.55], y: [-0.45,2.55], z: [-1.8,1.8] },
    axisLabels: { x: "x₁ integer", y: "x₂ integer", z: "u continuous" },
    camera: { yaw: -0.8, pitch: 0.38, distance: 5.5 },
    meshes,
    planes,
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y"],
    caption: { primary: "Lemma 148 · n=2,d=1", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "lem148-3d-statement",
    kicker: "Chapter 24 · Lemma 148 · n=2,d=1",
    title: "The 3D example starts from the actual product S=K×ℝ",
    description:
      "Take the maximal ℤ²-free triangle K=conv{(0,0),(2,0),(0,2)} and one continuous coordinate u. The displayed triangular prism is a finite truncation of S=K×ℝ; mathematically every vertical fiber continues indefinitely.",
    formula: "K=conv{(0,0),(2,0),(0,2)},   S=K×ℝ",
    insight:
      "This is the direct 3D analogue of the 2D strip K=[0,1] extruded along one continuous coordinate.",
    scene: prismScene3D(
      [triangularPrismMesh("S", triangle, -1.5, 1.5, "visible S=K×ℝ", "ghost", 0.2)],
      prismBoundaryPoints.map((p,i) => marker3D(`b-${i}`, p, i === 7 ? "boundary lattice fiber" : undefined, "integer", 0.047)),
      [segment3D("fiber", [0.7,0.6,-1.45], [0.7,0.6,1.45], "entire ℝ-fiber", C.violet)],
      "The integer restriction concerns x₁,x₂ only; u is genuinely continuous.",
    ),
  },
  {
    id: "lem148-3d-interior-projection",
    kicker: "Proof step 1 · Project the interior",
    title: "Project vertical interior fibers down to interior(K)",
    description:
      "The proof uses proj(interior(S))=interior(K). The bottom triangle is a drawing of K on a separate projection plane; the vertical arrows show representative interior points of S mapped to their (x₁,x₂) coordinates.",
    formula: "proj_{x₁,x₂}(interior(S))=interior(K)",
    insight:
      "The continuous coordinate disappears under projection, but openness of the interior is preserved in the integer-coordinate space.",
    scene: prismScene3D(
      [triangularPrismMesh("S-proj", triangle, -1.3, 1.3, "S", "ghost", 0.12)],
      [
        marker3D("p1", [0.6,0.5,0.8], "interior(S)", "fractional", 0.07),
        marker3D("q1", [0.6,0.5,-1.55], "projection in interior(K)", "fractional", 0.07),
      ],
      [segment3D("project", [0.6,0.5,0.8], [0.6,0.5,-1.55], "orthogonal projection", C.aqua)],
      "Interior points project to interior points of K.",
      [{ id: "K-plane", points: [[0,0,-1.56],[2,0,-1.56],[0,2,-1.56]], label: "K", color: C.aqua, opacity: 0.18 }],
    ),
  },
  {
    id: "lem148-3d-k-free",
    kicker: "Proof step 2 · K is ℤ²-free",
    title: "An interior lattice point of K would lift to a forbidden mixed-integer interior point",
    description:
      "The projected triangle has lattice points (1,0),(0,1),(1,1) on its facets but none in its relative interior. If z∈interior(K)∩ℤ² existed, the interior projection property would provide some u with (z,u)∈interior(S), contradicting ℤ²-freeness of S.",
    formula: "interior(K)∩ℤ²=∅",
    insight:
      "This stage mirrors the 2D proof's boundary integers x=0,1: lattice points on ∂K are allowed, only interior lattice points are forbidden.",
    scene: prismScene3D(
      [triangularPrismMesh("S-kfree", triangle, -1.3, 1.3, "S", "ghost", 0.08)],
      projectionLattice.map((p,i) => marker3D(`k-${i}`, p, i === 4 ? "(1,1) on ∂K" : undefined, i === 4 ? "optimum" : "integer", i === 4 ? 0.08 : 0.05)),
      [],
      "The separate projection plane makes the ordinary lattice-free triangle K visible inside the mixed-space picture.",
      [{ id: "K-free-plane", points: [[0,0,-1.56],[2,0,-1.56],[0,2,-1.56]], label: "K is ℤ²-free", color: C.aqua, opacity: 0.2 }],
    ),
  },
  {
    id: "lem148-3d-maximal-extension",
    kicker: "Proof step 3 · Hypothetical enlargement K⊂K′",
    title: "Any larger lattice-free K′ would create a larger lattice-free product K′×ℝ",
    description:
      "The abstract proof places K inside some maximal lattice-free K′. In the concrete triangle example K is already maximal: pushing the slanted facet from x₁+x₂=2 to 2.3 immediately makes (1,1) an interior lattice point, so the attempted K′ is not lattice-free.",
    formula: "K⊂K′ ⇒ S⊆K×ℝ⊂K′×ℝ;  here (1,1) blocks the enlargement",
    insight:
      "The removed outer prism visualizes exactly what would contradict maximality if a strict lattice-free K′ existed.",
    scene: prismScene3D(
      [
        triangularPrismMesh("Kprime", enlargedTriangle, -1.5, 1.5, "attempted K′×ℝ", "removed", 0.16),
        triangularPrismMesh("S-inner", triangle, -1.5, 1.5, "S", "ghost", 0.12),
      ],
      [marker3D("blocker", [1,1,0], "(1,1,u) becomes interior", "optimum", 0.1)],
      [segment3D("push", [1,1,0], [1.15,1.15,0], "push x₁+x₂ facet", C.rose)],
      "A strict enlargement of K would enlarge the entire product in mixed space.",
    ),
  },
  {
    id: "lem148-3d-maximality",
    kicker: "Proof step 4 · Use maximality of S",
    title: "The inclusion chain forces equality and all continuous fibers must be present",
    description:
      "In general S⊆K×ℝᵈ⊆K′×ℝᵈ. Both product sets are ℤⁿ-free whenever K and K′ are. Since S is maximal, the chain cannot contain a strict inclusion: S=K×ℝᵈ and K itself is maximal.",
    formula: "S⊆K×ℝᵈ⊆K′×ℝᵈ, S maximal ⇒ S=K×ℝᵈ and K=K′",
    insight:
      "The 3D proof now follows every step of the 2D walkthrough instead of jumping directly from the prism to the conclusion.",
    scene: prismScene3D(
      [triangularPrismMesh("final-product", triangle, -1.5, 1.5, "S=K×ℝ", "solid", 0.17)],
      [marker3D("inside", [0.6,0.6,0], "every fiber included", "fractional", 0.07)],
      [
        segment3D("up", [0.6,0.6,0], [0.6,0.6,1.45], "+u", C.aqua),
        segment3D("down", [0.6,0.6,0], [0.6,0.6,-1.45], "−u", C.aqua),
      ],
      "Conclusion: no genuine geometry remains in the continuous direction; S is exactly a cylinder over K.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "lem148-2d", title: "2D · n=1,d=1 full proof", stages: stages2D },
  { id: "lem148-3d", title: "3D · n=2,d=1 full proof", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "lemma-148-projection-product",
  title: "Lemma 148 — Project Away Continuous Coordinates",
  shortTitle: "Projection product · Lemma 148",
  chapter: "Lattice-free polyhedra",
  order: 5,
  description:
    "Visualizes the complete proof that a maximal full-dimensional ℤⁿ-free set in ℝ^{n+d} is the Cartesian product of a maximal ℤⁿ-free projection K⊂ℝⁿ with the entire continuous space ℝᵈ. Both 2D and 3D now expose all proof steps.",
  difficulty: "Intermediate",
  duration: 12,
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
