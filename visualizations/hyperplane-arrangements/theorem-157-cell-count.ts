import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS as COLORS,
  label2D,
  line2D,
  marker3D,
  plane3D,
  point2D,
  scene2D,
  scene3D,
  segment3D,
} from "@/visualizations/helpers/tdi-scenes";

function scene2(
  primitives: Primitive[],
  secondary: string,
  viewport = { x: [-3.2, 3.2] as [number, number], y: [-2.8, 3.5] as [number, number] },
) {
  return scene2D([], primitives, {
    viewport,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: false,
    caption: {
      primary: "Theorem 157 · counting cells",
      secondary,
    },
  });
}

const l1: Primitive = line2D([-3.1, 0], [3.1, 0], "H₁", COLORS.orange);
const l2: Primitive = line2D([0, -2.7], [0, 3.4], "H₂", COLORS.aqua);
const l3: Primitive = line2D([-3.1, -2.1], [2.3, 3.3], "H₃", COLORS.violet);
const l4: Primitive = line2D([-0.2, 3.4], [2.9, -2.8], "new H₄", COLORS.rose);

const stages2D: VisualizationStage[] = [
  {
    id: "thm157-2d-statement",
    kicker: "Chapter 26.1 · Theorem 157",
    title: "n hyperplanes in general position create a binomial number of cells",
    description:
      "For an arrangement of n hyperplanes in general position in ℝᵈ, the number φ_d(n) of d-dimensional cells is the sum of the first d+1 binomial coefficients of row n.",
    formula: "φ_d(n)=C(n,0)+C(n,1)+⋯+C(n,d)",
    insight:
      "In the plane, four lines in general position create 1+4+6=11 cells—not all 2⁴ possible sign patterns are geometrically realizable.",
    scene: scene2(
      [l1, l2, l3, l4, label2D([-2.7, 3.0], "φ₂(4)=11 cells", "accent")],
      "Running instance: d=2, n=4, so φ₂(4)=11.",
    ),
  },
  {
    id: "thm157-2d-base-d1",
    kicker: "Proof · Base case d=1",
    title: "On a line, n hyperplanes are just n points and create n+1 cells",
    description:
      "The proof starts in dimension one. A hyperplane in ℝ is a point. n distinct points split the line into n+1 open intervals, agreeing with C(n,0)+C(n,1)=1+n.",
    formula: "φ₁(n)=n+1=C(n,0)+C(n,1)",
    insight:
      "This is the lower-dimensional counting fact that will reappear on every newly inserted hyperplane.",
    scene: scene2(
      [
        line2D([-3, 0], [3, 0], "ℝ", COLORS.muted),
        point2D([-2, 0], "H₁", "optimum"),
        point2D([-0.7, 0], "H₂", "optimum"),
        point2D([0.8, 0], "H₃", "optimum"),
        point2D([2.1, 0], "H₄", "optimum"),
        label2D([-2.65, 0.55], "5 open intervals", "accent"),
      ],
      "Four points on ℝ create φ₁(4)=5 cells.",
      { x: [-3.2, 3.2], y: [-1.2, 1.5] },
    ),
  },
  {
    id: "thm157-2d-base-n0",
    kicker: "Proof · Base case n=0",
    title: "With no hyperplanes, all of ℝᵈ is one cell",
    description:
      "The second base case is n=0. There is no cut at all, so the whole ambient space is a single d-dimensional cell.",
    formula: "φ_d(0)=1=C(0,0)",
    insight:
      "The two base cases make induction possible simultaneously in dimension and in the number of hyperplanes.",
    scene: scene2(
      [label2D([-1.1, 0.5], "one cell = all of ℝ²", "accent")],
      "No lines means one unpartitioned cell.",
    ),
  },
  {
    id: "thm157-2d-old-arrangement",
    kicker: "Proof · Inductive step before insertion",
    title: "Assume the first n−1 hyperplanes already form their arrangement",
    description:
      "For the concrete d=2,n=4 instance, start with H₁,H₂,H₃. By the inductive hypothesis they create φ₂(3)=1+3+3=7 cells.",
    formula: "φ₂(3)=7",
    insight:
      "The proof does not recount these seven cells directly. It asks only how many new cells appear when H₄ is inserted.",
    scene: scene2(
      [l1, l2, l3, label2D([-2.7, 3.0], "old arrangement: 7 cells", "accent")],
      "First n−1=3 lines: φ₂(3)=7.",
    ),
  },
  {
    id: "thm157-2d-new-line-cut",
    kicker: "Proof · Restrict the old arrangement to Hₙ",
    title: "The old hyperplanes cut the new line into a lower-dimensional arrangement",
    description:
      "Because of general position, H₄ meets each of the three old lines in a distinct point. Those three points divide H₄ into four 1-dimensional cells. In general the number is φ_{d−1}(n−1).",
    formula: "# cells induced on Hₙ = φ_{d−1}(n−1)",
    insight:
      "This is the key geometric recursion: the new hyperplane inherits an arrangement one dimension lower.",
    scene: scene2(
      [
        l1,
        l2,
        l3,
        l4,
        point2D([1.5, 0], "H₁∩H₄", "optimum"),
        point2D([0, 3], "H₂∩H₄", "optimum"),
        point2D([2 / 3, 5 / 3], "H₃∩H₄", "optimum"),
        label2D([2.25, 2.55], "3 points ⇒ 4 pieces on H₄", "accent"),
      ],
      "The inserted line is divided into φ₁(3)=4 pieces.",
    ),
  },
  {
    id: "thm157-2d-each-piece-splits",
    kicker: "Proof · Every induced cell creates one new ambient cell",
    title: "Each open piece of H₄ cuts exactly one old 2D cell into two",
    description:
      "Every lower-dimensional cell on the inserted hyperplane lies inside one old ambient cell. Inserting the hyperplane partitions that old cell into two, increasing the total number by exactly one for each such piece.",
    formula: "φ_d(n)=φ_d(n−1)+φ_{d−1}(n−1)",
    insight:
      "For the example: 7 old cells + 4 pieces of H₄ = 11 final cells.",
    scene: scene2(
      [
        l1,
        l2,
        l3,
        l4,
        label2D([-2.75, 3.05], "7 + 4 = 11", "accent"),
        label2D([1.75, 2.55], "each H₄ piece splits one old cell", "muted"),
      ],
      "The geometry gives the recursion φ₂(4)=φ₂(3)+φ₁(3)=7+4.",
    ),
  },
  {
    id: "thm157-2d-pascal",
    kicker: "Proof · Solve the recursion",
    title: "Pascal's identity turns the recursion into the binomial sum",
    description:
      "Substitute the inductive formulas for φ_{d−1}(n−1) and φ_d(n−1). Pair neighboring binomial coefficients using Pascal's identity C(n−1,i)+C(n−1,i−1)=C(n,i).",
    formula: "Σ_{i=0}^{d−1}C(n−1,i)+Σ_{i=0}^{d}C(n−1,i)=Σ_{i=0}^{d}C(n,i)",
    insight:
      "The binomial formula is therefore not a separate combinatorial trick: it is exactly the closed form of the geometric insertion recursion.",
    scene: scene2(
      [
        label2D([-2.7, 2.5], "φ_d(n−1)", "muted"),
        label2D([-0.4, 2.5], "+", "default"),
        label2D([0.1, 2.5], "φ_{d−1}(n−1)", "muted"),
        label2D([-1.55, 1.4], "↓ Pascal identity", "accent"),
        label2D([-2.0, 0.4], "C(n,0)+⋯+C(n,d)", "accent"),
      ],
      "The recursion closes to the claimed formula.",
      { x: [-3.0, 3.0], y: [-0.8, 3.2] },
    ),
  },
];

