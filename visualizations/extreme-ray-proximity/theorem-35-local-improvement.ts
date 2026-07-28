import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const boxViewport: Scene["viewport"] = { x: [-0.75, 5.75], y: [-0.75, 5.75] };
const coneViewport: Scene["viewport"] = { x: [-0.75, 5.75], y: [-0.75, 5.75] };

const boxConstraints: Scene["constraints"] = [
  { id: "left", a: -1, b: 0, limit: 0, label: "x₁≥0", color: "#79c9c0" },
  { id: "bottom", a: 0, b: -1, limit: 0, label: "x₂≥0", color: "#79c9c0" },
  { id: "right", a: 1, b: 0, limit: 5, label: "x₁≤5", color: "#8f88dc" },
  { id: "top", a: 0, b: 1, limit: 5, label: "x₂≤5", color: "#8f88dc" },
];

const firstOrthantConstraints: Scene["constraints"] = [
  { id: "u1-positive", a: -1, b: 0, limit: 0, label: "u₁≥0", color: "#f49a4a" },
  { id: "u2-positive", a: 0, b: -1, limit: 0, label: "u₂≥0", color: "#8f88dc" },
];

const z: Point2D = [1, 1];
const farOptimum: Point2D = [5, 5];
const localImprovement: Point2D = [2, 1];
const objective = [2, 1] as Point2D;

function optimizationScene(overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: boxViewport,
    constraints: boxConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Integer box with Δ=1",
      secondary: "objective c=(2,1)",
    },
    ...overrides,
  };
}

function coneScene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport: coneViewport,
    constraints: firstOrthantConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "u₁", y: "u₂" },
    primitives,
    caption: {
      primary: "Difference cone C",
      secondary: "primitive extreme rays e₁,e₂ have norm 1=Δ",
    },
    ...overrides,
  };
}

