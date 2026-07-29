import type {
  Mesh3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
} from "@/engine/types";
import type { VisualizationStage } from "@/visualizations/types";

const faceConstraints: Scene["constraints"] = [
  { id: "left", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "lower-edge", a: 1, b: -1, limit: 0, label: "x₂≥x₁", color: "#8f88dc" },
  { id: "upper-edge", a: 2, b: -1, limit: 1, label: "x₂≥2x₁−1", color: "#f49a4a" },
  { id: "top", a: 0, b: 1, limit: 2, label: "x₂≤2", color: "#e27c89" },
];

const xHat: Point2D = [0, 0];
const yStar: Point2D = [1.5, 2];
const xStar: Point2D = [1, 1];
const uOne: Point2D = [1, 1];
const uTwo: Point2D = [1, 2];

function faceScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.45, 2.15], y: [-0.45, 2.45] },
    constraints: faceConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Projection of the optimal face used in Theorem 34",
      secondary: "x̂=(0,0), y*=(3/2,2), both vertices",
    },
    ...overrides,
  };
}

const theorem34ConeConstraints: Scene["constraints"] = [
  { id: "positive-first", a: -1, b: 0, limit: 0, label: "u₁≥0", color: "#79c9c0" },
  { id: "above-diagonal", a: 1, b: -1, limit: 0, label: "u₂≥u₁", color: "#8f88dc" },
  { id: "below-steep", a: -2, b: 1, limit: 0, label: "u₂≤2u₁", color: "#f49a4a" },
];

function theorem34ConeScene(
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-0.45, 3.3], y: [-0.45, 5.2] },
    constraints: theorem34ConeConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "u₁", y: "u₂" },
    caption: {
      primary: "The sign-compatible cone C in displacement space",
      secondary: "C=cone{(1,1),(1,2)}",
    },
    ...overrides,
  };
}

const coneRays: Primitive[] = [
  {
    kind: "vector",
    from: [0, 0],
    to: [3, 3],
    label: "extreme ray u¹=(1,1)",
    color: "#8f88dc",
    animate: true,
  },
  {
    kind: "vector",
    from: [0, 0],
    to: [2.5, 5],
    label: "extreme ray u²=(1,2)",
    color: "#f49a4a",
    animate: true,
  },
  { kind: "point", at: uOne, label: "primitive u¹", style: "integer" },
  { kind: "point", at: uTwo, label: "primitive u²", style: "integer" },
];

