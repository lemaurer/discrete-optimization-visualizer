import type { Point2D, Point3D } from "@/engine/types";
import type { VisualizationDefinition, VisualizationExample, VisualizationStage } from "@/visualizations/types";
import {
  PROXIMITY_COLORS as C,
  label2D,
  line2D,
  marker3D,
  point2D,
  polygon2D,
  scene2D,
  scene3D,
  segment3D,
  vector2D,
} from "@/visualizations/helpers/standard-form-proximity-scenes";

const W2: Point2D[] = [[2,0],[0,2],[1,2]];
const lattice2: Point2D[] = [];
for (let x=0;x<=8;x+=1) for (let y=0;y<=8;y+=2) lattice2.push([x,y]);

const stages2D: VisualizationStage[] = [
  {
    id: "def154-2d-cone-lattice",
    kicker: "Chapter 25 · Definition 154 · 2D",
    title: "Separate three objects: the real cone, its lattice, and the integer cone",
    description:
      "Take W with columns w₁=(2,0), w₂=(0,2), w₃=(1,2). The real cone is the first quadrant. The lattice Λ(W)=Wℤ³ contains points that need negative coefficients, while intcone(W)=Wℤ₊³ allows only nonnegative integer coefficients.",
    formula: "cone(W)=Wℝ₊ⁿ,   Λ(W)=Wℤⁿ,   intcone(W)=Wℤ₊ⁿ",
    insight: "Diagonal Frobenius asks when a lattice point that is represented deep inside the real cone is guaranteed to belong to the integer cone.",
    scene: scene2D(
      [
        polygon2D([[0,0],[8.5,0],[8.5,8.5],[0,8.5]], "cone(W)", "component"),
        ...lattice2.map((p) => point2D(p, undefined, "lattice")),
        ...W2.map((w,i) => vector2D([0,0], w, `w${i+1}`, i===2 ? C.orange : C.aqua)),
        point2D([1,0], "lattice point but not intcone", "fractional"),
      ],
      { primary: "Real cone versus integer cone", secondary: "The hole (1,0) belongs to cone(W)∩Λ(W), but cannot be generated nonnegatively by the columns." },
      { viewport: { x: [-0.7,8.8], y: [-0.7,8.8] } },
    ),
  },
  {
    id: "def154-2d-deep",
    kicker: "Definition 154 · The diagonal condition",
    title: "Deep means every coefficient in one real representation is at least t",
    description:
      "The condition is not merely geometric distance from the origin. A point c must have a representation c=Wλ with λ_i≥t for every column i. This moves c at least t copies along every generating direction.",
    formula: "c=Wλ,   λ≥t·1",
    insight: "The word diagonal refers to increasing all coefficients together along the direction W1.",
    scene: scene2D(
      [
        polygon2D([[0,0],[8.5,0],[8.5,8.5],[0,8.5]], "cone(W)", "component"),
        vector2D([0,0],[3,4], "W1=w₁+w₂+w₃", C.violet),
        point2D([6,8], "c=Wλ with all λᵢ large", "optimum"),
        line2D([3,4],[6,8], "move further along W1", C.orange),
      ],
      { primary: "Diagonal depth", secondary: "Requiring all λᵢ≥t keeps c away from every coefficient-space boundary." },
      { viewport: { x: [-0.7,8.8], y: [-0.7,8.8] } },
    ),
  },
  {
    id: "def154-2d-threshold",
    kicker: "Definition 154 · t*",
    title: "t* is the first depth after which every lattice point is integrally generated",
    description:
      "Among points c∈cone(W)∩Λ(W), consider only those admitting λ≥t1. The diagonal Frobenius number is the smallest integer t* for which every such c lies in intcone(W).",
    formula: "t*=min{t∈ℤ₊: c=Wλ, λ≥t1, c∈Λ(W) ⇒ c∈intcone(W)}",
    insight: "Holes may persist forever near facets; the definition only claims that holes disappear in the diagonal interior region.",
    scene: scene2D(
      [
        polygon2D([[0,0],[8.5,0],[8.5,8.5],[0,8.5]], "cone(W)", "component"),
        point2D([1,0], "boundary hole may persist", "fractional"),
        point2D([5,6], "deep lattice point", "optimum"),
        label2D([3.3,7.5], "deep region ⇒ no holes after t*", "accent"),
      ],
      { primary: "What the threshold does and does not say", secondary: "It controls the interior diagonal region, not every point of the cone." },
      { viewport: { x: [-0.7,8.8], y: [-0.7,8.8] } },
    ),
  },
];

const W3: Point3D[] = [[2,0,0],[0,2,0],[0,0,2],[1,2,2]];

