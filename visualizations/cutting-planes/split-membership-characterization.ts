import {
  computeSplitMembershipGeometry,
  projectPointToConstraint,
} from "@/engine/splitMembership";
import type {
  Constraint,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-0.5, 4.6],
  y: [-0.5, 4.6],
};

const tableViewport: Scene["viewport"] = {
  x: [-0.5, 8.1],
  y: [-0.5, 4.6],
};

/**
 * The rows are positively scaled to unit normal length. This keeps the
 * componentwise slack values geometrically comparable to perpendicular
 * distances in the picture without changing the polyhedron.
 */
const constraints: Constraint[] = [
  {
    id: "bottom",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#79c9c0",
  },
  {
    id: "right",
    a: 1,
    b: 0,
    limit: 4,
    label: "x₁ ≤ 4",
    color: "#8f88dc",
  },
  {
    id: "upper-right",
    a: 15 / 17,
    b: 8 / 17,
    limit: 4,
    label: "3x₁+1.6x₂≤13.6",
    color: "#d4ef77",
  },
  {
    id: "upper-left",
    a: -5 / 13,
    b: 12 / 13,
    limit: 36 / 13,
    label: "−x₁+2.4x₂≤7.2",
    color: "#f49a4a",
  },
  {
    id: "left",
    a: -1,
    b: 0,
    limit: 0,
    label: "x₁ ≥ 0",
    color: "#e27c89",
  },
];

const pi: Point2D = [1, 0];
const pi0 = 2;
const survivingPoint: Point2D = [2.4, 2.4];
const witness: Point2D = [3.4, 1.8];
const cutOffPoint: Point2D = [2.4, 3.8];

const survivingGeometry = computeSplitMembershipGeometry({
  constraints,
  viewport,
  pi,
  pi0,
  x: survivingPoint,
  y: witness,
});

const cutOffGeometry = computeSplitMembershipGeometry({
  constraints,
  viewport,
  pi,
  pi0,
  x: cutOffPoint,
});

function format(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2);
}

function polygon(
  points: Point2D[],
  label: string,
  style: "feasible" | "integer-hull" | "removed",
): Primitive {
  return {
    kind: "polygon",
    points,
    label,
    style,
  };
}

function line(
  from: Point2D,
  to: Point2D,
  label: string,
  color: string,
  style: "constraint" | "objective" | "cut" = "cut",
): Primitive {
  return {
    kind: "line",
    from,
    to,
    label,
    color,
    style,
  };
}

function point(
  at: Point2D,
  label: string,
  style: "vertex" | "fractional" | "integer" | "optimum",
): Primitive {
  return {
    kind: "point",
    at,
    label,
    style,
  };
}

function text(
  at: Point2D,
  value: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return {
    kind: "label",
    at,
    text: value,
    tone,
  };
}

function splitPrimitives(
  geometry: typeof survivingGeometry,
  x: Point2D,
): Primitive[] {
  return [
    polygon(
      geometry.split.strip,
      "forbidden strip",
      "removed",
    ),
    line(
      geometry.split.lowerBoundary[0],
      geometry.split.lowerBoundary[1],
      "πᵀu=π₀",
      "#e27c89",
    ),
    line(
      geometry.split.upperBoundary[0],
      geometry.split.upperBoundary[1],
      "πᵀu=π₀+1",
      "#e27c89",
    ),
    point(x, "x", "fractional"),
    text(
      [x[0] + 0.45, x[1] - 0.22],
      `α=πᵀx−π₀=${format(geometry.alpha)}`,
      "accent",
    ),
  ];
}

function witnessRegionPrimitives(
  geometry: typeof survivingGeometry,
  x: Point2D,
): Primitive[] {
  return [
    ...splitPrimitives(geometry, x),
    polygon(
      geometry.witnessRegion,
      "W(x): all points satisfying the slack budgets",
      "feasible",
    ),
  ];
}

