import {
  clipToConstraints,
  convexHull,
} from "./geometry";
import { computeSplitGeometry } from "./split";
import type {
  Constraint,
  Point2D,
  Scene,
} from "./types";

const EPSILON = 1e-8;

const DEFAULT_COLORS = [
  "#f49a4a",
  "#7ecbc4",
  "#d4ef77",
  "#a7a0ed",
  "#e88d99",
  "#6da8d6",
];

export interface SplitCutSpec {
  id: string;
  pi: Point2D;
  pi0: number;
  title: string;
  description: string;
  color?: string;
}

export interface SplitClosureRound {
  index: number;
  cut: SplitCutSpec;
  beforeConstraints: Constraint[];
  afterConstraints: Constraint[];
  beforePolygon: Point2D[];
  afterPolygon: Point2D[];
  beforeArea: number;
  afterArea: number;
  removedArea: number;
}

interface PolygonConstraintOptions {
  idPrefix: string;
  labelPrefix?: string;
  colors?: string[];
}

function clean(value: number): number {
  if (Math.abs(value) < EPSILON) return 0;
  return Number(value.toFixed(10));
}

function signedPolygonArea(
  polygon: Point2D[],
): number {
  if (polygon.length < 3) return 0;

  let sum = 0;

  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    sum += point[0] * next[1] - next[0] * point[1];
  });

  return sum / 2;
}

export function polygonArea(
  polygon: Point2D[],
): number {
  return Math.abs(signedPolygonArea(polygon));
}

/**
 * Converts a bounded convex polygon into inequalities of the form
 *
 *     ax + by <= limit.
 */
export function polygonToConstraints(
  points: Point2D[],
  options: PolygonConstraintOptions,
): Constraint[] {
  let polygon = convexHull(points);

  if (polygon.length < 3) {
    throw new Error(
      "A bounded polyhedron needs at least three non-collinear vertices.",
    );
  }

  if (signedPolygonArea(polygon) < 0) {
    polygon = [...polygon].reverse();
  }

  const colors = options.colors?.length
    ? options.colors
    : DEFAULT_COLORS;

  return polygon
    .map((from, index) => {
      const to = polygon[(index + 1) % polygon.length];
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];

      let a = dy;
      let b = -dx;
      const norm = Math.hypot(a, b);

      if (norm < EPSILON) return null;

      a /= norm;
      b /= norm;

      return {
        id: `${options.idPrefix}-edge-${index}`,
        a: clean(a),
        b: clean(b),
        limit: clean(a * from[0] + b * from[1]),
        label: `${options.labelPrefix ?? "boundary"} ${index + 1}`,
        color: colors[index % colors.length],
      } satisfies Constraint;
    })
    .filter(
      (constraint): constraint is Constraint =>
        constraint !== null,
    );
}

function cloneConstraints(
  constraints: Constraint[],
): Constraint[] {
  return constraints.map((constraint) => ({
    ...constraint,
  }));
}

/**
 * Applies a prescribed sequence of split cuts. Each result is converted
 * back into an inequality description and becomes the input of the next
 * round.
 */
export function buildSplitClosureRounds({
  initialConstraints,
  viewport,
  cuts,
}: {
  initialConstraints: Constraint[];
  viewport: Scene["viewport"];
  cuts: SplitCutSpec[];
}): SplitClosureRound[] {
  let currentConstraints = cloneConstraints(initialConstraints);

  return cuts.map((cut, zeroBasedIndex) => {
    const index = zeroBasedIndex + 1;

    if (
      Math.abs(cut.pi[0]) < EPSILON &&
      Math.abs(cut.pi[1]) < EPSILON
    ) {
      throw new Error(
        `Split "${cut.id}" has the zero vector as π.`,
      );
    }

    const beforePolygon = clipToConstraints(
      currentConstraints,
      viewport,
    );

    if (beforePolygon.length < 3) {
      throw new Error(
        `The polyhedron before split round ${index} is empty or lower-dimensional.`,
      );
    }

    const geometry = computeSplitGeometry(
      currentConstraints,
      viewport,
      cut.pi,
      cut.pi0,
    );

    const afterPolygon = convexHull(geometry.splitHull);

    if (afterPolygon.length < 3) {
      throw new Error(
        `Split "${cut.id}" produced an empty or lower-dimensional result.`,
      );
    }

    const beforeArea = polygonArea(beforePolygon);
    const afterArea = polygonArea(afterPolygon);
    const removedArea = Math.max(0, beforeArea - afterArea);

    if (removedArea < EPSILON) {
      throw new Error(
        `Split "${cut.id}" does not remove any area from the current polyhedron.`,
      );
    }

    const afterConstraints = polygonToConstraints(
      afterPolygon,
      {
        idPrefix: `split-round-${index}`,
        labelPrefix: `P${index} facet`,
      },
    );

    const round: SplitClosureRound = {
      index,
      cut,
      beforeConstraints: cloneConstraints(currentConstraints),
      afterConstraints: cloneConstraints(afterConstraints),
      beforePolygon: [...beforePolygon],
      afterPolygon: [...afterPolygon],
      beforeArea,
      afterArea,
      removedArea,
    };

    currentConstraints = cloneConstraints(afterConstraints);
    return round;
  });
}
