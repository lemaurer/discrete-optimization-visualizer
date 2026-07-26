import {
  buildSplitClosureRounds,
  polygonToConstraints,
} from "@/engine/splitClosure";
import type {
  SplitClosureRound,
  SplitCutSpec,
} from "@/engine/splitClosure";
import type {
  Point2D,
  Scene,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationStage,
} from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-1, 8],
  y: [-1, 7.5],
};

const initialVertices: Point2D[] = [
  [0, 0],
  [6.5, 0],
  [6.2, 1.5],
  [5.4, 3.2],
  [3.5, 5.6],
  [1.2, 6.2],
  [0, 5.5],
];

const initialConstraints = polygonToConstraints(
  initialVertices,
  {
    idPrefix: "initial-polyhedron",
    labelPrefix: "P⁰ facet",
  },
);

const cuts: SplitCutSpec[] = [
  {
    id: "vertical-right",
    pi: [1, 0],
    pi0: 6,
    title: "Remove the fractional right cap",
    description:
      "The split x₁ ≤ 6 or x₁ ≥ 7 removes the fractional protrusion with 6 < x₁ < 7.",
    color: "#e27c89",
  },
  {
    id: "horizontal-top",
    pi: [0, 1],
    pi0: 5,
    title: "Remove the fractional upper cap",
    description:
      "The split x₂ ≤ 5 or x₂ ≥ 6 acts on the upper part of the new relaxation.",
    color: "#f49a4a",
  },
  {
    id: "diagonal-sum",
    pi: [1, 1],
    pi0: 8,
    title: "Cut in a diagonal direction",
    description:
      "The coordinate is now x₁+x₂. The strip 8 < x₁+x₂ < 9 removes a diagonal fractional region.",
    color: "#8f88dc",
  },
  {
    id: "steeper-diagonal",
    pi: [1, 2],
    pi0: 13,
    title: "Use a steeper split",
    description:
      "The split x₁+2x₂ ≤ 13 or x₁+2x₂ ≥ 14 removes another fractional corner that survived the earlier rounds.",
    color: "#79c9c0",
  },
];

const rounds = buildSplitClosureRounds({
  initialConstraints,
  viewport,
  cuts,
});

const finalConstraints =
  rounds[rounds.length - 1].afterConstraints;

function stageNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatPi(pi: Point2D): string {
  return `(${pi[0]}, ${pi[1]})`;
}

function formatArea(value: number): string {
  return value.toFixed(2);
}

function formatLinearForm(pi: Point2D): string {
  const terms = [
    { coefficient: pi[0], variable: "x₁" },
    { coefficient: pi[1], variable: "x₂" },
  ].filter(({ coefficient }) => coefficient !== 0);

  return terms
    .map(({ coefficient, variable }, index) => {
      const magnitude = Math.abs(coefficient);
      const term = `${magnitude === 1 ? "" : magnitude}${variable}`;

      if (index === 0) {
        return coefficient < 0 ? `−${term}` : term;
      }

      return coefficient < 0 ? ` − ${term}` : ` + ${term}`;
    })
    .join("");
}

function scene(
  constraints: Scene["constraints"],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport,
    constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: false,
    ...overrides,
  };
}

