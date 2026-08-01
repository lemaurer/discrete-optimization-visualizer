import {
  buildRepeatedSplitClosures,
  polygonToConstraints,
} from "@/engine/splitClosure";
import type {
  SplitClosureIteration,
  SplitClosureStep,
  SplitClosureSpec,
} from "@/engine/splitClosure";
import { computeSplitGeometry } from "@/engine/split";
import type { Point2D, Primitive, Scene } from "@/engine/types";
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

interface InfiniteClosureState {
  index: number;
  alpha: number;
  epsilon: number;
}

interface InfiniteSplitFamily {
  id: "sum" | "x1" | "x2";
  title: string;
  projectionTitle: string;
  axisLabel: string;
  pi0: number;
  color: string;
  disjunction: string;
  explanation: string;
  apexCoordinate: (state: InfiniteClosureState) => number;
}

const infiniteSummaryViewport: Scene["viewport"] = {
  x: [-0.16, 2.2],
  y: [-0.035, 0.57],
};

const infiniteSplitFamilies: InfiniteSplitFamily[] = [
  {
    id: "sum",
    title: "Apply the sum split",
    projectionTitle: "(s=x₁+x₂, y)",
    axisLabel: "s=x₁+x₂",
    pi0: 1,
    color: "#f49a4a",
    disjunction: "x₁+x₂≤1  ∨  x₁+x₂≥2",
    explanation:
      "Because s=x₁+x₂ is integral, the strip 1<s<2 contains no mixed-integer point.",
    apexCoordinate: (state) => 2 * state.alpha,
  },
  {
    id: "x1",
    title: "Apply the first coordinate split",
    projectionTitle: "(x₁,y)",
    axisLabel: "x₁",
    pi0: 0,
    color: "#8f88dc",
    disjunction: "x₁≤0  ∨  x₁≥1",
    explanation:
      "The apex has 0<x₁<1, but convexifying the two surviving sides still recreates points with y>0.",
    apexCoordinate: (state) => state.alpha,
  },
  {
    id: "x2",
    title: "Apply the symmetric coordinate split",
    projectionTitle: "(x₂,y)",
    axisLabel: "x₂",
    pi0: 0,
    color: "#79c9c0",
    disjunction: "x₂≤0  ∨  x₂≥1",
    explanation:
      "The same operation is required in the second integer coordinate; it produces the mirror-image split polyhedron.",
    apexCoordinate: (state) => state.alpha,
  },
];

function infiniteState(index: number): InfiniteClosureState {
  const correction = 1 / (3 * 2 ** (index + 1));
  const alpha =
    index % 2 === 0
      ? 2 / 3 - correction
      : 2 / 3 + correction;

  return {
    index,
    alpha,
    epsilon: 1 / 2 ** (index + 1),
  };
}

function formatFraction(value: number): string {
  const knownFractions: Array<[number, string]> = [
    [1 / 2, "1/2"],
    [1 / 4, "1/4"],
    [1 / 8, "1/8"],
    [1 / 16, "1/16"],
    [1 / 32, "1/32"],
    [1 / 64, "1/64"],
    [3 / 4, "3/4"],
    [5 / 8, "5/8"],
    [11 / 16, "11/16"],
    [21 / 32, "21/32"],
    [43 / 64, "43/64"],
  ];

  const match = knownFractions.find(
    ([candidate]) => Math.abs(candidate - value) < 1e-9,
  );

  return match?.[1] ?? value.toFixed(4);
}

function infiniteProjectionVertices(
  state: InfiniteClosureState,
  family: InfiniteSplitFamily,
): Point2D[] {
  return [
    [0, 0],
    [2, 0],
    [family.apexCoordinate(state), state.epsilon],
  ];
}

function infiniteProjectionConstraints(
  state: InfiniteClosureState,
  family: InfiniteSplitFamily,
): Scene["constraints"] {
  return polygonToConstraints(
    infiniteProjectionVertices(state, family),
    {
      idPrefix: `infinite-p${state.index}-${family.id}`,
      labelPrefix: `${family.axisLabel}-projection facet`,
      colors: ["#79c9c0", family.color, "#d4ef77"],
    },
  );
}

function infiniteDetailViewport(
  state: InfiniteClosureState,
): Scene["viewport"] {
  return {
    x: [-0.12, 2.14],
    y: [
      -0.08 * state.epsilon,
      Math.max(0.095, 1.3 * state.epsilon),
    ],
  };
}

function integerHullPrimitive(): Primitive {
  return {
    kind: "line",
    from: [0, 0],
    to: [2, 0],
    label: "projected integer hull: y=0",
    style: "cut",
    color: "#f28b45",
  };
}

