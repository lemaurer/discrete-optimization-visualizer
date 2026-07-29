import type { Point2D, Primitive, Scene } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

interface FiniteCoreExample {
  id: string;
  title: string;
  description: string;
  viewport: Scene["viewport"];
  visiblePolyhedron: Point2D[];
  baseVertices: Point2D[];
  rays: Point2D[];
  T: Point2D[];
  generatedPoints: Point2D[];
  formulaP: string;
  formulaTE: string;
}

function add(a: Point2D, b: Point2D): Point2D {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(lambda: number, v: Point2D): Point2D {
  return [lambda * v[0], lambda * v[1]];
}

function scene(
  data: FiniteCoreExample,
  primitives: Primitive[],
  secondary: string,
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
      primary: "A finite core T together with the recession cone cone(E)",
      secondary,
    },
  };
}

function polyhedronPrimitive(data: FiniteCoreExample): Primitive {
  return {
    kind: "polygon",
    points: data.visiblePolyhedron,
    label: "visible part of P",
    style: "feasible",
  };
}

function basePrimitive(data: FiniteCoreExample): Primitive {
  if (data.baseVertices.length === 1) {
    return {
      kind: "point",
      at: data.baseVertices[0],
      label: "conv(V)",
      style: "fractional",
    };
  }

  if (data.baseVertices.length === 2) {
    return {
      kind: "line",
      from: data.baseVertices[0],
      to: data.baseVertices[1],
      label: "conv(V)",
      style: "objective",
      color: "#f49a4a",
    };
  }

  return {
    kind: "polygon",
    points: data.baseVertices,
    label: "conv(V)=P",
    style: "integer-hull",
  };
}

function tPrimitives(data: FiniteCoreExample): Primitive[] {
  return data.T.map((point, index) => ({
    kind: "point",
    at: point,
    label: index === 0 ? "finite set T" : undefined,
    style: "integer",
  }));
}

function coneAtOrigin(data: FiniteCoreExample): Primitive[] {
  if (data.rays.length === 0) {
    return [
      {
        kind: "point",
        at: [0, 0],
        label: "cone(E)={0}",
        style: "optimum",
      },
      {
        kind: "label",
        at: [1.1, 2.55],
        text: "bounded polytope: E=∅",
        tone: "accent",
      },
    ];
  }

  return data.rays.flatMap<Primitive>((ray, index) => [
    {
      kind: "vector",
      from: [0, 0],
      to: scale(2.4, ray),
      label: `e${index + 1}=(${ray[0]},${ray[1]})`,
      color: index === 0 ? "#8f88dc" : "#79c9c0",
      animate: true,
    },
    {
      kind: "point",
      at: ray,
      label: index === 0 ? "primitive generators E" : undefined,
      style: "optimum",
    },
  ]);
}

function translatedCones(data: FiniteCoreExample): Primitive[] {
  if (data.rays.length === 0) {
    return [];
  }

  return data.T.flatMap<Primitive>((t, tIndex) =>
    data.rays.map((ray, rayIndex) => ({
      kind: "vector",
      from: t,
      to: add(t, scale(1.8, ray)),
      label: tIndex === 0 ? `+e${rayIndex + 1}` : undefined,
      color: rayIndex === 0 ? "#8f88dc" : "#79c9c0",
      animate: true,
    })),
  );
}

function generatedPointPrimitives(data: FiniteCoreExample): Primitive[] {
  return data.generatedPoints.map((point, index) => ({
    kind: "point",
    at: point,
    label: index === 0 ? "points generated from T and E" : undefined,
    style: "fractional",
  }));
}

