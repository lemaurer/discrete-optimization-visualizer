import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

interface DecompositionExample {
  id: string;
  title: string;
  description: string;
  viewport: Scene["viewport"];
  base: [Point2D, Point2D];
  rays: [Point2D, Point2D];
  rayEnds: [Point2D, Point2D];
  target: Point2D;
  basePoint: Point2D;
  fractionalParts: [number, number];
  integerParts: [number, number];
  t: Point2D;
  T: Point2D[];
  formula: string;
}

function scene(
  data: DecompositionExample,
  primitives: Primitive[],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: data.viewport,
    constraints: [],
    primitives,
    showGrid: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      primary: "Theorem 37: a finite integer core plus integral recession steps",
      secondary: data.formula,
    },
    ...overrides,
  };
}

function add(a: Point2D, b: Point2D): Point2D {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(mu: number, e: Point2D): Point2D {
  return [mu * e[0], mu * e[1]];
}

function translatedRay(from: Point2D, direction: Point2D, length: number): Primitive {
  return {
    kind: "vector",
    from,
    to: add(from, scale(length, direction)),
    label: `recession direction (${direction[0]},${direction[1]})`,
    color: "#8f88dc",
    animate: true,
  };
}

function baseSegment(data: DecompositionExample): Primitive {
  return {
    kind: "line",
    from: data.base[0],
    to: data.base[1],
    label: "conv(V)",
    style: "objective",
    color: "#f49a4a",
  };
}

function fundamentalCell(data: DecompositionExample): Point2D[] {
  const [v0, v1] = data.base;
  const [e1, e2] = data.rays;
  return [
    v0,
    v1,
    add(v1, e1),
    add(add(v1, e1), e2),
    add(add(v0, e1), e2),
    add(v0, e2),
  ];
}

function theoremStages(data: DecompositionExample): VisualizationStage[] {
  const [e1, e2] = data.rays;
  const [frac1, frac2] = data.fractionalParts;
  const [int1, int2] = data.integerParts;
  const fractionalCorner = add(data.basePoint, scale(frac1, e1));
  const integerStart = add(data.t, scale(int1, e1));

  return [
    {
      id: `${data.id}-minkowski-weyl`,
      kicker: "Theorem 37 · Minkowski–Weyl",
      title: "Separate the bounded part from the recession cone",
      description:
        "Linear optimization gives P=conv(V)+cone(E). The orange segment is the bounded generator set V; the two arrows generate every unbounded direction of P.",
      formula: "P=conv(V)+cone(E)",
      insight:
        "The theorem does not try to list infinitely many integer points. It only needs finitely many bounded representatives and the integral recession directions.",
      scene: scene(data, [
        {
          kind: "polygon",
          points: [
            data.base[0],
            data.base[1],
            add(data.base[1], scale(6, e1)),
            add(add(data.base[1], scale(6, e1)), scale(5, e2)),
            add(data.base[0], scale(5, e2)),
          ],
          label: "P=conv(V)+cone(E)",
          style: "feasible",
        },
        baseSegment(data),
        translatedRay(data.base[0], e1, 4.5),
        translatedRay(data.base[0], e2, 4.5),
      ]),
    },
    {
      id: `${data.id}-representation`,
      kicker: "Theorem 37 · Arbitrary integer point",
      title: "Represent one distant lattice point using real cone coefficients",
      description:
        "Choose the displayed integer point x. Minkowski–Weyl represents it as a convex combination of V plus nonnegative multiples of the recession generators.",
      formula: "x=Σᵥλᵥv+μ₁e¹+μ₂e²",
      insight:
        "The coefficients μ₁ and μ₂ need not be integral yet. Their fractional parts are exactly what determines the finite representative t.",
      scene: scene(data, [
        baseSegment(data),
        { kind: "point", at: data.basePoint, label: "Σλᵥv", style: "fractional" },
        {
          kind: "vector",
          from: data.basePoint,
          to: add(data.basePoint, scale(int1 + frac1, e1)),
          label: `μ₁=${int1 + frac1}`,
          color: "#8f88dc",
          animate: true,
        },
        {
          kind: "vector",
          from: add(data.basePoint, scale(int1 + frac1, e1)),
          to: data.target,
          label: `μ₂=${int2 + frac2}`,
          color: "#79c9c0",
          animate: true,
        },
        { kind: "point", at: data.target, label: `integer x=(${data.target[0]},${data.target[1]})`, style: "optimum" },
      ]),
    },
    {
      id: `${data.id}-floor-split`,
      kicker: "Theorem 37 · Split each coefficient",
      title: "Break every ray coefficient into an integer and a fractional part",
      description:
        "Write μₑ=⌊μₑ⌋+(μₑ−⌊μₑ⌋). The full copies of the integral rays are shown separately from the two fragments whose coefficients lie in [0,1).",
      formula: "μₑ=⌊μₑ⌋+{μₑ},   0≤{μₑ}<1",
      insight:
        "Only the fractional fragments can remain inside a bounded fundamental window. All full ray copies can be peeled away without losing integrality.",
      scene: scene(data, [
        baseSegment(data),
        { kind: "point", at: data.basePoint, label: "bounded base point", style: "fractional" },
        {
          kind: "vector",
          from: data.basePoint,
          to: fractionalCorner,
          label: `{μ₁}e¹=${frac1}e¹`,
          color: "#f49a4a",
          animate: true,
        },
        {
          kind: "vector",
          from: fractionalCorner,
          to: data.t,
          label: `{μ₂}e²=${frac2}e²`,
          color: "#e27c89",
          animate: true,
        },
        {
          kind: "vector",
          from: data.t,
          to: integerStart,
          label: `⌊μ₁⌋e¹=${int1}e¹`,
          color: "#8f88dc",
          animate: true,
        },
        {
          kind: "vector",
          from: integerStart,
          to: data.target,
          label: `⌊μ₂⌋e²=${int2}e²`,
          color: "#79c9c0",
          animate: true,
        },
      ]),
    },
    {
      id: `${data.id}-finite-window`,
      kicker: "Theorem 37 · Define T",
      title: "The fractional remainder is trapped in one bounded cell",
      description:
        "After removing all full ray copies, the remainder lies in conv(V)+Σₑ[0,1)e. Intersecting this bounded region with the integer lattice produces the finite set T.",
      formula: "T=ℤⁿ∩(conv(V)+Σₑ[0,1)e)",
      insight:
        "Bounded set plus discrete lattice means finitely many points. This is the entire finiteness argument behind T.",
      scene: scene(data, [
        {
          kind: "polygon",
          points: fundamentalCell(data),
          label: "bounded fundamental region",
          style: "integer-hull",
          fromPoints: data.base.map((point) => point).concat(data.base.map((point) => point), data.base.map((point) => point)) as Point2D[],
        },
        baseSegment(data),
        ...data.T.map<Primitive>((point, index) => ({
          kind: "point",
          at: point,
          label: index === 0 ? "finite set T" : undefined,
          style: "integer",
        })),
        { kind: "point", at: data.t, label: `remainder t=(${data.t[0]},${data.t[1]})`, style: "optimum" },
      ]),
    },
    {
      id: `${data.id}-integrality`,
      kicker: "Theorem 37 · Why t is integral",
      title: "Subtracting integral ray copies from an integer point leaves an integer point",
      description:
        "The target x is integral, every generator e∈E is integral, and every floor coefficient is an integer. Therefore t=x−Σ⌊μₑ⌋e is integral and belongs to T.",
      formula: "t=x−⌊μ₁⌋e¹−⌊μ₂⌋e²∈T",
      insight:
        "The proof uses integrality only after flooring. The original convex coefficients and fractional cone coefficients may be completely nonintegral.",
      scene: scene(data, [
        { kind: "point", at: data.target, label: "integer x", style: "optimum" },
        {
          kind: "vector",
          from: data.target,
          to: integerStart,
          label: `subtract ${int2}e²`,
          color: "#79c9c0",
          animate: true,
        },
        {
          kind: "vector",
          from: integerStart,
          to: data.t,
          label: `subtract ${int1}e¹`,
          color: "#8f88dc",
          animate: true,
        },
        { kind: "point", at: data.t, label: "integral t∈T", style: "integer", animateFrom: data.target },
      ]),
    },
    {
      id: `${data.id}-reconstruct`,
      kicker: "Theorem 37 · Final representation",
      title: "Every lattice point is a finite-core point plus nonnegative integer ray steps",
      description:
        "Starting from t, reattach the removed full recession generators. The same finite set T works for every integer point of the unbounded polyhedron.",
      formula: "P∩ℤⁿ={t+Σₑμₑe:t∈T, μₑ∈ℤ₊}",
      insight:
        "Infinite integer geometry becomes finite-state: choose one representative t∈T, then move through the recession monoid generated by E.",
      scene: scene(data, [
        {
          kind: "polygon",
          points: fundamentalCell(data),
          label: "finite core",
          style: "integer-hull",
        },
        ...data.T.map<Primitive>((point) => ({ kind: "point", at: point, label: "t∈T", style: "integer" })),
        {
          kind: "vector",
          from: data.t,
          to: integerStart,
          label: `${int1}e¹`,
          color: "#8f88dc",
          animate: true,
        },
        {
          kind: "vector",
          from: integerStart,
          to: data.target,
          label: `${int2}e²`,
          color: "#79c9c0",
          animate: true,
        },
        { kind: "point", at: data.target, label: "reconstructed x", style: "optimum" },
      ]),
    },
    {
      id: `${data.id}-integer-hull`,
      kicker: "Theorem 38 · Immediate consequence",
      title: "Convexifying the finite core and restoring the cone gives the integer hull",
      description:
        "Theorem 37 is the key input for Theorem 38. Convex combinations replace T by conv(T), while the same recession cone remains attached.",
      formula: "conv(P∩ℤⁿ)=conv(T)+cone(E)",
      insight:
        "This proves that the convex hull of all integer points of a rational polyhedron is itself a polyhedron.",
      scene: scene(data, [
        {
          kind: "polygon",
          points: [
            data.T[0],
            data.T[data.T.length - 1],
            add(data.T[data.T.length - 1], scale(5, e1)),
            add(add(data.T[data.T.length - 1], scale(5, e1)), scale(4, e2)),
            add(data.T[0], scale(4, e2)),
          ],
          label: "conv(T)+cone(E)",
          style: "integer-hull",
        },
        {
          kind: "line",
          from: data.T[0],
          to: data.T[data.T.length - 1],
          label: "conv(T)",
          style: "cut",
          color: "#f49a4a",
        },
        ...data.T.map<Primitive>((point) => ({ kind: "point", at: point, label: "T", style: "integer" })),
      ]),
    },
  ];
}

const orthantData: DecompositionExample = {
  id: "finite-core-orthant",
  title: "Orthant recession cone",
  description:
    "A fractional base segment plus the two coordinate rays. Flooring a representation of x=(5,4) leaves t=(2,1) in a finite two-point set T.",
  viewport: { x: [-0.4, 6.5], y: [-0.4, 5.5] },
  base: [[0.5, 0.5], [1.5, 0.5]],
  rays: [[1, 0], [0, 1]],
  rayEnds: [[6, 0.5], [0.5, 5]],
  target: [5, 4],
  basePoint: [1.2, 0.5],
  fractionalParts: [0.8, 0.5],
  integerParts: [3, 3],
  t: [2, 1],
  T: [[1, 1], [2, 1]],
  formula: "V={(1/2,1/2),(3/2,1/2)}, E={e₁,e₂}",
};

const skewData: DecompositionExample = {
  id: "finite-core-skew",
  title: "Skew recession cone",
  description:
    "The same flooring idea in a nonorthogonal cone generated by (1,0) and (1,1), so the bounded fundamental region becomes a slanted cell.",
  viewport: { x: [-0.4, 7.2], y: [-0.4, 4.8] },
  base: [[0.25, 0.25], [0.75, 0.25]],
  rays: [[1, 0], [1, 1]],
  rayEnds: [[6, 0.25], [4.5, 4.5]],
  target: [6, 3],
  basePoint: [0.5, 0.25],
  fractionalParts: [0.75, 0.75],
  integerParts: [2, 2],
  t: [2, 1],
  T: [[1, 1], [2, 1]],
  formula: "V={(1/4,1/4),(3/4,1/4)}, E={(1,0),(1,1)}",
};

const orthantStages = theoremStages(orthantData);
const skewStages = theoremStages(skewData);

const examples: VisualizationExample[] = [
  {
    id: orthantData.id,
    title: orthantData.title,
    description: orthantData.description,
    stages: orthantStages,
  },
  {
    id: skewData.id,
    title: skewData.title,
    description: skewData.description,
    stages: skewStages,
  },
];

const visualization: VisualizationDefinition = {
  id: "integer-points-finite-core",
  title: "Theorem 37 — Finite Integer Core and Recession Cone",
  shortTitle: "Finite set T + cone(E)",
  chapter: "Polyhedral ties",
  order: 1,
  description:
    "Follow the notes proof that every integer point of a rational polyhedron is one of finitely many bounded representatives plus nonnegative integral copies of recession generators.",
  difficulty: "Advanced",
  duration: 19,
  accent: "#79c9c0",
  controls: {
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: orthantStages,
  examples,
  proof: {
    title: "Theorem 37 exactly as used in the notes",
    steps: [
      "Write P=conv(V)+cone(E), where V is finite and the recession cone is generated by integral vectors E.",
      "Represent any x∈P∩ℤⁿ as x=Σᵥλᵥv+Σₑμₑe with λ a convex combination and μₑ≥0.",
      "Split every μₑ into its floor and fractional part.",
      "Define t=Σᵥλᵥv+Σₑ(μₑ−⌊μₑ⌋)e=x−Σₑ⌊μₑ⌋e.",
      "Because x, e, and ⌊μₑ⌋ are integral, t is integral.",
      "All fractional coefficients lie in [0,1), so t belongs to the bounded set conv(V)+Σₑ[0,1)e. Its lattice intersection T is finite.",
      "Therefore x=t+Σₑ⌊μₑ⌋e with t∈T and nonnegative integral coefficients.",
      "Theorem 38 then obtains conv(P∩ℤⁿ)=conv(T)+cone(E).",
    ],
  },
};

export default visualization;
