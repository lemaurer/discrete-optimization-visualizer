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

export const PROXIMITY_COLORS = {
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
  color = PROXIMITY_COLORS.violet,
  style: "assignment" | "constraint" | "objective" | "cut" = "assignment",
): Primitive {
  return { kind: "line", from, to, label, color, style, animate: true };
}

export function vector2D(
  from: Point2D,
  to: Point2D,
  label?: string,
  color = PROXIMITY_COLORS.violet,
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
    viewport: { x: [-1, 5], y: [-1, 5] },
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
  color = PROXIMITY_COLORS.violet,
  options: Partial<Segment3D> = {},
): Segment3D {
  return { id, from, to, label, color, width: 4, animate: true, ...options };
}

export function boxMesh(
  id: string,
  lower: Point3D,
  upper: Point3D,
  label: string,
  style: Mesh3D["style"] = "ghost",
  opacity = 0.16,
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