function overlapPrimitives(
  geometry: typeof survivingGeometry,
  x: Point2D,
): Primitive[] {
  const primitives: Primitive[] = [
    ...witnessRegionPrimitives(geometry, x),
    polygon(
      geometry.split.right,
      "π₂",
      "feasible",
    ),
  ];

  if (geometry.witnessRegionOnRight.length > 0) {
    primitives.push(
      polygon(
        geometry.witnessRegionOnRight,
        "W(x)∩π₂",
        "integer-hull",
      ),
    );
  } else {
    primitives.push(
      text(
        [3.45, 3.35],
        "W(x)∩π₂=∅",
        "accent",
      ),
    );
  }

  return primitives;
}

function constructionPrimitives(): Primitive[] {
  const z = survivingGeometry.z;
  if (!z) return [];

  const zxMidpoint: Point2D = [
    (z[0] + survivingPoint[0]) / 2,
    (z[1] + survivingPoint[1]) / 2,
  ];
  const xyMidpoint: Point2D = [
    (survivingPoint[0] + witness[0]) / 2,
    (survivingPoint[1] + witness[1]) / 2,
  ];

  return [
    ...overlapPrimitives(
      survivingGeometry,
      survivingPoint,
    ),
    line(
      z,
      witness,
      "x lies on [z,y]",
      "#8f88dc",
      "constraint",
    ),
    point(z, "z∈π₁", "integer"),
    point(witness, "y∈W(x)∩π₂", "optimum"),
    text(
      [zxMidpoint[0], zxMidpoint[1] + 0.18],
      `α=${format(survivingGeometry.alpha)}`,
      "muted",
    ),
    text(
      [xyMidpoint[0], xyMidpoint[1] + 0.18],
      `1−α=${format(1 - survivingGeometry.alpha)}`,
      "muted",
    ),
  ];
}

function slackTablePrimitives(): Primitive[] {
  const z = survivingGeometry.z;
  if (!z) return [];

  const focus = survivingGeometry.tests.find(
    (test) => test.constraint.id === "upper-left",
  );

  const primitives: Primitive[] = [
    ...constructionPrimitives(),
    text(
      [6.15, 4.15],
      "Row-by-row slack test",
      "default",
    ),
    text(
      [6.15, 3.83],
      "bᵢ−aᵢᵀy ≤ (bᵢ−aᵢᵀx)/α",
      "muted",
    ),
  ];

  survivingGeometry.tests.forEach((test, index) => {
    const y = 3.35 - index * 0.58;
    const mark = test.satisfied ? "✓" : "×";
    primitives.push(
      text(
        [6.15, y],
        `${test.constraint.label}: ${format(test.slackAtY)} ≤ ${format(test.allowance)} ${mark}`,
        test.satisfied ? "default" : "accent",
      ),
    );
  });

  if (focus) {
    const xBoundary = projectPointToConstraint(
      survivingPoint,
      focus.constraint,
    );
    const yBoundary = projectPointToConstraint(
      witness,
      focus.constraint,
    );

    primitives.push(
      line(
        survivingPoint,
        xBoundary,
        `slack at x: ${format(focus.slackAtX)}`,
        "#79c9c0",
      ),
      line(
        witness,
        yBoundary,
        `slack at y: ${format(focus.slackAtY)}`,
        "#8f88dc",
      ),
    );
  }

  return primitives;
}

function conclusionPrimitives(
  geometry: typeof survivingGeometry,
  x: Point2D,
  member: boolean,
): Primitive[] {
  return [
    ...splitPrimitives(geometry, x),
    polygon(
      geometry.split.splitHull,
      "P⁽π,π₀⁾",
      "integer-hull",
    ),
    text(
      [2.45, 4.32],
      member
        ? "W(x)∩π₂≠∅  ⇒  x∈P⁽π,π₀⁾"
        : "W(x)∩π₂=∅  ⇒  x∉P⁽π,π₀⁾",
      member ? "default" : "accent",
    ),
  ];
}