export const signCompatibleConeStages: VisualizationStage[] = [
  {
    id: "cone-principle-two-points",
    kicker: "Cone construction · Start in P",
    title: "Choose two feasible points and look only at their displacement",
    description:
      "The proof compares x̂ and y* row by row. The vector d=y*−x̂ records how every inequality value changes when moving from x̂ to y*.",
    formula: "d=y*−x̂=(3/2,2)",
    insight:
      "The cone does not live at y* or at x̂. It lives in displacement space, so its apex is always the origin.",
    scene: faceScene([
      { kind: "point", at: xHat, label: "x̂", style: "integer" },
      { kind: "point", at: yStar, label: "y*", style: "fractional" },
      { kind: "vector", from: xHat, to: yStar, label: "d=y*−x̂", color: "#e27c89", animate: true },
    ]),
  },
  {
    id: "cone-principle-row-signs",
    kicker: "Cone construction · Compare rows",
    title: "Each row contributes one homogeneous sign condition",
    description:
      "If a row value decreases from x̂ to y*, the cone requires the same row applied to u to be nonpositive. If it increases, the cone requires it to be nonnegative. The constants b disappear because we compare two points.",
    formula: "A₁y*<A₁x̂⇒A₁u≤0,   A₂y*≥A₂x̂⇒A₂u≥0",
    insight:
      "Removing the right-hand sides is exactly why the resulting region is a cone: every feasible direction can be scaled by any nonnegative number.",
    scene: faceScene([
      { kind: "point", at: xHat, label: "x̂", style: "integer" },
      { kind: "point", at: yStar, label: "y*", style: "fractional" },
      { kind: "line", from: [0, 0], to: [1.8, 1.8], label: "row decreases: x₁−x₂", style: "constraint", color: "#8f88dc", animate: true },
      { kind: "line", from: [0.5, 0], to: [1.7, 2.4], label: "row increases: 2x₁−x₂", style: "constraint", color: "#f49a4a", animate: true },
    ]),
  },
  {
    id: "cone-principle-intersection",
    kicker: "Cone construction · Intersect halfspaces",
    title: "The homogeneous row conditions form an explicit wedge",
    description:
      "For this example the row partition becomes u₁≥0, u₂≥u₁, and u₂≤2u₁. Their intersection is the shaded wedge C.",
    formula: "C={u∈ℝ²:u₁≥0, u₁≤u₂≤2u₁}",
    insight:
      "This is the object used by the proof. It is not merely a pair of arrows: it contains every nonnegative combination of its two boundary rays.",
    scene: theorem34ConeScene(coneRays),
  },
  {
    id: "cone-principle-displacement-inside",
    kicker: "Cone construction · Locate d",
    title: "The original displacement lies inside the cone",
    description:
      "Because the row signs were defined from d itself, d must satisfy every cone inequality. Here it lies strictly between the two extreme rays.",
    formula: "d=(3/2,2)=1·(1,1)+(1/2)·(1,2)∈C",
    insight:
      "Carathéodory later replaces the whole shaded cone by at most n extreme-ray directions needed for this one vector.",
    scene: theorem34ConeScene([
      ...coneRays,
      { kind: "vector", from: [0, 0], to: yStar, label: "d∈C", color: "#e27c89", animate: true },
      { kind: "point", at: yStar, label: "d=(3/2,2)", style: "optimum" },
    ]),
  },
  {
    id: "cone-principle-remark-33",
    kicker: "Cone construction · Remark 33",
    title: "Only the coefficient box below d is guaranteed to stay feasible",
    description:
      "Write d=u¹+(1/2)u². Remark 33 says that every μ₁u¹+μ₂u² with 0≤μ₁≤1 and 0≤μ₂≤1/2 remains feasible when added to x̂.",
    formula: "0≤μ≤λ⇒x̂+μ₁u¹+μ₂u²∈P",
    insight:
      "The entire translated cone x̂+C need not lie in P. The proof only uses the bounded parallelogram of partial coefficients underneath d.",
    scene: faceScene([
      {
        kind: "polygon",
        points: [[0, 0], [1, 1], [1.5, 2], [0.5, 1]],
        label: "safe partial combinations",
        style: "integer-hull",
        fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
      },
      { kind: "vector", from: [0, 0], to: [1, 1], label: "u¹", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0, 0], to: [0.5, 1], label: "(1/2)u²", color: "#f49a4a", animate: true },
      { kind: "point", at: yStar, label: "d", style: "fractional" },
    ]),
  },
];

