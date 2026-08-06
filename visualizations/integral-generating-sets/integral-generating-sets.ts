import type {
  Point2D,
  PointPrimitive,
  Primitive,
  Scene,
} from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const COLORS = {
  muted: "#7d898b",
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
  lime: "#d4ef77",
};

type PointStyle = NonNullable<PointPrimitive["style"]>;

function add(a: Point2D, b: Point2D): Point2D {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(lambda: number, v: Point2D): Point2D {
  return [lambda * v[0], lambda * v[1]];
}

function point(
  at: Point2D,
  label?: string,
  style: PointStyle = "integer",
): Primitive {
  return { kind: "point", at, label, style };
}

function vector(
  to: Point2D,
  label: string,
  color = COLORS.violet,
  from: Point2D = [0, 0],
): Primitive {
  return {
    kind: "vector",
    from,
    to,
    label,
    color,
    animate: true,
  };
}

function segment(
  from: Point2D,
  to: Point2D,
  label?: string,
  color = COLORS.violet,
): Primitive {
  return {
    kind: "line",
    from,
    to,
    label,
    style: "assignment",
    color,
    animate: true,
  };
}

function text(
  at: Point2D,
  value: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return { kind: "label", at, text: value, tone };
}

function integerPoints(
  viewport: Scene["viewport"],
  predicate: (point: Point2D) => boolean,
): Primitive[] {
  const result: Primitive[] = [];
  for (let x = Math.ceil(viewport.x[0]); x <= Math.floor(viewport.x[1]); x += 1) {
    for (let y = Math.ceil(viewport.y[0]); y <= Math.floor(viewport.y[1]); y += 1) {
      const candidate: Point2D = [x, y];
      if (predicate(candidate)) result.push(point(candidate, undefined, "lattice"));
    }
  }
  return result;
}

function scene(
  viewport: Scene["viewport"],
  primitives: Primitive[],
  primary: string,
  secondary: string,
  axisLabels: Scene["axisLabels"] = { x: "x₁", y: "x₂" },
): Scene {
  return {
    viewport,
    constraints: [],
    primitives,
    showGrid: true,
    showAxes: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showLattice: false,
    showVertices: false,
    axisLabels,
    caption: { primary, secondary },
  };
}

const cone13Viewport: Scene["viewport"] = { x: [-0.5, 8.5], y: [-0.5, 8.5] };
const cone13Polygon: Primitive = {
  kind: "polygon",
  points: [[0, 0], [8, 8 / 3], [8, 8], [8 / 3, 8]],
  label: "C=cone{(1,3),(3,1)}",
  style: "feasible",
};
const cone13Lattice = integerPoints(
  cone13Viewport,
  ([x, y]) => x >= 0 && y >= 0 && y >= x / 3 - 1e-9 && y <= 3 * x + 1e-9,
);
const cone13Basis: Point2D[] = [[1, 1], [2, 1], [1, 2], [1, 3], [3, 1]];

const extremeRayStages: VisualizationStage[] = [
  {
    id: "igs-definition",
    kicker: "Chapter 21 · Definition 125",
    title: "Integral generation is a monoid statement",
    description:
      "A set H generates F when every integer point of F is a nonnegative integer combination of finitely many vectors from H. An integral basis is an inclusion-minimal such set.",
    formula: "x∈F  ⇒  x=Σᵢ λᵢhᵢ,   hᵢ∈H, λᵢ∈ℤ₊",
    insight:
      "The coefficients may not be negative. This is why a vector-space basis or the extreme rays of a cone need not generate all lattice points.",
    scene: scene(
      cone13Viewport,
      [
        cone13Polygon,
        ...cone13Lattice,
        vector([1, 3], "v₁=(1,3)", COLORS.orange),
        vector([3, 1], "v₂=(3,1)", COLORS.aqua),
      ],
      "Integer points in a rational cone",
      "The problem is to generate C∩ℤ² with nonnegative integral coefficients.",
    ),
  },
  {
    id: "igs-rays-fail",
    kicker: "Chapter 21 · Example 126",
    title: "The two primitive extreme rays are not enough",
    description:
      "The lattice point (2,2) lies in the cone. Its unique representation using the two ray generators has coefficients 1/2 and 1/2, so it is not an integral combination of them.",
    formula: "(2,2)=½(1,3)+½(3,1)  but  (2,2)≠λ₁(1,3)+λ₂(3,1) for λ∈ℤ₊²",
    insight:
      "Real conic generation and integral conic generation are different questions. Interior lattice directions may be indispensable.",
    scene: scene(
      cone13Viewport,
      [
        cone13Polygon,
        ...cone13Lattice,
        vector([1, 3], "(1,3)", COLORS.orange),
        vector([3, 1], "(3,1)", COLORS.aqua),
        point([2, 2], "missing lattice point (2,2)", "fractional"),
        segment([1, 3], [2, 2], "½v₁+½v₂", COLORS.rose),
        segment([3, 1], [2, 2], undefined, COLORS.rose),
      ],
      "Extreme rays generate C over ℝ₊, not necessarily C∩ℤ² over ℤ₊",
      "The obstruction is visible at (2,2).",
    ),
  },
  {
    id: "igs-hilbert-basis",
    kicker: "Chapter 21 · Example 126",
    title: "Insert the missing indecomposable directions",
    description:
      "For this cone the five highlighted vectors form an integral basis. Every lattice point in the cone is a nonnegative integer combination of these vectors.",
    formula: "H={(1,1),(2,1),(1,2),(1,3),(3,1)}",
    insight:
      "The integral basis refines the two extreme rays by adding precisely the lattice directions needed between them.",
    scene: scene(
      cone13Viewport,
      [
        cone13Polygon,
        ...cone13Lattice,
        ...cone13Basis.map((h, index) =>
          vector(h, index === 0 ? "integral basis H" : `h${index + 1}`, index < 3 ? COLORS.violet : COLORS.orange),
        ),
        ...cone13Basis.map((h, index) => point(h, index === 0 ? "H" : undefined, "optimum")),
      ],
      "Hilbert basis of the pointed cone",
      "Five generators replace the insufficient pair of extreme rays.",
    ),
  },
  {
    id: "igs-generation-examples",
    kicker: "Chapter 21 · Minimality",
    title: "Generated points are sums; basis vectors cannot be removed",
    description:
      "The display gives two sample decompositions. Inclusion-minimality means that removing any one highlighted basis vector destroys the ability to generate at least one lattice point.",
    formula: "(2,2)=2(1,1),   (4,3)=(3,1)+(1,2)",
    insight:
      "Minimal with respect to inclusion does not mean smallest cardinality in arbitrary non-pointed sets; pointedness will later restore uniqueness.",
    scene: scene(
      cone13Viewport,
      [
        cone13Polygon,
        ...cone13Lattice,
        ...cone13Basis.map((h) => point(h, undefined, "optimum")),
        vector([1, 1], "2·(1,1)", COLORS.violet),
        vector([2, 2], "(2,2)", COLORS.violet, [1, 1]),
        vector([3, 1], "(3,1)", COLORS.orange),
        vector([4, 3], "+(1,2)", COLORS.aqua, [3, 1]),
        point([2, 2], "2(1,1)", "integer"),
        point([4, 3], "(3,1)+(1,2)", "integer"),
      ],
      "Integer combinations tile the lattice points of the cone",
      "The highlighted generators are the irreducible building blocks.",
    ),
  },
];

const p35Viewport: Scene["viewport"] = { x: [-1.0, 9.0], y: [-1.0, 9.0] };
const p35Cone: Primitive = {
  kind: "polygon",
  points: [[0, 0], [8.5, 0], [8.5, 9], [5.4, 9]],
  label: "cone((1,0),(3,5))",
  style: "feasible",
};
const p35Lattice = integerPoints(
  p35Viewport,
  ([x, y]) => x >= 0 && y >= 0 && 3 * y <= 5 * x,
);
const p35GeneratingSet: Point2D[] = [[1, 0], [1, 1], [2, 2], [2, 3], [3, 4], [3, 5]];
const p35Basis: Point2D[] = [[1, 0], [1, 1], [2, 3], [3, 5]];
const gordanCell: Primitive = {
  kind: "polygon",
  points: [[0, 0], [1, 0], [4, 5], [3, 5]],
  label: "P={λ₁v₁+λ₂v₂:0≤λ≤1}",
  style: "component",
};
const gordanCellPoints: Point2D[] = [
  [0, 0], [1, 0], [1, 1], [2, 2], [2, 3], [3, 4], [3, 5], [4, 5],
];

const gordanStages: VisualizationStage[] = [
  {
    id: "gordan-parametric-set",
    kicker: "Chapter 21 · Second basic example",
    title: "A finite generating set can be written down explicitly",
    description:
      "For p=(3,5), the ceiling construction selects one lattice representative at every height j=1,…,5, together with (1,0).",
    formula: "H={(1,0)}∪{(⌈3j/5⌉,j):j=1,…,5}",
    insight:
      "Writing y=5n+j separates a lattice point into n copies of p, one residue representative, and copies of (1,0).",
    scene: scene(
      p35Viewport,
      [
        p35Cone,
        ...p35Lattice,
        vector([1, 0], "(1,0)", COLORS.orange),
        vector([3, 5], "p=(3,5)", COLORS.aqua),
        ...p35GeneratingSet.map((h, index) =>
          point(h, index === 0 ? "finite generating set H" : undefined, "integer"),
        ),
      ],
      "Ceiling representatives for p=(3,5)",
      "One representative handles each residue of y modulo 5.",
    ),
  },
  {
    id: "gordan-fundamental-remainders",
    kicker: "Chapter 21 · Theorem 127 (Gordan)",
    title: "All fractional remainders lie in one bounded cell",
    description:
      "For a cone generated by integral vectors v₁,…,vₘ, reduce every real coefficient modulo one. The remaining integer point z lies in the bounded set P, so P∩ℤⁿ is finite.",
    formula: "z=Σᵢ(λᵢ−⌊λᵢ⌋)vᵢ=x−Σᵢ⌊λᵢ⌋vᵢ ∈ P∩ℤⁿ",
    insight:
      "This bounded remainder argument proves that every rational polyhedral cone has a finite integral generating set.",
    scene: scene(
      p35Viewport,
      [
        p35Cone,
        ...p35Lattice,
        gordanCell,
        vector([1, 0], "v₁=(1,0)", COLORS.orange),
        vector([3, 5], "v₂=(3,5)", COLORS.aqua),
        ...gordanCellPoints.map((z, index) =>
          point(z, index === 2 ? "P∩ℤ²: finite remainders" : undefined, "optimum"),
        ),
      ],
      "Gordan's finite remainder set",
      "The cell P is bounded even though the cone is not.",
    ),
  },
  {
    id: "gordan-floor-decomposition",
    kicker: "Chapter 21 · Proof made concrete",
    title: "Floor the coefficients and keep one finite residue",
    description:
      "The target x=(8,7) has real coefficients λ₁=3.8 and λ₂=1.4. Flooring them leaves z=(2,2), one of the finitely many points in P∩ℤ².",
    formula: "(8,7)=(2,2)+3(1,0)+(3,5)",
    insight:
      "The infinite set C∩ℤ² is generated by the finite set P∩ℤ² because the integral ray generators themselves already belong to that set.",
    scene: scene(
      p35Viewport,
      [
        p35Cone,
        ...p35Lattice,
        gordanCell,
        point([2, 2], "z=(2,2)", "optimum"),
        vector([3, 0], "3v₁", COLORS.orange),
        vector([6, 5], "+v₂", COLORS.aqua, [3, 0]),
        vector([8, 7], "+z", COLORS.violet, [6, 5]),
        point([8, 7], "x=(8,7)", "integer"),
      ],
      "x = finite residue + integral ray steps",
      "λ=(3.8,1.4), floors=(3,1), residue z=(2,2).",
    ),
  },
  {
    id: "gordan-basis-vs-generating-set",
    kicker: "Chapter 21 · Theorem 128",
    title: "Pointed cones have a unique inclusion-minimal basis",
    description:
      "The ceiling construction is a generating set, but two of its elements are redundant. In a pointed cone, the nonzero integer vectors that cannot be split into two nonzero cone lattice points form the unique integral basis.",
    formula: "H*={h∈C∩ℤⁿ∖{0}: h≠v+w for nonzero v,w∈C∩ℤⁿ}",
    insight:
      "Here (2,2)=2(1,1) and (3,4)=(1,1)+(2,3), leaving the four highlighted basis vectors.",
    scene: scene(
      p35Viewport,
      [
        p35Cone,
        ...p35Lattice,
        ...p35GeneratingSet.map((h) => point(h, undefined, "integer")),
        ...p35Basis.map((h, index) => point(h, index === 0 ? "unique integral basis" : undefined, "optimum")),
        segment([1, 1], [2, 2], "2(1,1)", COLORS.rose),
        segment([1, 1], [3, 4], "+(2,3)", COLORS.rose),
      ],
      "Generating set versus unique Hilbert basis",
      "Pointedness prevents nontrivial nonnegative cycles.",
    ),
  },
  {
    id: "gordan-face-rules",
    kicker: "Chapter 21 · Lemma 129",
    title: "Integral generators behave cleanly under two cone operations",
    description:
      "Restricting to a face keeps precisely the generators lying on that face. Adding the opposite of an integer point c to the cone requires only the additional generator −c.",
    formula: "H∩F generates F∩ℤⁿ,   and   H∪{−c} generates cone(C,−c)∩ℤⁿ",
    insight:
      "For the x-axis face only (1,0) survives. Adding −(3,5) opens the cone in the opposite direction without recomputing all old generators.",
    scene: scene(
      p35Viewport,
      [
        p35Cone,
        ...p35Lattice,
        ...p35Basis.map((h) => point(h, undefined, "integer")),
        vector([5, 0], "face F=cone((1,0))", COLORS.orange),
        point([1, 0], "H∩F={(1,0)}", "optimum"),
        vector([-3, -5], "−c=−(3,5)", COLORS.rose),
      ],
      "Faces inherit generators; adjoining −c adds one generator",
      "Both statements are exact integral analogues of simple conic operations.",
    ),
  },
];

const lineViewport: Scene["viewport"] = { x: [-6.5, 6.5], y: [-3.8, 3.8] };
const lineLattice = Array.from({ length: 7 }, (_, index) => index - 3).map((k) =>
  point([2 * k, -k], undefined, "lattice"),
);

const uniquenessStages: VisualizationStage[] = [
  {
    id: "uniqueness-pointed",
    kicker: "Chapter 21 · Pointed case",
    title: "Pointedness gives a one-way order",
    description:
      "A pointed cone contains no nonzero vector together with its negative. Therefore a nonzero lattice point cannot be altered by a nonnegative cycle, and the indecomposable vectors are forced into every generating set.",
    formula: "C∩(−C)={0}  ⇒  the integral basis is unique",
    insight:
      "This is the structural reason Theorem 128 works; it is not merely a property of the two-dimensional examples.",
    scene: scene(
      p35Viewport,
      [p35Cone, ...p35Lattice, ...p35Basis.map((h) => vector(h, "", COLORS.violet))],
      "Pointed cone",
      "No nonzero line is contained in C.",
    ),
  },
  {
    id: "uniqueness-line-first-basis",
    kicker: "Chapter 21 · Non-pointed contrast",
    title: "A line cone admits a first minimal generating set",
    description:
      "For C={x:x₁+2x₂=0}, the primitive direction g=(2,−1) and its negative generate every integer point on the line.",
    formula: "B₁={(2,−1),(−2,1)}",
    insight:
      "Both directions are needed because coefficients are restricted to ℤ₊.",
    scene: scene(
      lineViewport,
      [
        segment([-6, 3], [6, -3], "C=lin((2,−1))", COLORS.muted),
        ...lineLattice,
        vector([2, -1], "g=(2,−1)", COLORS.orange),
        vector([-2, 1], "−g", COLORS.aqua),
      ],
      "A non-pointed rational cone",
      "The cone is the complete line through g.",
    ),
  },
  {
    id: "uniqueness-line-second-basis",
    kicker: "Chapter 21 · Non-uniqueness",
    title: "A different inclusion-minimal basis generates the same line lattice",
    description:
      "Replace g by 2g while keeping −g. The missing vector g is recovered as 2g+(−g), so the new pair still generates the entire integer line.",
    formula: "B₂={(4,−2),(−2,1)},   (2,−1)=(4,−2)+(−2,1)",
    insight:
      "Non-pointed cones allow nonnegative cycles. Consequently, inclusion-minimal integral bases need not be unique.",
    scene: scene(
      lineViewport,
      [
        segment([-6, 3], [6, -3], "C", COLORS.muted),
        ...lineLattice,
        vector([4, -2], "2g=(4,−2)", COLORS.violet),
        vector([-2, 1], "−g", COLORS.aqua),
        vector([2, -1], "2g+(−g)=g", COLORS.rose),
      ],
      "Two different integral bases of the same non-pointed cone",
      "Uniqueness in Theorem 128 genuinely needs pointedness.",
    ),
  },
];

const caratheodoryViewport: Scene["viewport"] = { x: [-0.5, 5.5], y: [-0.5, 15.5] };
const caratheodoryCone: Primitive = {
  kind: "polygon",
  points: [[0, 0], [5.2, 0], [3.1, 15.5]],
  label: "C=cone((1,0),(1,5))",
  style: "feasible",
};
const caratheodoryLattice = integerPoints(
  caratheodoryViewport,
  ([x, y]) => x >= 0 && y >= 0 && y <= 5 * x,
);
const hP5: Point2D[] = [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]];

