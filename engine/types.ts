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
  style?:
    | "vertex"
    | "fractional"
    | "integer"
    | "optimum"
    | "facility"
    | "facility-fractional"
    | "facility-closed"
    | "client"
    | "graph-node"
    | "graph-node-active"
    | "graph-node-invalid";
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
  style?: "feasible" | "integer-hull" | "removed" | "component";
}

export interface LinePrimitive {
  kind: "line";
  from: Point2D;
  to: Point2D;
  label?: string;
  style?:
    | "constraint"
    | "objective"
    | "cut"
    | "assignment"
    | "graph-edge"
    | "graph-edge-rejected"
    | "graph-arc"
    | "graph-rejected";
  color?: string;
  animationDelay?: number;
  animate?: boolean;
}

export interface CirclePrimitive {
  kind: "circle";
  at: Point2D;
  radius: number;
  label?: string;
  style?: "flood" | "component";
  color?: string;
  animationDelay?: number;
  animate?: boolean;
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
  | CirclePrimitive
  | LabelPrimitive;

export interface Scene {
  viewport: { x: [number, number]; y: [number, number] };
  constraints: Constraint[];
  primitives?: Primitive[];
  showFeasibleRegion?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showLattice?: boolean;
  showVertices?: boolean;
  showActiveConstraints?: boolean;
  showIntegerHull?: boolean;
  caption?: {
    label: string;
    detail: string;
  };
  objective?: {
    vector: Point2D;
    label: string;
  };
}
