import type {
  Constraint,
  EllipsePrimitive,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

type Matrix2 = [[number, number], [number, number]];

interface EllipsoidState {
  center: Point2D;
  shape: Matrix2;
}

const viewport: Scene["viewport"] = { x: [-2, 11], y: [-2, 11] };

const constraints: Constraint[] = [
  { id: "left", a: -1, b: 0, limit: -0.5, label: "x₁ ≥ 0.5", color: "#f49a4a" },
  { id: "bottom", a: 0, b: -1, limit: -0.5, label: "x₂ ≥ 0.5", color: "#7ecbc4" },
  { id: "right", a: 1, b: 0, limit: 3.2, label: "x₁ ≤ 3.2", color: "#a7a0ed" },
  { id: "top", a: 0, b: 1, limit: 3.1, label: "x₂ ≤ 3.1", color: "#e88d99" },
  { id: "diagonal", a: 1, b: 1, limit: 5, label: "x₁+x₂ ≤ 5", color: "#d4ef77" },
];

function multiply(shape: Matrix2, vector: Point2D): Point2D {
  return [
    shape[0][0] * vector[0] + shape[0][1] * vector[1],
    shape[1][0] * vector[0] + shape[1][1] * vector[1],
  ];
}

/** The n=2 central-cut update for E(c,Q). */
function centralCut(state: EllipsoidState, normal: Point2D): EllipsoidState {
  const qNormal = multiply(state.shape, normal);
  const scale = Math.sqrt(normal[0] * qNormal[0] + normal[1] * qNormal[1]);
  const direction: Point2D = [qNormal[0] / scale, qNormal[1] / scale];
  const center: Point2D = [
    state.center[0] - direction[0] / 3,
    state.center[1] - direction[1] / 3,
  ];
  const shape = [
    [
      (4 / 3) * (state.shape[0][0] - (2 / 3) * direction[0] * direction[0]),
      (4 / 3) * (state.shape[0][1] - (2 / 3) * direction[0] * direction[1]),
    ],
    [
      (4 / 3) * (state.shape[1][0] - (2 / 3) * direction[1] * direction[0]),
      (4 / 3) * (state.shape[1][1] - (2 / 3) * direction[1] * direction[1]),
    ],
  ] as Matrix2;
  return { center, shape };
}

function ellipseGeometry(state: EllipsoidState) {
  const [[a, b], [, d]] = state.shape;
  const trace = a + d;
  const discriminant = Math.sqrt((a - d) ** 2 + 4 * b ** 2);
  const largest = (trace + discriminant) / 2;
  const smallest = (trace - discriminant) / 2;
  return {
    at: state.center,
    radiusX: Math.sqrt(largest),
    radiusY: Math.sqrt(smallest),
    rotation: 0.5 * Math.atan2(2 * b, a - d),
  };
}

function ellipsoid(
  _id: string,
  state: EllipsoidState,
  label: string,
  options: Partial<EllipsePrimitive> = {},
): EllipsePrimitive {
  return {
    kind: "ellipse",
    ...ellipseGeometry(state),
    label,
    color: "#a7a0ed",
    opacity: 0.09,
    ...options,
  };
}

function centerPoint(state: EllipsoidState, label: string): Primitive {
  return { kind: "point", at: state.center, label, style: "fractional" };
}

function scene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints,
    primitives,
    showFeasibleRegion: true,
    showConstraints: true,
    showGrid: true,
    showVertices: true,
    caption: {
      primary: "Outer ellipsoid around P",
      secondary: "Every retained half keeps the full polyhedron",
    },
    ...overrides,
  };
}

const e0: EllipsoidState = { center: [5, 4], shape: [[36, 0], [0, 36]] };
const e1 = centralCut(e0, [1, 1]);
const e2 = centralCut(e1, [1, 0]);
const e3 = centralCut(e2, [0, 1]);

const oldEllipse = (id: string, state: EllipsoidState, label: string) =>
  ellipsoid(id, state, label, { color: "#7ecbc4", dashed: true, opacity: 0.035 });

const updateEllipse = (
  id: string,
  previous: EllipsoidState,
  next: EllipsoidState,
  label: string,
) => ellipsoid(id, next, label, { animateFrom: ellipseGeometry(previous) });

