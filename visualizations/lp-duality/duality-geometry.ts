import type {
  Point3D,
  Primitive,
  Scene,
  Scene3D,
} from "@/engine/types";

export const triangleConstraints: Scene["constraints"] = [
  { id: "x1-upper", a: 1, b: 0, limit: 2, label: "x₁≤2", color: "#f49a4a" },
  { id: "x2-upper", a: 0, b: 1, limit: 2, label: "x₂≤2", color: "#8f88dc" },
  { id: "sum-lower", a: -1, b: -1, limit: 0, label: "−x₁−x₂≤0", color: "#79c9c0" },
];

export function triangleScene(
  primitives: Primitive[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return {
    viewport: { x: [-2.7, 2.7], y: [-2.7, 2.7] },
    constraints: triangleConstraints,
    showGrid: true,
    showConstraints: true,
    showFeasibleRegion: true,
    showVertices: true,
    showLattice: true,
    axisLabels: { x: "x₁", y: "x₂" },
    primitives,
    caption: {
      primary: "Primal polyhedron P",
      secondary: "maximize cᵀx=x₁+x₂",
    },
    ...overrides,
  };
}

export function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: true,
    showLattice: true,
    showVertices: true,
    scene3D: configuration,
  };
}

export function dualRayConfiguration(
  overrides: Partial<Scene3D> = {},
): Scene3D {
  const origin: Point3D = [1, 1, 0];
  const far: Point3D = [3.2, 3.2, 2.2];
  return {
    bounds: { x: [-0.2, 3.5], y: [-0.2, 3.5], z: [-0.2, 2.7] },
    axisLabels: { x: "y₁", y: "y₂", z: "y₃" },
    camera: { yaw: -0.72, pitch: 0.42, distance: 6.4 },
    segments: [
      {
        id: "dual-ray",
        from: origin,
        to: far,
        label: "D={(1+t,1+t,t):t≥0}",
        color: "#8f88dc",
        width: 5,
        animate: true,
      },
    ],
    markers: [
      { id: "dual-vertex", at: origin, label: "dual vertex y*=(1,1,0)", style: "optimum" },
    ],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "Dual polyhedron D",
      secondary: "Aᵀy=c, y≥0 produces an unbounded ray",
    },
    ...overrides,
  };
}

export function dualSegmentConfiguration(
  overrides: Partial<Scene3D> = {},
): Scene3D {
  const left: Point3D = [1, 1, 0];
  const right: Point3D = [0, 0, 1];
  return {
    bounds: { x: [-0.25, 1.35], y: [-0.25, 1.35], z: [-0.25, 1.35] },
    axisLabels: { x: "y₁", y: "y₂", z: "y₃" },
    camera: { yaw: -0.72, pitch: 0.42, distance: 4.4 },
    segments: [
      {
        id: "dual-segment",
        from: left,
        to: right,
        label: "D={(1−t,1−t,t):0≤t≤1}",
        color: "#8f88dc",
        width: 6,
        animate: true,
      },
    ],
    markers: [
      { id: "separate", at: left, label: "a₁+a₂", style: "integer" },
      { id: "combined", at: right, label: "a₃", style: "integer" },
      { id: "middle", at: [0.5, 0.5, 0.5], label: "same c, mixed representation", style: "fractional" },
    ],
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x", "y", "z"],
    caption: {
      primary: "A bounded dual polyhedron",
      secondary: "every point is a nonnegative representation of c",
    },
    ...overrides,
  };
}

export const dualProof = {
  weakDuality:
    "For x∈P and y∈D, cᵀx=yᵀAx≤yᵀb because y≥0 and Ax≤b.",
  equality:
    "At optimal x* and y*, the weak-duality chain closes to equality.",
};