const stages3D: VisualizationStage[] = [
  {
    id: "def154-3d-cone",
    kicker: "Definition 154 · genuine 3D cone",
    title: "The same distinction is visible in a three-dimensional pointed cone",
    description:
      "Use columns 2e₁,2e₂,2e₃ and (1,2,2). Their real cone is the nonnegative octant. The lattice contains signed integer combinations, while the integer cone uses nonnegative coefficients only.",
    formula: "W=[2e₁,2e₂,2e₃,(1,2,2)]",
    insight: "The 3D scene shows the actual column directions; it is not an extrusion of the 2D drawing.",
    scene: scene3D({
      bounds: { x: [-0.5,5], y: [-0.5,5], z: [-0.5,5] },
      axisLabels: { x: "c₁", y: "c₂", z: "c₃" },
      camera: { yaw: -0.82, pitch: 0.48, distance: 6.1 },
      markers: [marker3D("o", [0,0,0], "0", "integer", 0.06), marker3D("hole", [1,0,0], "lattice hole near facet", "fractional", 0.09)],
      segments: W3.map((w,i) => segment3D(`w-${i}`, [0,0,0], w, `w${i+1}`, i===3 ? C.orange : C.aqua)),
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Pointed cone in ℝ³", secondary: "Integer generation is stricter than membership in the real cone and lattice." },
    }),
  },
  {
    id: "def154-3d-diagonal",
    kicker: "Definition 154 · Diagonal depth in 3D",
    title: "Adding tW1 moves simultaneously along every column",
    description:
      "Here W1=(3,6,6). If c=Wλ and λ≥t1, then c=tW1+W(λ−t1). Thus every admissible deep point is a translate of the cone by the lattice vector tW1.",
    formula: "c=tW1+W(λ−t1),   λ−t1≥0",
    insight: "This decomposition is exactly what Theorem 155 exploits by setting b′=tW1.",
    scene: scene3D({
      bounds: { x: [-0.5,7], y: [-0.5,8], z: [-0.5,8] },
      axisLabels: { x: "c₁", y: "c₂", z: "c₃" },
      camera: { yaw: -0.82, pitch: 0.48, distance: 7.0 },
      markers: [marker3D("bp", [3,6,6], "W1 (scaled picture)", "integer", 0.09), marker3D("c", [5,7,7], "deep c", "optimum", 0.1)],
      segments: [segment3D("diag", [0,0,0], [3,6,6], "tW1 direction", C.violet), segment3D("res", [3,6,6], [5,7,7], "remaining cone vector", C.orange)],
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Translate by the diagonal vector", secondary: "Coordinates are visually scaled; the algebraic decomposition is exact." },
    }),
  },
  {
    id: "def154-3d-threshold",
    kicker: "Definition 154 · Threshold",
    title: "Beyond t*, every deep lattice point has a nonnegative integral coefficient vector",
    description:
      "The conclusion c∈intcone(W) means there exists μ∈ℤ₊ⁿ with Wμ=c. Definition 154 asks for one uniform depth t* that works for every lattice point with a sufficiently deep real representation.",
    formula: "λ≥t*1 and c=Wλ∈Wℤⁿ ⇒ ∃μ∈ℤ₊ⁿ:Wμ=c",
    insight: "Theorem 155 supplies an explicit universal upper bound for this threshold in terms of m and Δ.",
    scene: scene3D({
      bounds: { x: [-0.5,7], y: [-0.5,8], z: [-0.5,8] },
      axisLabels: { x: "c₁", y: "c₂", z: "c₃" },
      camera: { yaw: -0.82, pitch: 0.48, distance: 7.0 },
      markers: [marker3D("deep", [5,7,7], "deep lattice point", "optimum", 0.11)],
      segments: W3.map((w,i) => segment3D(`r-${i}`, [0,0,0], w, `w${i+1}`, i===3 ? C.orange : C.aqua)),
      showGround: true,
      showIntegerLattice: true,
      integerAxes: ["x","y","z"],
      caption: { primary: "Diagonal Frobenius guarantee", secondary: "Deep real representability + lattice membership eventually forces integer representability." },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "def154-2d", title: "2D · cone, lattice, integer cone", stages: stages2D },
  { id: "def154-3d", title: "3D · genuine pointed cone", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "definition-154-diagonal-frobenius",
  title: "Definition 154 — Diagonal Frobenius Number",
  shortTitle: "Diagonal Frobenius · Def 154",
  chapter: "Standard-form proximity",
  order: 5,
  description:
    "Introduces the high-dimensional Frobenius notion by separating the real cone, the lattice Wℤⁿ and the integer cone Wℤ₊ⁿ, then visualizing the diagonal depth condition λ≥t1 in both two and three dimensions.",
  difficulty: "Foundation",
  duration: 9,
  accent: C.aqua,
  visualLabel: "Cone/lattice geometry",
  insightLabel: "Definition",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
};

export default visualization;
