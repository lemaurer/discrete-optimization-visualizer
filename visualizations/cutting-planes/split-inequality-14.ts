import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const viewport: Scene["viewport"] = {
  x: [-1.25, 2.25],
  y: [-0.28, 1.22],
};

const tentConstraints: Scene["constraints"] = [
  {
    id: "left-roof",
    a: -2,
    b: 3,
    limit: 2,
    label: "−2x₁+3x₂≤2",
    color: "#f49a4a",
  },
  {
    id: "right-roof",
    a: 2,
    b: 3,
    limit: 4,
    label: "2x₁+3x₂≤4",
    color: "#8f88dc",
  },
  {
    id: "floor",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂≥0",
    color: "#79c9c0",
  },
];

const splitHull: Point2D[] = [
  [-1, 0],
  [2, 0],
  [1, 2 / 3],
  [0, 2 / 3],
];

const removedCap: Point2D[] = [
  [0, 2 / 3],
  [0.5, 1],
  [1, 2 / 3],
];

const leftPiece: Point2D[] = [
  [-1, 0],
  [0, 0],
  [0, 2 / 3],
];

const rightPiece: Point2D[] = [
  [1, 0],
  [2, 0],
  [1, 2 / 3],
];

const splitCutLine: Primitive = {
  kind: "line",
  from: [-1.15, 2 / 3],
  to: [2.15, 2 / 3],
  label: "inequality (14): x₂≤2/3",
  style: "cut",
  color: "#e27c89",
  animate: true,
};

function tentScene(
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport,
    constraints: tentConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    latticeMode: "x-lines",
    axisLabels: { x: "x₁ (integer)", y: "x₂" },
    caption: {
      primary: "A tent polyhedron crossing the split 0<x₁<1",
      secondary: "π=(1,0), π₀=0, and only x₁ is integral",
    },
    ...overrides,
  };
}

