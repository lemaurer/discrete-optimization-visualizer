import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  boxMesh,
  label2D,
  line2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  tetrahedronMesh,
} from "@/visualizations/helpers/lattice-free-scenes";

const maximalTriangle: Point2D[] = [[0,0],[2,0],[0,2]];
const triangleBoundaryLattice: Point2D[] = [[1,0],[0,1],[1,1]];
const boxLattice2D: Point2D[] = [];
for (let x = -1; x <= 3; x += 1) {
  for (let y = -1; y <= 3; y += 1) boxLattice2D.push([x,y]);
}

function lovaszScene2D(primitives: Primitive[], secondary: string) {
  return scene2D(
    primitives,
    { primary: "Lemma 149 (Lovász) · bounded maximal lattice-free sets", secondary },
    { viewport: { x: [-1.3,3.2], y: [-1.3,3.2] } },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "lovasz-2d-statement",
    kicker: "Chapter 24 · Lemma 149 · 2D",
    title: "A bounded maximal full-dimensional lattice-free convex set is polyhedral and every facet is blocked by a lattice point",
    description:
      "For bounded S⊂ℝⁿ, maximality plus lattice-freeness forces two structural facts: S is a polyhedron, and every facet contains an integer point in its relative interior.",
    formula: "S maximal, bounded, full-dimensional, ℤⁿ-free ⇒ (1) S polyhedron; (2) relint(F)∩ℤⁿ≠∅ for every facet F",
    insight: "The triangle shown is the canonical 2D picture: each of its three edges has a lattice point in relative interior, while the interior has none.",
    scene: lovaszScene2D(
      [
        polygon2D(maximalTriangle, "S", "component"),
        ...boxLattice2D.map((p) => point2D(p, undefined, "lattice")),
        ...triangleBoundaryLattice.map((p,i) => point2D(p, i === 0 ? "facet blockers" : undefined, "optimum")),
      ],
      "Example S=conv{(0,0),(2,0),(0,2)}.",
    ),
  },
  {
    id: "lovasz-2d-bound-box",
    kicker: "Proof part 1 · Step 1",
    title: "Boundedness puts S and all relevant lattice points into one finite box",
    description:
      "Choose B∈ℕ with S⊂[−B,B]ⁿ. The box contains only finitely many integer points, which is what makes the forthcoming half-space intersection finite.",
    formula: "S⊂[−B,B]ⁿ,   [−B,B]ⁿ∩ℤⁿ finite",
    insight: "This is exactly where the boundedness assumption of Lemma 149 enters the first part of the proof.",
    scene: lovaszScene2D(
      [
        polygon2D([[-1,-1],[3,-1],[3,3],[-1,3]], "[−B,B]² (schematic)", "removed"),
        polygon2D(maximalTriangle, "S", "component"),
        ...boxLattice2D.map((p) => point2D(p, undefined, "lattice")),
      ],
      "Only finitely many z∈ℤ² must be separated inside the bounding box.",
    ),
  },
  {
    id: "lovasz-2d-separate",
    kicker: "Proof part 1 · Step 2",
    title: "Separate each lattice point z from the interior of S",
    description:
      "For every lattice point z in the box, lattice-freeness means z is not in interior(S). A separating hyperplane through z can therefore be chosen with S on one side.",
    formula: "S⊆{x:α_zᵀx≤α_zᵀz}",
    insight: "Boundary lattice points may have supporting hyperplanes that coincide with facets; exterior lattice points receive ordinary separating hyperplanes.",
    scene: lovaszScene2D(
      [
        polygon2D(maximalTriangle, "S", "component"),
        ...boxLattice2D.map((p) => point2D(p, undefined, "lattice")),
        point2D([1,0], "z₁", "optimum"),
        point2D([0,1], "z₂", "optimum"),
        point2D([1,1], "z₃", "optimum"),
        line2D([-1,0],[3,0], "α_{z₁}ᵀx=α_{z₁}ᵀz₁", C.orange, "constraint"),
        line2D([0,-1],[0,3], "α_{z₂} separator", C.aqua, "constraint"),
        line2D([-0.5,2.5],[2.5,-0.5], "α_{z₃} separator", C.violet, "constraint"),
      ],
      "Representative separators; the proof takes one for every lattice point in the finite box.",
    ),
  },
  {
    id: "lovasz-2d-finite-p",
    kicker: "Proof part 1 · Step 3",
    title: "Intersect the finite family of separators to obtain a lattice-free polytope P containing S",
    description:
      "Define P as the bounding box intersected with all separator half-spaces. It is a finite intersection of half-spaces, hence a polytope. It contains S and remains lattice-free by construction.",
    formula: "P=[−B,B]ⁿ∩⋂_z{x:α_zᵀx≤α_zᵀz}",
    insight: "Maximality of S now forces P=S. Therefore S itself must be a polyhedron.",
    scene: lovaszScene2D(
      [
        polygon2D(maximalTriangle, "P=S", "integer-hull"),
        ...triangleBoundaryLattice.map((p) => point2D(p, undefined, "optimum")),
        label2D([1.35,1.65], "maximality: S⊆P and P lattice-free ⇒ P=S", "accent"),
      ],
      "First conclusion: S is polyhedral.",
    ),
  },
  {
    id: "lovasz-2d-missing-facet-point",
    kicker: "Proof part 2 · Step 1",
    title: "Assume one facet has no lattice point in relative interior",
    description:
      "After the first part write S={x:aᵢᵀx≤bᵢ}. Suppose the facet of row 1 has no integer point in its relative interior. The proof will show this permits a strict lattice-free enlargement.",
    formula: "relint(F₁)∩ℤⁿ=∅  (contradiction hypothesis)",
    insight: "The smaller orange triangle is an illustrative nonmaximal analogue of the forbidden configuration.",
    scene: lovaszScene2D(
      [
        polygon2D([[0,0.2],[1.8,0.2],[0,1.8]], "hypothetical S", "component"),
        ...boxLattice2D.map((p) => point2D(p, undefined, "lattice")),
        line2D([-0.2,0.2],[2.1,0.2], "facet F₁ with no relint lattice point", C.rose, "constraint"),
      ],
      "Schematic contradiction setup: one facet is not blocked by a lattice point.",
    ),
  },
  {
    id: "lovasz-2d-push-one",
    kicker: "Proof part 2 · Step 2",
    title: "Push that facet outward by one unit in its inequality coordinate",
    description:
      "The notes define S′ by replacing a₁ᵀx≤b₁ with a₁ᵀx≤b₁+1. This strictly enlarges S. Since S was assumed maximal, S′ must now contain integer points in its interior.",
    formula: "S′={x:a₁ᵀx≤b₁+1, aᵢᵀx≤bᵢ (i≥2)}",
    insight: "Because S′ is bounded, only finitely many interior integer points appear, so a minimum a₁-value among them exists.",
    scene: lovaszScene2D(
      [
        polygon2D([[0,-0.6],[2.7,-0.6],[0,1.8]], "S′", "removed"),
        polygon2D([[0,0.2],[1.8,0.2],[0,1.8]], "S", "component"),
        point2D([1,0], "new interior integer point", "optimum"),
        line2D([-0.2,0.2],[2.1,0.2], "old facet", C.muted, "constraint"),
        line2D([-0.2,-0.6],[3,-0.6], "pushed facet", C.rose, "cut"),
      ],
      "Maximality says every strict enlargement must pick up an interior lattice point.",
    ),
  },
  {
    id: "lovasz-2d-beta",
    kicker: "Proof part 2 · Step 3",
    title: "Stop at the first new integer level β̄₁",
    description:
      "Among interior integer points of S′ choose one minimizing a₁ᵀz and call the minimum β̄₁. Move the facet back to a₁ᵀx≤β̄₁ while keeping all other rows fixed.",
    formula: "β̄₁=min_{z∈interior(S′)∩ℤⁿ} a₁ᵀz",
    insight: "At this first integer level, the selected lattice point lies on the new facet rather than in the interior.",
    scene: lovaszScene2D(
      [
        polygon2D([[0,0],[2.025,0],[0,1.8]], "S̄", "integer-hull"),
        polygon2D([[0,0.2],[1.8,0.2],[0,1.8]], "S", "component"),
        point2D([1,0], "z̄ on new facet", "optimum"),
        line2D([-0.2,0],[2.3,0], "a₁ᵀx=β̄₁", C.orange, "constraint"),
      ],
      "The first encountered lattice point becomes a boundary blocker.",
    ),
  },
  {
    id: "lovasz-2d-final-contradiction",
    kicker: "Proof part 2 · Step 4",
    title: "The new set S̄ is lattice-free, contains S strictly, and therefore contradicts maximality",
    description:
      "By minimality of β̄₁ no new integer point lies strictly inside S̄. Thus S̄ is lattice-free and contains S. Maximality would force S=S̄, contradicting the assumption that the original facet had no relative-interior integer point.",
    formula: "S⊆S̄, S̄ ℤⁿ-free, S maximal ⇒ S=S̄  contradiction",
    insight: "Hence every facet of a bounded maximal lattice-free set contains an integer point in relative interior.",
    scene: lovaszScene2D(
      [
        polygon2D(maximalTriangle, "maximal shape", "component"),
        ...triangleBoundaryLattice.map((p,i) => point2D(p, i === 0 ? "one blocker per facet" : undefined, "optimum")),
      ],
      "Second conclusion: every facet is blocked in relative interior by a lattice point.",
    ),
  },
];