const visualization: VisualizationDefinition = {
  id: "ellipsoid-representation",
  title: "Ellipsoid Representation of a Polyhedron",
  shortTitle: "Ellipsoid representation",
  chapter: "Polyhedral geometry",
  order: 2,
  description:
    "Represent an enclosing ellipsoid by its center and shape matrix, query a polyhedron with a separation oracle, and watch central cuts shrink the uncertainty region.",
  difficulty: "Intermediate",
  duration: 14,
  accent: "#a7a0ed",
  visualLabel: "Ellipsoid geometry",
  insightLabel: "Ellipsoid insight",
  controls: { constraints: true, grid: true, vertices: true, labels: true },
  stages: [
    {
      id: "polyhedron",
      kicker: "01 · Target set",
      title: "The inequalities define the hidden feasible region",
      description:
        "The polygon P is the intersection of five halfspaces. The ellipsoid method only needs a test that either accepts a query point or returns one violated row.",
      formula: "P={x∈ℝ²:Ax≤b}",
      insight: "A separation oracle can stand in for an explicit list of all facets.",
      scene: scene([]),
    },
    {
      id: "matrix-representation",
      kicker: "02 · Ellipsoid representation",
      title: "A center and a positive-definite matrix encode the ellipse",
      description:
        "The eigenvectors of Q give the principal directions; the square roots of its eigenvalues give the semi-axis lengths.",
      formula: "E(c,Q)={x:(x−c)ᵀQ⁻¹(x−c)≤1},   Q≻0",
      insight: "In two dimensions vol(E)=π√det(Q); in n dimensions it is βₙ√det(Q).",
      scene: scene([ellipsoid("e0", e0, "E₀: Q₀=36I"), centerPoint(e0, "c₀=(5,4)")]),
    },
    {
      id: "first-oracle-query",
      kicker: "03 · Separation oracle",
      title: "The first center violates a polyhedral inequality",
      description:
        "At c₀=(5,4), the row x₁+x₂≤5 is violated. Its normal a=(1,1) points toward the side that can safely be discarded.",
      formula: "aᵀc₀=9>5=b   ⇒   c₀∉P",
      insight: "Every point of P lies on the opposite side of the violated facet.",
      scene: scene([
        ellipsoid("e0-query", e0, "E₀"),
        centerPoint(e0, "violated center c₀"),
        { kind: "vector", from: e0.center, to: [6.2, 5.2], label: "a=(1,1)", color: "#e88d99", animate: true },
      ]),
    },
    {
      id: "first-central-cut",
      kicker: "04 · Central cut",
      title: "Move the valid separator through the ellipsoid center",
      description:
        "The true facet is x₁+x₂=5. The weaker central cut x₁+x₂=9 passes through c₀ and still keeps every point of P.",
      formula: "P⊆{x:aᵀ(x−c₀)≤0}",
      insight: "A central cut removes one half of the current ellipsoid without removing any feasible point.",
      scene: scene([
        ellipsoid("e0-cut", e0, "E₀"),
        { kind: "polygon", points: [[-2, 11], [11, -2], [11, 11]], style: "removed", label: "discarded half" },
        { kind: "line", from: [-2, 11], to: [11, -2], style: "cut", label: "aᵀx=aᵀc₀=9", animate: true },
        centerPoint(e0, "c₀"),
      ]),
    },
    {
      id: "first-update",
      kicker: "05 · Minimum-volume cover",
      title: "Replace the retained half by a smaller ellipsoid",
      description:
        "E₁ is the minimum-volume ellipsoid covering the retained half of E₀. It shifts away from the discarded region and becomes thinner in the cut direction.",
      formula: "c⁺=c−(1/3)Qã,   Q⁺=(4/3)(Q−(2/3)QããᵀQ)",
      insight: "For n=2, ã=a/√(aᵀQa). The matrix update changes size and orientation together.",
      scene: scene([
        oldEllipse("e0-old", e0, "previous E₀"),
        updateEllipse("e1", e0, e1, "new E₁"),
        { kind: "point", at: e1.center, animateFrom: e0.center, label: "c₁", style: "fractional" },
      ]),
    },
    {
      id: "second-query",
      kicker: "06 · Query again",
      title: "The new center exposes a different violated row",
      description:
        "Now c₁≈(3.59,2.59). It violates x₁≤3.2, so the oracle returns the horizontal normal a=(1,0).",
      formula: "(c₁)₁≈3.59>3.2",
      insight: "The method learns only one separating direction per iteration.",
      scene: scene([
        ellipsoid("e1-query", e1, "E₁"),
        { kind: "line", from: [e1.center[0], -2], to: [e1.center[0], 11], style: "cut", label: "x₁=(c₁)₁", animate: true },
        centerPoint(e1, "c₁"),
      ]),
    },
    {
      id: "second-update",
      kicker: "07 · Rotate and shrink",
      title: "The shape matrix adapts to the new cut direction",
      description:
        "The second update produces c₂≈(1.70,3.53). Because Q₁ has off-diagonal entries, an x₁-cut also changes the vertical position and orientation.",
      formula: "Q₁=[[32,−16],[−16,32]]  →  Q₂≈[[14.22,−7.11],[−7.11,35.56]]",
      insight: "Ellipsoid updates are affine-invariant: they respect skewed coordinates instead of treating axes independently.",
      scene: scene([
        oldEllipse("e1-old", e1, "previous E₁"),
        updateEllipse("e2", e1, e2, "new E₂"),
        { kind: "point", at: e2.center, animateFrom: e1.center, label: "c₂", style: "fractional" },
      ]),
    },
    {
      id: "third-query",
      kicker: "08 · Third separator",
      title: "One last violated upper bound remains",
      description:
        "The center c₂ violates x₂≤3.1. The central cut is drawn through c₂; the actual facet remains below it and P stays protected.",
      formula: "(c₂)₂≈3.53>3.1",
      insight: "The oracle certifies which half of the current search region cannot contain P.",
      scene: scene([
        ellipsoid("e2-query", e2, "E₂"),
        { kind: "polygon", points: [[-2, e2.center[1]], [11, e2.center[1]], [11, 11], [-2, 11]], style: "removed", label: "discarded half" },
        { kind: "line", from: [-2, e2.center[1]], to: [11, e2.center[1]], style: "cut", label: "x₂=(c₂)₂", animate: true },
        centerPoint(e2, "c₂"),
      ]),
    },
    {
      id: "feasible-center",
      kicker: "09 · Feasibility certificate",
      title: "The next ellipsoid center lies inside the polyhedron",
      description:
        "After the third update, c₃≈(2.10,1.54) satisfies every row of Ax≤b. The oracle returns feasible and the search can stop.",
      formula: "Ac₃≤b   ⇒   c₃∈P",
      insight: "For pure feasibility, a feasible center is already the desired certificate.",
      scene: scene([
        oldEllipse("e2-old", e2, "previous E₂"),
        updateEllipse("e3", e2, e3, "E₃"),
        { kind: "point", at: e3.center, animateFrom: e2.center, label: "feasible c₃", style: "optimum" },
      ]),
    },
    {
      id: "epsilon-accuracy",
      kicker: "10 · ε-accuracy",
      title: "The same geometry gives a quantitative stopping rule",
      description:
        "For optimization with subgradient g, the ellipsoid’s remaining width in direction g is √(gᵀQg). Once that width is at most ε, the current value is ε-optimal.",
      formula: "√(gᵀQₖg)≤ε   ⇒   f(cₖ)−f*≤ε",
      insight: "The iteration bound depends logarithmically on 1/ε because ellipsoid volume decreases geometrically.",
      scene: scene([
        ellipsoid("e3-final", e3, "remaining uncertainty Eₖ"),
        centerPoint(e3, "cₖ"),
        { kind: "vector", from: e3.center, to: [e3.center[0] + 1.1, e3.center[1] + 0.55], label: "g", color: "#e88d99", animate: true },
        { kind: "line", from: [1.9, 0.75], to: [2.8, 1.2], label: "directional width ≤ ε", style: "objective", color: "#e88d99", animate: true },
      ]),
    },
  ],
  proof: {
    title: "Why does every update remain safe?",
    steps: [
      "If the center c violates aᵀx≤b, then every feasible x satisfies aᵀx≤b<aᵀc.",
      "Therefore P lies inside the central halfspace aᵀ(x−c)≤0.",
      "The next ellipsoid is chosen to contain the complete retained half-ellipsoid, so it still contains P.",
      "The center moves by −Qã/(n+1), while the shape becomes thinner in the separator direction.",
      "Its volume decreases by a dimension-dependent factor; repeated cuts therefore reduce uncertainty geometrically.",
      "If an oracle accepts a center, that point certifies feasibility. With an objective, a width bound supplies ε-accuracy.",
    ],
  },
};

export default visualization;
