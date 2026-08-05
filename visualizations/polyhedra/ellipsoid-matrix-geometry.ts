import type {
  EllipsePrimitive,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

type Matrix2 = [[number, number], [number, number]];

const D: Matrix2 = [
  [2, 1],
  [1, 2],
];
const D2: Matrix2 = [
  [5, 4],
  [4, 5],
];
const DInv: Matrix2 = [
  [2 / 3, -1 / 3],
  [-1 / 3, 2 / 3],
];
const DInv2: Matrix2 = [
  [5 / 9, -4 / 9],
  [-4 / 9, 5 / 9],
];

const center: Point2D = [4, 3];
const origin: Point2D = [0, 0];
const sqrt2 = Math.sqrt(2);
const qLong: Point2D = [1 / sqrt2, 1 / sqrt2];
const qShort: Point2D = [1 / sqrt2, -1 / sqrt2];
const viewport: Scene["viewport"] = { x: [-4, 8], y: [-4, 8] };

function multiply(matrix: Matrix2, vector: Point2D): Point2D {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ];
}

function add(left: Point2D, right: Point2D): Point2D {
  return [left[0] + right[0], left[1] + right[1]];
}

function scale(vector: Point2D, factor: number): Point2D {
  return [factor * vector[0], factor * vector[1]];
}

function quadraticValue(matrix: Matrix2, vector: Point2D): number {
  const image = multiply(matrix, vector);
  return vector[0] * image[0] + vector[1] * image[1];
}

function geometryFromD(matrix: Matrix2, at: Point2D, factor = 1) {
  const [[a, b], [, c]] = matrix;
  const trace = a + c;
  const discriminant = Math.sqrt((a - c) ** 2 + 4 * b ** 2);
  const lambdaMax = (trace + discriminant) / 2;
  const lambdaMin = (trace - discriminant) / 2;

  return {
    at,
    radiusX: factor * lambdaMax,
    radiusY: factor * lambdaMin,
    rotation: 0.5 * Math.atan2(2 * b, a - c),
  };
}

function ellipse(
  at: Point2D,
  factor: number,
  label: string,
  options: Partial<EllipsePrimitive> = {},
): EllipsePrimitive {
  return {
    kind: "ellipse",
    ...geometryFromD(D, at, factor),
    label,
    color: "#a7a0ed",
    opacity: 0.09,
    ...options,
  };
}

function circle(
  at: Point2D,
  radius: number,
  label: string,
  options: Partial<EllipsePrimitive> = {},
): EllipsePrimitive {
  return {
    kind: "ellipse",
    at,
    radiusX: radius,
    radiusY: radius,
    rotation: 0,
    label,
    color: "#79c9c0",
    opacity: 0.07,
    ...options,
  };
}

function vector(
  from: Point2D,
  to: Point2D,
  label: string,
  color: string,
): Primitive {
  return { kind: "vector", from, to, label, color, animate: true };
}

function axis(
  at: Point2D,
  direction: Point2D,
  radius: number,
  label: string,
  color: string,
): Primitive {
  return {
    kind: "line",
    from: add(at, scale(direction, -radius)),
    to: add(at, scale(direction, radius)),
    label,
    style: "objective",
    color,
    animate: true,
  };
}

function scene(primitives: Primitive[], overrides: Partial<Scene> = {}): Scene {
  return {
    viewport,
    constraints: [],
    primitives,
    showFeasibleRegion: false,
    showConstraints: false,
    showGrid: true,
    showAxes: true,
    showVertices: false,
    caption: {
      primary: "Matrix representation of an ellipsoid",
      secondary: "Unit ball → linear image → translation",
    },
    ...overrides,
  };
}

const e1: Point2D = [1, 0];
const e2: Point2D = [0, 1];
const De1 = multiply(D, e1);
const De2 = multiply(D, e2);
const boundaryPoint = add(center, De1);
const insidePoint = add(center, scale(De1, 0.5));
const outsidePoint = add(center, scale(De1, 1.2));