const caratheodoryStages: VisualizationStage[] = [
  {
    id: "integer-caratheodory-fan",
    kicker: "Chapter 22 · Example 130",
    title: "Consecutive Hilbert vectors split the cone into unimodular sectors",
    description:
      "For C=cone((1,0),(1,p)), the integral basis is H={(1,j):j=0,…,p}. The sectors between consecutive vectors cover the cone.",
    formula: "C=⋃ᵢ cone((1,i−1),(1,i))",
    insight:
      "Inside each two-dimensional sector, integrality of the target forces both conic coefficients to be integers.",
    scene: scene(
      caratheodoryViewport,
      [
        caratheodoryCone,
        ...caratheodoryLattice,
        ...hP5.map((h, index) => vector(scale(2.8, h), `h${index}=(1,${index})`, index % 2 === 0 ? COLORS.violet : COLORS.aqua)),
        ...hP5.map((h) => point(h, undefined, "optimum")),
      ],
      "Hilbert fan for p=5",
      "Adjacent Hilbert vectors delimit five subcones.",
    ),
  },
  {
    id: "integer-caratheodory-target-sector",
    kicker: "Chapter 22 · Locate one integer point",
    title: "The slope identifies the adjacent pair",
    description:
      "The target x=(4,9) has slope 9/4 between 2 and 3, so it lies in the sector generated by (1,2) and (1,3).",
    formula: "(4,9)=λ₁(1,2)+λ₂(1,3)",
    insight:
      "The entire basis may be large, but a single target lies in one local sector.",
    scene: scene(
      caratheodoryViewport,
      [
        caratheodoryCone,
        ...caratheodoryLattice,
        ...hP5.map((h) => vector(scale(2.8, h), "", COLORS.muted)),
        vector(scale(4.8, [1, 2]), "sector ray (1,2)", COLORS.orange),
        vector(scale(4.8, [1, 3]), "sector ray (1,3)", COLORS.aqua),
        point([4, 9], "x=(4,9)", "fractional"),
      ],
      "Choose the subcone containing x",
      "9/4∈[2,3].",
    ),
  },
  {
    id: "integer-caratheodory-two-generators",
    kicker: "Chapter 22 · Integer coefficients",
    title: "The two real coefficients are automatically integral",
    description:
      "Solving the two equations gives λ₂=y−2x=1 and λ₁=x−λ₂=3. Hence only two Hilbert basis elements are used.",
    formula: "(4,9)=3(1,2)+(1,3)",
    insight:
      "In dimension two this family satisfies the hoped-for bound n=2 exactly.",
    scene: scene(
      caratheodoryViewport,
      [
        caratheodoryCone,
        ...caratheodoryLattice,
        vector([3, 6], "3(1,2)", COLORS.orange),
        vector([4, 9], "+(1,3)", COLORS.aqua, [3, 6]),
        point([4, 9], "x=(4,9)", "optimum"),
      ],
      "A sparse integral representation",
      "Three copies of one generator and one copy of its neighbor: support size 2.",
    ),
  },
  {
    id: "integer-caratheodory-general-bound",
    kicker: "Chapter 22 · Theorem 131",
    title: "In general, the proven support bound is 2n−1",
    description:
      "Maximize the sum of coefficients in a real representation and choose an optimal basic solution λ*. At most n coefficients are nonzero. Removing their integer parts leaves an integer residue whose integral representation uses at most n−1 additional basis elements.",
    formula: "x=Σ⌊λᵢ*⌋hᵢ+Σμᵢhᵢ,   |supp⌊λ*⌋|≤n, |supp μ|≤n−1",
    insight:
      "Therefore every point uses at most 2n−1 Hilbert basis elements. The notes also record Sebő's stronger bound 2n−2.",
    scene: scene(
      { x: [-0.5, 10.5], y: [-0.5, 7.2] },
      [
        text([1.2, 6.2], "ordinary Carathéodory", "muted"),
        text([1.2, 5.3], "≤ n real generators", "accent"),
        segment([2.3, 4.6], [4.5, 4.6], "floor coefficients", COLORS.orange),
        text([1.0, 3.8], "basic solution λ*", "default"),
        text([4.8, 4.6], "+", "muted"),
        segment([5.5, 4.6], [7.7, 4.6], "integral residue", COLORS.aqua),
        text([5.3, 3.8], "≤ n−1 further elements", "default"),
        text([2.6, 2.2], "Theorem 131: ≤ 2n−1", "accent"),
        text([2.6, 1.2], "Sebő strengthening: ≤ 2n−2", "accent"),
      ],
      "Integer Carathéodory support bounds",
      "The multiplicities may be large; the theorem bounds only the number of distinct basis elements used.",
      { x: "proof step", y: "" },
    ),
  },
];

