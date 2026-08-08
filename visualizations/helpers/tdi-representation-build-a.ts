import type { Point2D, Primitive } from "@/engine/types";
import type {
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS,
  label2D,
  line2D,
  point2D,
  scene2D,
  vector2D,
} from "@/visualizations/helpers/tdi-scenes";

type Row = {
  id: string;
  a: Point2D;
  rhs: number;
  label: string;
  source: "C" | "F1" | "F2" | "F3";
};

type Box2D = {
  x: [number, number];
  y: [number, number];
};

const LEFT_OFFSET = -3.55;
const RIGHT_OFFSET = 2.25;
const LOCAL_BOX: Box2D = { x: [-0.75, 2.75], y: [-0.75, 2.75] };
const VIEWPORT = {
  x: [-4.55, 5.35] as [number, number],
  y: [-1.0, 3.35] as [number, number],
};

const triangle: Point2D[] = [[0, 0], [1, 2], [2, 0]];

const c1: Row = { id: "c1", a: [0, -1], rhs: 0, label: "c₁=(0,−1): −x₂≤0", source: "C" };
const c2: Row = { id: "c2", a: [-2, 1], rhs: 0, label: "c₂=(−2,1): −2x₁+x₂≤0", source: "C" };
const c3: Row = { id: "c3", a: [2, 1], rhs: 4, label: "c₃=(2,1): 2x₁+x₂≤4", source: "C" };
const originalRows = [c1, c2, c3];

const h1Rows: Row[] = [
  { ...c1, source: "F1" },
  { id: "left-horizontal", a: [-1, 0], rhs: 0, label: "(−1,0): −x₁≤0", source: "F1" },
  { ...c2, source: "F1" },
];

const h2Rows: Row[] = [
  { ...c2, source: "F2" },
  { id: "apex-left", a: [-1, 1], rhs: 1, label: "(−1,1): −x₁+x₂≤1", source: "F2" },
  { id: "apex-up", a: [0, 1], rhs: 2, label: "(0,1): x₂≤2", source: "F2" },
  { id: "apex-right", a: [1, 1], rhs: 3, label: "(1,1): x₁+x₂≤3", source: "F2" },
  { ...c3, source: "F2" },
];

const h3Rows: Row[] = [
  { ...c1, source: "F3" },
  { id: "right-horizontal", a: [1, 0], rhs: 2, label: "(1,0): x₁≤2", source: "F3" },
  { ...c3, source: "F3" },
];

function sourceColor(source: Row["source"]) {
  switch (source) {
    case "F1": return TDI_COLORS.orange;
    case "F2": return TDI_COLORS.violet;
    case "F3": return TDI_COLORS.aqua;
    default: return TDI_COLORS.muted;
  }
}

function shift([x, y]: Point2D, dx: number): Point2D {
  return [x + dx, y];
}

function shiftedPolygon(points: Point2D[], dx: number, style: "feasible" | "component" = "feasible"): Primitive {
  return {
    kind: "polygon",
    points: points.map((p) => shift(p, dx)),
    style,
  };
}