const tetraVertices: [Point3D, Point3D, Point3D, Point3D] = [[0,0,0],[3,0,0],[0,3,0],[0,0,3]];
const facetBlockers: Point3D[] = [[0,1,1],[1,0,1],[1,1,0],[1,1,1]];

const stages3D: VisualizationStage[] = [
  {
    id: "lovasz-3d-tetra",
    kicker: "Lemma 149 · 3D example",
    title: "A maximal lattice-free tetrahedron has an integer blocker in every facet",
    description:
      "The tetrahedron conv{0,3e₁,3e₂,3e₃} has no integer point in its interior. The coordinate facets contain (0,1,1),(1,0,1),(1,1,0), and the slanted facet x₁+x₂+x₃=3 contains (1,1,1), all in relative interior.",
    formula: "S=conv{0,3e₁,3e₂,3e₃}",
    insight: "Moving any facet outward makes its blocker an interior integer point, which is the geometric signature of maximality.",
    scene: scene3D({
      bounds: { x: [-0.5,3.5], y: [-0.5,3.5], z: [-0.5,3.5] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.48, distance: 6.1 },
      meshes: [tetrahedronMesh("tetra", tetraVertices, "S", "ghost", 0.2)],
      markers: facetBlockers.map((p,i) => marker3D(`f-${i}`, p, i === 3 ? "facet blockers" : undefined, "optimum", 0.075)),
      segments: [],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "3D Lovász geometry", secondary: "Every facet has a relative-interior lattice point." },
    }),
  },
  {
    id: "lovasz-3d-polyhedrality",
    kicker: "Proof part 1 · 3D",
    title: "Finitely many lattice separators inside a bounding box cut out S",
    description:
      "Boundedness gives a finite lattice set in [−B,B]³. Separating each such lattice point from interior(S) yields finitely many half-spaces. Their intersection P is a lattice-free polytope containing S, so maximality forces P=S.",
    formula: "S⊆P, P polytope and ℤ³-free ⇒ S=P",
    insight: "This is the full polyhedrality proof in dimension three; nothing special about the tetrahedron is used.",
    scene: scene3D({
      bounds: { x: [-1,4], y: [-1,4], z: [-1,4] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.48, distance: 6.5 },
      meshes: [
        boxMesh("bound", [-0.7,-0.7,-0.7], [3.7,3.7,3.7], "bounding box", "removed", 0.06),
        tetrahedronMesh("tetra2", tetraVertices, "P=S", "solid", 0.16),
      ],
      markers: facetBlockers.map((p,i) => marker3D(`g-${i}`, p, undefined, "integer", 0.06)),
      segments: [],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Finite separator intersection", secondary: "Maximality collapses the outer polytope back onto S." },
    }),
  },
  {
    id: "lovasz-3d-facet-push",
    kicker: "Proof part 2 · 3D",
    title: "A facet without a blocker could be pushed until the first lattice point is reached",
    description:
      "The proof's contradiction construction moves one facet outward, collects the finitely many new interior lattice points, chooses the minimum β̄₁ along the facet normal, and moves back to that first lattice level.",
    formula: "b₁ → b₁+1 → β̄₁=min a₁ᵀz",
    insight: "The resulting larger set is still lattice-free, so a truly maximal S cannot have started with an unblocked facet.",
    scene: scene3D({
      bounds: { x: [-0.5,3.8], y: [-0.5,3.8], z: [-0.5,3.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.48, distance: 6.2 },
      meshes: [tetrahedronMesh("tetra3", tetraVertices, "S", "ghost", 0.14)],
      markers: [marker3D("block", [1,1,1], "first lattice level", "optimum", 0.1)],
      segments: [segment3D("push", [1,1,1], [1.3,1.3,1.3], "push slanted facet outward", C.rose)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Facet-pushing contradiction", secondary: "A maximal facet must already be stopped by a relative-interior lattice point." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "lovasz-2d", title: "2D · complete proof walkthrough", stages: stages2D },
  { id: "lovasz-3d", title: "3D · tetrahedron and proof mechanism", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "lovasz-lemma-149",
  title: "Lemma 149 (Lovász) — Structure of Bounded Maximal Lattice-Free Sets",
  shortTitle: "Lovász · Lemma 149",
  chapter: "Lattice-free polyhedra",
  order: 6,
  description:
    "Visualizes both conclusions and every proof step of Lemma 149: finite separation inside a bounding box gives polyhedrality, then a facet-pushing and first-integer-level argument forces a relative-interior lattice point on every facet.",
  difficulty: "Advanced",
  duration: 18,
  accent: C.orange,
  visualLabel: "Maximal lattice-free geometry",
  insightLabel: "Proof step",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Lemma 149 proof skeleton",
    steps: [
      "Boundedness gives B∈ℕ with S⊂[−B,B]ⁿ. For every lattice point z in that finite box, separate z from interior(S) by a half-space α_zᵀx≤α_zᵀz containing S.",
      "Intersect the bounding box with all these finitely many half-spaces. The resulting P is a lattice-free polytope containing S. Maximality forces P=S, proving that S is polyhedral.",
      "Write S={x:aᵢᵀx≤bᵢ} with distinct facet inequalities and suppose facet 1 has no integer point in relative interior.",
      "Push it to a₁ᵀx≤b₁+1, producing a strict enlargement S′. Maximality implies S′ has interior integer points; boundedness makes that set finite.",
      "Set β̄₁=min{a₁ᵀz:z∈interior(S′)∩ℤⁿ} and define S̄ by replacing row 1 with a₁ᵀx≤β̄₁.",
      "By choice of β̄₁, S̄ is lattice-free, contains S, and its new facet contains an integer point. Maximality gives S=S̄, contradicting the assumption that the original facet had no such relative-interior point.",
    ],
  },
};

export default visualization;
