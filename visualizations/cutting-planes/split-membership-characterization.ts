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
    kicker: "Lemma 45 · Start",
    title: "Place x inside the open split strip",
    description:
      "The point x is feasible for P and lies strictly between the two split hyperplanes. At this stage we only identify the point and the strip; α has not been introduced yet.",
    formula: "x∈P,   π₀<πᵀx<π₀+1",
    insight:
      "The question is whether x is recovered when the two surviving sides are convexified.",
    scene: scene({
      x: survivingPoint,
      phase: "setup",
    }),
  },
  {
    id: "survive-split-coordinate",
    kicker: "Lemma 45 · Split coordinate",
    title: "Project x onto the π-axis",
    description:
      "The animation projects x onto span(π). Its position on that axis represents the scalar split coordinate πᵀx.",
    formula: "πᵀx=2.4",
    insight:
      "The second picture is now genuinely different: the geometry is reduced to the one-dimensional split coordinate.",
    scene: scene({
      x: survivingPoint,
      phase: "split-coordinate",
    }),
  },
  {
    id: "survive-alpha",
    kicker: "Lemma 45 · Define α",
    title: "α is the distance from π₀ to πᵀx in split coordinates",
    description:
      "Only now do we introduce α. The highlighted segment begins at the lower integer threshold π₀ and ends at the projected value πᵀx.",
    formula: "α:=πᵀx−π₀=2.4−2=0.4",
    insight:
      "Because x lies inside the strip, α is automatically between 0 and 1.",
    scene: scene({
      x: survivingPoint,
      phase: "alpha-distance",
    }),
  },
  {
    id: "survive-slack-budget",
    kicker: "Lemma 45 · One constraint row",
    title: "Measure the slack of x in one facet",
    description:
      "For a row aᵢᵀu≤bᵢ, the segment from x to the facet represents bᵢ−aᵢᵀx. Dividing this slack by α gives the maximum slack allowed for a witness y.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α",
    insight:
      "The denominator is no longer mysterious: it is the α visualized in the preceding stage.",
    scene: scene({
      x: survivingPoint,
      phase: "slack-budget",
      focusConstraintId: "upper-right",
    }),
  },
  {
    id: "survive-first-witness-row",
    kicker: "Lemma 45 · First witness halfspace",
    title: "One slack budget becomes a region for y",
    description:
      "Rearranging the selected component inequality produces one halfspace in the y-plane. The blue region contains exactly the witnesses allowed by this row.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α",
    insight:
      "A single row usually leaves many possible witnesses.",
    scene: scene({
      x: survivingPoint,
      phase: "witness-row",
      focusConstraintId: "upper-right",
    }),
  },
  {
    id: "survive-second-witness-row",
    kicker: "Lemma 45 · Another witness halfspace",
    title: "A different row restricts y in another direction",
    description:
      "The second highlighted constraint produces a different witness halfspace. The final witness set must satisfy both of these and every remaining row simultaneously.",
    formula: "bⱼ−aⱼᵀy≤(bⱼ−aⱼᵀx)/α",
    insight:
      "The vector inequality is componentwise: every row contributes its own geometric restriction.",
    scene: scene({
      x: survivingPoint,
      phase: "witness-row",
      focusConstraintId: "upper-left",
    }),
  },
  {
    id: "survive-witness-region",
    kicker: "Lemma 45 · Intersect all rows",
    title: "Watch the witness polyhedron W(x) form row by row",
    description:
      "The animation successively adds all witness halfspaces. Their intersection with P is the complete set W(x).",
    formula: "W(x):={y∈P:b−Ay≤(b−Ax)/α}",
    insight:
      "Each new row can only shrink the set of admissible witnesses.",
    scene: scene({
      x: survivingPoint,
      phase: "witness-region",
    }),
  },
  {
    id: "survive-overlap",
    kicker: "Lemma 45 · Existential test",
    title: "Check whether W(x) reaches π₂",
    description:
      "The violet region is the right split side π₂. The bright overlap consists of witnesses that satisfy both the slack inequality and πᵀy≥π₀+1.",
    formula: "W(x)∩π₂≠∅",
    insight:
      "The overlap is nonempty, so at least one valid witness exists.",
    scene: scene({
      x: survivingPoint,
      phase: "overlap",
    }),
  },
  {
    id: "survive-select-witness",
    kicker: "Lemma 45 · Choose a witness",
    title: "Select one point y from the overlap",
    description:
      "The existential statement requires only one witness. The animation selects y from W(x)∩π₂ before constructing the point on the opposite split side.",
    formula: "y∈P,   πᵀy≥π₀+1,   b−Ay≤(b−Ax)/α",
    insight:
      "All three properties are visible in the location of y.",
    scene: scene({
      x: survivingPoint,
      y: witness,
      phase: "select-witness",
    }),
  },
  {
    id: "survive-construct",
    kicker: "Lemma 45 · Construct z",
    title: "Extrapolate from y through x to the left side",
    description:
      "Define z=(x−αy)/(1−α). The line grows from y through x until it reaches z. The split-coordinate calculation places z in π₁.",
    formula: "z=(x−αy)/(1−α),   x=(1−α)z+αy",
    insight:
      "The slack inequality is precisely what guarantees that this extrapolated point still lies in P.",
    scene: scene({
      x: survivingPoint,
      y: witness,
      phase: "construct",
    }),
  },
  {
    id: "survive-slacks",
    kicker: "Lemma 45 · Verify all rows",
    title: "Compare every slack with its α-scaled budget",
    description:
      "The panel checks the vector inequality component by component. A highlighted facet also shows the corresponding slacks directly in the polyhedron.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α   for every i",
    insight:
      "All rows pass, so the chosen y is a valid certificate.",
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
      "We found z∈π₁ and y∈π₂ with x=(1−α)z+αy. Therefore x belongs to the convex hull of the two split sides.",
    formula: "x∈conv(π₁∪π₂)=P⁽π,π₀⁾",
    insight:
      "The witness inequality and the geometric convex-combination certificate are the same statement in two forms.",
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
    kicker: "Lemma 45 · Start",
    title: "Place a second feasible point inside the strip",
    description:
      "This point is also feasible for P and lies in the same split strip, but it is much closer to the fractional apex.",
    formula: "x=(2.4,3.8),   2<πᵀx<3",
    insight:
      "No conclusion about split membership has been made yet.",
    scene: scene({
      x: cutOffPoint,
      phase: "setup",
    }),
  },
  {
    id: "cut-off-split-coordinate",
    kicker: "Lemma 45 · Split coordinate",
    title: "Project the second point onto the π-axis",
    description:
      "The projection again gives πᵀx=2.4. The two examples therefore have the same α even though their positions inside P are different.",
    formula: "πᵀx=2.4",
    insight:
      "The difference between the examples comes from the constraint slacks, not from the split coordinate.",
    scene: scene({
      x: cutOffPoint,
      phase: "split-coordinate",
    }),
  },
  {
    id: "cut-off-alpha",
    kicker: "Lemma 45 · Define α",
    title: "Compute the same α explicitly",
    description:
      "The highlighted split-coordinate segment again runs from π₀=2 to πᵀx=2.4.",
    formula: "α:=πᵀx−π₀=2.4−2=0.4",
    insight:
      "The denominator is identical in both examples.",
    scene: scene({
      x: cutOffPoint,
      phase: "alpha-distance",
    }),
  },
  {
    id: "cut-off-slack-budget",
    kicker: "Lemma 45 · Tight upper facet",
    title: "The point has almost no slack near the apex",
    description:
      "The highlighted upper-right constraint is nearly tight at x. Even after division by α, its witness budget remains very small.",
    formula: "(bᵢ−aᵢᵀx)/α≈0.24",
    insight:
      "This tiny budget is what makes the witness set fail to reach the other side of the split.",
    scene: scene({
      x: cutOffPoint,
      phase: "slack-budget",
      focusConstraintId: "upper-right",
    }),
  },
  {
    id: "cut-off-first-witness-row",
    kicker: "Lemma 45 · First restrictive row",
    title: "The first witness halfspace is already narrow",
    description:
      "The upper-right row allows y only in the displayed blue region. Compare its size with the corresponding stage of the surviving example.",
    formula: "bᵢ−aᵢᵀy≤(bᵢ−aᵢᵀx)/α",
    insight:
      "The picture now changes because the slack vector b−Ax has changed.",
    scene: scene({
      x: cutOffPoint,
      phase: "witness-row",
      focusConstraintId: "upper-right",
    }),
  },
  {
    id: "cut-off-second-witness-row",
    kicker: "Lemma 45 · Second restrictive row",
    title: "Another upper facet closes the remaining escape",
    description:
      "The upper-left row supplies a second narrow witness halfspace. A valid witness must satisfy both upper restrictions.",
    formula: "bⱼ−aⱼᵀy≤(bⱼ−aⱼᵀx)/α",
    insight:
      "The two small upper slacks encode that x lies close to the fractional apex.",
    scene: scene({
      x: cutOffPoint,
      phase: "witness-row",
      focusConstraintId: "upper-left",
    }),
  },
  {
    id: "cut-off-witness-region",
    kicker: "Lemma 45 · Intersect all rows",
    title: "The complete witness region stays on the left",
    description:
      "All row halfspaces are added one after another. Their intersection W(x) never reaches the second split side.",
    formula: "W(x):={y∈P:b−Ay≤(b−Ax)/α}",
    insight:
      "This stage is visually distinct from the starting polyhedron because W(x) is now drawn explicitly and formed progressively.",
    scene: scene({
      x: cutOffPoint,
      phase: "witness-region",
    }),
  },
  {
    id: "cut-off-empty-overlap",
    kicker: "Lemma 45 · Empty intersection",
    title: "W(x) and π₂ do not meet",
    description:
      "The violet right side and the blue witness region remain disjoint. Thus no point y can satisfy all requirements simultaneously.",
    formula: "W(x)∩π₂=∅",
    insight:
      "The failure is existential: every possible witness is ruled out at once.",
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
      "Since no witness exists, x cannot be expressed as a convex combination of one point in π₁ and one point in π₂.",
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
    "Derive α visibly, build W(x) row by row, select a witness in π₂, and recover the segment certificate.",
  stages: survivingStages,
  proof: {
    title: "Why the witness certifies membership",
    steps: [
      "Compute the split coordinate and set α=πᵀx−π₀∈(0,1).",
      "Choose y∈π₂ satisfying b−Ay≤(b−Ax)/α componentwise.",
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
    "Use the same explicit α construction, then see the much tighter slack budgets prevent W(x) from reaching π₂.",
  stages: cutOffStages,
  proof: {
    title: "Why an empty witness intersection proves nonmembership",
    steps: [
      "Compute α=πᵀx−π₀ from the projected split coordinate.",
      "For fixed x, the componentwise inequalities define the witness polyhedron W(x).",
      "The small slacks near the upper facets make W(x) too narrow to reach π₂.",
      "Therefore W(x)∩π₂ is empty.",
      "No admissible right endpoint y and no corresponding left endpoint z exist.",
      "Hence x lies outside the split polyhedron.",
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
    "Visualize Lemma 45 from the split coordinate and α through the row-wise witness inequalities to the final convex-combination certificate.",
  difficulty: "Advanced",
  duration: 20,
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