export const theorem34ExplicitConeStages: VisualizationStage[] = [
  {
    id: "t34-explicit-fix-optima",
    kicker: "Proof step 1 · Fix two optima",
    title: "Work on the optimal face and project away the fixed third coordinate",
    description:
      "The 3D prism example has x₃=1 on its optimal face. Projecting that face to (x₁,x₂) leaves the polygon shown here, with integer optimum x̂=(0,0) and LP optimum y*=(3/2,2).",
    formula: "x̂=(0,0,1),   y*=(3/2,2,1)",
    insight:
      "The projection loses no information relevant to the cone because every allowed displacement has u₃=0.",
    scene: faceScene([
      { kind: "point", at: xHat, label: "IP optimum x̂", style: "integer" },
      { kind: "point", at: yStar, label: "LP optimum y*", style: "fractional" },
      { kind: "vector", from: xHat, to: yStar, label: "d=y*−x̂", color: "#e27c89", animate: true },
    ]),
  },
  signCompatibleConeStages[1],
  signCompatibleConeStages[2],
  signCompatibleConeStages[3],
  signCompatibleConeStages[4],
  {
    id: "t34-explicit-absorb",
    kicker: "Proof step 5 · Absorb the integer ray part",
    title: "Move one full primitive ray into the integer optimum",
    description:
      "The decomposition d=u¹+(1/2)u² contains one full integral copy of u¹. Replace x̂ by x*=x̂+u¹=(1,1). Remark 33 keeps the move feasible, and the objective argument keeps it optimal.",
    formula: "x*=x̂+u¹=(1,1),   y*−x*=(1/2)u²",
    insight:
      "The cone picture makes the stripping operation literal: remove a whole boundary-ray segment and keep the residual segment inside the same cone.",
    scene: faceScene([
      { kind: "point", at: xHat, label: "old x̂", style: "integer" },
      { kind: "point", at: xStar, label: "new integer optimum x*", style: "optimum", animateFrom: xHat },
      { kind: "point", at: yStar, label: "y*", style: "fractional" },
      { kind: "vector", from: xHat, to: xStar, label: "one full u¹", color: "#8f88dc", animate: true },
      { kind: "vector", from: xStar, to: yStar, label: "(1/2)u²", color: "#f49a4a", animate: true },
    ]),
  },
  {
    id: "t34-explicit-bound",
    kicker: "Proof step 6 · Bound the remainder",
    title: "After stripping, only fractional pieces of bounded rays remain",
    description:
      "There are at most n rays, every remaining coefficient is below one, and Lemma 32 bounds each primitive ray by Δ.",
    formula: "‖y*−x*‖∞≤Σλᵢ‖uᵢ‖∞≤nΔ",
    insight:
      "In this example the actual remainder is simply (1/2)u²=(1/2,1), so its infinity norm is one.",
    scene: theorem34ConeScene([
      ...coneRays,
      { kind: "vector", from: [0, 0], to: [0.5, 1], label: "remaining (1/2)u²", color: "#e27c89", animate: true },
      { kind: "point", at: [0.5, 1], label: "‖remainder‖∞=1", style: "optimum" },
    ]),
  },
];

const pentagonConstraints: Scene["constraints"] = [
  { id: "p-left", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "p-bottom", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "p-right", a: 1, b: 0, limit: 5, label: "x₁≤5", color: "#8f88dc" },
  { id: "p-top", a: 0, b: 1, limit: 4, label: "x₂≤4", color: "#8f88dc" },
  { id: "p-cap", a: 1, b: 1, limit: 7, label: "x₁+x₂≤7", color: "#f49a4a" },
];

function pentagonScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.55, 5.7], y: [-0.55, 4.7] },
    constraints: pentagonConstraints,
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Theorem 35 example",
      secondary: "z=(1,1), optimal vertex ŷ=(5,2)",
    },
    ...overrides,
  };
}

function orthantScene(primitives: Primitive[] = [], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: { x: [-0.45, 4.8], y: [-0.45, 3.5] },
    constraints: [
      { id: "orthant-x", a: -1, b: 0, limit: 0, label: "u₁≥0", color: "#8f88dc" },
      { id: "orthant-y", a: 0, b: -1, limit: 0, label: "u₂≥0", color: "#f49a4a" },
    ],
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "u₁", y: "u₂" },
    caption: {
      primary: "The sign-compatible cone for Theorem 35",
      secondary: "C=ℝ²₊=cone{e₁,e₂}",
    },
    ...overrides,
  };
}

const orthantRays: Primitive[] = [
  { kind: "vector", from: [0, 0], to: [4.5, 0], label: "extreme ray e₁", color: "#8f88dc", animate: true },
  { kind: "vector", from: [0, 0], to: [0, 3.1], label: "extreme ray e₂", color: "#f49a4a", animate: true },
  { kind: "point", at: [1, 0], label: "primitive e₁", style: "integer" },
  { kind: "point", at: [0, 1], label: "primitive e₂", style: "integer" },
];