function createRoundStages(
  round: SplitClosureRound,
): VisualizationStage[] {
  const {
    index,
    cut,
    beforeConstraints,
    removedArea,
  } = round;

  const firstStageNumber = 2 + (index - 1) * 5;
  const linearForm = formatLinearForm(cut.pi);

  return [
    {
      id: `round-${index}-project`,
      kicker: `${stageNumber(firstStageNumber)} · Round ${index}`,
      title: `Project P${index - 1} onto π = ${formatPi(cut.pi)}`,
      description:
        "Every point of the current polyhedron moves onto the line spanned by π. Its position on that line represents the scalar value πᵀx.",
      formula: "projₚᵢ(x) = (πᵀx / ‖π‖²)π",
      insight: cut.description,
      scene: scene(beforeConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "project-polyhedron",
          showGuides: true,
          color: cut.color ?? "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `round-${index}-interval`,
      kicker: `${stageNumber(firstStageNumber + 1)} · Forbidden interval`,
      title: `Locate the strip for split ${index}`,
      description:
        `The values strictly between ${cut.pi0} and ${cut.pi0 + 1} cannot occur for an integer point because π is integral.`,
      formula: `${cut.pi0} < ${linearForm} < ${cut.pi0 + 1}`,
      insight:
        "The red interval contains projected fractional points but no projected integer points.",
      scene: scene(beforeConstraints, {
        showGrid: false,
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "projected-strip",
          color: cut.color ?? "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `round-${index}-lift`,
      kicker: `${stageNumber(firstStageNumber + 2)} · Lift the strip`,
      title: "Return the forbidden interval to the plane",
      description:
        "The two endpoints on the π-axis lift to the parallel lines πᵀx=π₀ and πᵀx=π₀+1. Their inverse image is the forbidden strip in the original plane.",
      formula: `${cut.pi0} < ${linearForm} < ${cut.pi0 + 1}`,
      insight:
        "Projection makes the split one-dimensional; lifting reveals which part of the polyhedron is affected.",
      scene: scene(beforeConstraints, {
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "lift-strip",
          color: cut.color ?? "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `round-${index}-remove`,
      kicker: `${stageNumber(firstStageNumber + 3)} · Apply the disjunction`,
      title: cut.title,
      description:
        "The part of the current polyhedron inside the open strip fades away. Both closed sides of the disjunction remain.",
      formula: `${linearForm} ≤ ${cut.pi0}  ∨  ${linearForm} ≥ ${cut.pi0 + 1}`,
      insight:
        `This round removes approximately ${formatArea(removedArea)} square units of fractional area.`,
      scene: scene(beforeConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "remove-strip",
          color: cut.color ?? "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
    {
      id: `round-${index}-hull`,
      kicker: `${stageNumber(firstStageNumber + 4)} · Convexify`,
      title: `Construct P${index}`,
      description:
        "The two surviving pieces are convexified. The resulting polygon becomes the input relaxation for the next split round.",
      formula: `P${index} = conv(P${index - 1}₁ ∪ P${index - 1}₂)`,
      insight:
        `The relaxation has shrunk from area ${formatArea(round.beforeArea)} to ${formatArea(round.afterArea)}.`,
      scene: scene(beforeConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "split-hull",
          color: cut.color ?? "#8f88dc",
          stripColor: "#e27c89",
        },
      }),
    },
  ];
}

const finalStageNumber = 2 + rounds.length * 5;

const visualization: VisualizationDefinition = {
  id: "repeated-split-closure",
  title: "Repeated Split Cuts",
  shortTitle: "Repeated splits",
  chapter: "Cutting planes",
  order: 3,
  description:
    "Apply several split disjunctions in different directions and watch the fractional relaxation shrink round by round.",
  difficulty: "Advanced",
  duration: 18,
  accent: "#8f88dc",
  controls: {
    constraints: false,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: [
    {
      id: "initial-polyhedron",
      kicker: "01 · Initial relaxation",
      title: "Start from a fractional polyhedron",
      description:
        "The initial relaxation has several fractional corners. Different split directions will target different parts of its boundary.",
      formula: "P⁰ = {x ∈ ℝ² : Ax ≤ b}",
      insight:
        "One split direction will not remove every fractional feature, so the process is repeated.",
      scene: scene(initialConstraints, {
        showLattice: true,
        showVertices: true,
        showIntegerHull: true,
        primitives: [
          {
            kind: "point",
            at: [6.5, 0],
            label: "fractional corner",
            style: "fractional",
          },
          {
            kind: "point",
            at: [3.5, 5.6],
            label: "fractional corner",
            style: "fractional",
          },
          {
            kind: "point",
            at: [1.2, 6.2],
            label: "fractional corner",
            style: "fractional",
          },
        ],
      }),
    },
    ...rounds.flatMap(createRoundStages),
    {
      id: "final-relaxation",
      kicker: `${stageNumber(finalStageNumber)} · After four rounds`,
      title: "The relaxation has become tighter",
      description:
        "The selected split cuts preserve the integer points while successively removing fractional regions from different directions.",
      formula: "P⁰ ⊇ P¹ ⊇ P² ⊇ P³ ⊇ P⁴",
      insight:
        "This is a selected split sequence. The complete split closure would additionally intersect the polyhedra obtained from every admissible split.",
      scene: scene(finalConstraints, {
        showLattice: true,
        showVertices: true,
        showIntegerHull: true,
      }),
    },
  ],
  proof: {
    title: "Why does every round preserve the integer points?",
    steps: [
      "Each split direction π is an integral vector.",
      "Therefore πᵀx is integral whenever x is an integer point.",
      "No integer value lies strictly between π₀ and π₀+1.",
      "Every integer point consequently belongs to one of the two surviving halfspaces.",
      "Convexifying the two surviving pieces preserves all feasible integer points.",
      "The output polygon can therefore be used safely as the input of the next round.",
    ],
  },
};

export default visualization;
