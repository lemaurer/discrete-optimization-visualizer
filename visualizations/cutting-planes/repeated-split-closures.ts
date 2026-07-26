import {
  buildRepeatedSplitClosures,
  polygonToConstraints,
} from "@/engine/splitClosure";
import type {
  SplitClosureIteration,
  SplitClosureStep,
  SplitClosureSpec,
} from "@/engine/splitClosure";
import type { Point2D, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const finiteViewport: Scene["viewport"] = {
  x: [-1, 7.5],
  y: [-1, 6.5],
};

const finiteInitialConstraints: Scene["constraints"] = [
  {
    id: "finite-left",
    a: -1,
    b: 0,
    limit: 0,
    label: "x₁ ≥ 0",
    color: "#f49a4a",
  },
  {
    id: "finite-bottom",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#79c9c0",
  },
  {
    id: "finite-right",
    a: 1,
    b: 0,
    limit: 6.5,
    label: "x₁ ≤ 6.5",
    color: "#e27c89",
  },
  {
    id: "finite-top",
    a: 0,
    b: 1,
    limit: 5.5,
    label: "x₂ ≤ 5.5",
    color: "#8f88dc",
  },
  {
    id: "finite-diagonal",
    a: 1,
    b: 1,
    limit: 9.5,
    label: "x₁+x₂ ≤ 9.5",
    color: "#d4ef77",
  },
];

const finiteClosureSpecs: SplitClosureSpec[] = [
  {
    id: "coordinate-closure",
    title: "Coordinate split closure",
    description:
      "Use the two coordinate splits to remove the fractional right and upper caps.",
    splits: [
      {
        id: "x-coordinate",
        pi: [1, 0],
        pi0: 6,
        title: "Round x₁ down to its integer boundary",
        description:
          "Because the relaxation never reaches x₁=7, this split produces the valid cut x₁≤6.",
        color: "#e27c89",
      },
      {
        id: "y-coordinate",
        pi: [0, 1],
        pi0: 5,
        title: "Round x₂ down to its integer boundary",
        description:
          "Because the relaxation never reaches x₂=6, this split produces the valid cut x₂≤5.",
        color: "#8f88dc",
      },
    ],
  },
  {
    id: "diagonal-closure",
    title: "Diagonal split closure",
    description:
      "Apply a split in the integral direction (1,1) to remove the last fractional diagonal edge.",
    splits: [
      {
        id: "sum-coordinate",
        pi: [1, 1],
        pi0: 9,
        title: "Round the diagonal coordinate",
        description:
          "The split x₁+x₂≤9 or x₁+x₂≥10 replaces the fractional bound 9.5 by 9.",
        color: "#f49a4a",
      },
    ],
  },
];

const finiteClosures = buildRepeatedSplitClosures({
  initialConstraints: finiteInitialConstraints,
  viewport: finiteViewport,
  closures: finiteClosureSpecs,
});

function formatLinearForm(pi: Point2D): string {
  const terms = [
    { coefficient: pi[0], variable: "x₁" },
    { coefficient: pi[1], variable: "x₂" },
  ].filter(({ coefficient }) => coefficient !== 0);

  return terms
    .map(({ coefficient, variable }, index) => {
      const magnitude = Math.abs(coefficient);
      const term = `${magnitude === 1 ? "" : magnitude}${variable}`;
      if (index === 0) return coefficient < 0 ? `−${term}` : term;
      return coefficient < 0 ? ` − ${term}` : ` + ${term}`;
    })
    .join("");
}

function finiteScene(
  constraints: Scene["constraints"],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: finiteViewport,
    constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    showIntegerHull: true,
    ...overrides,
  };
}

