import type { Constraint, Point2D } from "./types";

const EPSILON = 1e-7;

function inside(point: Point2D, constraint: Constraint) {
  return constraint.a * point[0] + constraint.b * point[1] <= constraint.limit + EPSILON;
}

function intersectSegment(start: Point2D, end: Point2D, constraint: Constraint): Point2D {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const denominator = constraint.a * dx + constraint.b * dy;
  const t =
    Math.abs(denominator) < EPSILON
      ? 0
      : (constraint.limit - constraint.a * start[0] - constraint.b * start[1]) / denominator;
  return [start[0] + t * dx, start[1] + t * dy];
}

export function clipToConstraints(
  constraints: Constraint[],
  viewport: { x: [number, number]; y: [number, number] },
): Point2D[] {
  let polygon: Point2D[] = [
    [viewport.x[0], viewport.y[0]],
    [viewport.x[1], viewport.y[0]],
    [viewport.x[1], viewport.y[1]],
    [viewport.x[0], viewport.y[1]],
  ];

  constraints.forEach((constraint) => {
    const output: Point2D[] = [];
    polygon.forEach((current, index) => {
      const previous = polygon[(index + polygon.length - 1) % polygon.length];
      const currentInside = inside(current, constraint);
      const previousInside = inside(previous, constraint);

      if (currentInside) {
        if (!previousInside) output.push(intersectSegment(previous, current, constraint));
        output.push(current);
      } else if (previousInside) {
        output.push(intersectSegment(previous, current, constraint));
      }
    });
    polygon = output;
  });

  return polygon;
}

export function activeConstraintsAt(point: Point2D, constraints: Constraint[]) {
  return constraints.filter(
    (constraint) =>
      Math.abs(constraint.a * point[0] + constraint.b * point[1] - constraint.limit) < 0.02,
  );
}

export function integerPoints(
  constraints: Constraint[],
  viewport: { x: [number, number]; y: [number, number] },
): Point2D[] {
  const points: Point2D[] = [];
  for (let x = Math.ceil(viewport.x[0]); x <= Math.floor(viewport.x[1]); x += 1) {
    for (let y = Math.ceil(viewport.y[0]); y <= Math.floor(viewport.y[1]); y += 1) {
      const point: Point2D = [x, y];
      if (constraints.every((constraint) => inside(point, constraint))) points.push(point);
    }
  }
  return points;
}

function cross(origin: Point2D, a: Point2D, b: Point2D) {
  return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);
}

export function convexHull(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return points;
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower: Point2D[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Point2D[] = [];
  for (const point of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

export function constraintLine(
  constraint: Constraint,
  viewport: { x: [number, number]; y: [number, number] },
): [Point2D, Point2D] {
  if (Math.abs(constraint.b) > EPSILON) {
    return [
      [viewport.x[0], (constraint.limit - constraint.a * viewport.x[0]) / constraint.b],
      [viewport.x[1], (constraint.limit - constraint.a * viewport.x[1]) / constraint.b],
    ];
  }
  const x = constraint.limit / constraint.a;
  return [
    [x, viewport.y[0]],
    [x, viewport.y[1]],
  ];
}
