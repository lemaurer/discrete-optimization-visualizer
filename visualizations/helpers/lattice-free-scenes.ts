import type {
  Marker3D,
  Mesh3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";

export const LATTICE_FREE_COLORS = {
  muted: "#7d898b",
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
  lime: "#d4ef77",
};

export function point2D(
  at: Point2D,
  label?: string,
  style: "integer" | "fractional" | "optimum" | "lattice" = "integer",
): Primitive {
  return { kind: "point", at, label, style };
}

export function line2D(
  from: Point2D,
  to: Point2D,
  label?: string,
  color = LATTICE_FREE_COLORS.violet,
  style: "assignment" | "constraint" | "objective" | "cut" = "assignment",
): Primitive {
  return { kind: "line", from, to, label, style, color, animate: true };
}

export function vector2D(
  from: Point2D,
  to: Point2D,
  label?: string,
  color = LATTICE_FREE_COLORS.violet,
): Primitive {
  return { kind: "vector", from, to, label, color, animate: true };
}

export function label2D(
  at: Point2D,
  text: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return { kind: "label", at, text, tone };
}

export function polygon2D(
  points: Point2D[],
  label?: string,
  style: "feasible" | "integer-hull" | "removed" | "component" = "feasible",
): Primitive {
  return { kind: "polygon", points, label, style };
}

export function scene2D(
  primitives: Primitive[],
  caption: { primary: string; secondary: string },
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-1.2, 4.2], y: [-1.2, 4.2] },
    constraints: [],
    primitives,
    showGrid: true,
    showAxes: true,
    showLattice: true,
    showConstraints: false,
    showFeasibleRegion: false,
    showVertices: false,
    axisLabels: { x: "x₁", y: "x₂" },
    caption,
    ...overrides,
  };
}

export function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: false,
    showAxes: false,
    showLattice: false,
    showVertices: true,
    scene3D: configuration,
  };
}

export function marker3D(
  id: string,
  at: Point3D,
  label?: string,
  style: "vertex" | "fractional" | "integer" | "optimum" = "integer",
  radius = 0.075,
): Marker3D {
  return { id, at, label, style, radius };
}

export function segment3D(
  id: string,
  from: Point3D,
  to: Point3D,
  label: string,
  color = LATTICE_FREE_COLORS.violet,
  options: Partial<Segment3D> = {},
): Segment3D {
  return {
    id,
    from,
    to,
    label,
    color,
    width: 4,
    animate: true,
    ...options,
  };
}

export function boxMesh(
  id: string,
  lower: Point3D,
  upper: Point3D,
  label: string,
  style: Mesh3D["style"] = "ghost",
  opacity = 0.18,
): Mesh3D {
  const [x0, y0, z0] = lower;
  const [x1, y1, z1] = upper;
  return {
    id,
    label,
    style,
    opacity,
    vertices: [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
    ],
    faces: [
      [0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4],
      [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
    ],
  };
}

export function triangularPrismMesh(
  id: string,
  triangle: [Point2D, Point2D, Point2D],
  z0: number,
  z1: number,
  label: string,
  style: Mesh3D["style"] = "solid",
  opacity = 0.2,
): Mesh3D {
  const [a, b, c] = triangle;
  return {
    id,
    label,
    style,
    opacity,
    vertices: [
      [a[0], a[1], z0], [b[0], b[1], z0], [c[0], c[1], z0],
      [a[0], a[1], z1], [b[0], b[1], z1], [c[0], c[1], z1],
    ],
    faces: [[0, 1, 2], [3, 5, 4], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]],
  };
}

export function tetrahedronMesh(
  id: string,
  vertices: [Point3D, Point3D, Point3D, Point3D],
  label: string,
  style: Mesh3D["style"] = "solid",
  opacity = 0.22,
): Mesh3D {
  return {
    id,
    vertices,
    faces: [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]],
    label,
    style,
    opacity,
  };
}

/**
 * L1 ball in R^3: {x : |x1-c1|+|x2-c2|+|x3-c3| <= radius}.
 * It is the natural full-dimensional 3D analogue of the 2D diamond.
 */
export function octahedronMesh(
  id: string,
  center: Point3D,
  radius: number,
  label: string,
  style: Mesh3D["style"] = "solid",
  opacity = 0.22,
): Mesh3D {
  const [cx, cy, cz] = center;
  return {
    id,
    label,
    style,
    opacity,
    vertices: [
      [cx + radius, cy, cz],
      [cx - radius, cy, cz],
      [cx, cy + radius, cz],
      [cx, cy - radius, cz],
      [cx, cy, cz + radius],
      [cx, cy, cz - radius],
    ],
    faces: [
      [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
      [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
    ],
  };
}

/**
 * The 3D cap {x >= 0 : lower <= x1+x2+x3 <= upper}.
 * Useful for objective-threshold proofs where the objective is (1,1,1).
 */
export function simplexFrustumMesh(
  id: string,
  lower: number,
  upper: number,
  label: string,
  style: Mesh3D["style"] = "removed",
  opacity = 0.18,
): Mesh3D {
  return {
    id,
    label,
    style,
    opacity,
    vertices: [
      [lower, 0, 0], [0, lower, 0], [0, 0, lower],
      [upper, 0, 0], [0, upper, 0], [0, 0, upper],
    ],
    faces: [
      [0, 2, 1], [3, 4, 5],
      [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5],
    ],
  };
}

export function integerMarkersInBox(
  prefix: string,
  lower: Point3D,
  upper: Point3D,
  predicate: (p: Point3D) => boolean = () => true,
): Marker3D[] {
  const markers: Marker3D[] = [];
  for (let x = Math.ceil(lower[0]); x <= Math.floor(upper[0]); x += 1) {
    for (let y = Math.ceil(lower[1]); y <= Math.floor(upper[1]); y += 1) {
      for (let z = Math.ceil(lower[2]); z <= Math.floor(upper[2]); z += 1) {
        const p: Point3D = [x, y, z];
        if (predicate(p)) markers.push(marker3D(`${prefix}-${x}-${y}-${z}`, p, undefined, "integer", 0.045));
      }
    }
  }
  return markers;
}