const concreteStages: VisualizationStage[] = [
  {
    id: "split14-tent-polyhedron",
    kicker: "Inequality (14) · Setup",
    title: "Start with a polyhedron that rises through the split strip",
    description:
      "The relaxation P is the triangle with vertices (−1,0), (2,0), and (1/2,1). The split keeps x₁≤0 or x₁≥1, while the open strip 0<x₁<1 contains the fractional roof.",
    formula: "P={x:Ax≤b},   x₁≤0  ∨  x₁≥1",
    insight:
      "The split disjunction removes the middle before convexification. The inequality must describe the convex hull of the two surviving side pieces.",
    scene: tentScene([], {
      splitProjection: {
        pi: [1, 0],
        pi0: 0,
        phase: "lift-strip",
        color: "#8f88dc",
        stripColor: "#e27c89",
      },
    }),
  },
  {
    id: "split14-choose-u",
    kicker: "Inequality (14) · Choose u",
    title: "Combine the two roof inequalities with opposite signs",
    description:
      "Take u=(−1/4,1/4,0). Then uᵀA=(1,0)=πᵀ and uᵀb=1/2, so π₀=⌊uᵀb⌋=0 and f=uᵀb−π₀=1/2.",
    formula: "u=(−1/4,1/4,0),   uᵀA=πᵀ,   f=1/2",
    insight:
      "The positive part u⁺ selects the right roof slack; the negative part u⁻ selects the left roof slack.",
    scene: tentScene([
      {
        kind: "label",
        at: [-0.95, 1.04],
        text: "u⁻=1/4 on left roof",
        tone: "accent",
      },
      {
        kind: "label",
        at: [1.12, 1.04],
        text: "u⁺=1/4 on right roof",
        tone: "accent",
      },
      {
        kind: "point",
        at: [0.5, 1],
        label: "fractional roof point",
        style: "fractional",
      },
    ]),
  },
  {
    id: "split14-slacks",
    kicker: "Inequality (14) · Normalize slacks",
    title: "Each side contributes a normalized slack budget",
    description:
      "Let s₁=2+2x₁−3x₂ and s₂=4−2x₁−3x₂ be the two roof slacks. Because f=1/2, inequality (14) becomes one half of each slack, summed and compared with one.",
    formula: "(1/2)s₂+(1/2)s₁≥1",
    insight:
      "The denominators f and 1−f normalize how far uᵀb lies from the two neighboring integers π₀ and π₀+1.",
    scene: tentScene([
      {
        kind: "line",
        from: [-1, 0],
        to: [0.5, 1],
        label: "s₁=2+2x₁−3x₂",
        style: "constraint",
        color: "#f49a4a",
        animate: true,
      },
      {
        kind: "line",
        from: [0.5, 1],
        to: [2, 0],
        label: "s₂=4−2x₁−3x₂",
        style: "constraint",
        color: "#8f88dc",
        animate: true,
      },
    ]),
  },
  {
    id: "split14-simplify",
    kicker: "Inequality (14) · Simplify",
    title: "The abstract slack inequality becomes a horizontal cut",
    description:
      "Adding the two roof slacks cancels x₁: s₁+s₂=6−6x₂. Therefore inequality (14) is exactly x₂≤2/3.",
    formula: "(1/2)(s₁+s₂)=3−3x₂≥1  ⇔  x₂≤2/3",
    insight:
      "The cancellation uᵀA=πᵀ makes the cut depend on the split geometry rather than on the individual row descriptions.",
    scene: tentScene([splitCutLine]),
  },
  {
    id: "split14-left-branch",
    kicker: "Inequality (14) · Left disjunct",
    title: "Every point with x₁≤0 satisfies the inequality",
    description:
      "For x₁≤0, uᵀb−πᵀx=1/2−x₁ is at least f=1/2. The remaining normalized slack term is nonnegative, so the left branch contributes at least one unit in total.",
    formula: "x₁≤0 ⇒ uᵀb−πᵀx≥f ⇒ LHS(14)≥1",
    insight:
      "Geometrically, the complete left surviving triangle lies below the cut x₂=2/3 and touches it only at (0,2/3).",
    scene: tentScene([
      {
        kind: "polygon",
        points: leftPiece,
        label: "left surviving piece",
        style: "integer-hull",
        fromPoints: [[0, 0], [0, 0], [0, 0]],
      },
      splitCutLine,
      {
        kind: "point",
        at: [0, 2 / 3],
        label: "LHS=1",
        style: "optimum",
      },
    ], {
      showFeasibleRegion: false,
      showConstraints: false,
    }),
  },
  {
    id: "split14-right-branch",
    kicker: "Inequality (14) · Right disjunct",
    title: "Every point with x₁≥1 satisfies it for the symmetric reason",
    description:
      "For x₁≥1, πᵀx−uᵀb=x₁−1/2 is at least 1−f=1/2. Again the other slack contribution is nonnegative, so the right branch also satisfies inequality (14).",
    formula: "x₁≥1 ⇒ πᵀx−uᵀb≥1−f ⇒ LHS(14)≥1",
    insight:
      "The right surviving triangle touches the same cut at (1,2/3). The two branch proofs are mirror images.",
    scene: tentScene([
      {
        kind: "polygon",
        points: rightPiece,
        label: "right surviving piece",
        style: "integer-hull",
        fromPoints: [[1, 0], [1, 0], [1, 0]],
      },
      splitCutLine,
      {
        kind: "point",
        at: [1, 2 / 3],
        label: "LHS=1",
        style: "optimum",
      },
    ], {
      showFeasibleRegion: false,
      showConstraints: false,
    }),
  },
  {
    id: "split14-convexify",
    kicker: "Inequality (14) · Convexity",
    title: "Validity on both branches implies validity on their convex hull",
    description:
      "Every point of P⁽π,π₀⁾ is a convex combination of a left-branch point and a right-branch point. Because the inequality is linear and valid on both pieces, it remains valid after convexification.",
    formula: "P⁽π,π₀⁾=conv(P₁∪P₂) ⊆ {x:x₂≤2/3}",
    insight:
      "The segment joining (0,2/3) and (1,2/3) is refilled by convexification even though it lies inside the open split strip.",
    scene: tentScene([
      {
        kind: "polygon",
        points: splitHull,
        label: "P⁽π,π₀⁾",
        style: "integer-hull",
        fromPoints: [...leftPiece, [0, 2 / 3]],
      },
      splitCutLine,
      {
        kind: "line",
        from: [0, 2 / 3],
        to: [1, 2 / 3],
        label: "convexification refills the strip",
        style: "objective",
        color: "#79c9c0",
        animate: true,
      },
    ], {
      showFeasibleRegion: false,
      showConstraints: false,
    }),
  },
  {
    id: "split14-test-points",
    kicker: "Inequality (14) · Test points",
    title: "High strip points violate; low strip points may survive",
    description:
      "At the roof point (1/2,1), the normalized slack sum is 0, so the point is cut off. At (1/2,1/2), the value is 3/2, so the point satisfies the inequality and belongs to the split hull.",
    formula: "LHS(1/2,1)=0<1,   LHS(1/2,1/2)=3/2≥1",
    insight:
      "Inequality (14) does not reject every point with 0<x₁<1. It rejects exactly the portion of P that lies outside the convex hull of the two surviving branches.",
    scene: tentScene([
      {
        kind: "polygon",
        points: splitHull,
        label: "split hull",
        style: "integer-hull",
      },
      {
        kind: "polygon",
        points: removedCap,
        label: "violating cap",
        style: "removed",
        fromPoints: [[0.5, 1], [0.5, 1], [0.5, 1]],
      },
      splitCutLine,
      {
        kind: "point",
        at: [0.5, 1],
        label: "violates: 0<1",
        style: "fractional",
      },
      {
        kind: "point",
        at: [0.5, 0.5],
        label: "survives: 1.5≥1",
        style: "optimum",
      },
    ], {
      showFeasibleRegion: false,
      showConstraints: false,
      splitProjection: {
        pi: [1, 0],
        pi0: 0,
        phase: "lift-strip",
        color: "#8f88dc",
        stripColor: "#e27c89",
      },
    }),
  },
];