export const theorem35ExplicitConeStages: VisualizationStage[] = [
  {
    id: "t35-explicit-points",
    kicker: "Proof step 1 · Compare z and an optimum",
    title: "The distant optimum supplies one improving displacement",
    description:
      "The nonoptimal integer point is z=(1,1), while ŷ=(5,2) is the optimal vertex. Their difference d=(4,1) is feasible as a complete move.",
    formula: "d=ŷ−z=(4,1)",
    insight:
      "The proof uses ŷ only to show that the set of improving integral displacements is nonempty.",
    scene: pentagonScene([
      { kind: "point", at: [1, 1], label: "z", style: "integer" },
      { kind: "point", at: [5, 2], label: "optimal ŷ", style: "optimum" },
      { kind: "vector", from: [1, 1], to: [5, 2], label: "d=ŷ−z", color: "#e27c89", animate: true },
    ], { objective: { vector: [2, 1], label: "c=(2,1)" } }),
  },
  {
    id: "t35-explicit-row-cone",
    kicker: "Proof step 2 · Build C from row signs",
    title: "Here every row comparison reduces to nonnegative coordinates",
    description:
      "Comparing Aᵢŷ with Aᵢz yields u₁≥0 and u₂≥0. Thus the sign-compatible cone is exactly the first orthant.",
    formula: "C={u:u₁≥0,u₂≥0}=cone{e₁,e₂}",
    insight:
      "The cone is shown at the origin because it contains displacements, not feasible points themselves.",
    scene: orthantScene([
      ...orthantRays,
      { kind: "vector", from: [0, 0], to: [4, 1], label: "d=(4,1)∈C", color: "#e27c89", animate: true },
    ]),
  },
  {
    id: "t35-explicit-partials",
    kicker: "Proof step 3 · Safe partial movements",
    title: "Remark 33 turns the ray rectangle into feasible points from z",
    description:
      "Since d=4e₁+e₂, every μ₁e₁+μ₂e₂ with 0≤μ₁≤4 and 0≤μ₂≤1 stays feasible when added to z.",
    formula: "0≤μ₁≤4, 0≤μ₂≤1⇒z+μ₁e₁+μ₂e₂∈P",
    insight:
      "This is the precise sense in which the cone directions are safe: the proof uses partial combinations bounded by a known feasible displacement.",
    scene: pentagonScene([
      {
        kind: "polygon",
        points: [[1, 1], [5, 1], [5, 2], [1, 2]],
        label: "safe partial combinations",
        style: "integer-hull",
        fromPoints: [[1, 1], [1, 1], [1, 1], [1, 1]],
      },
      { kind: "point", at: [1, 1], label: "z", style: "integer" },
      { kind: "point", at: [5, 2], label: "z+d=ŷ", style: "optimum" },
    ]),
  },
  {
    id: "t35-explicit-caratheodory",
    kicker: "Proof step 4 · Extreme-ray representation",
    title: "The improving displacement is assembled from primitive cone rays",
    description:
      "In dimension two the orthant has the two primitive extreme rays e₁ and e₂. The witness d=(4,1) is their nonnegative combination.",
    formula: "d=4e₁+e₂,   k=2≤n",
    insight:
      "Lemma 32 bounds each primitive direction; the remaining issue is to prevent large coefficients in a minimum-mass improving displacement.",
    scene: orthantScene([
      ...orthantRays,
      { kind: "vector", from: [0, 0], to: [4, 0], label: "4e₁", color: "#8f88dc", animate: true },
      { kind: "vector", from: [4, 0], to: [4, 1], label: "+e₂", color: "#f49a4a", animate: true },
      { kind: "point", at: [4, 1], label: "d", style: "optimum" },
    ]),
  },
  {
    id: "t35-explicit-positive-case",
    kicker: "Proof step 5 · Positive-ray case",
    title: "A full improving ray immediately gives the local witness",
    description:
      "For c=(2,1), cᵀe₁>0. If a chosen decomposition contains at least one full copy of e₁, then z+e₁ is already feasible, integral, and better.",
    formula: "cᵀe₁=2>0⇒y=z+e₁=(2,1)",
    insight:
      "The theorem can terminate before reaching the distant optimum.",
    scene: pentagonScene([
      { kind: "point", at: [1, 1], label: "z", style: "integer" },
      { kind: "point", at: [2, 1], label: "nearby improving y", style: "optimum", animateFrom: [1, 1] },
      { kind: "vector", from: [1, 1], to: [2, 1], label: "one e₁ step", color: "#8f88dc", animate: true },
    ], { objective: { vector: [2, 1], label: "c=(2,1)" } }),
  },
  {
    id: "t35-explicit-neutral-case",
    kicker: "Proof step 6 · Nonpositive-ray case",
    title: "A full neutral ray would contradict minimum coefficient mass",
    description:
      "To see the second branch, temporarily use c=e₂. A purported minimum-mass improving displacement containing d₀=2e₁+e₂ could lose one neutral e₁ and remain integral and improving. Hence such a d₀ cannot be minimal.",
    formula: "d₀=(2,1), d₀−e₁=(1,1), cᵀ(d₀−e₁)=cᵀd₀=1",
    insight:
      "This picture is a contradiction argument: it explains why a true minimum-mass displacement cannot contain a full nonimproving ray.",
    scene: orthantScene([
      ...orthantRays,
      { kind: "point", at: [2, 1], label: "nonminimal candidate d₀", style: "fractional" },
      { kind: "point", at: [1, 1], label: "smaller improving d₀−e₁", style: "optimum", animateFrom: [2, 1] },
      { kind: "vector", from: [2, 1], to: [1, 1], label: "subtract neutral e₁", color: "#e27c89", animate: true },
      { kind: "line", from: [-0.3, 0], to: [4.6, 0], label: "cᵀu=0 for c=e₂", style: "objective", color: "#8f88dc" },
    ]),
  },
  {
    id: "t35-explicit-bound",
    kicker: "Proof step 7 · Finish",
    title: "The hard case contains less than one copy of every used ray",
    description:
      "The two cases imply λᵢ<1 for every ray in a minimum-mass improving decomposition. With at most n rays of norm at most Δ, the displacement lies in the nΔ-box.",
    formula: "0≤λᵢ<1⇒‖d‖∞≤Σλᵢ‖uᵢ‖∞≤nΔ",
    insight:
      "The cone supplies the allowed directions; minimality supplies the coefficient bound.",
    scene: orthantScene([
      {
        kind: "polygon",
        points: [[0, 0], [2, 0], [2, 2], [0, 2]],
        label: "‖d‖∞≤nΔ=2",
        style: "integer-hull",
        fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
      },
      { kind: "point", at: [1, 1], label: "bounded improving displacement", style: "optimum" },
    ]),
  },
];

