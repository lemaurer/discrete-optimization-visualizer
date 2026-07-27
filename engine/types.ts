export type Point2D = [number, number];
export type Point3D = [number, number, number];

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

export type SplitMembershipPhase =
  | "setup"
  | "split-coordinate"
  | "alpha-distance"
  | "slack-budget"
  | "witness-row"
  | "witness-region"
  | "overlap"
  | "select-witness"
  | "construct"
  | "slacks"
  | "conclusion";

export interface SplitMembershipScene {
  pi: Point2D;
  pi0: number;
  x: Point2D;
  y?: Point2D;
  phase: SplitMembershipPhase;
  focusConstraintId?: string;
  stripColor?: string;
  witnessColor?: string;
  overlapColor?: string;
  candidateColor?: string;
}

export type MeshStyle3D =
  | "solid"
  | "ghost"
  | "removed"
  | "survivor"
  | "integer-hull"
  | "split-hull";

export interface Mesh3D {
  id: string;
  vertices: Point3D[];
  faces: number[][];
  label?: string;
  color?: string;
  edgeColor?: string;
  opacity?: number;
  style?: MeshStyle3D;
  /** Optional starting geometry for an animated interpolation. */
  fromVertices?: Point3D[];
}

export interface PlanePatch3D {
  id: string;
  points: Point3D[];
  label?: string;
  color?: string;
  opacity?: number;
  dashed?: boolean;
}

export interface Segment3D {
  id: string;
  from: Point3D;
  to: Point3D;
  label?: string;
  color?: string;
  width?: number;
  dashed?: boolean;
  animate?: boolean;
}

export interface Marker3D {
  id: string;
  at: Point3D;
  label?: string;
  color?: string;
  style?: "vertex" | "fractional" | "integer" | "optimum";
  radius?: number;
  animateFrom?: Point3D;
}

export interface Scene3D {
  bounds: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  axisLabels?: {
    x: string;
    y: string;
    z: string;
  };
  camera?: {
    yaw?: number;
    pitch?: number;
    distance?: number;
  };
  /** Visual-only multiplier for the third coordinate. */
  verticalScale?: number;
  meshes?: Mesh3D[];
  planes?: PlanePatch3D[];
  segments?: Segment3D[];
  markers?: Marker3D[];
  showAxes?: boolean;
  showGround?: boolean;
  showIntegerLattice?: boolean;
  integerAxes?: Array<"x" | "y" | "z">;
  caption?: {
    primary?: string;
    secondary?: string;
  };
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
   * `uniform` preserves equal units on both axes. `stretch` fits each axis
   * independently and is useful for schematic projections with very different
   * coordinate ranges.
   */
  scaleMode?: "uniform" | "stretch";

  /** Optional tick spacing. Omitted values are chosen automatically. */
  axisTicks?: {
    x?: number;
    y?: number;
  };

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
  splitMembership?: SplitMembershipScene;
  scene3D?: Scene3D;
}