const slackConstraints: Scene["constraints"] = [
  {
    id: "alpha-nonnegative",
    a: -1,
    b: 0,
    limit: 0,
    label: "α≥0",
    color: "#f49a4a",
  },
  {
    id: "beta-nonnegative",
    a: 0,
    b: -1,
    limit: 0,
    label: "β≥0",
    color: "#8f88dc",
  },
];

function slackScene(
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-0.18, 2.05], y: [-0.18, 2.05] },
    constraints: slackConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: false,
    axisLabels: {
      x: "α=(u⁺)ᵀ(b−Ax)/f",
      y: "β=(u⁻)ᵀ(b−Ax)/(1−f)",
    },
    caption: {
      primary: "Normalized slack space",
      secondary: "inequality (14) is the halfspace α+β≥1",
    },
    ...overrides,
  };
}

const slackBoundary: Primitive = {
  kind: "line",
  from: [0, 1],
  to: [1, 0],
  label: "α+β=1",
  style: "cut",
  color: "#e27c89",
  animate: true,
};

const slackStages: VisualizationStage[] = [
  {
    id: "split14-slack-coordinates",
    kicker: "Inequality (14) · Slack-space view",
    title: "Treat the two normalized terms as coordinates",
    description:
      "Write α=(u⁺)ᵀ(b−Ax)/f and β=(u⁻)ᵀ(b−Ax)/(1−f). Feasibility of x∈P makes both coordinates nonnegative.",
    formula: "α≥0,   β≥0",
    insight:
      "The complicated-looking split inequality is simply α+β≥1 in these coordinates.",
    scene: slackScene([
      {
        kind: "vector",
        from: [0, 0],
        to: [1.8, 0],
        label: "positive-multiplier slack",
        color: "#f49a4a",
        animate: true,
      },
      {
        kind: "vector",
        from: [0, 0],
        to: [0, 1.8],
        label: "negative-multiplier slack",
        color: "#8f88dc",
        animate: true,
      },
    ]),
  },
  {
    id: "split14-slack-branches",
    kicker: "Inequality (14) · Two disjuncts",
    title: "The two split branches land on opposite sides of the budget line",
    description:
      "The tight point of the left branch maps to (1,0), while the tight point of the right branch maps to (0,1). All other points on either branch have at least as much normalized slack.",
    formula: "P₁→α+β≥1,   P₂→α+β≥1",
    insight:
      "Each branch pays the unit budget in a different way: one through α, the other through β.",
    scene: slackScene([
      slackBoundary,
      {
        kind: "point",
        at: [1, 0],
        label: "left branch: (1,0)",
        style: "integer",
      },
      {
        kind: "point",
        at: [0, 1],
        label: "right branch: (0,1)",
        style: "integer",
      },
    ]),
  },
  {
    id: "split14-slack-convexity",
    kicker: "Inequality (14) · Convex combinations",
    title: "Convexifying the branches fills the boundary segment",
    description:
      "A convex combination of the two tight branch points traces the segment α+β=1. Convex combinations with additional slack stay above this line.",
    formula: "λ(1,0)+(1−λ)(0,1)=(λ,1−λ)",
    insight:
      "This is the normalized-slack version of the horizontal segment that reappears inside the original split strip.",
    scene: slackScene([
      slackBoundary,
      {
        kind: "vector",
        from: [1, 0],
        to: [0, 1],
        label: "convex combinations",
        color: "#79c9c0",
        animate: true,
      },
      {
        kind: "point",
        at: [0.5, 0.5],
        label: "boundary mixture",
        style: "optimum",
      },
    ]),
  },
  {
    id: "split14-slack-rejection",
    kicker: "Inequality (14) · Rejected region",
    title: "Only points below the unit-budget line are cut off",
    description:
      "The roof point has zero slack in both roof inequalities and maps to (0,0), below α+β=1. The lower strip point maps to (3/4,3/4), above the line, and therefore survives.",
    formula: "roof→(0,0),   lower point→(3/4,3/4)",
    insight:
      "The open split strip and the violating region are not identical. The cut is determined by insufficient normalized slack, not merely by the split coordinate being fractional.",
    scene: slackScene([
      {
        kind: "polygon",
        points: [[0, 0], [1, 0], [0, 1]],
        label: "α+β<1: cut off",
        style: "removed",
        fromPoints: [[0, 0], [0, 0], [0, 0]],
      },
      slackBoundary,
      {
        kind: "point",
        at: [0, 0],
        label: "roof point violates",
        style: "fractional",
      },
      {
        kind: "point",
        at: [0.75, 0.75],
        label: "lower strip point survives",
        style: "optimum",
      },
    ], {
      showFeasibleRegion: false,
      showConstraints: false,
    }),
  },
];

