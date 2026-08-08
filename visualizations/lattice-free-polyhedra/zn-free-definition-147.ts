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

function slabScene3D(
  meshes: NonNullable<ReturnType<typeof scene3D>["scene3D"]>["meshes"],
  markers: ReturnType<typeof marker3D>[],
  segments: ReturnType<typeof segment3D>[],
  secondary: string,
) {
  return scene3D({
    bounds: { x: [-0.6,1.6], y: [-1.6,1.6], z: [-1.6,1.6] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.8, pitch: 0.42, distance: 5.0 },
    meshes,
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: { primary: "Definition 147 · same geometry in ℝ³", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "znfree-3d-definition",
    kicker: "Chapter 24 · Definition 147 · 3D",
    title: "The definition is identical: the interior of the slab contains no lattice point",
    description:
      "The displayed box truncates the infinite slab S={x:0≤x₁≤1}. Every lattice point with x₁=0 or x₁=1 lies on a boundary plane, while an interior point would require an integer x₁ strictly between 0 and 1.",
    formula: "S={x∈ℝ³:0≤x₁≤1},   interior(S)∩ℤ³=∅",
    insight:
      "This stage is the literal 3D version of the first 2D strip stage: same two boundary levels, with one additional free direction.",
    scene: slabScene3D(
      [boxMesh("slab", [0,-1.4,-1.4], [1,1.4,1.4], "visible part of S", "ghost", 0.2)],
      boundary3D.map((p,i) => marker3D(`b-${i}`, p, i === 4 ? "boundary lattice points" : undefined, "integer", 0.047)),
      [],
      "Boundary lattice points are allowed; the open region 0<x₁<1 contains none.",
    ),
  },
  {
    id: "znfree-3d-nonmaximal",
    kicker: "Definition 147 · Maximality · 3D",
    title: "The smaller slab 0.2≤x₁≤0.8 is lattice-free but not maximal",
    description:
      "Just as in 2D, the narrow slab can expand in the x₁ direction until it reaches the consecutive integer hyperplanes x₁=0 and x₁=1. Both the smaller and larger slabs are lattice-free, so the smaller one is not inclusion-wise maximal.",
    formula: "S₀={0.2≤x₁≤0.8} ⊊ S={0≤x₁≤1}",
    insight:
      "The extra x₂,x₃ directions do not change the maximality mechanism; the only relevant obstruction is the next integer level of cᵀx.",
    scene: slabScene3D(
      [
        boxMesh("outer", [0,-1.4,-1.4], [1,1.4,1.4], "maximal S", "ghost", 0.12),
        boxMesh("inner", [0.2,-1.15,-1.15], [0.8,1.15,1.15], "nonmaximal S₀", "removed", 0.25),
      ],
      boundary3D.map((p,i) => marker3D(`m-${i}`, p, undefined, "integer", 0.04)),
      [
        segment3D("left-expand", [0.2,0,0], [0,0,0], "expand to x₁=0", C.aqua),
        segment3D("right-expand", [0.8,0,0], [1,0,0], "expand to x₁=1", C.aqua),
      ],
      "The inner slab can be enlarged without putting a lattice point into its interior.",
    ),
  },
  {
    id: "znfree-3d-split",
    kicker: "End of Chapter 24 · Split example · 3D",
    title: "The maximal slab is exactly a split between consecutive integer hyperplanes",
    description:
      "Take c=e₁ and α=0. Then S={x:α≤cᵀx≤α+1}. Because c is integral, cᵀz is integral for every z∈ℤ³, so no lattice point has 0<cᵀz<1. Moving either boundary outward makes a boundary lattice point interior.",
    formula: "S={x∈ℝ³:α≤cᵀx≤α+1},  c=e₁, α=0",
    insight:
      "This is the same final split picture as in 2D, now displayed as a slab with two infinite boundary planes.",
    scene: slabScene3D(
      [boxMesh("split", [0,-1.4,-1.4], [1,1.4,1.4], "split S", "solid", 0.16)],
      boundary3D.map((p,i) => marker3D(`s-${i}`, p, undefined, "integer", 0.043)),
      [
        segment3D("normal", [0.5,0,0], [1.25,0,0], "c=e₁", C.violet),
        segment3D("left-bound", [0,-1.2,0], [0,1.2,0], "cᵀx=α", C.orange),
        segment3D("right-bound", [1,-1.2,0], [1,1.2,0], "cᵀx=α+1", C.orange),
      ],
      "The 3D example now follows the same definition → nonmaximal set → maximal split progression as the 2D example.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "znfree-2d", title: "2D · definition, maximality, split", stages: stages2D },
  { id: "znfree-3d", title: "3D · definition, maximality, split", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "zn-free-definition-147",
  title: "Definition 147 — ℤⁿ-Free and Maximal Convex Sets",
  shortTitle: "ℤⁿ-free sets · Def 147",
  chapter: "Lattice-free polyhedra",
  order: 4,
  description:
    "Introduces the chapter's lattice-free notion, distinguishes boundary from interior lattice points, visualizes inclusion-wise maximality, and connects the definition to split sets at the end of Chapter 24. The 2D and 3D examples now use the same three-stage structure.",
  difficulty: "Foundation",
  duration: 9,
  accent: C.lime,
  visualLabel: "Lattice-free geometry",
  insightLabel: "Definition consequence",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
};

export default visualization;
