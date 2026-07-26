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
  pi: Point2D;
  pi0: number;
  phase: SplitProjectionPhase;
  showGuides?: boolean;
  color?: string;
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

  /**
   * `points` is the ordinary Z² lattice. `x-lines` and `y-lines` are useful
   * for mixed-integer projections where only one displayed coordinate is integral.
   */
  latticeMode?: "points" | "x-lines" | "y-lines";

  axisLabels?: {
    x: string;
    y: string;
  };

  caption?: {
    primary?: string;
    secondary?: string;
  };

  objective?: {
    vector: Point2D;
    label: string;
  };

  splitProjection?: SplitProjectionScene;
}