const concreteExample: VisualizationExample = {
  id: "tent-polyhedron",
  title: "Concrete tent polyhedron",
  description:
    "Compute inequality (14) explicitly, verify it on both split branches, convexify, and test one rejected and one surviving point inside the open strip.",
  stages: concreteStages,
};

const slackExample: VisualizationExample = {
  id: "normalized-slack-space",
  title: "Normalized slack-space interpretation",
  description:
    "Turn the two fractions in inequality (14) into coordinates α and β, where the entire argument becomes the simple unit-budget inequality α+β≥1.",
  stages: slackStages,
};

const visualization: VisualizationDefinition = {
  id: "split-inequality-14",
  title: "Why Split Inequality (14) Works",
  shortTitle: "Split inequality (14)",
  chapter: "Cutting planes",
  order: 5,
  description:
    "Follow Lemma 47 from the notes: normalize positive and negative multiplier slacks, prove validity on each side of the split, and use convexity to obtain a valid inequality for P⁽π,π₀⁾.",
  difficulty: "Advanced",
  duration: 18,
  accent: "#e27c89",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: concreteStages,
  examples: [concreteExample, slackExample],
  proof: {
    title: "The proof of validity from Lemma 47",
    steps: [
      "Choose u with uᵀA=πᵀ, π₀=⌊uᵀb⌋, and f=uᵀb−π₀∈(0,1).",
      "Write inequality (14) as (1−f)(u⁺)ᵀ(b−Ax)+f(u⁻)ᵀ(b−Ax)≥f(1−f).",
      "For x in the left branch πᵀx≤π₀, use uᵀb−πᵀx≥f and the nonnegativity of (u⁻)ᵀ(b−Ax).",
      "For x in the right branch πᵀx≥π₀+1, use πᵀx−uᵀb≥1−f and the nonnegativity of (u⁺)ᵀ(b−Ax).",
      "Thus the inequality is valid on both P₁ and P₂.",
      "A linear inequality valid on two sets is valid on conv(P₁∪P₂)=P⁽π,π₀⁾.",
      "Points in the open strip may still satisfy the inequality when convexification reconstructs them; only points outside the split hull are necessarily rejected by a complete description.",
    ],
  },
};

export default visualization;