function stages(data: FiniteCoreExample): VisualizationStage[] {
  return [
    {
      id: `${data.id}-polyhedron`,
      kicker: "Examples · First look only at P",
      title: "Start with the shape of the polyhedron",
      description:
        "The shaded region is the visible part of P. For an unbounded example the drawing is truncated by the viewport, but the indicated edges continue indefinitely.",
      formula: data.formulaP,
      insight:
        "At this stage ignore the theorem and first identify the bounded base and the directions in which the polyhedron continues forever.",
      scene: scene(data, [polyhedronPrimitive(data), basePrimitive(data)], data.formulaP),
    },
    {
      id: `${data.id}-finite-set`,
      kicker: "Examples · Reveal T",
      title: "Mark the finitely many integer representatives",
      description:
        "The dark lattice points are the selected finite set T. They lie near the bounded base of the polyhedron and serve as representatives for all farther integer points.",
      formula: `T={${data.T.map((p) => `(${p[0]},${p[1]})`).join(", ")}}`,
      insight:
        "T is not the whole set of integer points of P. It is only the finite collection of starting positions needed before recession steps are added.",
      scene: scene(
        data,
        [polyhedronPrimitive(data), basePrimitive(data), ...tPrimitives(data)],
        `finite core with |T|=${data.T.length}`,
      ),
    },
    {
      id: `${data.id}-cone`,
      kicker: "Examples · Reveal E",
      title: "Now isolate the recession cone",
      description:
        data.rays.length === 0
          ? "This example is bounded, so it has no nonzero recession direction. The recession cone is only the origin and E can be empty."
          : "The arrows at the origin are the integral generators in E. Their nonnegative combinations form the recession cone of P.",
      formula:
        data.rays.length === 0
          ? "E=∅,   cone(E)={0}"
          : `E={${data.rays.map((e) => `(${e[0]},${e[1]})`).join(", ")}}`,
      insight:
        "The cone describes only directions. It can be translated to any point t∈T to generate the unbounded part of the integer geometry.",
      scene: scene(
        data,
        [polyhedronPrimitive(data), basePrimitive(data), ...coneAtOrigin(data)],
        data.rays.length === 0 ? "bounded case" : "recession directions shown at the origin",
      ),
    },
    {
      id: `${data.id}-t-plus-e`,
      kicker: "Examples · Put T and E together",
      title: "Translate the same cone from every point of T",
      description:
        data.rays.length === 0
          ? "Because the polytope is bounded, all its integer points already belong to the finite set T. No recession step is available or needed."
          : "From every representative t∈T, attach nonnegative integral copies of the directions in E. The lightly marked lattice points illustrate the resulting infinite families.",
      formula: data.formulaTE,
      insight:
        "The picture to remember is simple: finitely many starting points, all sharing the same set of allowed unbounded directions.",
      scene: scene(
        data,
        [
          polyhedronPrimitive(data),
          ...generatedPointPrimitives(data),
          ...translatedCones(data),
          ...tPrimitives(data),
        ],
        data.formulaTE,
      ),
    },
  ];
}

function verticalStripPoints(): Point2D[] {
  const points: Point2D[] = [];
  for (let x = 0; x <= 2; x += 1) {
    for (let y = 0; y <= 5; y += 1) points.push([x, y]);
  }
  return points;
}

function diagonalStripPoints(): Point2D[] {
  const points: Point2D[] = [];
  for (let t = 0; t <= 2; t += 1) {
    for (let k = 0; k <= 5; k += 1) points.push([t + k, k]);
  }
  return points;
}

function wedgePoints(): Point2D[] {
  const keys = new Set<string>();
  const points: Point2D[] = [];
  const T: Point2D[] = [[0, 0], [0, 1], [1, 1]];

  for (const t of T) {
    for (let mu1 = 0; mu1 <= 5; mu1 += 1) {
      for (let mu2 = 0; mu2 <= 5; mu2 += 1) {
        const point: Point2D = [t[0] + mu1 + mu2, t[1] + mu2];
        if (point[0] > 6 || point[1] > 7) continue;
        const key = `${point[0]},${point[1]}`;
        if (!keys.has(key)) {
          keys.add(key);
          points.push(point);
        }
      }
    }
  }

  return points;
}

