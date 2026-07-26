export type Point2D = [number, number];

export interface Constraint {
  id: string;
  a: number;
  b: number;
  limit: number;
  label: string;
  color?: string;
}

export interface PointPrimitive {
  kind: "point";
  at: Point2D;
  label?: string;
  style?: "vertex" | "fractional" | "integer" | "optimum";
  active?: boolean;
}

export interface VectorPrimitive {
  kind: "vector";
  from: Point2D;
  to: Point2D;
  label?: string;
  color?: string;
}

export interface PolygonPrimitive {
  kind: "polygon";
  points: Point2D[];
  label?: string;
  style?: "feasible" | "integer-hull" | "removed";
}

export interface LinePrimitive {
  kind: "line";
  from: Point2D;
  to: Point2D;
  label?: string;
  style?: "constraint" | "objective" | "cut";
  color?: string;
}

export interface LabelPrimitive {
  kind: "label";
  at: Point2D;
  text: string;
  tone?: "default" | "muted" | "accent";
}

export type Primitive =
  | PointPrimitive
  | VectorPrimitive
  | PolygonPrimitive
  | LinePrimitive
  | LabelPrimitive;

export type SplitProjectionPhase =
  | "direction"
  | "project-facets"
  | "project-polyhedron"
  | "projected-strip"
  | "lift-strip"
  | "remove-strip"
  | "split-hull";

export interface SplitProjectionScene {
  /**
   * Integral split vector π.
   */
  pi: Point2D;

  /**
   * Integer split threshold π₀.
   */
  pi0: number;

  phase: SplitProjectionPhase;

  /**
   * Draw orthogonal guides x → proj_π(x).
   */
  showGuides?: boolean;

  /**
   * Main accent used for the π-axis.
   */
  color?: string;

  /**
   * Color of the forbidden strip.
   */
  stripColor?: string;
}

export interface Scene {
  viewport: {
    x: [number, number];
    y: [number, number];
  };

  constraints: Constraint[];
  primitives?: Primitive[];

  showFeasibleRegion?: boolean;
  showConstraints?: boolean;
  showGrid?: boolean;
  showLattice?: boolean;
  showVertices?: boolean;
  showActiveConstraints?: boolean;
  showIntegerHull?: boolean;

  objective?: {
    vector: Point2D;
    label: string;
  };

  splitProjection?: SplitProjectionScene;
}