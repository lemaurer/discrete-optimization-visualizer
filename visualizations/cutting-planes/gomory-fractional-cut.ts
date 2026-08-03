import type {
  Constraint,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationStage,
} from "@/visualizations/types";

const COLORS = {
  cut: "#e27c89",
  tableau: "#8f88dc",
  objective: "#f49a4a",
};

const viewport: Scene["viewport"] = {
  x: [-0.45, 2.15],
  y: [-0.45, 2.15],
};

const originalConstraints: Constraint[] = [
  { id: "row-1", a: 2, b: 1, limit: 3, label: "2x₁+x₂≤3" },
  { id: "row-2", a: 1, b: 2, limit: 3, label: "x₁+2x₂≤3" },
  { id: "nonnegative-x1", a: -1, b: 0, limit: 0, label: "x₁≥0" },
  { id: "nonnegative-x2", a: 0, b: -1, limit: 0, label: "x₂≥0" },
];

const gomoryConstraint: Constraint = {
  id: "gomory-x1",
  a: 1,
  b: 0,
  limit: 1,
  label: "Gomory cut · x₁≤1",
  color: COLORS.cut,
};

const secondGomoryConstraint: Constraint = {
  id: "gomory-x2",
  a: 0,
  b: 1,
  limit: 1,
  label: "symmetric cut · x₂≤1",
  color: COLORS.tableau,
};

const lpOptimum: Point2D = [1.5, 0];
const integerOptimum: Point2D = [1, 1];

const fractionalCap: Primitive = {
  kind: "polygon",
  points: [
    [1, 0],
    [1.5, 0],
    [1, 1],
  ],
  label: "removed fractional cap",
  style: "removed",
};

const integerPoints: Primitive[] = [
  { kind: "point", at: [0, 0], label: "(0,0)", style: "integer" },
  { kind: "point", at: [1, 0], label: "(1,0)", style: "integer" },
  { kind: "point", at: [0, 1], label: "(0,1)", style: "integer" },
  { kind: "point", at: [1, 1], label: "(1,1)", style: "integer" },
];

function scene(
  constraints: Constraint[] = originalConstraints,
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport,
    constraints,
    primitives,
    showGrid: true,
    showAxes: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showLattice: true,
    showVertices: true,
    axisLabels: { x: "x₁", y: "x₂" },
    objective: { vector: [1, 0.2], label: "max x₁+0.2x₂" },
    ...overrides,
  };
}

const tableauLabels = (
  highlighted: "row" | "fractions" | "cut",
): Primitive[] => [
  {
    kind: "label",
    at: [0.05, 1.93],
    text: "optimal row:  x₁ = 3/2 − 1/2 x₂ − 1/2 s₁",
    tone: highlighted === "row" ? "accent" : "default",
  },
  {
    kind: "label",
    at: [0.05, 1.68],
    text: "fractional parts:  f=(1/2; 1/2, 1/2)",
    tone: highlighted === "fractions" ? "accent" : "muted",
  },
  {
    kind: "label",
    at: [0.05, 1.43],
    text: "cut:  1/2 x₂ + 1/2 s₁ ≥ 1/2",
    tone: highlighted === "cut" ? "accent" : "muted",
  },
];