const verticalStrip: FiniteCoreExample = {
  id: "vertical-strip",
  title: "Vertical strip with one recession direction",
  description:
    "The finite set contains the three bottom lattice points, and the single ray e=(0,1) generates every lattice point above them.",
  viewport: { x: [-0.6, 3.2], y: [-0.6, 6.2] },
  visiblePolyhedron: [[0, 0], [2, 0], [2, 6], [0, 6]],
  baseVertices: [[0, 0], [2, 0]],
  rays: [[0, 1]],
  T: [[0, 0], [1, 0], [2, 0]],
  generatedPoints: verticalStripPoints(),
  formulaP: "P=[0,2]×ℝ₊",
  formulaTE: "P∩ℤ²={t+μ(0,1):t∈T, μ∈ℤ₊}",
};

const diagonalStrip: FiniteCoreExample = {
  id: "diagonal-strip",
  title: "Diagonal strip with one slanted ray",
  description:
    "The same three-point finite core is repeated along the diagonal recession direction (1,1).",
  viewport: { x: [-0.6, 7.6], y: [-0.6, 5.8] },
  visiblePolyhedron: [[0, 0], [2, 0], [7, 5], [5, 5]],
  baseVertices: [[0, 0], [2, 0]],
  rays: [[1, 1]],
  T: [[0, 0], [1, 0], [2, 0]],
  generatedPoints: diagonalStripPoints(),
  formulaP: "P={(x₁,x₂):x₂≥0, 0≤x₁−x₂≤2}",
  formulaTE: "P∩ℤ²={t+μ(1,1):t∈T, μ∈ℤ₊}",
};

const wedge: FiniteCoreExample = {
  id: "two-ray-wedge",
  title: "Wedge with two recession generators",
  description:
    "A vertical bounded base is combined with the horizontal ray (1,0) and the diagonal ray (1,1).",
  viewport: { x: [-0.6, 6.8], y: [-0.6, 7.6] },
  visiblePolyhedron: [[0, 0], [0, 1], [6, 7], [6, 0]],
  baseVertices: [[0, 0], [0, 1]],
  rays: [[1, 0], [1, 1]],
  T: [[0, 0], [0, 1], [1, 1]],
  generatedPoints: wedgePoints(),
  formulaP: "P={(x₁,x₂):x₁≥0, 0≤x₂≤x₁+1}",
  formulaTE: "P∩ℤ²={t+μ₁(1,0)+μ₂(1,1):t∈T, μ∈ℤ₊²}",
};

const boundedTriangle: FiniteCoreExample = {
  id: "bounded-triangle",
  title: "Bounded triangle: the cone disappears",
  description:
    "A limiting case in which the polyhedron has no nonzero recession direction, so T is simply the complete finite set of lattice points.",
  viewport: { x: [-0.6, 3.7], y: [-0.6, 2.8] },
  visiblePolyhedron: [[0, 0], [3, 0], [0, 2]],
  baseVertices: [[0, 0], [3, 0], [0, 2]],
  rays: [],
  T: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [0, 2]],
  generatedPoints: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [0, 2]],
  formulaP: "P=conv{(0,0),(3,0),(0,2)}",
  formulaTE: "P∩ℤ²=T,   E=∅",
};

const data = [verticalStrip, diagonalStrip, wedge, boundedTriangle];
const examples: VisualizationExample[] = data.map((example) => ({
  id: example.id,
  title: example.title,
  description: example.description,
  stages: stages(example),
}));

const visualization: VisualizationDefinition = {
  id: "finite-t-cone-example-gallery",
  title: "Examples — What the Finite Set T and Cone E Look Like",
  shortTitle: "Examples of T + cone(E)",
  chapter: "Polyhedral ties",
  order: 2,
  description:
    "A picture-first gallery: inspect several polyhedra, reveal their finite representative set T, reveal their recession generators E, and then see how the two pieces generate the integer points.",
  difficulty: "Introductory",
  duration: 12,
  accent: "#f49a4a",
  controls: {
    grid: true,
    lattice: true,
    vertices: false,
    labels: true,
  },
  stages: stages(verticalStrip),
  examples,
};

export default visualization;