function scene(
  primitives: Primitive[],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport,
    constraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showLattice: true,
    showVertices: false,
    ...overrides,
  };
}

const survivingStages: VisualizationStage[] = [
  {
    id: "survive-inside-strip",
    kicker: "Lemma 45 · Point inside the split",
    title: "Only points inside the strip need a test",
    description:
      "The point x belongs to P, but its split coordinate lies strictly between two consecutive integers. It may or may not survive the split convexification.",
    formula: "π₀<πᵀx<π₀+1,   α:=πᵀx−π₀∈(0,1)",
    insight:
      "Here π=(1,0), π₀=2, and x=(2.4,2.4), so α=0.4.",
    scene: scene(
      splitPrimitives(
        survivingGeometry,
        survivingPoint,
      ),
    ),
  },
  {
    id: "survive-witness-region",
    kicker: "Lemma 45 · Slack budgets",
    title: "The vector inequality defines a second polyhedron",
    description:
      "For fixed x, every row of A gives a halfspace for the possible witness y. Their intersection with P is the witness region W(x).",
    formula: "W(x):={y∈P : b−Ay≤(b−Ax)/α}",
    insight:
      "A point y is allowed only when it does not use more than the scaled slack budget of x in any constraint row.",
    scene: scene(
      witnessRegionPrimitives(
        survivingGeometry,
        survivingPoint,
      ),
    ),
  },
  {
    id: "survive-overlap",
    kicker: "Lemma 45 · Existential condition",
    title: "Ask whether the witness region reaches π₂",
    description:
      "The lemma does not require every point in π₂ to work. It requires one point that lies both in π₂ and in W(x).",
    formula: "x∈P⁽π,π₀⁾ ⇔ W(x)∩π₂≠∅",
    insight:
      "The highlighted overlap is nonempty, so a valid witness exists.",
    scene: scene(
      overlapPrimitives(
        survivingGeometry,
        survivingPoint,
      ),
    ),
  },
  {
    id: "survive-construct",
    kicker: "Lemma 45 · Construct the left endpoint",
    title: "Choose y and extrapolate through x",
    description:
      "After choosing y in the overlap, define z=(x−αy)/(1−α). The slack condition guarantees z∈P, while y∈π₂ forces z onto the left side π₁.",
    formula: "z=(x−αy)/(1−α),   x=(1−α)z+αy",
    insight:
      "The witness inequality is exactly what prevents the extrapolated point z from leaving P.",
    scene: scene(constructionPrimitives()),
  },
  {
    id: "survive-slacks",
    kicker: "Lemma 45 · Componentwise verification",
    title: "Check every constraint row",
    description:
      "The inequality is componentwise. The right-hand side is the slack of x enlarged by 1/α; the witness y must stay below that allowance in every row.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α   for all i",
    insight:
      "All five rows pass, so the chosen y certifies membership.",
    scene: scene(
      slackTablePrimitives(),
      {
        viewport: tableViewport,
        showConstraints: false,
        showLattice: false,
      },
    ),
  },
  {
    id: "survive-conclusion",
    kicker: "Lemma 45 · Conclusion",
    title: "The segment proves membership",
    description:
      "We found z∈π₁ and y∈π₂ with x=(1−α)z+αy. Therefore x lies in the convex hull of the two split sides.",
    formula: "x∈conv(π₁∪π₂)=P⁽π,π₀⁾",
    insight:
      "The algebraic slack test and the geometric segment statement are the same certificate.",
    scene: scene(
      conclusionPrimitives(
        survivingGeometry,
        survivingPoint,
        true,
      ),
    ),
  },
];

