import {
  clipToConstraints,
} from "./geometry";
import {
  computeSplitGeometry,
  dot,
} from "./split";
import type {
  Constraint,
  Point2D,
  Scene,
} from "./types";

const EPSILON = 1e-7;

export interface SplitMembershipConstraintTest {
  constraint: Constraint;
  slackAtX: number;
  slackAtY: number;
  allowance: number;
  satisfied: boolean;
}

export interface SplitMembershipGeometry {
  alpha: number;
  lambda: number;
  xCoordinate: number;
  xInsideSplit: boolean;

  witnessConstraints: Constraint[];
  witnessRegion: Point2D[];
  witnessRegionOnRight: Point2D[];
  witnessExists: boolean;

  split: ReturnType<typeof computeSplitGeometry>;

  y?: Point2D;
  z?: Point2D;
  yInPi2?: boolean;
  zInPi1?: boolean;
  candidateValid?: boolean;
  tests: SplitMembershipConstraintTest[];
}

export function constraintSlack(
  constraint: Constraint,
  point: Point2D,
): number {
  return (
    constraint.limit -
    constraint.a * point[0] -
    constraint.b * point[1]
  );
}

/**
 * The lemma's componentwise condition
 *
 *   b - Ay <= (b - Ax) / alpha
 *
 * can be rewritten as halfspaces in the witness variable y:
 *
 *   -A_i y <= (b_i - A_i x) / alpha - b_i.
 */
export function buildWitnessConstraints(
  constraints: Constraint[],
  x: Point2D,
  alpha: number,
): Constraint[] {
  if (alpha <= EPSILON) {
    throw new Error("The split-membership point must satisfy pi^T x > pi0.");
  }

  return constraints.map((constraint) => {
    const slackAtX = constraintSlack(constraint, x);

    return {
      id: `witness-${constraint.id}`,
      a: -constraint.a,
      b: -constraint.b,
      limit: slackAtX / alpha - constraint.limit,
      label: `witness budget: ${constraint.label}`,
      color: constraint.color,
    };
  });
}

export function projectPointToConstraint(
  point: Point2D,
  constraint: Constraint,
): Point2D {
  const normSquared =
    constraint.a * constraint.a +
    constraint.b * constraint.b;

  if (normSquared <= EPSILON) return point;

  const slack = constraintSlack(constraint, point);

  return [
    point[0] + (slack / normSquared) * constraint.a,
    point[1] + (slack / normSquared) * constraint.b,
  ];
}

export function computeSplitMembershipGeometry({
  constraints,
  viewport,
  pi,
  pi0,
  x,
  y,
}: {
  constraints: Constraint[];
  viewport: Scene["viewport"];
  pi: Point2D;
  pi0: number;
  x: Point2D;
  y?: Point2D;
}): SplitMembershipGeometry {
  const xCoordinate = dot(pi, x);
  const alpha = xCoordinate - pi0;
  const xInsideSplit =
    alpha > EPSILON &&
    alpha < 1 - EPSILON;

  if (!xInsideSplit) {
    throw new Error(
      "The split-membership visualization requires pi0 < pi^T x < pi0 + 1.",
    );
  }

  const lambda = alpha / (1 - alpha);
  const witnessConstraints = buildWitnessConstraints(
    constraints,
    x,
    alpha,
  );

  const witnessRegion = clipToConstraints(
    [...constraints, ...witnessConstraints],
    viewport,
  );

  const rightSideConstraint: Constraint = {
    id: "witness-right-side",
    a: -pi[0],
    b: -pi[1],
    limit: -(pi0 + 1),
    label: `pi^T y >= ${pi0 + 1}`,
  };

  const witnessRegionOnRight = clipToConstraints(
    [
      ...constraints,
      ...witnessConstraints,
      rightSideConstraint,
    ],
    viewport,
  );

  const split = computeSplitGeometry(
    constraints,
    viewport,
    pi,
    pi0,
  );

  if (!y) {
    return {
      alpha,
      lambda,
      xCoordinate,
      xInsideSplit,
      witnessConstraints,
      witnessRegion,
      witnessRegionOnRight,
      witnessExists: witnessRegionOnRight.length > 0,
      split,
      tests: [],
    };
  }

  const z: Point2D = [
    (x[0] - alpha * y[0]) / (1 - alpha),
    (x[1] - alpha * y[1]) / (1 - alpha),
  ];

  const tests = constraints.map((constraint) => {
    const slackAtX = constraintSlack(constraint, x);
    const slackAtY = constraintSlack(constraint, y);
    const allowance = slackAtX / alpha;

    return {
      constraint,
      slackAtX,
      slackAtY,
      allowance,
      satisfied: slackAtY <= allowance + EPSILON,
    };
  });

  const yInP = constraints.every(
    (constraint) => constraintSlack(constraint, y) >= -EPSILON,
  );
  const zInP = constraints.every(
    (constraint) => constraintSlack(constraint, z) >= -EPSILON,
  );
  const yInPi2 =
    yInP &&
    dot(pi, y) >= pi0 + 1 - EPSILON;
  const zInPi1 =
    zInP &&
    dot(pi, z) <= pi0 + EPSILON;
  const candidateValid =
    yInPi2 &&
    tests.every((test) => test.satisfied);

  return {
    alpha,
    lambda,
    xCoordinate,
    xInsideSplit,
    witnessConstraints,
    witnessRegion,
    witnessRegionOnRight,
    witnessExists: witnessRegionOnRight.length > 0,
    split,
    y,
    z,
    yInPi2,
    zInPi1,
    candidateValid,
    tests,
  };
}