function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: true,
    showLattice: true,
    showVertices: true,
    scene3D: configuration,
  };
}

const multiplierOrigin: Point3D = [0, 0, 0];
const multiplierR1: Point3D = [1, 0, 1];
const multiplierR2: Point3D = [0, 1, 1];
const multiplierU: Point3D = [0.7, 0.8, 1.5];

const multiplierConeMesh: Mesh3D = {
  id: "explicit-multiplier-cone",
  vertices: [multiplierOrigin, [2.6, 0, 2.6], [0, 2.6, 2.6]],
  faces: [[0, 1, 2]],
  label: "C",
  color: "#79c9c0",
  edgeColor: "#10202a",
  opacity: 0.2,
  style: "solid",
};

function multiplierConeScene(overrides: Partial<Scene3D> = {}): Scene {
  return scene3D({
    bounds: { x: [-0.25, 3], y: [-0.25, 3], z: [-0.25, 3] },
    axisLabels: { x: "w₁", y: "w₂", z: "w₃" },
    camera: { yaw: -0.7, pitch: 0.38, distance: 6.1 },
    meshes: [multiplierConeMesh],
    segments: [
      { id: "mr1", from: multiplierOrigin, to: [2.6, 0, 2.6], label: "r¹=(1,0,1)", color: "#f49a4a", width: 4, animate: true },
      { id: "mr2", from: multiplierOrigin, to: [0, 2.6, 2.6], label: "r²=(0,1,1)", color: "#8f88dc", width: 4, animate: true },
    ],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "The actual multiplier cone in w-space",
      secondary: "C={w≥0:w₁+w₂=w₃}",
    },
    ...overrides,
  });
}

