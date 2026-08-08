import type { Point2D, Point3D } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  boxMesh,
  label2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
} from "@/visualizations/helpers/lattice-free-scenes";

const lattice2D: Point2D[] = [];
for (let x = -1; x <= 2; x += 1) {
  for (let y = -2; y <= 2; y += 1) lattice2D.push([x, y]);
}

const stages2D: VisualizationStage[] = [
  {
    id: "znfree-2d-definition",
    kicker: "Chapter 24 · Definition 147 · 2D",
    title: "Lattice-free means no lattice point in the interior",
    description:
      "Boundary lattice points are allowed. The strip 0≤x₁≤1 has infinitely many integer points on its two boundary lines, but its interior 0<x₁<1 contains none.",
    formula: "interior(S)∩ℤⁿ=∅",
    insight: "This differs from P∩ℤⁿ=∅: lattice-free sets may deliberately use integer points on their boundary.",
    scene: scene2D(
      [
        polygon2D([[0,-2.5],[1,-2.5],[1,2.5],[0,2.5]], "visible part of S", "component"),
        ...lattice2D.map((p) => point2D(p, undefined, p[0] === 0 || p[0] === 1 ? "integer" : "lattice")),
        label2D([0.18,2.1], "interior has no integer x₁", "accent"),
      ],
      { primary: "A maximal lattice-free split in ℝ²", secondary: "Integer boundary points are permitted; integer interior points are forbidden." },
      { viewport: { x: [-1.3,2.3], y: [-2.7,2.7] } },
    ),
  },
  {
    id: "znfree-2d-nonmaximal",
    kicker: "Definition 147 · Maximality",
    title: "A smaller lattice-free strip is not maximal",
    description:
      "The strip 0.2≤x₁≤0.8 is lattice-free but can be enlarged while keeping its interior free of lattice points. Hence it is not maximal with respect to inclusion.",
    formula: "S₀⊊S and both are ℤⁿ-free ⇒ S₀ is not maximal",
    insight: "Maximality is inclusion-wise: there is no strictly larger convex lattice-free set containing S.",
    scene: scene2D(
      [
        polygon2D([[0,-2.5],[1,-2.5],[1,2.5],[0,2.5]], "maximal S", "component"),
        polygon2D([[0.2,-2.5],[0.8,-2.5],[0.8,2.5],[0.2,2.5]], "nonmaximal S₀", "removed"),
        ...lattice2D.map((p) => point2D(p, undefined, "lattice")),
      ],
      { primary: "Inclusion-wise maximality", secondary: "S₀ can expand until the next integer hyperplanes x₁=0 and x₁=1." },
      { viewport: { x: [-1.3,2.3], y: [-2.7,2.7] } },
    ),
  },
  {
    id: "znfree-2d-split",
    kicker: "End of Chapter 24 · Split example",
    title: "Splits are the simplest maximal lattice-free sets",
    description:
      "The notes end the chapter with the set between two consecutive integer hyperplanes. For integral c and consecutive integers α,α+1, no integer point can lie strictly between them.",
    formula: "S={x∈ℝⁿ: α≤cᵀx≤α+1},   c∈ℤⁿ, α∈ℤ",
    insight: "This is exactly the lattice-free geometry behind split disjunctions and split cuts.",
    scene: scene2D(
      [
        polygon2D([[0,-2.5],[1,-2.5],[1,2.5],[0,2.5]], "split S", "component"),
        ...lattice2D.map((p) => point2D(p, undefined, "lattice")),
        label2D([-0.1,2.1], "cᵀx=α", "accent"),
        label2D([0.82,2.1], "cᵀx=α+1", "accent"),
      ],
      { primary: "Split = one lattice-free slab", secondary: "Here c=e₁ and α=0." },
      { viewport: { x: [-1.3,2.3], y: [-2.7,2.7] } },
    ),
  },
];

const boundary3D: Point3D[] = [];
for (let y = -1; y <= 1; y += 1) {
  for (let z = -1; z <= 1; z += 1) {
    boundary3D.push([0,y,z],[1,y,z]);
  }
}

const stages3D: VisualizationStage[] = [
  {
    id: "znfree-3d-slab",
    kicker: "Definition 147 · 3D",
    title: "In three dimensions a split becomes a lattice-free slab",
    description:
      "The visible box is only a truncation of the infinite slab 0≤x₁≤1. Integer points may lie on the boundary planes x₁=0 and x₁=1, but none occur in its interior.",
    formula: "S={x∈ℝ³:0≤x₁≤1}",
    insight: "The free directions along x₂ and x₃ do not create interior integer points because x₁ would have to be an integer strictly between 0 and 1.",
    scene: scene3D({
      bounds: { x: [-0.4,1.4], y: [-1.6,1.6], z: [-1.6,1.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.42, distance: 5.0 },
      meshes: [boxMesh("slab", [0,-1.4,-1.4], [1,1.4,1.4], "visible slab", "ghost", 0.18)],
      markers: boundary3D.map((p,i) => marker3D(`b-${i}`, p, undefined, "integer", 0.045)),
      segments: [
        segment3D("free-y", [0.5,-1.3,0], [0.5,1.3,0], "free x₂ direction", C.aqua),
        segment3D("free-z", [0.5,0,-1.3], [0.5,0,1.3], "free x₃ direction", C.violet),
      ],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "3D maximal lattice-free split", secondary: "The two bounding hyperplanes are consecutive integer levels." },
    }),
  },
  {
    id: "znfree-3d-maximality",
    kicker: "Definition 147 · Why the slab is maximal",
    title: "Move either boundary outward and a boundary lattice point enters the interior",
    description:
      "If the plane x₁=0 is shifted to x₁<0, points with x₁=0 become interior. The same happens on the x₁=1 side. Thus the split cannot be enlarged in either normal direction while remaining lattice-free.",
    formula: "strict enlargement ⇒ interior(S′)∩ℤ³≠∅",
    insight: "This is the geometric meaning of maximality used later in Lovász's lemma.",
    scene: scene3D({
      bounds: { x: [-0.6,1.6], y: [-1.6,1.6], z: [-1.6,1.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.8, pitch: 0.42, distance: 5.0 },
      meshes: [boxMesh("slab-expanded", [-0.25,-1.4,-1.4], [1,1.4,1.4], "attempted enlargement", "removed", 0.15)],
      markers: [marker3D("blocked", [0,0,0], "integer point becomes interior", "optimum", 0.11)],
      segments: [segment3D("push", [0,0,0], [-0.25,0,0], "push facet", C.rose)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Maximality is blocked by lattice points", secondary: "A strict expansion destroys the lattice-free property." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "znfree-2d", title: "2D · strip and split", stages: stages2D },
  { id: "znfree-3d", title: "3D · lattice-free slab", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "zn-free-definition-147",
  title: "Definition 147 — ℤⁿ-Free and Maximal Convex Sets",
  shortTitle: "ℤⁿ-free sets · Def 147",
  chapter: "Lattice-free polyhedra",
  order: 4,
  description:
    "Introduces the chapter's lattice-free notion, distinguishes boundary from interior lattice points, visualizes inclusion-wise maximality, and connects the definition to split sets at the end of Chapter 24.",
  difficulty: "Foundation",
  duration: 8,
  accent: C.lime,
  visualLabel: "Lattice-free geometry",
  insightLabel: "Definition consequence",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
};

export default visualization;