function detailedSplitStages(step: SplitClosureStep): VisualizationStage[] {
  const cut = step.cut;
  const linearForm = formatLinearForm(cut.pi);
  const prefix = `finite-c${step.closureIndex}-s${step.splitIndex}`;

  return [
    {
      id: `${prefix}-project`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Projection`,
      title: `Project onto π = (${cut.pi[0]}, ${cut.pi[1]})`,
      description:
        "The split is easiest to read after the current closure input collapses onto the scalar coordinate πᵀx.",
      formula: "projₚᵢ(x) = (πᵀx / ‖π‖²)π",
      insight: cut.description,
      scene: finiteScene(step.closureBaseConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "project-polyhedron",
          showGuides: true,
          color: cut.color,
          stripColor: "#e27c89",
        },
      }),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
      },
    },
    {
      id: `${prefix}-interval`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Interval`,
      title: "Mark the forbidden unit interval",
      description:
        "The open interval between two consecutive integers contains no projected integer point.",
      formula: `${cut.pi0} < ${linearForm} < ${cut.pi0 + 1}`,
      insight:
        "This is the one-dimensional source of the lattice-free strip in the original plane.",
      scene: finiteScene(step.closureBaseConstraints, {
        showGrid: false,
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "projected-strip",
          color: cut.color,
          stripColor: "#e27c89",
        },
      }),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
      },
    },
    {
      id: `${prefix}-lift`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Lift`,
      title: "Lift the interval into a strip",
      description:
        "The interval becomes the region between the two parallel hyperplanes πᵀx=π₀ and πᵀx=π₀+1.",
      formula: `${cut.pi0} < ${linearForm} < ${cut.pi0 + 1}`,
      insight:
        "Everything in the highlighted strip is fractional in the chosen split coordinate.",
      scene: finiteScene(step.closureBaseConstraints, {
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "lift-strip",
          color: cut.color,
          stripColor: "#e27c89",
        },
      }),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
      },
    },
    {
      id: `${prefix}-remove`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Remove`,
      title: cut.title,
      description:
        "Remove the open strip, keep both closed sides, and convexify the surviving union.",
      formula: `${linearForm} ≤ ${cut.pi0}  ∨  ${linearForm} ≥ ${cut.pi0 + 1}`,
      insight:
        `The split itself removes ${step.splitRemovedArea.toFixed(2)} square units from P${step.closureIndex - 1}.`,
      scene: finiteScene(step.closureBaseConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "remove-strip",
          color: cut.color,
          stripColor: "#e27c89",
        },
      }),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
      },
    },
    {
      id: `${prefix}-hull`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Convexify`,
      title: "See this split polyhedron",
      description:
        "This is the polyhedron generated by one split, before it is intersected with the other split polyhedra from the same closure.",
      formula: "P⁽π,π₀⁾ = conv(P₁ ∪ P₂)",
      insight:
        "All splits in one closure are computed from the same input polyhedron.",
      scene: finiteScene(step.closureBaseConstraints, {
        showConstraints: false,
        showFeasibleRegion: false,
        showVertices: false,
        splitProjection: {
          pi: cut.pi,
          pi0: cut.pi0,
          phase: "split-hull",
          color: cut.color,
          stripColor: "#e27c89",
        },
      }),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
      },
    },
    {
      id: `${prefix}-accumulate`,
      kicker: `Closure ${step.closureIndex} · Split ${step.splitIndex} · Intersect`,
      title: "Add this split to the closure",
      description:
        "Intersect the new split polyhedron with the split polyhedra already accumulated in this closure.",
      formula: "S ← S ∩ P⁽π,π₀⁾",
      insight:
        `The accumulated intersection shrinks by ${step.accumulatedRemovedArea.toFixed(2)} square units.`,
      scene: finiteScene(step.afterIntersectionConstraints),
      navigation: {
        closure: step.closureIndex,
        split: step.splitIndex,
        milestone: "split",
      },
    },
  ];
}

function closureStages(closure: SplitClosureIteration): VisualizationStage[] {
  return [
    {
      id: `finite-closure-${closure.index}-start`,
      kicker: `Split closure ${closure.index}`,
      title: closure.spec.title,
      description: closure.spec.description,
      formula: `P${closure.index} = (P${closure.index - 1})ˢᵖˡⁱᵗ`,
      insight:
        "Detail shows the projection and strip for every split. Splits jumps to each accumulated intersection.",
      scene: finiteScene(closure.beforeConstraints),
      navigation: { closure: closure.index },
    },
    ...closure.steps.flatMap(detailedSplitStages),
    {
      id: `finite-closure-${closure.index}-result`,
      kicker: `Split closure ${closure.index} · Result`,
      title: `Finish P${closure.index}`,
      description:
        "All split polyhedra selected for this closure have now been intersected. This output becomes the next closure input.",
      formula: `P${closure.index} = ⋂ P${closure.index - 1}⁽π,π₀⁾`,
      insight:
        `Closure ${closure.index} reduces the area from ${closure.beforeArea.toFixed(2)} to ${closure.afterArea.toFixed(2)}.`,
      scene: finiteScene(closure.afterConstraints),
      navigation: {
        closure: closure.index,
        milestone: "closure",
      },
    },
  ];
}

const finiteStages: VisualizationStage[] = [
  {
    id: "finite-initial",
    kicker: "Finite rank · Initial relaxation",
    title: "Three fractional bounds encode the same integer points",
    description:
      "Integer feasibility already implies x₁≤6, x₂≤5, and x₁+x₂≤9, but the LP relaxation uses the weaker bounds 6.5, 5.5, and 9.5.",
    formula: "P⁰ = {0≤x₁≤6.5, 0≤x₂≤5.5, x₁+x₂≤9.5}",
    insight:
      "Two split closures are enough here: coordinate splits first, then a diagonal split.",
    scene: finiteScene(finiteInitialConstraints),
  },
  ...finiteClosures.flatMap(closureStages),
  {
    id: "finite-integer-hull",
    kicker: "Finite rank · Integer hull",
    title: "The second closure reaches the integer hull",
    description:
      "After the coordinate and diagonal closures, all three fractional right-hand sides have been rounded to the strongest integral bounds.",
    formula: "P² = conv(P⁰ ∩ ℤ²)",
    insight:
      "This example has finite split rank: the integer hull appears after two closure rounds.",
    scene: finiteScene(finiteClosures[finiteClosures.length - 1].afterConstraints),
    navigation: {
      closure: finiteClosures.length,
      milestone: "closure",
    },
  },
];

const infiniteViewport: Scene["viewport"] = {
  x: [-0.2, 2.2],
  y: [-0.06, 0.62],
};

function infiniteTriangle(height: number, index: number) {
  return polygonToConstraints(
    [
      [0, 0],
      [2, 0],
      [1, height],
    ],
    {
      idPrefix: `infinite-closure-${index}`,
      labelPrefix: `projected P${index} facet`,
      colors: ["#79c9c0", "#8f88dc", "#f49a4a"],
    },
  );
}

function infiniteScene(
  height: number,
  index: number,
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: infiniteViewport,
    constraints: infiniteTriangle(height, index),
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    latticeMode: "x-lines",
    axisLabels: {
      x: "s=x₁+x₂",
      y: "y",
    },
    caption: {
      primary: "Projected (s,y) plane",
      secondary: "x₁,x₂ integer; y continuous",
    },
    primitives: [
      {
        kind: "line",
        from: [0, 0],
        to: [2, 0],
        label: "projected integer hull",
        style: "cut",
        color: "#f28b45",
      },
      {
        kind: "point",
        at: [1, height],
        label: height > 0 ? "fractional height remains" : "limit",
        style: "fractional",
      },
    ],
    ...overrides,
  };
}

const schematicHeights = [0.5, 0.25, 1 / 6, 0.125, 0.1, 1 / 12];

const infiniteStages: VisualizationStage[] = [
  {
    id: "infinite-initial",
    kicker: "Infinite rank · Lecture Example 54",
    title: "Project the mixed-integer example onto (s,y)",
    description:
      "For s=x₁+x₂, the LP relaxation projects to the triangle 2y≤s≤2−2y. The integer hull projects to its base y=0.",
    formula:
      "F = {(x₁,x₂,y)∈ℤ²₊×ℝ₊ : x₁≥y, x₂≥y, x₁+x₂+2y≤2}",
    insight:
      "The lecture notes state that no finite number of split closures reaches conv(F).",
    scene: infiniteScene(schematicHeights[0], 0),
  },
  ...schematicHeights.slice(1).flatMap((height, offset) => {
    const closureIndex = offset + 1;
    const previousHeight = schematicHeights[offset];
    return [
      {
        id: `infinite-closure-${closureIndex}-transition`,
        kicker: `Infinite rank · Closure ${closureIndex}`,
        title: "The fractional envelope becomes thinner",
        description:
          "Another split closure removes part of the positive-y region, but a fractional point with y>0 survives.",
        formula: `P${closureIndex} = (P${closureIndex - 1})ˢᵖˡⁱᵗ`,
        insight:
          "The two-dimensional envelopes are a normalized schematic of the projection, not claimed exact closure coordinates.",
        scene: infiniteScene(height, closureIndex, {
          primitives: [
            {
              kind: "polygon",
              points: [
                [0, 0],
                [2, 0],
                [1, previousHeight],
              ],
              label: `P${closureIndex - 1}`,
              style: "removed",
            },
            {
              kind: "line",
              from: [0, 0],
              to: [2, 0],
              label: "projected integer hull",
              style: "cut",
              color: "#f28b45",
            },
            {
              kind: "point",
              at: [1, height],
              label: "still above y=0",
              style: "fractional",
            },
          ],
        }),
        navigation: { closure: closureIndex },
      },
      {
        id: `infinite-closure-${closureIndex}-result`,
        kicker: `Infinite rank · Closure ${closureIndex} result`,
        title: `P${closureIndex} still differs from the integer hull`,
        description:
          "The closure is tighter, yet its projected region still contains positive-y fractional points.",
        formula: `P${closureIndex} ≠ conv(F)`,
        insight:
          "No matter which finite closure index is chosen, the lecture counterexample has not reached the integer hull.",
        scene: infiniteScene(height, closureIndex),
        navigation: {
          closure: closureIndex,
          milestone: "closure" as const,
        },
      },
    ] satisfies VisualizationStage[];
  }),
  {
    id: "infinite-never-finishes",
    kicker: "Infinite rank · Conclusion",
    title: "There is no final finite closure",
    description:
      "The regions approach the projected integer hull y=0, but the lecture example has positive split rank beyond every finite number of rounds.",
    formula: "(Pˢᵖˡⁱᵗ)ᵏ ≠ conv(F)  for every finite k",
    insight:
      "The obstruction is a maximal lattice-free set in the y=0 slice that is too large to be covered by splits.",
    scene: infiniteScene(schematicHeights[schematicHeights.length - 1], schematicHeights.length),
    navigation: {
      closure: schematicHeights.length,
      milestone: "closure",
    },
  },
];

const finiteExample: VisualizationExample = {
  id: "finite-rank",
  title: "Finite rank — reaches the integer hull",
  description:
    "Follow every split inside two closure rounds, or use the navigation granularity controls to jump by split or by closure.",
  stages: finiteStages,
  proof: {
    title: "Why are two closure rounds sufficient here?",
    steps: [
      "Integer feasibility turns x₁≤6.5 into x₁≤6 and x₂≤5.5 into x₂≤5.",
      "The first selected closure obtains both coordinate bounds.",
      "Afterward, integrality turns x₁+x₂≤9.5 into x₁+x₂≤9.",
      "The second closure obtains this diagonal bound.",
      "The resulting system has the same convex hull as the feasible integer points.",
    ],
  },
};

const infiniteExample: VisualizationExample = {
  id: "infinite-rank",
  title: "Infinite rank — Lecture Example 54",
  description:
    "Select the mixed-integer counterexample from the lecture notes and inspect closure snapshots that never reach the integer hull at a finite index.",
  stages: infiniteStages,
  proof: {
    title: "What the lecture counterexample establishes",
    steps: [
      "The variables x₁ and x₂ are nonnegative integers, while y is nonnegative and continuous.",
      "The LP relaxation contains points with y>0, but every feasible mixed-integer point lies in the slice y=0.",
      "The notes state that conv(F) differs from the kth split closure for every finite k.",
      "Informally, the maximal lattice-free set in the y=0 slice cannot be covered by splits strongly enough in finitely many rounds.",
      "The displayed shrinking triangles are schematic projected envelopes used to visualize this infinite-rank conclusion.",
    ],
  },
};

const visualization: VisualizationDefinition = {
  id: "repeated-split-closures",
  title: "Repeated Split Closures",
  shortTitle: "Repeated closures",
  chapter: "Cutting planes",
  order: 3,
  description:
    "Move through individual splits, completed split closures, and repeated closure rounds at different levels of detail.",
  difficulty: "Advanced",
  duration: 22,
  accent: "#f49a4a",
  controls: {
    constraints: false,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: finiteStages,
  examples: [finiteExample, infiniteExample],
  proof: finiteExample.proof,
};

export default visualization;