const stages: VisualizationStage[] = [
  {
    id: "integer-program",
    kicker: "01 · Pure integer program",
    title: "Begin with an integer problem and forget integrality",
    description:
      "We maximize x₁+0.2x₂ over two integral packing inequalities. The blue polygon is the LP relaxation; the dots are the feasible integer solutions.",
    formula:
      "max{x₁+0.2x₂ : 2x₁+x₂≤3, x₁+2x₂≤3, x∈ℤ²₊}",
    insight:
      "Gomory cuts are generated from an optimal simplex tableau of the relaxation, not guessed directly from the picture.",
    scene: scene(originalConstraints, integerPoints, {
      caption: {
        label: "LP relaxation",
        detail: "continuous polygon around discrete feasible points",
      },
    }),
  },
  {
    id: "fractional-optimum",
    kicker: "02 · Solve the LP relaxation",
    title: "The objective reaches a fractional vertex first",
    description:
      "The relaxed optimum is x̄=(3/2,0) with value 3/2. It violates x₁∈ℤ, while the best integer point is (1,1) with value 1.2.",
    formula: "zLP=1.5 at x̄=(1.5,0)   >   zIP=1.2 at x*=(1,1)",
    insight:
      "The difference 0.3 is the integrality gap that the cutting-plane algorithm tries to close.",
    scene: scene(originalConstraints, [
      ...integerPoints,
      {
        kind: "point",
        at: lpOptimum,
        label: "x̄=(3/2,0) · LP optimum",
        style: "fractional",
        active: true,
      },
    ], {
      caption: { label: "Fractional optimum", detail: "objective value 1.5" },
    }),
  },
  {
    id: "tableau-row",
    kicker: "03 · Read one tableau row",
    title: "Choose a basic variable with a fractional right-hand side",
    description:
      "The first constraint has slack s₁≥0. At the LP optimum, the tableau expresses the fractional basic variable x₁ using the nonbasic integer variables x₂ and s₁.",
    formula: "2x₁+x₂+s₁=3   ⇔   x₁=3/2−(1/2)x₂−(1/2)s₁",
    insight:
      "Because the original matrix and right-hand side are integral, the slack s₁ is also integer whenever x is integer.",
    scene: scene(originalConstraints, [
      ...tableauLabels("row"),
      { kind: "point", at: lpOptimum, label: "x̄", style: "fractional" },
    ], {
      showLattice: false,
      caption: { label: "Fractional tableau row", detail: "basic value 3/2" },
    }),
  },
  {
    id: "fractional-parts",
    kicker: "04 · Keep only fractional parts",
    title: "Strip every coefficient down to its fractional remainder",
    description:
      "For f(t)=t−⌊t⌋, the right-hand side and both nonbasic coefficients have fractional part 1/2.",
    formula: "f(3/2)=f(1/2)=1/2",
    insight:
      "Integer parts can be absorbed by integer variables. Only the remainders obstruct the tableau row from evaluating to an integer.",
    scene: scene(originalConstraints, [
      ...tableauLabels("fractions"),
      { kind: "point", at: lpOptimum, label: "fractional RHS 3/2", style: "fractional" },
    ], {
      showLattice: false,
      caption: { label: "Fractional-part operator", detail: "f(t)=t−⌊t⌋" },
    }),
  },
  {
    id: "gomory-formula",
    kicker: "05 · Gomory fractional cut",
    title: "The tableau row yields a valid inequality automatically",
    description:
      "For a pure-integer row xB=b̄−Σāⱼxⱼ, Gomory’s rule requires the fractional coefficients to contribute at least the fractional part of b̄.",
    formula: "Σⱼ f(āⱼ)xⱼ ≥ f(b̄)   ⇒   ½x₂+½s₁≥½",
    insight:
      "At the LP solution x₂=s₁=0, the left side is zero, so the inequality separates x̄ immediately.",
    scene: scene(originalConstraints, [
      ...tableauLabels("cut"),
      { kind: "point", at: lpOptimum, label: "0 ≥ 1/2 · violated", style: "fractional" },
    ], {
      showLattice: false,
      caption: { label: "Cut in tableau variables", detail: "½x₂+½s₁≥½" },
    }),
  },
  {
    id: "substitute-slack",
    kicker: "06 · Return to x-space",
    title: "Eliminate the slack and reveal a simple geometric cut",
    description:
      "Substitute s₁=3−2x₁−x₂. The tableau inequality collapses to the vertical half-space x₁≤1.",
    formula: "½x₂+½(3−2x₁−x₂)≥½   ⇔   x₁≤1",
    insight:
      "The algebraic tableau cut and the geometric red line are exactly the same inequality in different coordinates.",
    scene: scene([...originalConstraints, gomoryConstraint], [
      ...integerPoints,
      { kind: "point", at: lpOptimum, label: "cut off", style: "fractional" },
      {
        kind: "line",
        from: [1.5, -0.2],
        to: [1, 1.72],
        label: "pivot into x₁≤1",
        style: "cut",
        color: COLORS.cut,
        animate: true,
      },
    ], {
      caption: { label: "Gomory cut in x-space", detail: "x₁≤1" },
    }),
  },
  {
    id: "remove-cap",
    kicker: "07 · Tighten the relaxation",
    title: "The cut removes the fractional cap containing x̄",
    description:
      "Intersect the relaxation with x₁≤1. The rejected triangle disappears, including the former LP optimum.",
    formula: "P¹=P⁰∩{x:x₁≤1}",
    insight:
      "A useful cut removes the current fractional optimum while retaining every feasible integer point.",
    scene: scene([...originalConstraints, gomoryConstraint], [
      fractionalCap,
      ...integerPoints,
      { kind: "point", at: lpOptimum, label: "rejected x̄", style: "fractional" },
    ], {
      caption: { label: "First Gomory relaxation", detail: "fractional cap removed" },
    }),
  },
  {
    id: "validity",
    kicker: "08 · Why no integer point is lost",
    title: "Integrality turns the row into a remainder contradiction",
    description:
      "If an integer solution violated the cut, then ½x₂+½s₁<½. Nonnegativity and integrality force x₂=s₁=0, but the tableau row would then give x₁=3/2—not an integer.",
    formula: "x₂,s₁∈ℤ₊ and ½x₂+½s₁<½ ⇒ x₂=s₁=0 ⇒ x₁=3/2 ∉ℤ",
    insight:
      "This contradiction is the validity proof specialized to the displayed tableau row.",
    scene: scene([...originalConstraints, gomoryConstraint], integerPoints, {
      showIntegerHull: true,
      caption: { label: "Validity certificate", detail: "all four integer points survive" },
    }),
  },
  {
    id: "reoptimize",
    kicker: "09 · Resolve the tightened LP",
    title: "Reoptimization lands on the integer optimum",
    description:
      "With x₁≤1 added, the objective moves to x*=(1,1). Its value 1.2 matches the integer optimum, so the algorithm can stop for this objective.",
    formula: "max{cᵀx:x∈P¹}=cᵀ(1,1)=1.2=zIP",
    insight:
      "Simplex can warm-start from the previous tableau, which is why repeated cutting-plane rounds are computationally natural.",
    scene: scene([...originalConstraints, gomoryConstraint], [
      ...integerPoints,
      {
        kind: "point",
        at: integerOptimum,
        label: "x*=(1,1) · integral optimum",
        style: "optimum",
        active: true,
        animateFrom: lpOptimum,
      },
    ], {
      caption: { label: "Reoptimized LP", detail: "integral optimum · value 1.2" },
    }),
  },
  {
    id: "objective-vs-hull",
    kicker: "10 · An important distinction",
    title: "Solving this objective does not mean the entire integer hull is known",
    description:
      "The point (0,3/2) remains in P¹, although it is fractional. It cannot improve the chosen objective, so the algorithm may stop even though the relaxation is larger than conv(P∩ℤ²).",
    formula: "x* integral   but   P¹ ⊋ conv(P∩ℤ²)",
    insight:
      "Cutting planes solve an optimization problem; they need not reconstruct every facet of the integer hull first.",
    scene: scene([...originalConstraints, gomoryConstraint], [
      ...integerPoints,
      { kind: "point", at: [0, 1.5], label: "fractional but harmless", style: "fractional" },
      { kind: "point", at: integerOptimum, label: "chosen optimum", style: "optimum" },
    ], {
      showIntegerHull: true,
      caption: { label: "Optimum versus integer hull", detail: "P¹ still has one fractional corner" },
    }),
  },
  {
    id: "second-cut",
    kicker: "11 · Continue if the hull matters",
    title: "A symmetric Gomory row removes the remaining fractional corner",
    description:
      "Applying the same construction to the second row yields x₂≤1. Together, the two cuts produce the unit square—the integer hull for this example.",
    formula: "P²=P⁰∩{x₁≤1}∩{x₂≤1}=conv(P∩ℤ²)",
    insight:
      "Different fractional basic rows expose different missing facets; a round may therefore add more than one Gomory cut.",
    scene: scene(
      [...originalConstraints, gomoryConstraint, secondGomoryConstraint],
      [
        ...integerPoints,
        {
          kind: "line",
          from: [-0.15, 1.5],
          to: [1.72, 1],
          label: "second cut → x₂≤1",
          style: "cut",
          color: COLORS.tableau,
          animate: true,
        },
      ],
      {
        showIntegerHull: true,
        caption: { label: "Integer hull reached", detail: "0≤x₁,x₂≤1" },
      },
    ),
  },
  {
    id: "algorithm-loop",
    kicker: "12 · Gomory cutting-plane algorithm",
    title: "Solve, inspect a fractional row, cut, and repeat",
    description:
      "Each round solves the current LP, selects a tableau row with fractional basic value, adds its Gomory cut, and reoptimizes until the optimum is integral.",
    formula: "solve LP → fractional row → Gomory cut → reoptimize → ⋯ → integer optimum",
    insight:
      "The essential bridge is the tableau: arithmetic remainders become a geometric inequality that separates the current LP vertex.",
    scene: scene(
      [...originalConstraints, gomoryConstraint, secondGomoryConstraint],
      [
        ...integerPoints,
        { kind: "point", at: lpOptimum, label: "LP⁰", style: "fractional" },
        {
          kind: "vector",
          from: lpOptimum,
          to: integerOptimum,
          label: "cut + reoptimize",
          color: COLORS.cut,
          animate: true,
        },
        { kind: "point", at: integerOptimum, label: "IP optimum", style: "optimum" },
      ],
      {
        showIntegerHull: true,
        caption: { label: "Gomory loop", detail: "fractional tableau → valid separator" },
      },
    ),
  },
];

