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

export interface SplitClosureSpec {
  id: string;
  title: string;
  description: string;
  splits: SplitCutSpec[];
}

export interface SplitClosureStep {
  closureIndex: number;
  splitIndex: number;
  cut: SplitCutSpec;
  closureBaseConstraints: Constraint[];
  beforeIntersectionConstraints: Constraint[];
  splitPolyhedronConstraints: Constraint[];
  afterIntersectionConstraints: Constraint[];
  closureBasePolygon: Point2D[];
  beforeIntersectionPolygon: Point2D[];
  splitPolyhedron: Point2D[];
  afterIntersectionPolygon: Point2D[];
  splitRemovedArea: number;
  accumulatedRemovedArea: number;
}

export interface SplitClosureIteration {
  index: number;
  spec: SplitClosureSpec;
  beforeConstraints: Constraint[];
  afterConstraints: Constraint[];
  beforePolygon: Point2D[];
  afterPolygon: Point2D[];
  beforeArea: number;
  afterArea: number;
  removedArea: number;
  steps: SplitClosureStep[];
}

/**
 * Backwards-compatible description of a sequential split cut.
 */
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

function signedPolygonArea(polygon: Point2D[]): number {
  if (polygon.length < 3) return 0;

  let sum = 0;
  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    sum += point[0] * next[1] - next[0] * point[1];
  });

  return sum / 2;
}

export function polygonArea(polygon: Point2D[]): number {
  return Math.abs(signedPolygonArea(polygon));
}

/** Convert a bounded convex polygon into inequalities ax + by <= limit. */
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

  const constraints: Constraint[] = [];

  polygon.forEach((from, index) => {
    const to = polygon[(index + 1) % polygon.length];
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];

    let a = dy;
    let b = -dx;
    const norm = Math.hypot(a, b);

    if (norm < EPSILON) return;

    a /= norm;
    b /= norm;

    constraints.push({
      id: `${options.idPrefix}-edge-${index}`,
      a: clean(a),
      b: clean(b),
      limit: clean(a * from[0] + b * from[1]),
      label: `${options.labelPrefix ?? "boundary"} ${index + 1}`,
      color: colors[index % colors.length],
    });
  });

  return constraints;
}

function cloneConstraints(constraints: Constraint[]): Constraint[] {
  return constraints.map((constraint) => ({ ...constraint }));
}

function ensurePolygon(
  polygon: Point2D[],
  message: string,
): Point2D[] {
  const result = convexHull(polygon);
  if (result.length < 3) throw new Error(message);
  return result;
}

/**
 * Build several split closures. Within one closure every split polyhedron is
 * computed from the same input P^k, and the displayed finite closure is their
 * intersection. The output becomes the input of the next closure.
 */
