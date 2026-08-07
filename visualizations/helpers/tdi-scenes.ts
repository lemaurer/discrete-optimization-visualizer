import type {
  Constraint,
  Marker3D,
  Mesh3D,
  PlanePatch3D,
  Point2D,
  Point3D,
  Primitive,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";

export const TDI_COLORS = {
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
  style: "vertex" | "fractional" | "integer" | "optimum" | "lattice" = "integer",
): Primitive {
  return { kind: "point", at, label, style };
}

export function vector2D(
  from: Point2D,
  to: Point2D,
  label: string,
  color = TDI_COLORS.violet,
): Primitive {
  return { kind: "vector", from, to, label, color, animate: true };
}

export function line2D(
  from: Point2D,
  to: Point2D,
  label: string,
  color = TDI_COLORS.violet,
): Primitive {
  return { kind: "line", from, to, label, style: "assignment", color, animate: true };
}

export function label2D(
  at: Point2D,
  text: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return { kind: "label", at, text, tone };
}

export function scene2D(
  constraints: Constraint[],
  primitives: Primitive[],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-1, 3], y: [-1, 3] },
    constraints,
    primitives,
    showGrid: true,
    showAxes: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
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

export function segment3D(
  id: string,
  from: Point3D,
  to: Point3D,
  label: string,
  color = TDI_COLORS.violet,
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

export function marker3D(
  id: string,
  at: Point3D,
  label?: string,
  style: Marker3D["style"] = "integer",
  radius = 0.075,
): Marker3D {
  return { id, at, label, style, radius };
}

export function plane3D(
  id: string,
  points: Point3D[],
  label: string,
  color = TDI_COLORS.muted,
  opacity = 0.12,
): PlanePatch3D {
  return { id, points, label, color, opacity };
}

export const triangle2DConstraints: Constraint[] = [
  { id: "tri-bottom", a: 0, b: -1, limit: 0, label: "−x₂≤0", color: TDI_COLORS.aqua },
  { id: "tri-left", a: -2, b: 1, limit: 0, label: "−2x₁+x₂≤0", color: TDI_COLORS.orange },
  { id: "tri-right", a: 2, b: 1, limit: 4, label: "2x₁+x₂≤4", color: TDI_COLORS.violet },
];

export const triangle2DTdiConstraints: Constraint[] = [
  ...triangle2DConstraints,
  { id: "tri-xlower", a: -1, b: 0, limit: 0, label: "−x₁≤0", color: TDI_COLORS.muted },
  { id: "tri-midleft", a: -1, b: 1, limit: 1, label: "−x₁+x₂≤1", color: TDI_COLORS.rose },
  { id: "tri-top", a: 0, b: 1, limit: 2, label: "x₂≤2", color: TDI_COLORS.rose },
  { id: "tri-midright", a: 1, b: 1, limit: 3, label: "x₁+x₂≤3", color: TDI_COLORS.rose },
  { id: "tri-xupper", a: 1, b: 0, limit: 2, label: "x₁≤2", color: TDI_COLORS.muted },
];

export const triangle2DVertices: Point2D[] = [[0, 0], [1, 2], [2, 0]];

export function triangle2DVertexMarkers(): Primitive[] {
  return triangle2DVertices.map((at, index) =>
    point2D(at, index === 1 ? "apex (1,2)" : undefined, "integer"),
  );
}

const cubeFaces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
];

export function boxMesh(
  id: string,
  upper: Point3D,
  label: string,
  style: Mesh3D["style"] = "solid",
  opacity = 0.18,
): Mesh3D {
  const [x, y, z] = upper;
  return {
    id,
    vertices: [
      [0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0],
      [0, 0, z], [x, 0, z], [x, y, z], [0, y, z],
    ],
    faces: cubeFaces,
    label,
    color: TDI_COLORS.violet,
    opacity,
    style,
  };
}

export const prismVertices: Point3D[] = [
  [0, 0, 0], [2, 0, 0], [1, 2, 0],
  [0, 0, 1], [2, 0, 1], [1, 2, 1],
];

export function trianglePrismMesh(
  id: string,
  label: string,
  opacity = 0.18,
): Mesh3D {
  return {
    id,
    vertices: prismVertices,
    faces: [
      [0, 1, 2], [3, 5, 4],
      [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5],
    ],
    label,
    color: TDI_COLORS.violet,
    opacity,
    style: "solid",
  };
}

export const theorem143Vertices: Point3D[] = [
  [0, 0, 0], [7, 0, 0], [1, 3, 0], [0, 3, 0],
  [0, 0, 1], [3, 0, 1], [1, 1, 1], [0, 1, 1],
];

export function theorem143Mesh(id: string, label: string): Mesh3D {
  return {
    id,
    vertices: theorem143Vertices,
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 3, 7, 4],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [1, 2, 6, 5],
    ],
    label,
    color: TDI_COLORS.aqua,
    opacity: 0.2,
    style: "solid",
  };
}

export function integerBoxMarkers(upper: Point3D, prefix: string): Marker3D[] {
  const result: Marker3D[] = [];
  for (let x = 0; x <= Math.floor(upper[0]); x += 1) {
    for (let y = 0; y <= Math.floor(upper[1]); y += 1) {
      for (let z = 0; z <= Math.floor(upper[2]); z += 1) {
        result.push(marker3D(`${prefix}-${x}-${y}-${z}`, [x, y, z], undefined, "integer", 0.045));
      }
    }
  }
  return result;
}

export function theorem143IntegerMarkers(): Marker3D[] {
  const result: Marker3D[] = [];
  for (let x1 = 0; x1 <= 7; x1 += 1) {
    for (let x2 = 0; x2 <= 3; x2 += 1) {
      for (let x3 = 0; x3 <= 1; x3 += 1) {
        if (x1 + 2 * x2 + 4 * x3 <= 7 && x2 + 2 * x3 <= 3) {
          result.push(marker3D(`t143-${x1}-${x2}-${x3}`, [x1, x2, x3], undefined, "integer", 0.04));
        }
      }
    }
  }
  return result;
}