const graverProjectionViewport: Scene["viewport"] = { x: [-2.7, 2.7], y: [-3.0, 3.0] };
const projectedKernel = integerPoints(graverProjectionViewport, () => true);
const graverProjected: Array<{ at: Point2D; label: string }> = [
  { at: [-1, 0], label: "(2,−1,0)" },
  { at: [-1, 2], label: "(0,−1,2)" },
  { at: [0, -1], label: "(1,0,−1)" },
  { at: [-1, 1], label: "(1,−1,1)" },
  { at: [1, 0], label: "−(2,−1,0)" },
  { at: [1, -2], label: "−(0,−1,2)" },
  { at: [0, 1], label: "−(1,0,−1)" },
  { at: [1, -1], label: "−(1,−1,1)" },
];

function feasibleParameterPoints(): Primitive[] {
  const result: Primitive[] = [];
  for (let x2 = 0; x2 <= 4; x2 += 1) {
    for (let x3 = 0; x3 <= 8; x3 += 1) {
      if (2 * x2 + x3 <= 8) result.push(point([x2, x3], undefined, "lattice"));
    }
  }
  return result;
}

const feasibleTriangle: Primitive = {
  kind: "polygon",
  points: [[0, 0], [4, 0], [0, 8]],
  label: "2x₂+x₃≤8",
  style: "feasible",
};

