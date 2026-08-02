import type {
  Point2D,
  PolygonPrimitive,
  Primitive,
  Scene,
  VectorPrimitive,
} from "@/engine/types";

export const LATTICE_COLORS = {
  muted: "#7d898b",
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
};

export type Basis2D = [Point2D, Point2D];

export const add = (left: Point2D, right: Point2D): Point2D => [
  left[0] + right[0],
  left[1] + right[1],
];

export const scale = (factor: number, point: Point2D): Point2D => [
  factor * point[0],
  factor * point[1],
];

export function latticePoints(
  basis: Basis2D,
  viewport: Scene["viewport"],
  coefficientRange = 7,
): Primitive[] {
  const points: Primitive[] = [];

  for (let first = -coefficientRange; first <= coefficientRange; first += 1) {
    for (let second = -coefficientRange; second <= coefficientRange; second += 1) {
      const point = add(scale(first, basis[0]), scale(second, basis[1]));
      if (
        point[0] < viewport.x[0] ||
        point[0] > viewport.x[1] ||
        point[1] < viewport.y[0] ||
        point[1] > viewport.y[1]
      ) {
        continue;
      }
      points.push({ kind: "point", at: point, style: "lattice" });
    }
  }

  return points;
}

export function basisVectors(
  basis: Basis2D,
  labels: [string, string] = ["b₁", "b₂"],
  colors: [string, string] = [LATTICE_COLORS.orange, LATTICE_COLORS.aqua],
): VectorPrimitive[] {
  return basis.map((to, index) => ({
    kind: "vector",
    from: [0, 0],
    to,
    label: labels[index],
    color: colors[index],
    animate: true,
  })) as VectorPrimitive[];
}

export function fundamentalCell(
  basis: Basis2D,
  label = "𝒫(B)",
  fromBasis?: Basis2D,
): PolygonPrimitive {
  const points: Point2D[] = [[0, 0], basis[0], add(basis[0], basis[1]), basis[1]];
  const fromPoints = fromBasis
    ? ([[0, 0], fromBasis[0], add(fromBasis[0], fromBasis[1]), fromBasis[1]] as Point2D[])
    : undefined;

  return {
    kind: "polygon",
    points,
    fromPoints,
    label,
    style: "component",
  };
}

export function latticeScene(
  basis: Basis2D,
  overrides: Partial<Scene> = {},
): Scene {
  const viewport = overrides.viewport ?? { x: [-8, 8], y: [-6, 6] };
  return {
    viewport,
    constraints: [],
    showGrid: true,
    showAxes: true,
    showFeasibleRegion: false,
    showLattice: false,
    showVertices: false,
    axisLabels: { x: "x₁", y: "x₂" },
    caption: {
      label: "Two-dimensional lattice",
      detail: "integer combinations of the displayed basis",
    },
    primitives: [...latticePoints(basis, viewport), ...basisVectors(basis)],
    ...overrides,
  };
}