export function buildRepeatedSplitClosures({
  initialConstraints,
  viewport,
  closures,
}: {
  initialConstraints: Constraint[];
  viewport: Scene["viewport"];
  closures: SplitClosureSpec[];
}): SplitClosureIteration[] {
  let currentConstraints = cloneConstraints(initialConstraints);

  return closures.map((spec, zeroBasedClosureIndex) => {
    const index = zeroBasedClosureIndex + 1;
    const beforeConstraints = cloneConstraints(currentConstraints);
    const beforePolygon = ensurePolygon(
      clipToConstraints(beforeConstraints, viewport),
      `The polyhedron before split closure ${index} is empty or lower-dimensional.`,
    );
    const beforeArea = polygonArea(beforePolygon);

    let accumulatedConstraints = cloneConstraints(beforeConstraints);
    const steps: SplitClosureStep[] = [];

    spec.splits.forEach((cut, zeroBasedSplitIndex) => {
      const splitIndex = zeroBasedSplitIndex + 1;

      if (
        Math.abs(cut.pi[0]) < EPSILON &&
        Math.abs(cut.pi[1]) < EPSILON
      ) {
        throw new Error(`Split "${cut.id}" has the zero vector as π.`);
      }

      const beforeIntersectionConstraints = cloneConstraints(
        accumulatedConstraints,
      );
      const beforeIntersectionPolygon = ensurePolygon(
        clipToConstraints(beforeIntersectionConstraints, viewport),
        `The accumulated intersection before split ${splitIndex} of closure ${index} is lower-dimensional.`,
      );

      const geometry = computeSplitGeometry(
        beforeConstraints,
        viewport,
        cut.pi,
        cut.pi0,
      );
      const splitPolyhedron = ensurePolygon(
        geometry.splitHull,
        `Split "${cut.id}" produced an empty or lower-dimensional polyhedron.`,
      );
      const splitPolyhedronConstraints = polygonToConstraints(
        splitPolyhedron,
        {
          idPrefix: `closure-${index}-split-${splitIndex}-polyhedron`,
          labelPrefix: `split ${splitIndex} facet`,
        },
      );

      const afterIntersectionPolygon = ensurePolygon(
        clipToConstraints(
          [
            ...beforeIntersectionConstraints,
            ...splitPolyhedronConstraints,
          ],
          viewport,
        ),
        `The intersection after split ${splitIndex} of closure ${index} is lower-dimensional.`,
      );
      const afterIntersectionConstraints = polygonToConstraints(
        afterIntersectionPolygon,
        {
          idPrefix: `closure-${index}-after-split-${splitIndex}`,
          labelPrefix: `closure ${index} facet`,
        },
      );

      steps.push({
        closureIndex: index,
        splitIndex,
        cut,
        closureBaseConstraints: cloneConstraints(beforeConstraints),
        beforeIntersectionConstraints,
        splitPolyhedronConstraints: cloneConstraints(
          splitPolyhedronConstraints,
        ),
        afterIntersectionConstraints: cloneConstraints(
          afterIntersectionConstraints,
        ),
        closureBasePolygon: [...beforePolygon],
        beforeIntersectionPolygon: [...beforeIntersectionPolygon],
        splitPolyhedron: [...splitPolyhedron],
        afterIntersectionPolygon: [...afterIntersectionPolygon],
        splitRemovedArea: Math.max(
          0,
          beforeArea - polygonArea(splitPolyhedron),
        ),
        accumulatedRemovedArea: Math.max(
          0,
          polygonArea(beforeIntersectionPolygon) -
            polygonArea(afterIntersectionPolygon),
        ),
      });

      accumulatedConstraints = cloneConstraints(
        afterIntersectionConstraints,
      );
    });

    const afterConstraints = cloneConstraints(accumulatedConstraints);
    const afterPolygon = ensurePolygon(
      clipToConstraints(afterConstraints, viewport),
      `Split closure ${index} is empty or lower-dimensional.`,
    );
    const afterArea = polygonArea(afterPolygon);

    const iteration: SplitClosureIteration = {
      index,
      spec,
      beforeConstraints,
      afterConstraints,
      beforePolygon: [...beforePolygon],
      afterPolygon: [...afterPolygon],
      beforeArea,
      afterArea,
      removedArea: Math.max(0, beforeArea - afterArea),
      steps,
    };

    currentConstraints = cloneConstraints(afterConstraints);
    return iteration;
  });
}

export function buildSelectedSplitClosure({
  initialConstraints,
  viewport,
  title,
  description,
  cuts,
}: {
  initialConstraints: Constraint[];
  viewport: Scene["viewport"];
  title: string;
  description: string;
  cuts: SplitCutSpec[];
}): SplitClosureIteration {
  return buildRepeatedSplitClosures({
    initialConstraints,
    viewport,
    closures: [
      {
        id: "selected-split-closure",
        title,
        description,
        splits: cuts,
      },
    ],
  })[0];
}

/**
 * Apply splits sequentially. Kept for older visualization modules.
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
  const closures = cuts.map((cut, index) => ({
    id: `sequential-split-${index + 1}`,
    title: cut.title,
    description: cut.description,
    splits: [cut],
  }));

  return buildRepeatedSplitClosures({
    initialConstraints,
    viewport,
    closures,
  }).map((closure) => {
    const step = closure.steps[0];
    return {
      index: closure.index,
      cut: step.cut,
      beforeConstraints: closure.beforeConstraints,
      afterConstraints: closure.afterConstraints,
      beforePolygon: closure.beforePolygon,
      afterPolygon: closure.afterPolygon,
      beforeArea: closure.beforeArea,
      afterArea: closure.afterArea,
      removedArea: closure.removedArea,
    };
  });
}