const cutOffStages: VisualizationStage[] = [
  {
    id: "cut-off-inside-strip",
    kicker: "Lemma 45 · A point that is removed",
    title: "This point also starts inside the split",
    description:
      "The point is feasible for P and has the same split coordinate α=0.4, but it lies closer to the fractional apex of the relaxation.",
    formula: "x=(2.4,3.8),   α=0.4",
    insight:
      "Being inside P and inside the strip is not enough to survive the split.",
    scene: scene(
      splitPrimitives(
        cutOffGeometry,
        cutOffPoint,
      ),
    ),
  },
  {
    id: "cut-off-witness-region",
    kicker: "Lemma 45 · Tighter slack budgets",
    title: "The available witness region becomes smaller",
    description:
      "Because x is close to the upper facets, some entries of b−Ax are small. Dividing by α leaves little room for a possible y.",
    formula: "W(x):={y∈P : b−Ay≤(b−Ax)/α}",
    insight:
      "The witness region remains entirely to the left of the second split side.",
    scene: scene(
      witnessRegionPrimitives(
        cutOffGeometry,
        cutOffPoint,
      ),
    ),
  },
  {
    id: "cut-off-empty-overlap",
    kicker: "Lemma 45 · Empty intersection",
    title: "No point in π₂ satisfies all slack budgets",
    description:
      "The witness region W(x) and the right split polyhedron π₂ do not overlap. Therefore the existential condition in the lemma fails.",
    formula: "W(x)∩π₂=∅",
    insight:
      "This rules out every possible witness y at once, not merely one unsuccessful candidate.",
    scene: scene(
      overlapPrimitives(
        cutOffGeometry,
        cutOffPoint,
      ),
    ),
  },
  {
    id: "cut-off-conclusion",
    kicker: "Lemma 45 · Conclusion",
    title: "The split convex hull cuts the point off",
    description:
      "Since no witness exists on the right side, x cannot be expressed as a convex combination of one point from π₁ and one point from π₂.",
    formula: "x∉P⁽π,π₀⁾",
    insight:
      "The new upper edge of the split polyhedron lies below the fractional point.",
    scene: scene(
      conclusionPrimitives(
        cutOffGeometry,
        cutOffPoint,
        false,
      ),
    ),
  },
];

const survivingExample: VisualizationExample = {
  id: "witness-exists",
  title: "Witness exists — point survives",
  description:
    "Build the witness region, choose y∈π₂, and recover the convex combination that keeps x in the split polyhedron.",
  stages: survivingStages,
  proof: {
    title: "Why the witness certifies membership",
    steps: [
      "Set α=πᵀx−π₀ and choose y∈π₂ satisfying the componentwise slack inequality.",
      "Define z=(x−αy)/(1−α), so x=(1−α)z+αy.",
      "Because πᵀy≥π₀+1, the split coordinate of z is at most π₀.",
      "The slack inequality implies Az≤b, hence z∈P and therefore z∈π₁.",
      "Thus x is a convex combination of a point in π₁ and a point in π₂.",
    ],
  },
};

const cutOffExample: VisualizationExample = {
  id: "no-witness",
  title: "No witness — point is cut off",
  description:
    "See the same characterization reject a point near the fractional apex because its witness region never reaches π₂.",
  stages: cutOffStages,
  proof: {
    title: "Why an empty witness intersection proves nonmembership",
    steps: [
      "For fixed x, the inequality b−Ay≤(b−Ax)/α defines the witness region W(x).",
      "Lemma 45 states that membership is equivalent to the existence of y∈W(x)∩π₂.",
      "In this example W(x)∩π₂ is empty.",
      "Consequently there is no admissible right endpoint y and no corresponding left endpoint z.",
      "Therefore x is outside the split polyhedron.",
    ],
  },
};

const visualization: VisualizationDefinition = {
  id: "split-membership-characterization",
  title: "Membership Inside a Split",
  shortTitle: "Split membership",
  chapter: "Cutting planes",
  order: 4,
  description:
    "Visualize Lemma 45 by turning the componentwise slack inequality into a witness polyhedron and testing whether it reaches the second side of the split.",
  difficulty: "Advanced",
  duration: 12,
  accent: "#79c9c0",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: survivingStages,
  examples: [survivingExample, cutOffExample],
  proof: survivingExample.proof,
};

export default visualization;