const visualization: VisualizationDefinition = {
  id: "ellipsoid-matrix-geometry",
  title: "Ellipsoids from Positive-Definite Matrices",
  shortTitle: "Matrix ellipsoid geometry",
  chapter: "Polyhedral geometry",
  order: 3,
  description:
    "Build an ellipsoid from a positive-definite matrix D, read its axes from the eigendecomposition, translate it by d, and connect the linear-image and quadratic-form descriptions used in FIXIP.",
  difficulty: "Intermediate",
  duration: 15,
  accent: "#a7a0ed",
  visualLabel: "Matrix geometry",
  insightLabel: "Ellipsoid invariant",
  controls: { grid: true, labels: true },
  stages: [
    {
      id: "unit-ball",
      kicker: "01 · Starting object",
      title: "Begin with the Euclidean unit ball",
      description:
        "Every point y in the unit disk satisfies ‖y‖₂≤1. A matrix ellipsoid is obtained by applying a linear map to this disk and then translating the result.",
      formula: "B₂(0,1)={y∈ℝ²:yᵀy≤1}",
      insight: "The circle contains no preferred direction; all geometry enters through D.",
      scene: scene([
        circle(origin, 1, "unit ball B₂(0,1)"),
        vector(origin, e1, "e₁", "#f49a4a"),
        vector(origin, e2, "e₂", "#79c9c0"),
      ]),
    },
    {
      id: "linear-image",
      kicker: "02 · Apply D",
      title: "The positive-definite matrix stretches and rotates the unit ball",
      description:
        "For D=[[2,1],[1,2]], the image of the unit ball is an ellipse. The two matrix columns are De₁=(2,1) and De₂=(1,2).",
      formula: "D B₂(0,1)={Dy:‖y‖₂≤1}",
      insight: "The matrix acts on every point of the disk, not only on the coordinate vectors.",
      scene: scene([
        circle(origin, 1, "original unit ball", { dashed: true, opacity: 0.025 }),
        ellipse(origin, 1, "D B₂(0,1)"),
        vector(origin, De1, "De₁=(2,1)", "#f49a4a"),
        vector(origin, De2, "De₂=(1,2)", "#79c9c0"),
      ]),
    },
    {
      id: "eigen-directions",
      kicker: "03 · Principal axes",
      title: "Eigenvectors give the directions and eigenvalues give the semi-axis lengths",
      description:
        "The orthonormal eigenvectors are q₁=(1,1)/√2 and q₂=(1,−1)/√2. Their eigenvalues are 3 and 1, so the ellipse has radii 3 and 1 in these directions.",
      formula: "D=R diag(3,1)Rᵀ,   Dq₁=3q₁,   Dq₂=q₂",
      insight: "Off-diagonal matrix entries rotate the principal axes away from the coordinate axes.",
      scene: scene([
        ellipse(origin, 1, "eigen-ellipse"),
        axis(origin, qLong, 3, "long axis: λ₁=3", "#e88d99"),
        axis(origin, qShort, 1, "short axis: λ₂=1", "#d4ef77"),
        vector(origin, scale(qLong, 3), "3q₁", "#e88d99"),
        vector(origin, qShort, "q₂", "#d4ef77"),
      ]),
    },
    {
      id: "quadratic-form",
      kicker: "04 · Equivalent equation",
      title: "Applying D to the ball is equivalent to a quadratic inequality",
      description:
        "Writing x=Dy gives y=D⁻¹x. Therefore ‖y‖₂²≤1 becomes xᵀD⁻²x≤1. For this example D⁻²=(1/9)[[5,−4],[−4,5]].",
      formula: "DB₂(0,1)={x:xᵀD⁻²x≤1}",
      insight: "The inverse matrix measures distance in the coordinates in which the ellipse becomes a circle.",
      scene: scene([
        ellipse(origin, 1, "xᵀD⁻²x≤1"),
        { kind: "label", at: [4.6, 6.6], text: "D⁻¹=(1/3)[[2,−1],[−1,2]]", tone: "accent" },
        { kind: "label", at: [4.6, 5.9], text: "D⁻²=(1/9)[[5,−4],[−4,5]]", tone: "accent" },
      ]),
    },
    {
      id: "translate-center",
      kicker: "05 · Add the center",
      title: "Translation by d moves the ellipse without changing its shape",
      description:
        "The full affine map is x=d+Dy. With d=(4,3), every point of the centered ellipse is shifted by the same vector.",
      formula: "E′=d+D B₂(0,1)={x:(x−d)ᵀD⁻²(x−d)≤1}",
      insight: "D controls shape and orientation; d controls only the center.",
      scene: scene([
        ellipse(origin, 1, "before translation", { dashed: true, opacity: 0.025 }),
        ellipse(center, 1, "E′=d+DB₂", {
          animateFrom: geometryFromD(D, origin, 1),
        }),
        vector(origin, center, "d=(4,3)", "#f49a4a"),
        { kind: "point", at: center, label: "center d", style: "fractional" },
      ]),
    },
    {
      id: "boundary-preimage",
      kicker: "06 · Boundary test",
      title: "A point is on the boundary exactly when its preimage has unit norm",
      description:
        "Take x=d+De₁=(6,4). Its transformed coordinate is D⁻¹(x−d)=e₁, whose Euclidean norm is one.",
      formula: "x=(6,4):   D⁻¹(x−d)=e₁   ⇒   (x−d)ᵀD⁻²(x−d)=1",
      insight: "Membership in a rotated ellipse becomes an ordinary norm test after applying D⁻¹.",
      scene: scene([
        circle(origin, 1, "preimage ball", { dashed: true, opacity: 0.025 }),
        vector(origin, e1, "e₁", "#79c9c0"),
        ellipse(center, 1, "E′"),
        vector(center, boundaryPoint, "De₁=(2,1)", "#e88d99"),
        { kind: "point", at: boundaryPoint, label: "x=(6,4) · boundary", style: "optimum" },
      ]),
    },
    {
      id: "membership-values",
      kicker: "07 · Inside or outside",
      title: "The quadratic value directly classifies points",
      description:
        "Along the same transformed direction, half the radius gives value 1/4, while 1.2 times the radius gives value 1.44.",
      formula: "q(x)=(x−d)ᵀD⁻²(x−d):   q<1 inside, q=1 boundary, q>1 outside",
      insight: "The curved boundary is simply the level set q(x)=1.",
      scene: scene([
        ellipse(center, 1, "q(x)≤1"),
        { kind: "point", at: insidePoint, label: "q=0.25 · inside", style: "integer" },
        { kind: "point", at: boundaryPoint, label: "q=1 · boundary", style: "optimum" },
        { kind: "point", at: outsidePoint, label: "q=1.44 · outside", style: "graph-node-invalid" },
        vector(center, outsidePoint, "same D-direction", "#e88d99"),
      ]),
    },
    {
      id: "fixip-inner-outer",
      kicker: "08 · FIXIP convention",
      title: "The notes use the same matrix for an inner and an outer ellipsoid",
      description:
        "For n=2, E uses right-hand side 1/(n+1)²=1/9, while E′ uses right-hand side 1. Hence E has exactly one third of every semi-axis of E′.",
      formula: "E={x:(x−d)ᵀD⁻²(x−d)≤1/9} ⊆ P ⊆ E′={x:(x−d)ᵀD⁻²(x−d)≤1}",
      insight: "Both ellipsoids have the same center, orientation, and axis ratio; only their uniform scale differs.",
      scene: scene([
        ellipse(center, 1, "outer E′", { color: "#79c9c0", dashed: true, opacity: 0.025 }),
        ellipse(center, 1 / 3, "inner E", { color: "#a7a0ed", opacity: 0.13 }),
        { kind: "point", at: center, label: "common center d", style: "fractional" },
        axis(center, qLong, 3, "outer radius 3", "#79c9c0"),
        axis(center, qLong, 1, "inner radius 1", "#a7a0ed"),
      ]),
    },
    {
      id: "normalization",
      kicker: "09 · Normalize the geometry",
      title: "The affine map z=D⁻¹(x−d) turns both ellipsoids into concentric balls",
      description:
        "Under the coordinate change used in FIXIP, the outer ellipsoid becomes the unit ball and the inner ellipsoid becomes the ball of radius 1/(n+1).",
      formula: "z=D⁻¹(x−d):   B₂(0,1/3) ⊆ P′ ⊆ B₂(0,1)",
      insight: "The same transformation must also be applied to the lattice, producing L=D⁻¹ℤ².",
      scene: scene([
        ellipse(center, 1, "before: E′", { color: "#79c9c0", dashed: true, opacity: 0.025 }),
        ellipse(center, 1 / 3, "before: E", { opacity: 0.08 }),
        circle(origin, 1, "after: B₂(0,1)", { color: "#79c9c0", dashed: true, opacity: 0.025 }),
        circle(origin, 1 / 3, "after: B₂(0,1/3)", { color: "#a7a0ed", opacity: 0.12 }),
        vector(center, origin, "z=D⁻¹(x−d)", "#f49a4a"),
      ]),
    },
    {
      id: "determinant-volume",
      kicker: "10 · Volume",
      title: "The determinant records the area expansion",
      description:
        "The unit disk has area π. Applying D multiplies every area by det(D)=3, so the outer ellipse has area 3π. Scaling every axis by 1/3 multiplies area by 1/9, giving area π/3 for the inner ellipse.",
      formula: "area(E′)=π det(D)=3π,   area(E)=π det(D)/(n+1)²=π/3",
      insight: "In dimension n, vol(d+D Bₙ)=|det(D)|·vol(Bₙ). This is why maximum-volume ellipsoids maximize log|det(D)|.",
      scene: scene([
        ellipse(center, 1, "area 3π", { color: "#79c9c0", dashed: true, opacity: 0.025 }),
        ellipse(center, 1 / 3, "area π/3", { opacity: 0.13 }),
        vector(origin, De1, "column 1", "#f49a4a"),
        vector(origin, De2, "column 2", "#79c9c0"),
        { kind: "label", at: [0.2, -2.8], text: "det(D)=2·2−1·1=3", tone: "accent" },
      ]),
    },
    {
      id: "D-versus-Q",
      kicker: "11 · Notation dictionary",
      title: "The D-form and the standard Q-form describe the same ellipse",
      description:
        "Many texts write E(d,Q) with Q=D². Then Q has eigenvalues 9 and 1, while the semi-axis lengths are their square roots 3 and 1.",
      formula: "Q=D²=[[5,4],[4,5]],   E′={x:(x−d)ᵀQ⁻¹(x−d)≤1}",
      insight: "With D, the eigenvalues are axis lengths. With Q, the eigenvalues are squared axis lengths.",
      scene: scene([
        ellipse(center, 1, "same geometric ellipse"),
        axis(center, qLong, 3, "D eigenvalue 3 · Q eigenvalue 9", "#e88d99"),
        axis(center, qShort, 1, "D eigenvalue 1 · Q eigenvalue 1", "#d4ef77"),
        { kind: "label", at: [0.3, 7], text: "D=[[2,1],[1,2]]", tone: "accent" },
        { kind: "label", at: [0.3, 6.3], text: "Q=D²=[[5,4],[4,5]]", tone: "accent" },
      ]),
    },
  ],
  proof: {
    title: "Why are the two ellipsoid descriptions equivalent?",
    steps: [
      "Start with x=d+Dy and ‖y‖₂≤r.",
      "Since D is positive definite, it is invertible and y=D⁻¹(x−d).",
      "Substituting gives ‖D⁻¹(x−d)‖₂²=(x−d)ᵀD⁻²(x−d)≤r².",
      "The eigendecomposition D=RΛRᵀ shows that the principal directions are the columns of R and the semi-axis lengths are rλᵢ.",
      "Setting Q=D² yields the standard form (x−d)ᵀQ⁻¹(x−d)≤r², where the eigenvalues of Q are λᵢ².",
      "For the FIXIP pair, r=1/(n+1) gives E and r=1 gives E′, so the ellipsoids are uniform homothetic copies about d.",
    ],
  },
};

void D2;
void DInv;
void quadraticValue;
void DInv2;

export default visualization;
