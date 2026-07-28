import type { Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  dualRayConfiguration,
  dualSegmentConfiguration,
  scene3D,
} from "./duality-geometry";

function normalScene(primitives: Primitive[], caption: string): Scene {
  return {
    viewport: { x: [-0.6, 2.5], y: [-0.6, 2.5] },
    constraints: [],
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "first normal coordinate", y: "second normal coordinate" },
    primitives,
    caption: {
      primary: "Constraint-normal space",
      secondary: caption,
    },
  };
}

const boundedStages: VisualizationStage[] = [
  {
    id: "dual-polyhedron-normals",
    kicker: "Definition · From rows to a dual point",
    title: "A dual vector chooses a nonnegative combination of row normals",
    description:
      "Take a₁=(1,0), a₂=(0,1), a₃=(1,1), and objective c=(1,1). A dual feasible vector y must reproduce c from these rows with nonnegative coefficients.",
    formula: "Aᵀy=c,   y≥0  ⇔  c=y₁a₁+y₂a₂+y₃a₃",
    insight:
      "The dual variables are weights attached to primal inequalities.",
    scene: normalScene([
      { kind: "vector", from: [0, 0], to: [1, 0], label: "a₁", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [0, 1], label: "a₂", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0, 0], to: [1, 1], label: "a₃", color: "#79c9c0", animate: true },
      { kind: "vector", from: [0, 0], to: [1, 1], label: "objective c", color: "#e27c89", animate: true },
    ], "three primal rows can represent the same objective in several ways"),
  },
  {
    id: "dual-polyhedron-equations",
    kicker: "Definition · Solve Aᵀy=c",
    title: "The equality constraints cut coefficient space down to a line",
    description:
      "The equations are y₁+y₃=1 and y₂+y₃=1. Together with y≥0 they leave exactly one parameter t=y₃ between zero and one.",
    formula: "y=(1−t,1−t,t),   0≤t≤1",
    insight:
      "A dual polyhedron is an ordinary polyhedron in multiplier space: linear equalities plus nonnegativity.",
    scene: scene3D(dualSegmentConfiguration({
      markers: [
        { id: "left", at: [1, 1, 0], label: "t=0", style: "integer" },
        { id: "right", at: [0, 0, 1], label: "t=1", style: "integer" },
      ],
    })),
  },
  {
    id: "dual-polyhedron-segment",
    kicker: "Geometry · The complete dual polyhedron",
    title: "Every point on the segment is one valid representation of c",
    description:
      "At t=0, c=a₁+a₂. At t=1, c=a₃. Intermediate points split the representation between these two explanations.",
    formula: "c=(1−t)a₁+(1−t)a₂+ta₃",
    insight:
      "The dual polyhedron records every nonnegative certificate for the same objective direction.",
    scene: scene3D(dualSegmentConfiguration()),
  },
  {
    id: "dual-polyhedron-rhs",
    kicker: "Geometry · Add the right-hand side",
    title: "The right-hand side turns the dual polyhedron into an optimization problem",
    description:
      "The set D depends only on A and c. Once b is supplied, each dual point receives cost bᵀy. Minimizing this linear function over D gives the dual LP.",
    formula: "D={y≥0:Aᵀy=c},   dual objective=min bᵀy",
    insight:
      "The dual polyhedron is the feasible geometry; the dual LP is that geometry plus the objective b.",
    scene: scene3D(dualSegmentConfiguration({
      segments: [
        { id: "segment", from: [1, 1, 0], to: [0, 0, 1], label: "dual feasible segment", color: "#8f88dc", width: 6, animate: true },
        { id: "cost", from: [0.5, 0.5, 0.5], to: [0.9, 0.9, 1.2], label: "direction of bᵀy", color: "#e27c89", width: 4, animate: true },
      ],
    })),
  },
];

const unboundedStages: VisualizationStage[] = [
  {
    id: "dual-ray-equations",
    kicker: "Second example · Unbounded D",
    title: "A dual polyhedron can also be an unbounded ray",
    description:
      "For rows a₁=(1,0), a₂=(0,1), a₃=(−1,−1) and c=(1,1), the equations become y₁−y₃=1 and y₂−y₃=1.",
    formula: "D={(1+t,1+t,t):t≥0}",
    insight:
      "Nonnegativity no longer caps the free parameter, so the feasible multiplier set extends forever.",
    scene: scene3D(dualRayConfiguration()),
  },
  {
    id: "dual-ray-vertex",
    kicker: "Second example · Extreme point",
    title: "The ray still has a distinguished dual vertex",
    description:
      "The endpoint y=(1,1,0) is the unique vertex of D. Every other feasible multiplier adds t(1,1,1).",
    formula: "y=(1,1,0)+t(1,1,1),   t≥0",
    insight:
      "Dual vertices play the same geometric role as primal vertices: they are candidates for linear optimization.",
    scene: scene3D(dualRayConfiguration({
      markers: [
        { id: "vertex", at: [1, 1, 0], label: "dual vertex", style: "optimum" },
        { id: "far", at: [2.5, 2.5, 1.5], label: "another feasible dual point", style: "fractional" },
      ],
    })),
  },
];

const boundedExample: VisualizationExample = {
  id: "bounded-dual-segment",
  title: "Bounded dual segment — several representations of c",
  description:
    "See the dual polyhedron as all nonnegative row combinations that reproduce the objective vector.",
  stages: boundedStages,
};

const unboundedExample: VisualizationExample = {
  id: "unbounded-dual-ray",
  title: "Unbounded dual ray — a vertex plus a recession direction",
  description:
    "See how the equality system and nonnegativity can produce an unbounded multiplier polyhedron.",
  stages: unboundedStages,
};

const visualization: VisualizationDefinition = {
  id: "dual-polyhedron",
  title: "The Dual Polyhedron",
  shortTitle: "Dual polyhedron",
  chapter: "LP duality and certificates",
  order: 1,
  description:
    "Interpret dual variables as nonnegative weights on primal rows and explore the polyhedron D={y≥0:Aᵀy=c} in multiplier space.",
  difficulty: "Foundation",
  duration: 13,
  accent: "#8f88dc",
  controls: { constraints: false, grid: true, lattice: true, vertices: true, labels: true },
  stages: boundedStages,
  examples: [boundedExample, unboundedExample],
  proof: {
    title: "How to read the dual polyhedron",
    steps: [
      "Each primal inequality contributes one row normal aᵢ and one nonnegative multiplier yᵢ.",
      "The equation Aᵀy=c says that the weighted row normals reproduce the primal objective vector.",
      "The nonnegativity restriction y≥0 allows only conic combinations of the rows.",
      "Thus D is precisely the set of all nonnegative certificates representing c.",
      "Adding the linear objective bᵀy turns D into the dual linear program.",
    ],
  },
};

export default visualization;
