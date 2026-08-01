import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

interface ConeSplitExampleData {
  id: string;
  title: string;
  description: string;
  viewport: Scene["viewport"];
  constraints: Scene["constraints"];
  splitPi: Point2D;
  splitPi0: number;
  apex: Point2D;
  leftIntersection: Point2D;
  rightIntersection: Point2D;
  finalConstraints: Scene["constraints"];
  finalCutLabel: string;
  finalCutLine: [Point2D, Point2D];
  raySegments: Array<{
    to: Point2D;
    label: string;
    color: string;
  }>;
  integerPoints: Point2D[];
  splitCoordinateLabel: string;
}

function baseScene(
  data: ConeSplitExampleData,
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: data.viewport,
    constraints: data.constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "A translated rational cone",
      secondary: `the apex lies strictly inside ${data.splitPi0}<${data.splitCoordinateLabel}<${data.splitPi0 + 1}`,
    },
    ...overrides,
  };
}

function coneRays(data: ConeSplitExampleData): Primitive[] {
  return data.raySegments.map((ray) => ({
    kind: "vector",
    from: data.apex,
    to: ray.to,
    label: ray.label,
    color: ray.color,
    animate: true,
  }));
}

function buildStages(data: ConeSplitExampleData): VisualizationStage[] {
  const splitFormula = `${data.splitCoordinateLabel}≤${data.splitPi0}  ∨  ${data.splitCoordinateLabel}≥${data.splitPi0 + 1}`;
  return [
    {
      id: `${data.id}-translated-cone`,
      kicker: "Cone split · Setup",
      title: "Start with a translated cone whose apex is fractional",
      description:
        "The feasible set is an affine translate of a pointed cone. Its two extreme rays continue indefinitely, but the apex itself lies in the open split strip.",
      formula: "Q=x̄+cone(r¹,r²)",
      insight:
        "A homogeneous cone based at the origin is often unchanged by scaling. The interesting split geometry appears after translating the cone to a fractional apex x̄.",
      scene: baseScene(data, {
        primitives: [
          ...coneRays(data),
          {
            kind: "point",
            at: data.apex,
            label: "fractional apex x̄",
            style: "fractional",
          },
        ],
      }),
    },
    {
      id: `${data.id}-split-strip`,
      kicker: "Cone split · Disjunction",
      title: "Place two consecutive lattice hyperplanes around the apex",
      description:
        "The split keeps the two closed halfspaces and forbids only the open slab between them. Every integral point has an integral split coordinate and therefore belongs to one of the two closed sides.",
      formula: splitFormula,
      insight:
        "The split is lattice-free in its interior: no point with integral split coordinates can lie strictly between two consecutive integers.",
      scene: baseScene(data, {
        showVertices: false,
        primitives: [
          ...coneRays(data),
          {
            kind: "point",
            at: data.apex,
            label: "apex in the forbidden slab",
            style: "fractional",
          },
        ],
        splitProjection: {
          pi: data.splitPi,
          pi0: data.splitPi0,
          phase: "lift-strip",
          color: "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `${data.id}-branch-intersections`,
      kicker: "Cone split · Boundary points",
      title: "Each extreme ray first meets one boundary of the split",
      description:
        "Trace the cone rays away from the apex. Their first surviving points occur where the rays hit the two split hyperplanes. Everything on the short ray pieces between those points and the apex is removed.",
      formula: "p⁻∈Q∩{πᵀx=π₀},   p⁺∈Q∩{πᵀx=π₀+1}",
      insight:
        "The two intersection points are the geometric data needed for the new split cut.",
      scene: baseScene(data, {
        primitives: [
          ...coneRays(data),
          {
            kind: "point",
            at: data.leftIntersection,
            label: "p⁻ on the left boundary",
            style: "integer",
            animateFrom: data.apex,
          },
          {
            kind: "point",
            at: data.rightIntersection,
            label: "p⁺ on the right boundary",
            style: "integer",
            animateFrom: data.apex,
          },
          {
            kind: "line",
            from: data.leftIntersection,
            to: data.rightIntersection,
            label: "future convexification edge",
            style: "cut",
            color: "#f49a4a",
            animate: true,
          },
        ],
        splitProjection: {
          pi: data.splitPi,
          pi0: data.splitPi0,
          phase: "remove-strip",
          color: "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `${data.id}-two-branches`,
      kicker: "Cone split · Surviving union",
      title: "Keep the left and right branches, but not their missing middle",
      description:
        "The split operation first forms a nonconvex union: the portion of the cone on the left side together with the portion on the right side.",
      formula: "Q₁=Q∩{πᵀx≤π₀},   Q₂=Q∩{πᵀx≥π₀+1}",
      insight:
        "At this stage the apex is gone, yet the two surviving pieces are not a polyhedron described by one convex feasible region.",
      scene: baseScene(data, {
        showFeasibleRegion: false,
        showConstraints: false,
        primitives: [
          ...coneRays(data),
          {
            kind: "point",
            at: data.leftIntersection,
            label: "left branch starts here",
            style: "integer",
          },
          {
            kind: "point",
            at: data.rightIntersection,
            label: "right branch starts here",
            style: "integer",
          },
          {
            kind: "point",
            at: data.apex,
            label: "removed apex",
            style: "fractional",
          },
        ],
        splitProjection: {
          pi: data.splitPi,
          pi0: data.splitPi0,
          phase: "remove-strip",
          color: "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `${data.id}-convexify`,
      kicker: "Cone split · Convex hull",
      title: "Convexification fills exactly the segment between the branches",
      description:
        "Taking the convex hull joins the two first surviving boundary points. The joining segment becomes a new facet and cuts away the fractional apex.",
      formula: "Q⁽π,π₀⁾=conv(Q₁∪Q₂)",
      insight:
        "The split hull is not obtained by deleting the entire open slab. Convexification may refill part of that slab above the new facet.",
      scene: {
        ...baseScene(data),
        constraints: data.finalConstraints,
        primitives: [
          {
            kind: "line",
            from: data.finalCutLine[0],
            to: data.finalCutLine[1],
            label: data.finalCutLabel,
            style: "cut",
            color: "#f49a4a",
            animate: true,
          },
          {
            kind: "point",
            at: data.leftIntersection,
            label: "p⁻",
            style: "integer",
          },
          {
            kind: "point",
            at: data.rightIntersection,
            label: "p⁺",
            style: "integer",
          },
          {
            kind: "point",
            at: data.apex,
            label: "cut-off apex",
            style: "fractional",
          },
        ],
        caption: {
          primary: "The cone split hull",
          secondary: `new facet: ${data.finalCutLabel}`,
        },
      },
    },
    {
      id: `${data.id}-integer-preservation`,
      kicker: "Cone split · Integer points",
      title: "Every integral point of the cone survives the split hull",
      description:
        "For an integral point z and integral π, the number πᵀz is integral. It cannot lie strictly between π₀ and π₀+1, so z is already in one of the two branches before convexification.",
      formula: "z∈Q∩ℤⁿ ⇒ πᵀz∈ℤ ⇒ z∈Q₁∪Q₂⊆Q⁽π,π₀⁾",
      insight:
        "Cone splits remove fractional geometry around the apex while preserving all feasible lattice points.",
      scene: {
        ...baseScene(data),
        constraints: data.finalConstraints,
        primitives: [
          {
            kind: "line",
            from: data.finalCutLine[0],
            to: data.finalCutLine[1],
            label: data.finalCutLabel,
            style: "cut",
            color: "#f49a4a",
          },
          ...data.integerPoints.map<Primitive>((point, index) => ({
            kind: "point",
            at: point,
            label: index === 0 ? "surviving lattice points" : undefined,
            style: "integer",
          })),
        ],
      },
    },
  ];
}

const symmetricData: ConeSplitExampleData = {
  id: "symmetric-vertical",
  title: "Symmetric translated cone",
  description:
    "A vertical split cuts the fractional apex of a V-shaped translated cone and creates a horizontal split facet.",
  viewport: { x: [-2.1, 3.1], y: [-0.6, 4.1] },
  constraints: [
    { id: "right-ray", a: 1, b: -1, limit: 0.5, label: "x₁−x₂≤1/2", color: "#8f88dc" },
    { id: "left-ray", a: -1, b: -1, limit: -0.5, label: "−x₁−x₂≤−1/2", color: "#79c9c0" },
  ],
  splitPi: [1, 0],
  splitPi0: 0,
  apex: [0.5, 0],
  leftIntersection: [0, 0.5],
  rightIntersection: [1, 0.5],
  finalConstraints: [
    { id: "right-ray", a: 1, b: -1, limit: 0.5, label: "x₁−x₂≤1/2", color: "#8f88dc" },
    { id: "left-ray", a: -1, b: -1, limit: -0.5, label: "−x₁−x₂≤−1/2", color: "#79c9c0" },
    { id: "split-facet", a: 0, b: -1, limit: -0.5, label: "x₂≥1/2", color: "#f49a4a" },
  ],
  finalCutLabel: "x₂≥1/2",
  finalCutLine: [[-1.8, 0.5], [2.8, 0.5]],
  raySegments: [
    { to: [-2, 2.5], label: "x̄+λ(−1,1)", color: "#79c9c0" },
    { to: [3, 2.5], label: "x̄+λ(1,1)", color: "#8f88dc" },
  ],
  integerPoints: [[0, 1], [1, 1], [-1, 2], [2, 2], [0, 2], [1, 2]],
  splitCoordinateLabel: "x₁",
};

const obliqueData: ConeSplitExampleData = {
  id: "oblique-split",
  title: "Oblique split on a corner cone",
  description:
    "The same construction with π=(1,1) produces a diagonal lattice strip and an oblique split facet.",
  viewport: { x: [-2.1, 2.1], y: [-1.2, 3.1] },
  constraints: [
    { id: "west", a: 1, b: 0, limit: 0.25, label: "x₁≤1/4", color: "#79c9c0" },
    { id: "north", a: 0, b: -1, limit: -0.25, label: "x₂≥1/4", color: "#8f88dc" },
  ],
  splitPi: [1, 1],
  splitPi0: 0,
  apex: [0.25, 0.25],
  leftIntersection: [-0.25, 0.25],
  rightIntersection: [0.25, 0.75],
  finalConstraints: [
    { id: "west", a: 1, b: 0, limit: 0.25, label: "x₁≤1/4", color: "#79c9c0" },
    { id: "north", a: 0, b: -1, limit: -0.25, label: "x₂≥1/4", color: "#8f88dc" },
    { id: "diagonal-facet", a: 1, b: -1, limit: -0.5, label: "x₂−x₁≥1/2", color: "#f49a4a" },
  ],
  finalCutLabel: "x₂−x₁≥1/2",
  finalCutLine: [[-1.9, -1.4], [1.8, 2.3]],
  raySegments: [
    { to: [-2, 0.25], label: "x̄+λ(−1,0)", color: "#79c9c0" },
    { to: [0.25, 3], label: "x̄+λ(0,1)", color: "#8f88dc" },
  ],
  integerPoints: [[-1, 1], [0, 1], [-2, 2], [-1, 2], [0, 2]],
  splitCoordinateLabel: "x₁+x₂",
};

const symmetricStages = buildStages(symmetricData);
const obliqueStages = buildStages(obliqueData);

const examples: VisualizationExample[] = [
  {
    id: symmetricData.id,
    title: symmetricData.title,
    description: symmetricData.description,
    stages: symmetricStages,
  },
  {
    id: obliqueData.id,
    title: obliqueData.title,
    description: obliqueData.description,
    stages: obliqueStages,
  },
];

const visualization: VisualizationDefinition = {
  id: "cone-split",
  title: "Splitting a Translated Cone",
  shortTitle: "Cone split",
  chapter: "Cutting planes",
  order: 6,
  description:
    "Apply a split disjunction to a translated cone, locate the first surviving points on its extreme rays, and watch convexification turn them into a new split facet.",
  difficulty: "Intermediate",
  duration: 15,
  accent: "#f49a4a",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: symmetricStages,
  examples,
  proof: {
    title: "Why splitting the cone preserves lattice points and cuts the apex",
    steps: [
      "Write the translated cone as Q=x̄+cone(r¹,…,rᵗ) and choose a split whose open slab contains x̄.",
      "Form Q₁=Q∩{πᵀx≤π₀} and Q₂=Q∩{πᵀx≥π₀+1}.",
      "Along each relevant extreme ray, determine the first point that reaches one of the two split hyperplanes.",
      "The fractional ray segment between x̄ and that first surviving point is removed.",
      "Convexifying Q₁∪Q₂ joins the first surviving boundary points and creates a new facet separating x̄ from the split hull.",
      "For every integral z, πᵀz is integral, so z cannot lie in the open slab and therefore survives in Q⁽π,π₀⁾.",
    ],
  },
};

export default visualization;