const graverStages: VisualizationStage[] = [
  {
    id: "graver-orthant-hilbert-bases",
    kicker: "Chapter 22 · Definition 133",
    title: "Split the integer kernel into orthants",
    description:
      "For every orthant Oⱼ, intersect ker(A) with Oⱼ and take its integral basis Hⱼ. Their union is the Graver basis. The picture uses coordinates (s,t)=(h₂,h₃), with h₁=−2s−t, for A=[1 2 1].",
    formula: "Cⱼ={h∈Oⱼ:Ah=0},   G[A]=⋃ⱼ Hⱼ",
    insight:
      "Orthant compatibility is what later guarantees that taking one generator step cannot overshoot the componentwise interval between two feasible points.",
    scene: scene(
      graverProjectionViewport,
      [
        ...projectedKernel,
        segment([-2.5, 0], [2.5, 0], "t=0", COLORS.muted),
        segment([0, -2.8], [0, 2.8], "s=0", COLORS.muted),
        ...graverProjected.map(({ at, label }) => point(at, label, "optimum")),
      ],
      "Two-coordinate chart of ker([1 2 1])∩ℤ³",
      "Each plotted point (s,t) represents h=(−2s−t,s,t).",
      { x: "s=h₂", y: "t=h₃" },
    ),
  },
  {
    id: "graver-explicit-basis",
    kicker: "Chapter 22 · Example 134",
    title: "The Graver basis is a finite set of primitive signed moves",
    description:
      "For A=[1 2 1], the eight highlighted points are exactly the four listed primitive moves and their negatives.",
    formula: "G[A]=±{(2,−1,0),(0,−1,2),(1,0,−1),(1,−1,1)}",
    insight:
      "Every integer kernel vector is a conformal nonnegative integer combination of Graver moves from its orthant.",
    scene: scene(
      graverProjectionViewport,
      [
        ...projectedKernel,
        ...graverProjected.map(({ at, label }, index) =>
          vector(at, label, index < 4 ? COLORS.violet : COLORS.aqua),
        ),
        ...graverProjected.map(({ at }) => point(at, undefined, "optimum")),
      ],
      "Graver basis of A=[1 2 1]",
      "Finite test directions extracted from all orthant Hilbert bases.",
      { x: "h₂", y: "h₃" },
    ),
  },
  {
    id: "graver-nonoptimal-point",
    kicker: "Chapter 22 · Theorem 135",
    title: "A nonoptimal feasible point exposes an improving Graver move",
    description:
      "Consider Ax=8, x≥0, and maximize x₁. In displayed coordinates (x₂,x₃), x=(0,4,0) is the point (4,0), while the optimum y=(8,0,0) is (0,0). Their difference is four copies of h=(2,−1,0).",
    formula: "y−x=(8,−4,0)=4(2,−1,0),   cᵀh=2>0",
    insight:
      "At least one generator in a conformal decomposition of the improving difference must itself improve the objective.",
    scene: scene(
      { x: [-0.5, 4.7], y: [-0.5, 8.7] },
      [
        feasibleTriangle,
        ...feasibleParameterPoints(),
        point([4, 0], "x=(0,4,0)", "fractional"),
        point([0, 0], "y=(8,0,0)", "optimum"),
        segment([4, 0], [0, 0], "y−x=4h", COLORS.rose),
      ],
      "Feasible integer points for x₁+2x₂+x₃=8",
      "Maximizing x₁ means moving toward (x₂,x₃)=(0,0).",
      { x: "x₂", y: "x₃" },
    ),
  },
  {
    id: "graver-augmentation",
    kicker: "Chapter 22 · One-step certificate",
    title: "One primitive move stays feasible and improves",
    description:
      "Adding h=(2,−1,0) changes (x₂,x₃) by (−1,0). The move can be repeated until the optimum is reached, but Theorem 135 needs only the existence of one feasible improving step to certify nonoptimality.",
    formula: "(0,4,0)→(2,3,0)→(4,2,0)→(6,1,0)→(8,0,0)",
    insight:
      "The Graver basis is a finite universal test set for every right-hand side b, upper bound u, and linear objective c associated with the fixed matrix A.",
    scene: scene(
      { x: [-0.5, 4.7], y: [-0.5, 8.7] },
      [
        feasibleTriangle,
        ...feasibleParameterPoints(),
        ...[[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]].map((q, index) =>
          point(q as Point2D, index === 0 ? "start" : index === 4 ? "optimum" : undefined, index === 4 ? "optimum" : "integer"),
        ),
        segment([4, 0], [3, 0], "h", COLORS.violet),
        segment([3, 0], [2, 0], "h", COLORS.violet),
        segment([2, 0], [1, 0], "h", COLORS.violet),
        segment([1, 0], [0, 0], "h", COLORS.violet),
      ],
      "Graver augmentation path",
      "Every step preserves Ax=8 and nonnegativity while increasing x₁ by 2.",
      { x: "x₂", y: "x₃" },
    ),
  },
  {
    id: "graver-optimality-condition",
    kicker: "Chapter 22 · Optimality condition",
    title: "No feasible improving Graver step means optimal",
    description:
      "A feasible x is optimal exactly when every Graver move either has nonpositive objective gain or leaves the feasible set when added to x.",
    formula: "x optimal ⇔ ∀h∈G[A]: cᵀh≤0 or (cᵀh>0 and x+h∉F)",
    insight:
      "This is a finite certificate of optimality. It does not by itself imply an efficient algorithm because the Graver basis may be exponentially large.",
    scene: scene(
      { x: [-0.5, 4.7], y: [-0.5, 8.7] },
      [
        feasibleTriangle,
        ...feasibleParameterPoints(),
        point([0, 0], "x*=(8,0,0)", "optimum"),
        segment([0, 0], [-1, 0], "improving h leaves F", COLORS.rose),
        text([1.0, 6.8], "all improving Graver moves blocked", "accent"),
      ],
      "Finite optimality certificate at x*",
      "Any move increasing x₁ would require x₂<0 or x₃<0.",
      { x: "x₂", y: "x₃" },
    ),
  },
  {
    id: "graver-convex-extension",
    kicker: "Chapter 22 · Theorem 137",
    title: "The same idea extends to one-dimensional convex objectives",
    description:
      "For minimizing f(wᵀx), refine each orthant kernel cone by the sign of wᵀh. The resulting finite union of integral bases is again an exact test set.",
    formula: "x optimal ⇔ no feasible h with f(wᵀ(x+h))<f(wᵀx)",
    insight:
      "Convexity ensures that if a sum of sign-compatible moves improves the objective, at least one constituent basis move already improves it.",
    scene: scene(
      { x: [-0.5, 10.5], y: [-0.5, 7.2] },
      [
        text([0.8, 6.2], "split each Cⱼ by wᵀh≥0 / wᵀh≤0", "default"),
        segment([1.5, 5.2], [4.1, 5.2], "Hⱼ≥", COLORS.orange),
        segment([1.5, 4.2], [4.1, 4.2], "Hⱼ≤", COLORS.aqua),
        text([5.0, 4.7], "finite test set", "accent"),
        text([1.0, 2.8], "improving total displacement", "muted"),
        segment([1.1, 2.0], [8.2, 2.0], "⇒ one improving basis move", COLORS.violet),
      ],
      "Convex Graver optimality test",
      "The sign split lets the convexity inequality be applied along one monotone scalar direction.",
      { x: "argument", y: "" },
    ),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "extreme-rays-versus-integral-basis",
    title: "Extreme rays versus an integral basis",
    description:
      "Why real ray generators may miss lattice points, and how a Hilbert basis repairs the gap.",
    stages: extremeRayStages,
    proof: {
      title: "Why the ray pair fails",
      steps: [
        "Solve (2,2)=λ₁(1,3)+λ₂(3,1).",
        "The unique solution is λ₁=λ₂=1/2.",
        "Therefore (2,2) belongs to the cone but not to the nonnegative integer monoid generated by the two rays.",
      ],
    },
  },
  {
    id: "gordan-and-pointed-uniqueness",
    title: "Gordan's theorem and the pointed Hilbert basis",
    description:
      "The bounded remainder construction, an explicit p=(3,5) example, uniqueness, and face operations.",
    stages: gordanStages,
    proof: {
      title: "Finite generation by coefficient remainders",
      steps: [
        "Write x=Σλᵢvᵢ with λᵢ≥0 and integral ray generators vᵢ.",
        "Set z=Σ(λᵢ−⌊λᵢ⌋)vᵢ. Then z is integral and lies in the bounded cell 0≤λᵢ≤1.",
        "Recover x=z+Σ⌊λᵢ⌋vᵢ. Hence the finite set P∩ℤⁿ generates every integer point of the cone.",
      ],
    },
  },
  {
    id: "pointed-versus-nonpointed",
    title: "Why pointedness is necessary for uniqueness",
    description:
      "A line cone has two different inclusion-minimal integral generating sets.",
    stages: uniquenessStages,
  },
  {
    id: "integer-caratheodory",
    title: "Integer Carathéodory",
    description:
      "A two-dimensional exact decomposition and the general 2n−1 support argument.",
    stages: caratheodoryStages,
    proof: {
      title: "The 2n−1 support count",
      steps: [
        "Choose an optimal basic solution λ* maximizing Σλᵢ subject to x=Σλᵢhᵢ, λ≥0. Its support has size at most n.",
        "Remove the integer parts. The remainder y=Σ(λᵢ*−⌊λᵢ*⌋)hᵢ is again an integer point of the cone.",
        "Represent y integrally as Σμᵢhᵢ. Optimality of λ* gives Σμᵢ<n, hence at most n−1 coefficients μᵢ are positive.",
        "Combining both pieces uses at most n+(n−1)=2n−1 distinct basis elements.",
      ],
    },
  },
  {
    id: "graver-optimality",
    title: "Graver basis optimality certificates",
    description:
      "Build the Graver basis from orthant Hilbert bases and use it as a finite augmentation test set.",
    stages: graverStages,
    proof: {
      title: "Why one improving Graver move exists",
      steps: [
        "For a nonoptimal x choose a better feasible y. Then d=y−x is an integer kernel vector with cᵀd>0.",
        "Choose the orthant containing d and decompose d=Σλᵢhᵢ using that orthant's integral basis.",
        "At least one hᵣ has positive objective gain. Sign compatibility ensures x+hᵣ stays componentwise between x and y, hence remains feasible.",
        "Thus absence of a feasible improving Graver move is equivalent to optimality.",
      ],
    },
  },
];

