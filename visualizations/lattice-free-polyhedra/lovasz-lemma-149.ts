import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  boxMesh,
  integerMarkersInBox,
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
const smallTetraVertices: [Point3D, Point3D, Point3D, Point3D] = [[0,0,0],[2.5,0,0],[0,2.5,0],[0,0,2.5]];
const pushedTetraVertices: [Point3D, Point3D, Point3D, Point3D] = [[0,0,0],[3.5,0,0],[0,3.5,0],[0,0,3.5]];
const facetBlockers: Point3D[] = [[0,1,1],[1,0,1],[1,1,0],[1,1,1]];
const finiteBoxLattice3D = integerMarkersInBox("box", [-1,-1,-1], [3,3,3]);

function lovaszScene3D(
  meshes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["meshes"],
  markers: ReturnType<typeof marker3D>[],
  segments: ReturnType<typeof segment3D>[],
  secondary: string,
  planes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["planes"] = [],
) {
  return scene3D({
    bounds: { x: [-1.0,4.0], y: [-1.0,4.0], z: [-1.0,4.0] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.78, pitch: 0.48, distance: 6.5 },
    meshes,
    planes,
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: { primary: "Lemma 149 (Lovász) · complete 3D proof", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "lovasz-3d-statement",
    kicker: "Chapter 24 · Lemma 149 · 3D",
    title: "The maximal lattice-free tetrahedron shows both conclusions of the lemma",
    description:
      "Take S=conv{0,3e₁,3e₂,3e₃}. It is full-dimensional, bounded and lattice-free. Its four facets are blocked in relative interior by (0,1,1),(1,0,1),(1,1,0), and (1,1,1).",
    formula: "S=conv{0,3e₁,3e₂,3e₃},   relint(F_j)∩ℤ³≠∅ for j=1,…,4",
    insight:
      "The 3D example now starts with the actual polyhedron and the actual facet blockers, exactly as the 2D triangle does.",
    scene: lovaszScene3D(
      [tetrahedronMesh("S", tetraVertices, "S", "ghost", 0.2)],
      facetBlockers.map((p,i) => marker3D(`f-${i}`, p, i === 3 ? "one integer blocker per facet" : undefined, "optimum", 0.075)),
      [],
      "The coordinate facets are blocked by three boundary points; the slanted facet 1ᵀx=3 is blocked by (1,1,1).",
    ),
  },
  {
    id: "lovasz-3d-bound-box",
    kicker: "Proof part 1 · Step 1 · 3D",
    title: "Boundedness places S inside a finite lattice box",
    description:
      "Choose B so that S⊂[−B,B]³. Only finitely many lattice points lie in that box. The proof will separate each of those finitely many z from interior(S).",
    formula: "S⊂[−B,B]³,   [−B,B]³∩ℤ³ finite",
    insight:
      "This is the same first proof step as in 2D; the wireframe box is not decoration but the source of finiteness.",
    scene: lovaszScene3D(
      [
        boxMesh("B", [-0.7,-0.7,-0.7], [3.7,3.7,3.7], "finite bounding box", "removed", 0.055),
        tetrahedronMesh("S-box", tetraVertices, "S", "ghost", 0.14),
      ],
      finiteBoxLattice3D,
      [],
      "Only finitely many displayed z∈ℤ³ need separating hyperplanes.",
    ),
  },
  {
    id: "lovasz-3d-separate",
    kicker: "Proof part 1 · Step 2 · 3D",
    title: "Separate every lattice point z from the interior of S",
    description:
      "Lattice-freeness says no z∈ℤ³ lies in interior(S). For each z in the finite box, choose a separating half-space α_zᵀx≤α_zᵀz containing S. The four displayed planes are representative supporting separators through the facet blockers.",
    formula: "S⊆{x:α_zᵀx≤α_zᵀz} for every lattice z in the box",
    insight:
      "Boundary lattice points naturally use supporting facet planes; exterior points may use other separating planes. The proof takes finitely many of them all together.",
    scene: lovaszScene3D(
      [tetrahedronMesh("S-sep", tetraVertices, "S", "ghost", 0.12)],
      facetBlockers.map((p,i) => marker3D(`z-${i}`, p, `z${i + 1}`, "optimum", 0.07)),
      [],
      "Representative separators through the four facet blockers.",
      [
        { id: "x0", points: [[0,0,0],[0,3,0],[0,0,3]], label: "x₁=0", color: C.orange, opacity: 0.12 },
        { id: "y0", points: [[0,0,0],[3,0,0],[0,0,3]], label: "x₂=0", color: C.aqua, opacity: 0.12 },
        { id: "z0", points: [[0,0,0],[3,0,0],[0,3,0]], label: "x₃=0", color: C.violet, opacity: 0.12 },
        { id: "sum3", points: [[3,0,0],[0,3,0],[0,0,3]], label: "x₁+x₂+x₃=3", color: C.rose, opacity: 0.16 },
      ],
    ),
  },
  {
    id: "lovasz-3d-finite-p",
    kicker: "Proof part 1 · Step 3 · 3D",
    title: "Intersect the finitely many separators: the resulting lattice-free polytope P must equal S",
    description:
      "The bounding box and separator half-spaces define a finite polytope P containing S. By construction P is lattice-free. Since S was assumed maximal, S⊆P cannot be strict, hence P=S and S is itself polyhedral.",
    formula: "S⊆P, P polytope and ℤ³-free, S maximal ⇒ P=S",
    insight:
      "This is the complete polyhedrality conclusion, not a 3D summary shortcut.",
    scene: lovaszScene3D(
      [tetrahedronMesh("P=S", tetraVertices, "P=S", "integer-hull", 0.18)],
      facetBlockers.map((p,i) => marker3D(`ps-${i}`, p, i === 3 ? "P=S by maximality" : undefined, "optimum", 0.065)),
      [],
      "First conclusion: the maximal convex set S is a polyhedron.",
    ),
  },
  {
    id: "lovasz-3d-missing-facet",
    kicker: "Proof part 2 · Step 1 · 3D",
    title: "Assume one facet has no lattice point in relative interior",
    description:
      "To visualize the contradiction hypothesis, shrink only the slanted facet from 1ᵀx=3 to 1ᵀx=5/2. The resulting tetrahedron is still lattice-free, but its slanted facet cannot contain an integer point because 1ᵀz is integral for z∈ℤ³.",
    formula: "S₀={x≥0:1ᵀx≤5/2},   relint(F₁)∩ℤ³=∅",
    insight:
      "This smaller tetrahedron is intentionally nonmaximal: it is the concrete 3D analogue of the smaller triangle used in the 2D contradiction picture.",
    scene: lovaszScene3D(
      [tetrahedronMesh("S0", smallTetraVertices, "hypothetical unblocked S", "ghost", 0.2)],
      [],
      [segment3D("normal-small", [0.83,0.83,0.83], [1.25,1.25,1.25], "a₁=(1,1,1)", C.rose)],
      "The slanted facet 1ᵀx=2.5 has no lattice point at all, hence none in relative interior.",
      [{ id: "old-facet", points: [[2.5,0,0],[0,2.5,0],[0,0,2.5]], label: "unblocked facet", color: C.rose, opacity: 0.18 }],
    ),
  },
  {
    id: "lovasz-3d-push-one",
    kicker: "Proof part 2 · Step 2 · 3D",
    title: "Push the unblocked facet outward by one unit",
    description:
      "The notes replace a₁ᵀx≤b₁ by a₁ᵀx≤b₁+1. Here b₁=5/2, so S′ has slanted facet 1ᵀx=7/2. The integer point (1,1,1), whose sum is 3, becomes an interior point of S′.",
    formula: "S′={x≥0:1ᵀx≤7/2},   (1,1,1)∈interior(S′)∩ℤ³",
    insight:
      "This is the lattice point that maximality guarantees must appear after a strict enlargement.",
    scene: lovaszScene3D(
      [
        tetrahedronMesh("Sprime", pushedTetraVertices, "S′", "removed", 0.16),
        tetrahedronMesh("S0-inside", smallTetraVertices, "S", "ghost", 0.1),
      ],
      [marker3D("new-int", [1,1,1], "new interior integer point", "optimum", 0.105)],
      [segment3D("push", [2.5/3,2.5/3,2.5/3], [3.5/3,3.5/3,3.5/3], "push b₁→b₁+1", C.rose)],
      "After pushing the facet, (1,1,1) is strictly inside the larger tetrahedron.",
    ),
  },
  {
    id: "lovasz-3d-beta",
    kicker: "Proof part 2 · Step 3 · 3D",
    title: "Move back to the first integer level β̄₁=3",
    description:
      "Among interior integer points of S′ minimize a₁ᵀz=1ᵀz. The first possible value above 5/2 is 3, attained by z̄=(1,1,1). Replacing the pushed facet by 1ᵀx≤3 puts z̄ on the new boundary.",
    formula: "β̄₁=min{1ᵀz:z∈interior(S′)∩ℤ³}=3",
    insight:
      "The first encountered lattice level gives exactly the maximal tetrahedron S̄=conv{0,3e₁,3e₂,3e₃}.",
    scene: lovaszScene3D(
      [
        tetrahedronMesh("Sbar", tetraVertices, "S̄", "integer-hull", 0.18),
        tetrahedronMesh("S0-beta", smallTetraVertices, "original hypothetical S", "ghost", 0.08),
      ],
      [marker3D("zbar", [1,1,1], "z̄ on 1ᵀx=β̄₁", "optimum", 0.11)],
      [],
      "The slanted facet stops exactly when it reaches the first integer level 3.",
      [{ id: "beta-plane", points: [[3,0,0],[0,3,0],[0,0,3]], label: "1ᵀx=β̄₁=3", color: C.orange, opacity: 0.18 }],
    ),
  },
  {
    id: "lovasz-3d-final",
    kicker: "Proof part 2 · Step 4 · 3D",
    title: "The larger S̄ is still lattice-free, so maximality rules out the unblocked original facet",
    description:
      "By minimality of β̄₁ no integer point lies strictly beyond the old facet but strictly inside S̄. Therefore S̄ is lattice-free and strictly contains the hypothetical S₀. A maximal S could not allow this. Hence every facet of a bounded maximal lattice-free set must already contain a relative-interior lattice point.",
    formula: "S⊂S̄, S̄ ℤ³-free ⇒ S was not maximal",
    insight:
      "The final tetrahedron displays all four blockers again, completing exactly the same two-part proof sequence as the 2D example.",
    scene: lovaszScene3D(
      [tetrahedronMesh("final", tetraVertices, "maximal S", "solid", 0.17)],
      facetBlockers.map((p,i) => marker3D(`final-${i}`, p, i === 3 ? "all facets blocked" : undefined, "optimum", 0.075)),
      [],
      "Second conclusion: every facet has a lattice point in its relative interior.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "lovasz-2d", title: "2D · complete proof walkthrough", stages: stages2D },
  { id: "lovasz-3d", title: "3D · complete proof walkthrough", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "lovasz-lemma-149",
  title: "Lemma 149 (Lovász) — Structure of Bounded Maximal Lattice-Free Sets",
  shortTitle: "Lovász · Lemma 149",
  chapter: "Lattice-free polyhedra",
  order: 6,
  description:
    "Visualizes both conclusions and every proof step of Lemma 149: finite separation inside a bounding box gives polyhedrality, then a facet-pushing and first-integer-level argument forces a relative-interior lattice point on every facet. The 3D option now mirrors all eight 2D stages.",
  difficulty: "Advanced",
  duration: 22,
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
