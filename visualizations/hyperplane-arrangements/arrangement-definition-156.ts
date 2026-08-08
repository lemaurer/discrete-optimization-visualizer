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

function polygon(points: Point2D[], label: string): Primitive {
  return { kind: "polygon", points, label, style: "component" };
}

function arrangementScene2D(
  primitives: Primitive[],
  secondary: string,
  viewport = { x: [-3.2, 3.2] as [number, number], y: [-2.8, 3.5] as [number, number] },
) {
  return scene2D([], primitives, {
    viewport,
    showFeasibleRegion: false,
    showConstraints: false,
    showVertices: false,
    showLattice: false,
    caption: {
      primary: "Chapter 26 · hyperplane arrangement",
      secondary,
    },
  });
}

const generalLines2D: Primitive[] = [
  line2D([-3.1, 0], [3.1, 0], "H₁: x₂=0", COLORS.orange),
  line2D([0, -2.7], [0, 3.4], "H₂: x₁=0", COLORS.aqua),
  line2D([-3.1, -2.1], [2.3, 3.3], "H₃: x₂=x₁+1", COLORS.violet),
  line2D([-0.2, 3.4], [2.9, -2.8], "H₄: x₂=−2x₁+3", COLORS.rose),
];

const stages2D: VisualizationStage[] = [
  {
    id: "arrangement-2d-definition",
    kicker: "Chapter 26.1 · Hyperplane arrangements",
    title: "Hyperplanes partition space into relatively open convex faces",
    description:
      "An arrangement of a finite set H of hyperplanes partitions ℝᵈ into relatively open convex faces. In dimension two, the hyperplanes are lines: intersection points are 0-faces, open line pieces are 1-faces, and the open two-dimensional regions are the cells.",
    formula: "H={x:aᵢᵀx=bᵢ};  faces have dimensions 0,…,d; d-faces are cells",
    insight:
      "A cell is not a closed polygon. Its boundary belongs to lower-dimensional faces of the same arrangement.",
    scene: arrangementScene2D(
      [
        line2D([-3, 0], [3, 0], "H₁", COLORS.orange),
        line2D([-2.4, -2.4], [2.4, 2.4], "H₂", COLORS.aqua),
        line2D([-2.4, 2.8], [2.5, -2.1], "H₃", COLORS.violet),
        point2D([0, 0], "0-face / vertex", "optimum"),
        label2D([1.9, 0.25], "1-face / edge", "muted"),
        polygon([[0, 0], [1.2, 1.2], [1.4, 1.0]], "one 2D cell"),
      ],
      "In ℝ²: vertices, open edges, and open cells are all faces of the arrangement.",
    ),
  },
  {
    id: "arrangement-2d-sign-pattern",
    kicker: "Chapter 26.1 · Cells as sign patterns",
    title: "Every cell fixes one strict side of every hyperplane",
    description:
      "The notes describe a cell by a partition N₁∪N₂={1,…,n}: for each hyperplane, every point of the cell lies strictly on one selected side. A formal sign pattern need not produce a nonempty cell.",
    formula: "aᵢᵀx<bᵢ (i∈N₁),   aᵢᵀx>bᵢ (i∈N₂)",
    insight:
      "There are 2ⁿ possible strict sign patterns, but geometry makes many of them empty. Theorem 157 counts the nonempty cells in general position.",
    scene: arrangementScene2D(
      [
        line2D([-3, 0], [3, 0], "H₁", COLORS.orange),
        line2D([-2.4, -2.4], [2.4, 2.4], "H₂", COLORS.aqua),
        line2D([-2.4, 2.8], [2.5, -2.1], "H₃", COLORS.violet),
        polygon([[0.05, 0.05], [1.12, 1.12], [1.38, 1.02]], "fixed sign pattern"),
        label2D([1.2, 1.45], "same side of every Hᵢ", "accent"),
      ],
      "Crossing any hyperplane changes at least one sign and therefore moves to another cell.",
    ),
  },
  {
    id: "arrangement-2d-general-position",
    kicker: "Definition 156 · General position",
    title: "In ℝ², every pair intersects and no three lines meet at one point",
    description:
      "Definition 156 requires the intersection of every k hyperplanes to have dimension d−k for k≤min{d+1,n}. In the plane this means: no two lines are parallel, and no three lines share a common point.",
    formula: "dim(H_{i₁}∩⋯∩H_{i_k})=d−k",
    insight:
      "General position eliminates degeneracies. It is exactly the hypothesis under which the clean cell-count formula of Theorem 157 is attained.",
    scene: arrangementScene2D(
      [
        ...generalLines2D,
        point2D([0, 0], "H₁∩H₂", "integer"),
        point2D([-1, 0], "H₁∩H₃", "integer"),
        point2D([1.5, 0], "H₁∩H₄", "integer"),
        point2D([2 / 3, 5 / 3], "H₃∩H₄", "optimum"),
      ],
      "Four lines in general position: every pair has its own intersection point.",
    ),
  },
  {
    id: "arrangement-2d-degenerate",
    kicker: "Definition 156 · What can fail",
    title: "Parallelism or a triple intersection destroys general position",
    description:
      "The definition is stronger than merely asking for distinct hyperplanes. Parallel lines have empty intersection instead of a 0-dimensional one; three concurrent lines have a common point although d−3 would be negative in dimension two.",
    formula: "general position excludes parallel pairs and triple concurrence in ℝ²",
    insight:
      "Degenerate arrangements can have strictly fewer cells than the maximum counted by Theorem 157.",
    scene: arrangementScene2D(
      [
        line2D([-3, -1], [3, -1], "parallel H₁", COLORS.orange),
        line2D([-3, 1], [3, 1], "parallel H₂", COLORS.aqua),
        line2D([-2.6, -2.6], [2.6, 2.6], "H₃", COLORS.violet),
        line2D([-2.6, 2.6], [2.6, -2.6], "H₄", COLORS.rose),
        label2D([-2.3, 1.35], "not in general position", "accent"),
      ],
      "This arrangement is valid, but it does not satisfy Definition 156.",
    ),
  },
];