function infiniteProjectionScene(
  state: InfiniteClosureState,
  family: InfiniteSplitFamily,
  phase?: "lift-strip" | "remove-strip" | "split-hull",
): Scene {
  const viewport = infiniteDetailViewport(state);
  const constraints = infiniteProjectionConstraints(state, family);
  const primitives: Primitive[] = [
    integerHullPrimitive(),
    {
      kind: "point",
      at: [family.apexCoordinate(state), state.epsilon],
      label: `apex of P${state.index}: y=${formatFraction(state.epsilon)}`,
      style: "fractional",
    },
  ];

  if (phase === "split-hull") {
    const splitGeometry = computeSplitGeometry(
      constraints,
      viewport,
      [1, 0],
      family.pi0,
    );
    const survivingTop = splitGeometry.splitHull.reduce<Point2D>(
      (best, point) => (point[1] > best[1] ? point : best),
      splitGeometry.splitHull[0] ?? [0, 0],
    );

    primitives.push({
      kind: "point",
      at: survivingTop,
      label: `this split still leaves y=${formatFraction(survivingTop[1])}>0`,
      style: "optimum",
    });
  }

  return {
    viewport,
    constraints,
    primitives,
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: phase === undefined || phase === "lift-strip",
    showVertices: false,
    showLattice: true,
    latticeMode: "x-lines",
    scaleMode: "stretch",
    axisTicks: {
      x: 0.5,
      y: Math.max(state.epsilon / 4, 1 / 128),
    },
    axisLabels: {
      x: family.axisLabel,
      y: "y",
    },
    caption: {
      primary: `Exact ${family.projectionTitle} projection`,
      secondary: "horizontal coordinate is integral; y is continuous",
    },
    splitProjection: phase
      ? {
          pi: [1, 0],
          pi0: family.pi0,
          phase,
          color: family.color,
          stripColor: "#e27c89",
        }
      : undefined,
  };
}

function infiniteSummaryVertices(
  state: InfiniteClosureState,
): Point2D[] {
  return [
    [0, 0],
    [2, 0],
    [2 * state.alpha, state.epsilon],
  ];
}

function infiniteSummaryConstraints(
  state: InfiniteClosureState,
): Scene["constraints"] {
  return polygonToConstraints(infiniteSummaryVertices(state), {
    idPrefix: `infinite-summary-${state.index}`,
    labelPrefix: `projected P${state.index} facet`,
    colors: ["#79c9c0", "#8f88dc", "#f49a4a"],
  });
}

function infiniteSummaryScene(
  state: InfiniteClosureState,
  options: {
    previous?: InfiniteClosureState;
    showGap?: boolean;
    extraPrimitives?: Primitive[];
  } = {},
): Scene {
  const apex: Point2D = [2 * state.alpha, state.epsilon];
  const primitives: Primitive[] = [integerHullPrimitive()];

  if (options.previous) {
    primitives.unshift({
      kind: "polygon",
      points: infiniteSummaryVertices(options.previous),
      label: `previous envelope P${options.previous.index}`,
      style: "removed",
    });
  }

  primitives.push({
    kind: "point",
    at: apex,
    label: `C${state.index}: y=${formatFraction(state.epsilon)}>0`,
    style: "fractional",
  });

  if (options.showGap) {
    primitives.push({
      kind: "line",
      from: [apex[0], 0],
      to: apex,
      label: `remaining gap ε${state.index}=${formatFraction(state.epsilon)}`,
      style: "constraint",
      color: "#e27c89",
    });
  }

  if (options.extraPrimitives) {
    primitives.push(...options.extraPrimitives);
  }

  return {
    viewport: infiniteSummaryViewport,
    constraints: infiniteSummaryConstraints(state),
    primitives,
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    latticeMode: "x-lines",
    scaleMode: "stretch",
    axisTicks: {
      x: 0.5,
      y: 0.125,
    },
    axisLabels: {
      x: "s=x₁+x₂",
      y: "y",
    },
    caption: {
      primary: "Exact (s=x₁+x₂,y) projection",
      secondary: "x₁,x₂ integer; y continuous",
    },
  };
}

