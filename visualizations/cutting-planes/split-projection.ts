import type { Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-0.5, 4.6],
  y: [-0.5, 4.7],
};

const constraints: Scene["constraints"] = [
  {
    id: "bottom",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#7ecbc4",
  },
  {
    id: "left-face",
    a: -8,
    b: 5,
    limit: 0,
    label: "5x₂ ≤ 8x₁",
    color: "#f49a4a",
  },
  {
    id: "right-face",
    a: 8,
    b: 3,
    limit: 32,
    label: "8x₁ + 3x₂ ≤ 32",
    color: "#d4ef77",
  },
];

const pi: [number, number] = [1, 0];
const pi0 = 2;

const scene = (
  overrides: Partial<Scene> = {},
): Scene => ({
  viewport,
  constraints,

  showGrid: true,
  showConstraints: true,
  showFeasibleRegion: true,
  showVertices: true,

  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "split-projection",
  title: "Projecting and Applying a Split",
  shortTitle: "Split projection",
  chapter: "Cutting planes",
  order: 2,

  description:
    "Project the facets and points of a polyhedron onto the split direction, identify the forbidden interval, lift it back to the original space, and form the split polyhedron.",

  difficulty: "Intermediate",
  duration: 10,
  accent: "#7a70df",

  controls: {
    constraints: true,
    vertices: true,
    labels: true,
  },

  stages: [
    {
      id: "original",

      kicker: "01 · Original space",
      title: "Choose the split direction",

      description:
        "The vector π determines the scalar coordinate πᵀx. In this example π = (1,0), so the projection records the x₁-coordinate.",

      formula: "π = (1,0),    πᵀx = x₁",

      insight:
        "The right-hand sides b determine where the facets of P are located.",

      scene: scene({
        splitProjection: {
          pi,
          pi0,
          phase: "direction",
          color: "#7a70df",
        },

        primitives: [
          {
            kind: "point",
            at: [2.5, 4],
            label: "fractional apex",
            style: "fractional",
          },
        ],
      }),
    },

    {
      id: "project-facets",

      kicker: "02 · Facet projection",
      title: "Project each bounded facet",

      description:
        "We project the facet segments Fᵢ = P ∩ Hᵢ, not the complete affine lines Hᵢ. Each facet collapses to an interval on span(π).",

      formula:
        "Fᵢ = P ∩ {x : aᵢᵀx = bᵢ}",

      insight:
        "The values bᵢ matter because they determine the actual location of each facet.",

      scene: scene({
        splitProjection: {
          pi,
          pi0,
          phase: "project-facets",
          showGuides: true,
          color: "#7a70df",
        },
      }),
    },

    {
      id: "project-polyhedron",

      kicker: "03 · Point projection",
      title: "Collapse the polyhedron onto π",

      description:
        "Every vertex moves orthogonally to the π-axis. At the end, the two-dimensional polyhedron has collapsed to its one-dimensional image.",

      formula:
        "projₚᵢ(x) = (πᵀx / ‖π‖²)π",

      insight:
        "Although the picture becomes one-dimensional, every projected point still remembers its scalar value πᵀx.",

      scene: scene({
        showFeasibleRegion: false,

        splitProjection: {
          pi,
          pi0,
          phase: "project-polyhedron",
          showGuides: true,
          color: "#7a70df",
        },
      }),
    },

    {
      id: "forbidden-interval",

      kicker: "04 · Split interval",
      title: "Reveal the forbidden interval",

      description:
        "Integer points cannot satisfy 2 < x₁ < 3. The red segment is therefore lattice-free for the chosen integer variable.",

      formula:
        "π₀ < πᵀx < π₀ + 1",

      insight:
        "For π = (1,0), the forbidden interval is simply 2 < x₁ < 3.",

      scene: scene({
        showGrid: false,
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,

        splitProjection: {
          pi,
          pi0,
          phase: "projected-strip",
          color: "#7a70df",
          stripColor: "#e27c89",
        },
      }),
    },

    {
      id: "lift-strip",

      kicker: "05 · Back in the original space",
      title: "Lift the interval into a strip",

      description:
        "The interval endpoints become the parallel lines πᵀx = π₀ and πᵀx = π₀+1. Their preimage is the forbidden strip.",

      formula:
        "2 < x₁ < 3",

      insight:
        "A one-dimensional forbidden interval becomes a full strip in the original space.",

      scene: scene({
        splitProjection: {
          pi,
          pi0,
          phase: "lift-strip",
          color: "#7a70df",
          stripColor: "#e27c89",
        },
      }),
    },

    {
      id: "remove-strip",

      kicker: "06 · Disjunction",
      title: "Keep the two integer sides",

      description:
        "The middle region fades away. What remains is P ∩ {x₁≤2} together with P ∩ {x₁≥3}.",

      formula:
        "x₁ ≤ 2   ∨   x₁ ≥ 3",

      insight:
        "No feasible integer point is removed.",

      scene: scene({
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,

        splitProjection: {
          pi,
          pi0,
          phase: "remove-strip",
          color: "#7a70df",
          stripColor: "#e27c89",
        },
      }),
    },

    {
      id: "split-hull",

      kicker: "07 · Convexification",
      title: "Take the convex hull",

      description:
        "The split polyhedron is not merely the disconnected union of the two pieces. We convexify their union.",

      formula:
        "P⁽π,π₀⁾ = conv(P₁ ∪ P₂)",

      insight:
        "The fractional apex is cut off and replaced by a new upper edge.",

      scene: scene({
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,

        splitProjection: {
          pi,
          pi0,
          phase: "split-hull",
          color: "#7a70df",
          stripColor: "#e27c89",
        },
      }),
    },
  ],

  proof: {
    title: "Why is the split valid?",
    steps: [
      "For every integer feasible point, πᵀx is an integer because π is integral.",
      "There is no integer strictly between π₀ and π₀+1.",
      "Therefore every integer point lies on one of the two sides of the split.",
      "Taking the convex hull preserves all integer feasible points while removing the fractional apex.",
    ],
  },
};

export default visualization;