const visualization: VisualizationDefinition = {
  id: "gomory-fractional-cut",
  title: "Gomory Fractional Cuts",
  shortTitle: "Gomory cuts",
  chapter: "Cutting planes",
  order: 8,
  description:
    "Turn one fractional simplex-tableau row into a valid separating inequality, watch it remove the LP optimum, and reoptimize to an integer solution.",
  difficulty: "Intermediate",
  duration: 15,
  accent: COLORS.cut,
  visualLabel: "Tableau → cut",
  insightLabel: "Cutting-plane insight",
  controls: {
    constraints: true,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages,
  proof: {
    title: "Why is the Gomory fractional cut valid?",
    steps: [
      "Take a pure-integer tableau row xB=b̄−Σāⱼxⱼ whose basic value b̄ is fractional.",
      "Write every coefficient as āⱼ=⌊āⱼ⌋+f(āⱼ) and b̄=⌊b̄⌋+f(b̄).",
      "Because xB and every xⱼ are integer, the integer parts can be moved across the equality without affecting integrality.",
      "If Σf(āⱼ)xⱼ<f(b̄), the remaining nonnegative fractional contribution cannot bridge the fractional remainder of b̄ to an integer value.",
      "Therefore every integer solution satisfies Σf(āⱼ)xⱼ≥f(b̄), while the current basic LP solution violates it because all nonbasic variables equal zero.",
      "For the displayed row this is ½x₂+½s₁≥½; substituting s₁=3−2x₁−x₂ gives x₁≤1.",
    ],
  },
};

export default visualization;