function infiniteSplitStages(
  input: InfiniteClosureState,
  closureIndex: number,
  family: InfiniteSplitFamily,
  splitIndex: number,
): VisualizationStage[] {
  const prefix = `infinite-c${closureIndex}-${family.id}`;

  return [
    {
      id: `${prefix}-projection`,
      kicker: `Closure ${closureIndex} · Split ${splitIndex} · Exact projection`,
      title: `Move to the ${family.projectionTitle} projection`,
      description:
        "The split variable is kept in this projection, so projecting and taking this split polyhedron commute. The triangle shown here is the exact projection of the current closure input.",
      formula:
        family.id === "sum"
          ? `C${input.index} ↦ (2α${input.index}, ε${input.index})`
          : `C${input.index} ↦ (α${input.index}, ε${input.index})`,
      insight: family.explanation,
      scene: infiniteProjectionScene(input, family),
      navigation: {
        closure: closureIndex,
        split: splitIndex,
      },
    },
    {
      id: `${prefix}-strip`,
      kicker: `Closure ${closureIndex} · Split ${splitIndex} · Forbidden strip`,
      title: family.title,
      description:
        "The red strip is excluded by one valid split disjunction in the integer coordinate displayed horizontally.",
      formula: family.disjunction,
      insight:
        "The fractional apex lies in the open strip, so this split removes it.",
      scene: infiniteProjectionScene(input, family, "lift-strip"),
      navigation: {
        closure: closureIndex,
        split: splitIndex,
      },
    },
    {
      id: `${prefix}-remove`,
      kicker: `Closure ${closureIndex} · Split ${splitIndex} · Remove`,
      title: "Keep the two closed sides",
      description:
        "Delete the open strip. The surviving left and right pieces are still disconnected before convexification.",
      formula:
        family.pi0 === 0
          ? `${family.axisLabel}≤0  ∨  ${family.axisLabel}≥1`
          : `${family.axisLabel}≤1  ∨  ${family.axisLabel}≥2`,
      insight:
        "No feasible mixed-integer point is removed, because the horizontal coordinate is integral.",
      scene: infiniteProjectionScene(input, family, "remove-strip"),
      navigation: {
        closure: closureIndex,
        split: splitIndex,
      },
    },
    {
      id: `${prefix}-hull`,
      kicker: `Closure ${closureIndex} · Split ${splitIndex} · Convexify`,
      title: "Convexification brings back positive-y points",
      description:
        "The split polyhedron is the convex hull of the two surviving pieces. The highlighted top point has y>0, so this individual split is not enough to obtain the integer hull.",
      formula: "P⁽π,π₀⁾ = conv(P≤ ∪ P≥)",
      insight:
        "This is the key mechanism: removing a strip cuts the old apex, but convexification creates a lower fractional envelope instead of collapsing everything to y=0.",
      scene: infiniteProjectionScene(input, family, "split-hull"),
      navigation: {
        closure: closureIndex,
        split: splitIndex,
        milestone: "split",
      },
    },
  ];
}

function infiniteClosureStages(
  closureIndex: number,
): VisualizationStage[] {
  const input = infiniteState(closureIndex - 1);
  const output = infiniteState(closureIndex);

  return [
    {
      id: `infinite-closure-${closureIndex}-start`,
      kicker: `Infinite rank · Split closure ${closureIndex}`,
      title: `Start from the exact polyhedron P${input.index}`,
      description:
        "A full split closure intersects the split polyhedra obtained from every integral split. For this Cook–Kannan–Schrijver simplex, the sum split and the two coordinate splits below generate the facets of the next exact closure.",
      formula:
        `C${input.index}=(α${input.index},α${input.index},ε${input.index})` +
        `,  ε${input.index}=${formatFraction(input.epsilon)}`,
      insight:
        "Use Detail to see the three decisive splits. Use Splits to jump directly to their convexified outputs.",
      scene: infiniteSummaryScene(input, { showGap: true }),
      navigation: { closure: closureIndex },
    },
    ...infiniteSplitFamilies.flatMap((family, splitOffset) =>
      infiniteSplitStages(
        input,
        closureIndex,
        family,
        splitOffset + 1,
      ),
    ),
    {
      id: `infinite-closure-${closureIndex}-intersection`,
      kicker: `Infinite rank · Closure ${closureIndex} · Intersect all splits`,
      title: "The complete closure is smaller — but still three-dimensional",
      description:
        "Intersecting all split polyhedra gives the next exact simplex. The old projected envelope is shown in red and the new one remains filled.",
      formula:
        `α${closureIndex}=1−α${closureIndex - 1}/2,  ` +
        `ε${closureIndex}=ε${closureIndex - 1}/2`,
      insight:
        `The apex moves from y=${formatFraction(input.epsilon)} to y=${formatFraction(output.epsilon)} rather than to y=0.`,
      scene: infiniteSummaryScene(output, {
        previous: input,
      }),
      navigation: { closure: closureIndex },
    },
    {
      id: `infinite-closure-${closureIndex}-gap`,
      kicker: `Infinite rank · Closure ${closureIndex} · Why it is not finished`,
      title: `P${closureIndex} still contains a fractional apex`,
      description:
        "The orange base is the projected mixed-integer hull. The vertical segment measures the positive gap that survives the entire split closure.",
      formula:
        `ε${closureIndex}=${formatFraction(output.epsilon)}>0  ⇒  P${closureIndex}≠conv(F)`,
      insight:
        "A new closure can halve this gap again, but no finite number of halvings makes it exactly zero.",
      scene: infiniteSummaryScene(output, {
        showGap: true,
      }),
      navigation: {
        closure: closureIndex,
        milestone: "closure",
      },
    },
  ];
}