const visualization: VisualizationDefinition = {
  id: "integral-generating-sets-chapters-21-22",
  title: "Integral Generating Sets, Integer Carathéodory, and Graver Optimality",
  shortTitle: "Integral generating sets",
  chapter: "Integral generating sets",
  order: 1,
  description:
    "A visual module for Chapters 21 and 22: integral bases of cones, Gordan's finite-generation theorem, pointed uniqueness, the integer Carathéodory bound, and Graver-basis optimality certificates.",
  difficulty: "Advanced",
  duration: 28,
  accent: COLORS.violet,
  visualLabel: "Cone and lattice view",
  insightLabel: "Discrete consequence",
  controls: {
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: extremeRayStages,
  examples,
  proof: {
    title: "Chapter map",
    steps: [
      "Definition 125 and Example 126: distinguish real cone generators from integral generators.",
      "Theorems 127–128 and Lemma 129: finite generation, uniqueness for pointed cones, and stability under cone operations.",
      "Theorem 131: every integer cone point has a representation supported on at most 2n−1 Hilbert basis elements.",
      "Definitions 133–Theorem 135: orthant Hilbert bases form the Graver basis, a finite universal optimality test set.",
      "Theorem 137: the test-set principle extends to objectives f(wᵀx) with convex f.",
    ],
  },
};

export default visualization;