const coordinatePlaneX: Point3D[] = [[0, -2, -2], [0, 2, -2], [0, 2, 2], [0, -2, 2]];
const coordinatePlaneY: Point3D[] = [[-2, 0, -2], [2, 0, -2], [2, 0, 2], [-2, 0, 2]];
const coordinatePlaneZ: Point3D[] = [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]];
const insertedPlane: Point3D[] = [[-1.5, -1.5, 4], [2.5, -1.5, 0], [2.5, 2.5, -4], [-1.5, 2.5, 0]];

function oldPlanes3D() {
  return [
    plane3D("h1", coordinatePlaneX, "H₁: x₁=0", COLORS.orange, 0.09),
    plane3D("h2", coordinatePlaneY, "H₂: x₂=0", COLORS.aqua, 0.09),
    plane3D("h3", coordinatePlaneZ, "H₃: x₃=0", COLORS.violet, 0.09),
  ];
}

const stages3D: VisualizationStage[] = [
  {
    id: "thm157-3d-statement",
    kicker: "Theorem 157 · 3D instance",
    title: "Four planes in general position create fifteen 3D cells",
    description:
      "For d=3 and n=4, Theorem 157 gives φ₃(4)=C(4,0)+C(4,1)+C(4,2)+C(4,3)=1+4+6+4=15.",
    formula: "φ₃(4)=15",
    insight:
      "The 3D example follows exactly the same insertion proof as the 2D one; only the induced arrangement on the new hyperplane is now two-dimensional.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [...oldPlanes3D(), plane3D("h4", insertedPlane, "H₄: x₁+x₂+x₃=1", COLORS.rose, 0.15)],
      caption: { primary: "d=3, n=4", secondary: "The theorem predicts 15 open 3D cells." },
    }),
  },
  {
    id: "thm157-3d-old",
    kicker: "Proof · Start with n−1 planes",
    title: "Three planes in general position create eight cells",
    description:
      "The coordinate planes x₁=0,x₂=0,x₃=0 are in general position as a three-plane arrangement in ℝ³. They create φ₃(3)=1+3+3+1=8 octant-like cells.",
    formula: "φ₃(3)=8",
    insight:
      "This is the ambient count before inserting H₄.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: oldPlanes3D(),
      markers: [marker3D("origin", [0, 0, 0], "common vertex of first 3", "optimum", 0.08)],
      caption: { primary: "Old arrangement", secondary: "φ₃(3)=8 cells." },
    }),
  },
  {
    id: "thm157-3d-restrict",
    kicker: "Proof · Restrict the old planes to H₄",
    title: "The three old planes cut H₄ into three lines in general position",
    description:
      "Intersect H₄:x₁+x₂+x₃=1 with each old coordinate plane. On H₄ these are three lines; no two are parallel and no three meet at one point. By the lower-dimensional theorem they create φ₂(3)=7 cells on H₄.",
    formula: "# cells on H₄ = φ₂(3)=1+3+3=7",
    insight:
      "This is the 3D version of the three intersection points cutting a new line into four pieces in the planar proof.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [plane3D("inserted", insertedPlane, "H₄", COLORS.rose, 0.22)],
      segments: [
        segment3D("ix", [0, -1, 2], [0, 2, -1], "H₁∩H₄", COLORS.orange),
        segment3D("iy", [-1, 0, 2], [2, 0, -1], "H₂∩H₄", COLORS.aqua),
        segment3D("iz", [-1, 2, 0], [2, -1, 0], "H₃∩H₄", COLORS.violet),
      ],
      markers: [
        marker3D("v12", [0, 0, 1], "", "integer", 0.06),
        marker3D("v13", [0, 1, 0], "", "integer", 0.06),
        marker3D("v23", [1, 0, 0], "", "integer", 0.06),
      ],
      caption: {
        primary: "Induced arrangement on H₄",
        secondary: "Three lines divide the plane H₄ into φ₂(3)=7 regions.",
      },
    }),
  },
  {
    id: "thm157-3d-split",
    kicker: "Proof · Lift the induced cells back to ℝ³",
    title: "Each of the seven regions on H₄ splits one old 3D cell",
    description:
      "Every 2D cell of the induced arrangement sits inside one of the eight old 3D cells. Adding H₄ cuts that old cell into two, so exactly seven new ambient cells are created.",
    formula: "φ₃(4)=φ₃(3)+φ₂(3)=8+7=15",
    insight:
      "This is precisely the general recursion φ_d(n)=φ_d(n−1)+φ_{d−1}(n−1).",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [...oldPlanes3D(), plane3D("h4-final", insertedPlane, "new H₄", COLORS.rose, 0.16)],
      caption: { primary: "8 old + 7 new = 15", secondary: "The same recurrence works in every dimension." },
    }),
  },
  {
    id: "thm157-3d-pascal",
    kicker: "Proof · Closed form",
    title: "Pascal's identity solves the recurrence in every dimension",
    description:
      "Substituting the inductive binomial sums into the recursion and applying Pascal's identity yields the formula in Theorem 157. Nothing in this final algebra depends on d=2 or d=3.",
    formula: "φ_d(n)=Σ_{i=0}^d C(n,i)",
    insight:
      "The 3D geometry establishes the same recursion; the binomial identity finishes the general proof.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [...oldPlanes3D(), plane3D("h4-pascal", insertedPlane, "H₄", COLORS.rose, 0.13)],
      caption: { primary: "Theorem 157 proved", secondary: "φ₃(4)=1+4+6+4=15 is one concrete instance." },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "theorem-157-2d",
    title: "2D · full insertion proof",
    description:
      "The proof of Theorem 157 made concrete with four lines: base cases, insertion of H₄, the lower-dimensional arrangement, the recursion, and Pascal's identity.",
    stages: stages2D,
  },
  {
    id: "theorem-157-3d",
    title: "3D · four-plane insertion proof",
    description:
      "The exact same proof in ℝ³: three old planes create 8 cells; their intersections with the fourth plane create 7 regions; the fourth plane therefore raises the count to 15.",
    stages: stages3D,
  },
];