function multiplierCoefficientScene(primitives: Primitive[] = []): Scene {
  return {
    viewport: { x: [-0.3, 2.2], y: [-0.3, 1.95] },
    constraints: [
      { id: "coef-one", a: -1, b: 0, limit: 0, label: "μ₁≥0", color: "#f49a4a" },
      { id: "coef-two", a: 0, b: -1, limit: 0, label: "μ₂≥0", color: "#8f88dc" },
    ],
    primitives,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "μ₁", y: "μ₂" },
    caption: {
      primary: "The same cone in extreme-ray coordinates",
      secondary: "w=μ₁r¹+μ₂r²",
    },
  };
}

export const lemma51ExplicitConeStages: VisualizationStage[] = [
  {
    id: "l51-explicit-actual-cone",
    kicker: "Proof step 1 · Actual multiplier space",
    title: "The sign restrictions and equality define a lower-dimensional cone",
    description:
      "For the example A_C=(1,1,−1)ᵀ and nonnegative sign pattern, the condition wᵀA_C=0 becomes w₁+w₂=w₃. Its intersection with w≥0 is the triangular cone sheet shown in three dimensions.",
    formula: "C={w∈ℝ³:w≥0, w₁+w₂−w₃=0}",
    insight:
      "The cone is two-dimensional even though the multiplier has three coordinates. The equality cuts the nonnegative orthant by a plane through the origin.",
    scene: multiplierConeScene(),
  },
  {
    id: "l51-explicit-rays",
    kicker: "Proof step 2 · Extreme rays",
    title: "The two boundary edges are the primitive multiplier rays",
    description:
      "The cone is generated by r¹=(1,0,1) and r²=(0,1,1). Every multiplier in this sign cone is a nonnegative combination of those two vectors.",
    formula: "C=cone{r¹,r²}",
    insight:
      "Lemma 32 is applied to these actual multiplier-space rays, not to the coordinate axes drawn later.",
    scene: multiplierConeScene({
      markers: [
        { id: "mr1-marker", at: multiplierR1, label: "primitive r¹", style: "integer" },
        { id: "mr2-marker", at: multiplierR2, label: "primitive r²", style: "integer" },
      ],
    }),
  },
  {
    id: "l51-explicit-coordinate-map",
    kicker: "Proof step 3 · Switch coordinates",
    title: "Coefficient space is only a convenient chart for the same cone",
    description:
      "Writing w=μ₁r¹+μ₂r² identifies the cone with the nonnegative coefficient quadrant. The point (0.7,0.8) corresponds to w=(0.7,0.8,1.5) on the 3D sheet.",
    formula: "(μ₁,μ₂)=(0.7,0.8)↔w=(0.7,0.8,1.5)",
    insight:
      "This makes later coefficient stripping easy to draw without forgetting what geometric cone the coefficients parametrize.",
    scene: multiplierCoefficientScene([
      { kind: "vector", from: [0, 0], to: [0.7, 0], label: "0.7r¹", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0.7, 0], to: [0.7, 0.8], label: "+0.8r²", color: "#8f88dc", animate: true },
      { kind: "point", at: [0.7, 0.8], label: "same multiplier w", style: "optimum" },
    ]),
  },
];
