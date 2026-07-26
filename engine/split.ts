import {
  clipToConstraints,
  constraintLine,
  convexHull,
} from "./geometry";

import type {
  Constraint,
  Point2D,
  Scene,
} from "./types";

const EPSILON = 1e-7;

export interface ProjectedFacet {
  constraint: Constraint;
  segment: [Point2D, Point2D];
  projectedSegment: [Point2D, Point2D];
}

export interface SplitGeometry {
  feasible: Point2D[];
  left: Point2D[];
  right: Point2D[];
  strip: Point2D[];
  splitHull: Point2D[];

  projectedVertices: Array<{
    source: Point2D;
    target: Point2D;
    value: number;
  }>;

  facets: ProjectedFacet[];

  axis: [Point2D, Point2D];
  lowerBoundary: [Point2D, Point2D];
  upperBoundary: [Point2D, Point2D];

  lowerAxisPoint: Point2D;
  upperAxisPoint: Point2D;

  projectedMinimum: Point2D;
  projectedMaximum: Point2D;
}

export function dot(a: Point2D, b: Point2D): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function lerpPoint(
  from: Point2D,
  to: Point2D,
  progress: number,
): Point2D {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ];
}

/**
 * Scalar coordinate used by the split:
 *
 *     t = πᵀx.
 */
export function splitCoordinate(
  point: Point2D,
  pi: Point2D,
): number {
  return dot(point, pi);
}

/**
 * Orthogonal projection of x onto span(π):
 *
 *     proj_π(x) = (πᵀx / ||π||²) π.
 */
export function projectPointOntoPi(
  point: Point2D,
  pi: Point2D,
): Point2D {
  const normSquared = dot(pi, pi);

  if (normSquared < EPSILON) {
    throw new Error("The split vector π must be nonzero.");
  }

  const factor = dot(pi, point) / normSquared;

  return [
    factor * pi[0],
    factor * pi[1],
  ];
}

/**
 * Point on the π-axis whose split coordinate is `value`.
 */
export function pointOnPiAxis(
  value: number,
  pi: Point2D,
): Point2D {
  const normSquared = dot(pi, pi);

  if (normSquared < EPSILON) {
    throw new Error("The split vector π must be nonzero.");
  }

  return [
    (value / normSquared) * pi[0],
    (value / normSquared) * pi[1],
  ];
}

function clipPolygonByHalfspace(
  polygon: Point2D[],
  normal: Point2D,
  limit: number,
): Point2D[] {
  if (polygon.length === 0) return [];

  const inside = (point: Point2D) =>
    dot(normal, point) <= limit + EPSILON;

  const intersection = (
    start: Point2D,
    end: Point2D,
  ): Point2D => {
    const direction: Point2D = [
      end[0] - start[0],
      end[1] - start[1],
    ];

    const denominator = dot(normal, direction);

    if (Math.abs(denominator) < EPSILON) {
      return start;
    }

    const t =
      (limit - dot(normal, start)) / denominator;

    return [
      start[0] + t * direction[0],
      start[1] + t * direction[1],
    ];
  };

  const output: Point2D[] = [];

  polygon.forEach((current, index) => {
    const previous =
      polygon[(index + polygon.length - 1) % polygon.length];

    const currentInside = inside(current);
    const previousInside = inside(previous);

    if (currentInside) {
      if (!previousInside) {
        output.push(intersection(previous, current));
      }

      output.push(current);
    } else if (previousInside) {
      output.push(intersection(previous, current));
    }
  });

  return output;
}

function farthestPair(
  points: Point2D[],
): [Point2D, Point2D] | null {
  if (points.length < 2) return null;

  let best: [Point2D, Point2D] = [
    points[0],
    points[1],
  ];

  let bestDistance = -Infinity;

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const distance =
        (points[i][0] - points[j][0]) ** 2 +
        (points[i][1] - points[j][1]) ** 2;

      if (distance > bestDistance) {
        bestDistance = distance;
        best = [points[i], points[j]];
      }
    }
  }

  return best;
}