const displayedInfiniteClosures = 5;
const initialInfiniteState = infiniteState(0);
const finalDisplayedInfiniteState = infiniteState(displayedInfiniteClosures);

const convergencePrimitives: Primitive[] = [];
for (let index = 0; index <= displayedInfiniteClosures; index += 1) {
  const state = infiniteState(index);
  const apex: Point2D = [2 * state.alpha, state.epsilon];

  convergencePrimitives.push({
    kind: "point",
    at: apex,
    label: `C${index}`,
    style: index === displayedInfiniteClosures ? "optimum" : "fractional",
  });

  if (index > 0) {
    const previous = infiniteState(index - 1);
    convergencePrimitives.push({
      kind: "line",
      from: [2 * previous.alpha, previous.epsilon],
      to: apex,
      label: "",
      style: "objective",
      color: "#8f88dc",
    });
  }
}

const infiniteStages: VisualizationStage[] = [
  {
    id: "infinite-initial",
    kicker: "Infinite rank · Lecture Example 54",
    title: "Start from the exact Cook–Kannan–Schrijver simplex",
    description:
      "The relaxation is the simplex with base points (0,0,0), (2,0,0), (0,2,0) and fractional apex C₀=(1/2,1/2,1/2). In the (s=x₁+x₂,y) projection, the integer hull is only the base y=0.",
    formula:
      "P⁰={x₁,x₂,y≥0 : x₁≥y, x₂≥y, x₁+x₂+2y≤2}",
    insight:
      "The old fixed-apex schematic has been replaced by the exact closure family and exact projected apex coordinates.",
    scene: infiniteSummaryScene(initialInfiniteState, {
      showGap: true,
    }),
  },
  ...Array.from(
    { length: displayedInfiniteClosures },
    (_, offset) => offset + 1,
  ).flatMap(infiniteClosureStages),
  {
    id: "infinite-convergence-formula",
    kicker: "Infinite rank · Exact recurrence",
    title: "Every closure halves the height, but never reaches zero",
    description:
      "The displayed apex path is exact. Its horizontal coordinate oscillates toward 4/3, while its continuous height is εₖ=2⁻⁽ᵏ⁺¹⁾.",
    formula:
      "αₖ=2/3+(−1)ᵏ⁺¹/(3·2ᵏ⁺¹),   εₖ=1/2ᵏ⁺¹",
    insight:
      "For every finite k, εₖ is strictly positive. Therefore Pᵏ still contains a point outside the mixed-integer hull y=0.",
    scene: infiniteSummaryScene(finalDisplayedInfiniteState, {
      showGap: true,
      extraPrimitives: convergencePrimitives,
    }),
    navigation: {
      closure: displayedInfiniteClosures,
      milestone: "closure",
    },
  },
  {
    id: "infinite-never-finishes",
    kicker: "Infinite rank · Conclusion",
    title: "There is no final finite split closure",
    description:
      "Each round applies genuine split disjunctions and produces a strictly tighter exact simplex, but its fractional apex always has y>0.",
    formula: "(Pˢᵖˡⁱᵗ)ᵏ ≠ conv(F)  for every finite k",
    insight:
      "Geometrically, the maximal lattice-free triangle in the y=0 integer-variable slice cannot be captured by finitely many rounds of split strips.",
    scene: infiniteSummaryScene(finalDisplayedInfiniteState, {
      showGap: true,
    }),
    navigation: {
      closure: displayedInfiniteClosures,
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
    "Inspect the exact sum and coordinate splits inside every displayed closure, then see the positive continuous height that remains after their full intersection.",
  stages: infiniteStages,
  proof: {
    title: "Why no finite split closure reaches the integer hull",
    steps: [
      "The relaxation is the simplex P(3,1/2,1/2) with fractional apex C₀=(1/2,1/2,1/2).",
      "Inside every closure, the sum split and the two coordinate splits cut the current apex and are convexified separately.",
      "Their exact intersection is another simplex P(3,αₖ,εₖ), with εₖ=εₖ₋₁/2.",
      "Consequently εₖ=1/2ᵏ⁺¹ is positive for every finite k.",
      "The mixed-integer hull lies in y=0, whereas Pᵏ contains the apex (αₖ,αₖ,εₖ) with y>0.",
      "Hence Pᵏ differs from conv(F) for every finite k.",
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
  duration: 32,
  accent: "#f49a4a",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: finiteStages,
  examples: [finiteExample, infiniteExample],
  proof: finiteExample.proof,
};

export default visualization;