const p1: Point3D[] = [[0, -2, -2], [0, 2, -2], [0, 2, 2], [0, -2, 2]];
const p2: Point3D[] = [[-2, 0, -2], [2, 0, -2], [2, 0, 2], [-2, 0, 2]];
const p3: Point3D[] = [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]];
const p4: Point3D[] = [[-1.5, -1.5, 4], [2.5, -1.5, 0], [2.5, 2.5, -4], [-1.5, 2.5, 0]];

const stages3D: VisualizationStage[] = [
  {
    id: "arrangement-3d-definition",
    kicker: "Chapter 26.1 · 3D arrangement",
    title: "In ℝ³ the same hierarchy becomes vertices, edges, faces, and cells",
    description:
      "Hyperplanes are planes. Their pairwise intersections are typically lines, triple intersections are points, and the open 3D regions between the planes are the cells of the arrangement.",
    formula: "0-faces=vertices, 1-faces=edges, 3-faces=cells",
    insight:
      "The arrangement is a decomposition of all of ℝ³, not just of a bounded polyhedron.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [
        plane3D("p1", p1, "H₁: x₁=0", COLORS.orange, 0.12),
        plane3D("p2", p2, "H₂: x₂=0", COLORS.aqua, 0.12),
        plane3D("p3", p3, "H₃: x₃=0", COLORS.violet, 0.12),
      ],
      segments: [
        segment3D("e12", [0, 0, -2], [0, 0, 2], "H₁∩H₂", COLORS.rose),
        segment3D("e13", [0, -2, 0], [0, 2, 0], "H₁∩H₃", COLORS.rose),
        segment3D("e23", [-2, 0, 0], [2, 0, 0], "H₂∩H₃", COLORS.rose),
      ],
      markers: [marker3D("origin", [0, 0, 0], "triple intersection", "optimum", 0.1)],
      caption: {
        primary: "Three coordinate planes",
        secondary: "Pairwise intersection lines meet at one 0-dimensional face.",
      },
    }),
  },
  {
    id: "arrangement-3d-general-position",
    kicker: "Definition 156 · General position in ℝ³",
    title: "Every three planes meet in a point, but no four share one point",
    description:
      "For n>d, the notes give the equivalent formulation: every d hyperplanes intersect in a point and no d+1 hyperplanes have a common point. The four displayed planes satisfy this condition.",
    formula: "d=3: every triple intersects in one point; no quadruple intersection",
    insight:
      "The fourth plane x₁+x₂+x₃=1 misses the origin, so the four planes do not all meet; every triple still has a unique point.",
    scene: scene3D({
      bounds: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.72, pitch: 0.55, distance: 6.6 },
      planes: [
        plane3D("gp1", p1, "x₁=0", COLORS.orange, 0.09),
        plane3D("gp2", p2, "x₂=0", COLORS.aqua, 0.09),
        plane3D("gp3", p3, "x₃=0", COLORS.violet, 0.09),
        plane3D("gp4", p4, "x₁+x₂+x₃=1", COLORS.rose, 0.15),
      ],
      markers: [
        marker3D("v123", [0, 0, 0], "H₁H₂H₃", "integer", 0.075),
        marker3D("v124", [0, 0, 1], "H₁H₂H₄", "optimum", 0.075),
        marker3D("v134", [0, 1, 0], "H₁H₃H₄", "optimum", 0.075),
        marker3D("v234", [1, 0, 0], "H₂H₃H₄", "optimum", 0.075),
      ],
      caption: {
        primary: "Four planes in general position",
        secondary: "The four triple-intersection vertices are all different.",
      },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "arrangement-definition-2d",
    title: "2D · lines, faces, and general position",
    description:
      "The definitions from Section 26.1 shown directly in the plane: cells as sign patterns and Definition 156 as a nondegeneracy condition.",
    stages: stages2D,
  },
  {
    id: "arrangement-definition-3d",
    title: "3D · planes, edges, and general position",
    description:
      "A proof-parallel geometric translation of the same definitions into ℝ³ using four planes in general position.",
    stages: stages3D,
  },
];

const visualization: VisualizationDefinition = {
  id: "hyperplane-arrangement-definition-156",
  title: "Hyperplane Arrangements and General Position",
  shortTitle: "Arrangements · Def. 156",
  chapter: "Hyperplane arrangements",
  order: 1,
  description:
    "Section 26.1 visualized: how hyperplanes partition space into relatively open faces and cells, how cells correspond to strict sign patterns, and what general position means in dimensions two and three.",
  difficulty: "Intermediate",
  duration: 18,
  accent: COLORS.violet,
  controls: { constraints: false, grid: true, lattice: false, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Definition 156 in one sentence",
    steps: [
      "For every k≤min{d+1,n}, intersect any k chosen hyperplanes.",
      "General position requires that intersection to have dimension exactly d−k.",
      "Thus in ℝ² there are no parallel pairs and no triple concurrence; in ℝ³ every triple meets in a point and no four meet together.",
    ],
  },
};

export default visualization;