const improvingRayStages: VisualizationStage[] = [
  {
    id: "theorem35-nonoptimal-z",
    kicker: "Theorem 35 · Starting point",
    title: "A feasible integer point can be visibly nonoptimal",
    description:
      "The point z=(1,1) is feasible and integral, but the objective 2x₁+x₂ can still be increased. The moving level line makes the improving direction visible.",
    formula: "z∈P∩ℤ²,   z∉argmax(IP)",
    insight:
      "The theorem promises not merely a better point somewhere, but one inside an ℓ∞-box of radius nΔ around z.",
    scene: optimizationScene({
      objective: { vector: objective, label: "c=(2,1)" },
      primitives: [{ kind: "point", at: z, label: "nonoptimal z", style: "integer" }],
    }),
  },
  {
    id: "theorem35-far-optimum",
    kicker: "Theorem 35 · A distant witness",
    title: "An optimum proves that an improving displacement exists",
    description:
      "The distant optimum ŷ=(5,5) provides a displacement ŷ−z in the sign-compatible cone. The proof does not use its full length; it searches inside its ray decomposition for a shorter improving certificate.",
    formula: "ŷ−z=(4,4)∈C",
    insight:
      "The optimal point is only used to certify that the auxiliary search for an improving displacement is nonempty.",
    scene: optimizationScene({
      primitives: [
        { kind: "point", at: z, label: "z", style: "integer" },
        { kind: "point", at: farOptimum, label: "optimal ŷ", style: "optimum" },
        { kind: "vector", from: z, to: farOptimum, label: "ŷ−z", color: "#8f88dc", animate: true },
      ],
    }),
  },
  {
    id: "theorem35-difference-cone",
    kicker: "Theorem 35 · Difference space",
    title: "Translate the geometry so z becomes the origin",
    description:
      "In difference coordinates, feasible movements toward ŷ lie in a cone generated here by the primitive extreme rays e₁ and e₂. Lemma 32 bounds both by Δ=1.",
    formula: "C={u:A₁u≥0, A₂u≤0}",
    insight:
      "The cone records which inequalities may loosen and which may tighten while moving away from z.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [5, 0], label: "u¹=e₁", color: "#f49a4a", animate: true },
      { kind: "vector", from: [0, 0], to: [0, 5], label: "u²=e₂", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0, 0], to: [4, 4], label: "ŷ−z", color: "#e27c89", animate: true },
      { kind: "point", at: [1, 0], label: "primitive ray step", style: "integer" },
      { kind: "point", at: [0, 1], label: "primitive ray step", style: "integer" },
    ]),
  },
  {
    id: "theorem35-minimal-candidate",
    kicker: "Theorem 35 · Minimal improving decomposition",
    title: "Among improving displacements, minimize total ray mass",
    description:
      "The proof chooses an improving integral displacement d=Σλᵢuᵢ minimizing Σλᵢ. Carathéodory lets us retain at most n ray directions.",
    formula: "min{Σλᵢ:d=Σλᵢuᵢ∈ℤⁿ, cᵀd>0}",
    insight:
      "Minimality turns any coefficient of size at least one into a contradiction or an immediate local move.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [1, 0], label: "candidate d=e₁", color: "#f49a4a", animate: true },
      { kind: "point", at: [1, 0], label: "cᵀd=2>0", style: "optimum", animateFrom: [4, 4] },
      { kind: "line", from: [0, 0], to: [5, -10], label: "cᵀu=0", style: "objective", color: "#e27c89" },
    ]),
  },
  {
    id: "theorem35-improving-ray",
    kicker: "Theorem 35 · First branch",
    title: "A full primitive ray step already improves the objective",
    description:
      "For u¹=e₁, the objective gain is cᵀu¹=2>0. Therefore z+u¹ is feasible, integral, improving, and only one unit away.",
    formula: "y=z+u¹=(2,1),   cᵀy=5>cᵀz=3",
    insight:
      "When a used extreme ray is improving, the proof can stop immediately with a move of norm at most Δ.",
    scene: optimizationScene({
      primitives: [
        { kind: "point", at: z, label: "z", style: "integer" },
        { kind: "point", at: localImprovement, label: "y=z+e₁", style: "optimum", animateFrom: z },
        { kind: "vector", from: z, to: localImprovement, label: "u¹=e₁", color: "#f49a4a", animate: true },
        { kind: "line", from: [0, 3], to: [3, -3], label: "level at cᵀz", style: "objective", color: "#8f88dc" },
        { kind: "line", from: [0, 5], to: [3, -1], label: "higher level at cᵀy", style: "cut", color: "#e27c89" },
      ],
    }),
  },
  {
    id: "theorem35-local-box",
    kicker: "Theorem 35 · nΔ neighborhood",
    title: "The improving point lies in a universal local box",
    description:
      "Here n=2 and Δ=1, so the theorem guarantees an improving integer point within radius two. The actual move has ℓ∞-length one.",
    formula: "‖y−z‖∞=1≤nΔ=2",
    insight:
      "A global optimization failure always has a bounded local witness whose radius depends only on dimension and the determinant parameter.",
    scene: optimizationScene({
      primitives: [
        {
          kind: "polygon",
          points: [[-1, -1], [3, -1], [3, 3], [-1, 3]],
          label: "‖x−z‖∞≤nΔ",
          style: "integer-hull",
          fromPoints: [z, z, z, z],
        },
        { kind: "point", at: z, label: "z", style: "integer" },
        { kind: "point", at: localImprovement, label: "improving y", style: "optimum" },
        { kind: "vector", from: z, to: localImprovement, label: "local certificate", color: "#f49a4a", animate: true },
      ],
    }),
  },
  {
    id: "theorem35-conclusion",
    kicker: "Theorem 35 · Local optimality principle",
    title: "No local improvement means global optimality",
    description:
      "Contrapositively, if no improving integer point exists in the nΔ-box around z, then z cannot be nonoptimal. The extreme-ray argument turns this finite neighborhood into an optimality certificate.",
    formula: "z nonoptimal ⇒ ∃y: cᵀy>cᵀz and ‖y−z‖∞≤nΔ",
    insight:
      "Theorem 35 is an augmentation principle: global improvement can always be detected locally.",
    scene: optimizationScene({
      primitives: [
        {
          kind: "polygon",
          points: [[-1, -1], [3, -1], [3, 3], [-1, 3]],
          label: "search neighborhood",
          style: "integer-hull",
        },
        { kind: "point", at: z, label: "current integer point z", style: "integer" },
        { kind: "point", at: localImprovement, label: "better point", style: "optimum" },
      ],
    }),
  },
];

