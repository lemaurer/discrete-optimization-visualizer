import type {
  Constraint,
  Point2D,
  Scene,
  SplitMembershipPhase,
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

/**
 * The rows are positively scaled to unit normal length. This does not change
 * the polyhedron, and it lets the drawn slack segments be read as Euclidean
 * distances to the corresponding facet.
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

function scene({
  x,
  phase,
  y,
  focusConstraintId,
  showLattice = true,
}: {
  x: Point2D;
  phase: SplitMembershipPhase;
  y?: Point2D;
  focusConstraintId?: string;
  showLattice?: boolean;
}): Scene {
  return {
    viewport,
    constraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showLattice,
    showVertices: false,
    splitMembership: {
      pi,
      pi0,
      x,
      y,
      phase,
      focusConstraintId,
      stripColor: "#e27c89",
      witnessColor: "#79c9c0",
      overlapColor: "#d4ef77",
      candidateColor: "#8f88dc",
    },
  };
}

const survivingStages: VisualizationStage[] = [
  {
    id: "survive-inside-strip",
    kicker: "Lemma 45 · Point inside the split",
    title: "Only points inside the strip need the criterion",
    description:
      "The point x belongs to P, but its split coordinate lies strictly between two consecutive integers. It may or may not survive the split convexification.",
    formula: "π₀<πᵀx<π₀+1,   α:=πᵀx−π₀∈(0,1)",
    insight:
      "Here π=(1,0), π₀=2, and x=(2.4,2.4), so α=0.4.",
    scene: scene({
      x: survivingPoint,
      phase: "setup",
    }),
  },
  {
    id: "survive-witness-region",
    kicker: "Lemma 45 · Slack budgets",
    title: "The vector inequality defines a witness polyhedron",
    description:
      "For fixed x, every row of A becomes a halfspace for the possible witness y. Their intersection with P is the animated region W(x).",
    formula: "W(x):={y∈P : b−Ay≤(b−Ax)/α}",
    insight:
      "A point y is allowed only when it respects the scaled slack budget of x in every constraint row.",
    scene: scene({
      x: survivingPoint,
      phase: "witness-region",
    }),
  },
  {
    id: "survive-overlap",
    kicker: "Lemma 45 · Existential condition",
    title: "Ask whether W(x) reaches the second split side",
    description:
      "The lemma does not require every point of π₂ to work. It requires at least one point that lies in both π₂ and W(x).",
    formula: "x∈P⁽π,π₀⁾ ⇔ W(x)∩π₂≠∅",
    insight:
      "The bright overlap is nonempty, so a valid witness exists.",
    scene: scene({
      x: survivingPoint,
      phase: "overlap",
    }),
  },
  {
    id: "survive-construct",
    kicker: "Lemma 45 · Geometric certificate",
    title: "Choose y and extrapolate through x",
    description:
      "Pick y in W(x)∩π₂ and define z=(x−αy)/(1−α). The animation extends the line from y through x until it reaches z.",
    formula: "z=(x−αy)/(1−α),   x=(1−α)z+αy",
    insight:
      "The split coordinate puts z in π₁; the slack inequality prevents z from leaving P.",
    scene: scene({
      x: survivingPoint,
      y: witness,
      phase: "construct",
    }),
  },
  {
    id: "survive-slacks",
    kicker: "Lemma 45 · Componentwise verification",
    title: "Check the slack inequality row by row",
    description:
      "Each bar compares the slack used by y with the allowance obtained by scaling the slack of x by 1/α.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α   for every i",
    insight:
      "All rows pass. The highlighted facet also shows the two slacks directly in the geometry.",
    scene: scene({
      x: survivingPoint,
      y: witness,
      phase: "slacks",
      focusConstraintId: "upper-left",
      showLattice: false,
    }),
  },
  {
    id: "survive-conclusion",
    kicker: "Lemma 45 · Conclusion",
    title: "The segment proves membership",
    description:
      "We found z∈π₁ and y∈π₂ with x=(1−α)z+αy. Hence x lies in the convex hull of the two split sides.",
    formula: "x∈conv(π₁∪π₂)=P⁽π,π₀⁾",
    insight:
      "The algebraic slack test and the geometric convex-combination certificate are equivalent.",
    scene: scene({
      x: survivingPoint,
      y: witness,
      phase: "conclusion",
    }),
  },
];

const cutOffStages: VisualizationStage[] = [
  {
    id: "cut-off-inside-strip",
    kicker: "Lemma 45 · A point that is removed",
    title: "This point also starts inside the split",
    description:
      "The point is feasible for P and has the same split coordinate α=0.4, but it lies close to the fractional apex of the relaxation.",
    formula: "x=(2.4,3.8),   α=0.4",
    insight:
      "Feasibility for P alone does not imply membership in the split polyhedron.",
    scene: scene({
      x: cutOffPoint,
      phase: "setup",
    }),
  },
  {
    id: "cut-off-witness-region",
    kicker: "Lemma 45 · Tighter slack budgets",
    title: "Small slacks make W(x) much narrower",
    description:
      "Because x is close to the upper facets, some entries of b−Ax are small. After division by α, they still leave little room for a possible witness.",
    formula: "W(x):={y∈P : b−Ay≤(b−Ax)/α}",
    insight:
      "The witness polyhedron remains to the left of the second split side.",
    scene: scene({
      x: cutOffPoint,
      phase: "witness-region",
    }),
  },
  {
    id: "cut-off-empty-overlap",
    kicker: "Lemma 45 · Empty intersection",
    title: "No point in π₂ satisfies all slack budgets",
    description:
      "The animated witness region and π₂ do not overlap. This rules out every possible witness y simultaneously.",
    formula: "W(x)∩π₂=∅",
    insight:
      "The failure is existential: there is no admissible right endpoint at all.",
    scene: scene({
      x: cutOffPoint,
      phase: "overlap",
    }),
  },
  {
    id: "cut-off-conclusion",
    kicker: "Lemma 45 · Conclusion",
    title: "The split convex hull cuts the point off",
    description:
      "Since no witness exists, x cannot be expressed as a convex combination of a point in π₁ and a point in π₂.",
    formula: "x∉P⁽π,π₀⁾",
    insight:
      "The new upper boundary of the split polyhedron lies below the fractional point.",
    scene: scene({
      x: cutOffPoint,
      phase: "conclusion",
    }),
  },
];

const survivingExample: VisualizationExample = {
  id: "witness-exists",
  title: "Witness exists — point survives",
  description:
    "Build W(x), locate a witness on π₂, and recover the segment certificate that keeps x in the split polyhedron.",
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
    "Apply the same characterization to a point near the fractional apex and see its witness region fail to reach π₂.",
  stages: cutOffStages,
  proof: {
    title: "Why an empty witness intersection proves nonmembership",
    steps: [
      "For fixed x, the inequality b−Ay≤(b−Ax)/α defines the witness polyhedron W(x).",
      "Lemma 45 says that membership is equivalent to the existence of y∈W(x)∩π₂.",
      "In this example W(x)∩π₂ is empty.",
      "Consequently no admissible right endpoint y and no corresponding left endpoint z exist.",
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