const visualization: VisualizationDefinition = {
  id: "hyperplane-arrangement-theorem-157",
  title: "Theorem 157 — Number of Cells in General Position",
  shortTitle: "Cell count · Thm 157",
  chapter: "Hyperplane arrangements",
  order: 2,
  description:
    "A proof-faithful visualization of Theorem 157: insert one hyperplane, observe the lower-dimensional arrangement induced on it, derive the recursion φ_d(n)=φ_d(n−1)+φ_{d−1}(n−1), and close the induction with Pascal's identity.",
  difficulty: "Advanced",
  duration: 24,
  accent: COLORS.rose,
  controls: { constraints: false, grid: true, lattice: false, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 157 · proof from the notes",
    steps: [
      "Base d=1: n points on a line create n+1 cells, which equals C(n,0)+C(n,1).",
      "Base n=0: ℝᵈ with no hyperplanes is one cell.",
      "Assume the formula for smaller dimension / fewer hyperplanes and start with n−1 hyperplanes in ℝᵈ.",
      "Insert Hₙ. General position makes the previous n−1 hyperplanes induce an arrangement in Hₙ≅ℝ^{d−1} with φ_{d−1}(n−1) cells.",
      "Each induced cell lies inside one old d-cell and splits it into two, so the ambient cell count increases by exactly φ_{d−1}(n−1).",
      "Therefore φ_d(n)=φ_d(n−1)+φ_{d−1}(n−1).",
      "Substitute the two inductive binomial sums and apply Pascal's identity to obtain φ_d(n)=Σ_{i=0}^d C(n,i).",
    ],
  },
};

export default visualization;