function piAxisSegment(
  pi: Point2D,
  viewport: Scene["viewport"],
): [Point2D, Point2D] {
  const [dx, dy] = pi;
  const candidates: Point2D[] = [];

  const addCandidate = (point: Point2D) => {
    const inside =
      point[0] >= viewport.x[0] - EPSILON &&
      point[0] <= viewport.x[1] + EPSILON &&
      point[1] >= viewport.y[0] - EPSILON &&
      point[1] <= viewport.y[1] + EPSILON;

    if (!inside) return;

    const duplicate = candidates.some(
      (existing) =>
        Math.hypot(
          existing[0] - point[0],
          existing[1] - point[1],
        ) < EPSILON,
    );

    if (!duplicate) candidates.push(point);
  };

  if (Math.abs(dx) > EPSILON) {
    for (const x of viewport.x) {
      const parameter = x / dx;
      addCandidate([x, parameter * dy]);
    }
  }

  if (Math.abs(dy) > EPSILON) {
    for (const y of viewport.y) {
      const parameter = y / dy;
      addCandidate([parameter * dx, y]);
    }
  }

  const pair = farthestPair(candidates);

  if (pair) return pair;

  const norm = Math.hypot(dx, dy);
  const radius =
    Math.max(
      viewport.x[1] - viewport.x[0],
      viewport.y[1] - viewport.y[0],
    ) * 2;

  return [
    [-(dx / norm) * radius, -(dy / norm) * radius],
    [(dx / norm) * radius, (dy / norm) * radius],
  ];
}

export function computeSplitGeometry(
  constraints: Constraint[],
  viewport: Scene["viewport"],
  pi: Point2D,
  pi0: number,
): SplitGeometry {
  const feasible = clipToConstraints(
    constraints,
    viewport,
  );

  const left = clipPolygonByHalfspace(
    feasible,
    pi,
    pi0,
  );

  const negativePi: Point2D = [-pi[0], -pi[1]];

  const right = clipPolygonByHalfspace(
    feasible,
    negativePi,
    -(pi0 + 1),
  );

  const stripLower = clipPolygonByHalfspace(
    feasible,
    negativePi,
    -pi0,
  );

  const strip = clipPolygonByHalfspace(
    stripLower,
    pi,
    pi0 + 1,
  );

  const splitHull =
    left.length + right.length > 0
      ? convexHull([...left, ...right])
      : [];

  const projectedVertices = feasible.map((source) => ({
    source,
    target: projectPointOntoPi(source, pi),
    value: splitCoordinate(source, pi),
  }));

  const facets: ProjectedFacet[] = constraints
    .map((constraint) => {
      const pointsOnFacet = feasible.filter(
        (point) =>
          Math.abs(
            constraint.a * point[0] +
              constraint.b * point[1] -
              constraint.limit,
          ) < 1e-5,
      );

      const segment = farthestPair(pointsOnFacet);

      if (!segment) return null;

      return {
        constraint,
        segment,
        projectedSegment: [
          projectPointOntoPi(segment[0], pi),
          projectPointOntoPi(segment[1], pi),
        ] as [Point2D, Point2D],
      };
    })
    .filter(
      (facet): facet is ProjectedFacet =>
        facet !== null,
    );

  const projectedValues = projectedVertices.map(
    ({ value }) => value,
  );

  const minimum =
    projectedValues.length > 0
      ? Math.min(...projectedValues)
      : pi0;

  const maximum =
    projectedValues.length > 0
      ? Math.max(...projectedValues)
      : pi0 + 1;

  return {
    feasible,
    left,
    right,
    strip,
    splitHull,
    projectedVertices,
    facets,

    axis: piAxisSegment(pi, viewport),

    lowerBoundary: constraintLine(
      {
        id: "split-lower",
        a: pi[0],
        b: pi[1],
        limit: pi0,
        label: `πᵀx = ${pi0}`,
      },
      viewport,
    ),

    upperBoundary: constraintLine(
      {
        id: "split-upper",
        a: pi[0],
        b: pi[1],
        limit: pi0 + 1,
        label: `πᵀx = ${pi0 + 1}`,
      },
      viewport,
    ),

    lowerAxisPoint: pointOnPiAxis(pi0, pi),
    upperAxisPoint: pointOnPiAxis(pi0 + 1, pi),

    projectedMinimum: pointOnPiAxis(minimum, pi),
    projectedMaximum: pointOnPiAxis(maximum, pi),
  };
}