const removalStages: VisualizationStage[] = [
  {
    id: "theorem35-removal-setup",
    kicker: "Theorem 35 · Second branch",
    title: "Some ray mass may be neutral rather than improving",
    description:
      "Consider d=2e₁+0.5e₂ with objective c=e₂. The e₁ component does not change the objective, while the e₂ component creates the strict improvement.",
    formula: "cᵀe₁=0,   cᵀe₂=1,   cᵀd=0.5>0",
    insight:
      "A coefficient at least one does not always directly give an improving ray, so the proof needs a second branch.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [2, 0], label: "2e₁: neutral mass", color: "#8f88dc", animate: true },
      { kind: "vector", from: [2, 0], to: [2, 0.5], label: "0.5e₂: improvement", color: "#f49a4a", animate: true },
      { kind: "point", at: [2, 0.5], label: "d", style: "fractional" },
      { kind: "line", from: [-0.5, 0], to: [5.5, 0], label: "cᵀu=0", style: "objective", color: "#e27c89" },
    ]),
  },
  {
    id: "theorem35-remove-unit",
    kicker: "Theorem 35 · Remove a full ray",
    title: "Delete one neutral integral ray step",
    description:
      "Subtract e₁ from d. The new displacement d′=e₁+0.5e₂ remains integral in the original translated problem and still has positive objective gain.",
    formula: "d′=d−e₁,   cᵀd′=cᵀd>0",
    insight:
      "The total coefficient sum falls by one, contradicting the choice of a minimum-mass improving displacement.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [1, 0], label: "remaining e₁", color: "#8f88dc", animate: true },
      { kind: "vector", from: [1, 0], to: [1, 0.5], label: "0.5e₂", color: "#f49a4a", animate: true },
      { kind: "point", at: [2, 0.5], label: "old d", style: "fractional" },
      { kind: "point", at: [1, 0.5], label: "smaller d′", style: "optimum", animateFrom: [2, 0.5] },
      { kind: "vector", from: [2, 0.5], to: [1, 0.5], label: "subtract e₁", color: "#e27c89", animate: true },
    ]),
  },
  {
    id: "theorem35-coefficients-small",
    kicker: "Theorem 35 · Minimality consequence",
    title: "A minimal improving decomposition has no large coefficient",
    description:
      "If λⱼ≥1, either uʲ itself improves and yields the desired short move, or one full uʲ can be removed without destroying improvement. Therefore the hard case has λᵢ<1 for every used ray.",
    formula: "minimality ⇒ 0≤λᵢ<1",
    insight:
      "Now the same sum as in Theorem 34 gives ‖d‖∞≤kΔ≤nΔ.",
    scene: coneScene([
      { kind: "vector", from: [0, 0], to: [0.7, 0], label: "λ₁u¹, λ₁<1", color: "#8f88dc", animate: true },
      { kind: "vector", from: [0.7, 0], to: [0.7, 0.6], label: "λ₂u², λ₂<1", color: "#f49a4a", animate: true },
      { kind: "point", at: [0.7, 0.6], label: "minimal improving d", style: "optimum", animateFrom: [2, 0.5] },
      {
        kind: "polygon",
        points: [[0, 0], [2, 0], [2, 2], [0, 2]],
        label: "‖d‖∞≤nΔ",
        style: "integer-hull",
        fromPoints: [[0, 0], [0, 0], [0, 0], [0, 0]],
      },
    ]),
  },
];

const improvingExample: VisualizationExample = {
  id: "improving-extreme-ray",
  title: "An extreme ray gives the local move",
  description:
    "See a distant optimum collapse to the one-step improving point z+e₁ inside the nΔ neighborhood.",
  stages: improvingRayStages,
};

const removalExample: VisualizationExample = {
  id: "neutral-ray-removal",
  title: "A neutral ray is removed by minimality",
  description:
    "Inspect the second branch of the proof: a full ray with no objective gain can be deleted from a minimum-mass improving displacement.",
  stages: removalStages,
};

const visualization: VisualizationDefinition = {
  id: "theorem-35-local-improvement",
  title: "Theorem 35 — A Nearby Improving Integer Point",
  shortTitle: "Theorem 35: local improvement",
  chapter: "Extreme-ray proximity",
  order: 3,
  description:
    "Turn nonoptimality into a bounded augmentation step by minimizing ray mass and using the two coefficient-reduction branches of the proof.",
  difficulty: "Advanced",
  duration: 18,
  accent: "#79c9c0",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: improvingRayStages,
  examples: [improvingExample, removalExample],
  proof: {
    title: "Why every nonoptimal integer point has an nΔ-local improvement",
    steps: [
      "Choose an optimal integer solution ŷ and form the sign-compatible cone C containing ŷ−z.",
      "Let u¹,…,uᵗ be primitive integral extreme rays of C; Lemma 32 gives ‖uⁱ‖∞≤Δ.",
      "Among all improving integral displacements d=Σλᵢuᵢ, choose one minimizing Σλᵢ.",
      "Carathéodory reduces the support to k≤n rays.",
      "If λⱼ≥1 and cᵀuʲ>0, then z+uʲ is already a feasible improving integer point at distance at most Δ.",
      "If λⱼ≥1 and cᵀuʲ≤0, subtract one copy of uʲ; feasibility and strict improvement remain, contradicting minimality.",
      "Hence every remaining λᵢ<1, so ‖d‖∞≤Σλᵢ‖uᵢ‖∞≤kΔ≤nΔ.",
    ],
  },
};

export default visualization;