function uniqueRows(groups: Row[][]): Row[] {
  const seen = new Set<string>();
  const result: Row[] = [];
  for (const group of groups) {
    for (const row of group) {
      const key = `${row.a[0]},${row.a[1]},${row.rhs}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(row);
    }
  }
  return result;
}

function clipPolygonByRow(polygon: Point2D[], row: Row): Point2D[] {
  if (polygon.length === 0) return polygon;
  const value = ([x, y]: Point2D) => row.a[0] * x + row.a[1] * y - row.rhs;
  const inside = (p: Point2D) => value(p) <= 1e-9;
  const output: Point2D[] = [];

  for (let i = 0; i < polygon.length; i += 1) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    const currentInside = inside(current);
    const nextInside = inside(next);

    if (currentInside) output.push(current);
    if (currentInside === nextInside) continue;

    const currentValue = value(current);
    const nextValue = value(next);
    const denominator = currentValue - nextValue;
    if (Math.abs(denominator) < 1e-12) continue;
    const t = currentValue / denominator;
    output.push([
      current[0] + t * (next[0] - current[0]),
      current[1] + t * (next[1] - current[1]),
    ]);
  }
  return output;
}

function clippedFeasiblePolygon(rows: Row[]): Point2D[] {
  let polygon: Point2D[] = [
    [LOCAL_BOX.x[0], LOCAL_BOX.y[0]],
    [LOCAL_BOX.x[1], LOCAL_BOX.y[0]],
    [LOCAL_BOX.x[1], LOCAL_BOX.y[1]],
    [LOCAL_BOX.x[0], LOCAL_BOX.y[1]],
  ];
  for (const row of rows) polygon = clipPolygonByRow(polygon, row);
  return polygon;
}

function rowBoundarySegment(row: Row): [Point2D, Point2D] | null {
  const candidates: Point2D[] = [];
  const [xmin, xmax] = LOCAL_BOX.x;
  const [ymin, ymax] = LOCAL_BOX.y;
  const [a, b] = row.a;

  if (Math.abs(b) > 1e-12) {
    for (const x of [xmin, xmax]) {
      const y = (row.rhs - a * x) / b;
      if (y >= ymin - 1e-9 && y <= ymax + 1e-9) candidates.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-12) {
    for (const y of [ymin, ymax]) {
      const x = (row.rhs - b * y) / a;
      if (x >= xmin - 1e-9 && x <= xmax + 1e-9) candidates.push([x, y]);
    }
  }

  const unique = candidates.filter((p, i, arr) =>
    arr.findIndex((q) => Math.abs(q[0] - p[0]) < 1e-8 && Math.abs(q[1] - p[1]) < 1e-8) === i,
  );
  if (unique.length < 2) return null;

  let pair: [Point2D, Point2D] = [unique[0], unique[1]];
  let best = -1;
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const dx = unique[i][0] - unique[j][0];
      const dy = unique[i][1] - unique[j][1];
      const distance = dx * dx + dy * dy;
      if (distance > best) {
        best = distance;
        pair = [unique[i], unique[j]];
      }
    }
  }
  return pair;
}

function panelBorder(dx: number): Primitive[] {
  const [xmin, xmax] = LOCAL_BOX.x;
  const [ymin, ymax] = LOCAL_BOX.y;
  return [
    line2D(shift([xmin, ymin], dx), shift([xmax, ymin], dx), "", TDI_COLORS.muted),
    line2D(shift([xmax, ymin], dx), shift([xmax, ymax], dx), "", TDI_COLORS.muted),
    line2D(shift([xmax, ymax], dx), shift([xmin, ymax], dx), "", TDI_COLORS.muted),
    line2D(shift([xmin, ymax], dx), shift([xmin, ymin], dx), "", TDI_COLORS.muted),
  ];
}

function rowLines(rows: Row[], dx: number, withLabels: boolean): Primitive[] {
  return rows.flatMap((row) => {
    const segment = rowBoundarySegment(row);
    if (!segment) return [];
    return [
      line2D(
        shift(segment[0], dx),
        shift(segment[1], dx),
        withLabels ? row.label : "",
        sourceColor(row.source),
      ),
    ];
  });
}

function translatedConeAtVertex(
  vertex: Point2D,
  rays: [Point2D, Point2D],
  scale: number,
): Primitive {
  const origin = shift(vertex, LEFT_OFFSET);
  return {
    kind: "polygon",
    points: [
      origin,
      [origin[0] + scale * rays[0][0], origin[1] + scale * rays[0][1]],
      [origin[0] + scale * rays[1][0], origin[1] + scale * rays[1][1]],
    ],
    style: "component",
  };
}

function hilbertArrows(vertex: Point2D, rows: Row[], scale: number): Primitive[] {
  const origin = shift(vertex, LEFT_OFFSET);
  return rows.map((row, index) =>
    vector2D(
      origin,
      [origin[0] + scale * row.a[0], origin[1] + scale * row.a[1]],
      index === 0 ? `H at this vertex` : "",
      sourceColor(row.source),
    ),
  );
}

function comparisonScene(
  currentRows: Row[],
  options: {
    vertex?: Point2D;
    coneRays?: [Point2D, Point2D];
    hilbertRows?: Row[];
    secondary: string;
    currentLabel: string;
  },
) {
  const rightFeasible = clippedFeasiblePolygon(currentRows);
  const primitives: Primitive[] = [
    ...panelBorder(LEFT_OFFSET),
    ...panelBorder(RIGHT_OFFSET),
    shiftedPolygon(triangle, LEFT_OFFSET, "feasible"),
    ...rowLines(originalRows, LEFT_OFFSET, false),
    ...triangle.map((p, index) => point2D(shift(p, LEFT_OFFSET), index === 1 ? "(1,2)" : undefined, "integer")),
    label2D([LEFT_OFFSET + 0.35, 3.03], "REFERENCE:  P={x:Cx≤d}", "accent"),
    label2D([LEFT_OFFSET + 0.15, 2.82], "C has exactly the 3 original facet rows", "muted"),
    line2D([-0.45, -0.82], [-0.45, 2.88], "", TDI_COLORS.muted),
    label2D([RIGHT_OFFSET + 0.2, 3.03], options.currentLabel, "accent"),
    label2D([RIGHT_OFFSET + 0.15, 2.82], `current rows: ${currentRows.length}`, "muted"),
  ];

  if (rightFeasible.length >= 3) primitives.push(shiftedPolygon(rightFeasible, RIGHT_OFFSET, "component"));
  primitives.push(...rowLines(currentRows, RIGHT_OFFSET, true));

  if (options.vertex && options.coneRays && options.hilbertRows) {
    primitives.push(
      translatedConeAtVertex(options.vertex, options.coneRays, 0.38),
      point2D(shift(options.vertex, LEFT_OFFSET), "current minimal face", "optimum"),
      ...hilbertArrows(options.vertex, options.hilbertRows, 0.31),
    );
  }

  return scene2D([], primitives, {
    viewport: VIEWPORT,
    showGrid: false,
    showAxes: false,
    showLattice: false,
    showVertices: false,
    showConstraints: false,
    showFeasibleRegion: false,
    caption: {
      primary: "Theorem 141 · original C-description versus the A-description being constructed",
      secondary: options.secondary,
    },
  });
}

const rowsAfterF1 = uniqueRows([h1Rows]);
const rowsAfterF2 = uniqueRows([h1Rows, h2Rows]);
const rowsAfterF3 = uniqueRows([h1Rows, h2Rows, h3Rows]);

const parallelBuildStages: VisualizationStage[] = [
  {
    id: "tdi-parallel-c-vs-a-start",
    kicker: "Theorem 141 · Correct construction view",
    title: "Keep Cx≤d fixed; build A from the vertex generating sets",
    description:
      "The proof starts from the fixed reference polyhedron P={x:Cx≤d}. It then chooses an integral generating set H_i for the normal cone at every minimal face and defines the rows of A from the union of those H_i. For the animation only, we reveal that union vertex by vertex. Intermediate partial A-systems are not claimed to equal P.",
    formula: "P={x:Cx≤d};   rows(A)=⋃ᵢ H_i;   b_a=max{x∈P} aᵀx",
    insight:
      "This is the distinction missing from the old visualization: A is not conceptually initialized as C and then repaired. C stays as the reference description while A is assembled from the H_i.",
    scene: comparisonScene([], {
      secondary: "Left: the fixed original triangle. Right: before revealing any H_i, the partial A-system has no rows, so the clipped display represents all of ℝ².",
      currentLabel: "PARTIAL:  A⁽⁰⁾ has no revealed H_i rows",
    }),
  },
  {
    id: "tdi-parallel-c-vs-a-f1",
    kicker: "Vertex 1 · F₁=(0,0)",
    title: "Add the entire integral generating set H₁ to A",
    description:
      "At F₁ the original tight normals are c₁=(0,−1) and c₂=(−2,1). The integral basis adds the missing direction (−1,0). On the left, the translated normal cone and H₁ are drawn at F₁. On the right, the current system consists exactly of the unique rows contributed by H₁.",
    formula: "H₁={(0,−1),(−1,0),(−2,1)};   rows(A⁽¹⁾)=H₁;   b⁽¹⁾=(0,0,0)",
    insight:
      "The current polyhedron {x:A⁽¹⁾x≤b⁽¹⁾} is an unbounded wedge containing P. That is fine: the theorem only asserts equality after the complete union of generating sets has been formed.",
    scene: comparisonScene(rowsAfterF1, {
      vertex: [0, 0],
      coneRays: [[0, -1], [-2, 1]],
      hilbertRows: h1Rows,
      secondary: "H₁ creates the first three rows of A. Compare the orange partial feasible wedge on the right with the fixed C-polytope on the left.",
      currentLabel: "CURRENT:  Q₁={x:A⁽¹⁾x≤b⁽¹⁾}",
    }),
  },
  {
    id: "tdi-parallel-c-vs-a-f2",
    kicker: "Vertex 2 · F₂=(1,2)",
    title: "Add H₂: the apex contributes the three missing interior lattice normals",
    description:
      "At F₂ the cone cone{(−2,1),(2,1)} has integral basis H₂={(−2,1),(−1,1),(0,1),(1,1),(2,1)}. The duplicate row (−2,1) is already present from H₁; the other four unique rows are appended. Their support values are 1,2,3,4.",
    formula: "rows(A⁽²⁾)=H₁∪H₂;   new unique rows: (−1,1),(0,1),(1,1),(2,1)",
    insight:
      "Now A already contains all three original facet normals c₁,c₂,c₃, so in this particular example Q₂ becomes exactly P. The extra apex rows are geometrically redundant but arithmetically essential for TDI.",
    scene: comparisonScene(rowsAfterF2, {
      vertex: [1, 2],
      coneRays: [[-2, 1], [2, 1]],
      hilbertRows: h2Rows,
      secondary: "The right-hand polyhedron has now collapsed exactly onto the left-hand reference P, while several additional supporting lines remain visible.",
      currentLabel: "CURRENT:  Q₂={x:A⁽²⁾x≤b⁽²⁾}=P",
    }),
  },
  {
    id: "tdi-parallel-c-vs-a-f3",
    kicker: "Vertex 3 · F₃=(2,0)",
    title: "Add H₃ and complete the row system A",
    description:
      "At F₃ the integral basis is H₃={(0,−1),(1,0),(2,1)}. The two extreme rows were already contributed by earlier vertices; only (1,0) is new, giving the supporting inequality x₁≤2. The feasible set therefore stays equal to P while the final missing normal-cone generator is added.",
    formula: "rows(A)=H₁∪H₂∪H₃;   final new row (1,0) with b=2",
    insight:
      "The final A-description and the original C-description define the same polyhedron, but A has eight unique rows rather than three because its tight rows must integrally generate every face cone.",
    scene: comparisonScene(rowsAfterF3, {
      vertex: [2, 0],
      coneRays: [[0, -1], [2, 1]],
      hilbertRows: h3Rows,
      secondary: "Both panels now show exactly the same triangle. The difference is the row description: C has 3 facet rows, A has 8 unique supported rows.",
      currentLabel: "FINAL:  {x:Ax≤b}=P={x:Cx≤d}",
    }),
  },
  {
    id: "tdi-parallel-c-vs-a-summary",
    kicker: "Theorem 141 · What the construction actually did",
    title: "Same primal polyhedron, richer normal description",
    description:
      "The left panel never changed: it was always the original P={x:Cx≤d}. The right panel showed the partial systems obtained while revealing H₁,H₂,H₃. The final union gives A, and each row receives its support value b_a=max_{x∈P}aᵀx. The theorem then proves that this complete A-system describes exactly P and satisfies the TDI face-cone condition.",
    formula: "P={x:Cx≤d}={x:Ax≤b},   rows(A)=H₁∪H₂∪H₃",
    insight:
      "The intermediate Q₁,Q₂ are only a pedagogical ordering of the final union. The mathematical construction in the notes defines A from all H_i at once.",
    scene: comparisonScene(rowsAfterF3, {
      secondary: "Final side-by-side comparison: identical feasible sets, different inequality descriptions.",
      currentLabel: "FINAL TDI DESCRIPTION:  {x:Ax≤b}",
    }),
  },
];

export const buildAExamples: VisualizationExample[] = [
  {
    id: "tdi-build-a-parallel-2d",
    title: "2D · C versus A, vertex by vertex",
    description:
      "The fixed original system Cx≤d stays on the left while A is assembled on the right from H₁,H₂,H₃. Each stage shows the current vertex normal cone, the rows contributed to A, their supporting constraints, and the current partial polyhedron.",
    stages: parallelBuildStages,
    proof: {
      title: "How this animation matches Theorem 141",
      steps: [
        "Keep the original nonredundant description P={x:Cx≤d} fixed as the reference polyhedron.",
        "For each minimal face F_i choose an integral generating set H_i of the cone generated by the rows of C tight at F_i.",
        "Define the row set of A as the union of the H_i. The vertex-by-vertex ordering in the animation is only a way to reveal this union; the theorem does not require the intermediate partial systems to equal P.",
        "For every row a of A set b_a=max{aᵀx:x∈P}; therefore all final A-inequalities are valid supporting inequalities of P.",
        "The proof in the notes then establishes the reverse inclusion {x:Ax≤b}⊆P and finally the TDI face-cone condition.",
      ],
    },
  },
];
