import type { Constraint, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS,
  boxMesh,
  integerBoxMarkers,
  marker3D,
  point2D,
  scene2D,
  scene3D,
} from "@/visualizations/helpers/tdi-scenes";

const squareIntegral: Constraint[] = [
  { id: "sq-left", a: -1, b: 0, limit: 0, label: "−x₁≤0", color: TDI_COLORS.aqua },
  { id: "sq-bottom", a: 0, b: -1, limit: 0, label: "−x₂≤0", color: TDI_COLORS.aqua },
  { id: "sq-right", a: 1, b: 0, limit: 2, label: "x₁≤2", color: TDI_COLORS.violet },
  { id: "sq-top", a: 0, b: 1, limit: 2, label: "x₂≤2", color: TDI_COLORS.violet },
];

const squareFractional: Constraint[] = [
  ...squareIntegral.slice(0, 2),
  { id: "sq-right-half", a: 1, b: 0, limit: 0.5, label: "x₁≤1/2", color: TDI_COLORS.rose },
  squareIntegral[3],
];

const integralSquareVertices: Array<[number, number]> = [[0,0],[2,0],[2,2],[0,2]];
const fractionalSquareVertices: Array<[number, number]> = [[0,0],[0.5,0],[0.5,2],[0,2]];

const stages2D: VisualizationStage[] = [
  {
    id: "tdi-integrality-2d-system",
    kicker: "Chapter 23 · Theorem 140 · 2D",
    title: "Start with a TDI system and an integral right-hand side",
    description:
      "The box system −x₁≤0,−x₂≤0,x₁≤2,x₂≤2 is TDI: on every face, its tight row vectors are subsets of ±e₁,±e₂ and integrally generate the corresponding coordinate cone.",
    formula: "A∈ℤ⁴ˣ², b=(0,0,2,2)∈ℤ⁴, Ax≤b is TDI",
    insight:
      "Theorem 140 needs both ingredients: TDI of the inequality system and integrality of b.",
    scene: scene2D(
      squareIntegral,
      integralSquareVertices.map<Primitive>((at, index) => point2D(at, index === 2 ? "integral vertex" : undefined, "integer")),
      {
        viewport: { x: [-0.6, 2.8], y: [-0.6, 2.8] },
        caption: {
          primary: "TDI system with integral right-hand side",
          secondary: "P=[0,2]².",
        },
      },
    ),
  },
  {
    id: "tdi-integrality-2d-conclusion",
    kicker: "Theorem 140 · Conclusion",
    title: "Every minimal face contains an integer point",
    description:
      "For this polytope, the minimal faces are its four vertices, and all four are integer. Theorem 140 proves the same conclusion for arbitrary TDI systems with integral b, including unbounded polyhedra where minimal faces need not be vertices.",
    formula: "Ax≤b TDI and b∈ℤᵐ  ⇒  P={x:Ax≤b} is integral",
    insight:
      "The proof in the notes rules out a nonintegral minimal face using the integer Farkas lemma and the integral dual optimum from Theorem 139.",
    scene: scene2D(
      squareIntegral,
      integralSquareVertices.map((at, index) => point2D(at, index === 0 ? "all minimal faces integral" : undefined, "optimum")),
      {
        viewport: { x: [-0.6, 2.8], y: [-0.6, 2.8] },
        caption: {
          primary: "The polyhedron is integral",
          secondary: "Every vertex lies in ℤ².",
        },
      },
    ),
  },
  {
    id: "tdi-integrality-2d-b-matters",
    kicker: "Theorem 140 · Why b∈ℤᵐ matters",
    title: "Keep the same TDI row geometry but make one right-hand side fractional",
    description:
      "Replace x₁≤2 by x₁≤1/2. The face cones are unchanged in type and the system remains TDI, but the new polytope has fractional vertices (1/2,0) and (1/2,2).",
    formula: "TDI alone does not imply an integral polyhedron when b∉ℤᵐ",
    insight:
      "This isolates exactly where Theorem 140 uses the hypothesis b integral: an integral dual y* then forces bᵀy* to be an integer.",
    scene: scene2D(
      squareFractional,
      fractionalSquareVertices.map((at, index) =>
        point2D(at, index === 1 ? "fractional vertex" : undefined, at[0] % 1 === 0 && at[1] % 1 === 0 ? "integer" : "fractional"),
      ),
      {
        viewport: { x: [-0.6, 2.8], y: [-0.6, 2.8] },
        caption: {
          primary: "Same normal structure, fractional right-hand side",
          secondary: "The conclusion of Theorem 140 can fail.",
        },
      },
    ),
  },
];

const stages3D: VisualizationStage[] = [
  {
    id: "tdi-integrality-3d-integral",
    kicker: "Chapter 23 · Theorem 140 · 3D",
    title: "A three-dimensional TDI box with integral bounds is integral",
    description:
      "Take P=[0,2]³. The six coordinate inequalities form a TDI system, and all right-hand sides are integral.",
    formula: "P=[0,2]³,   b∈ℤ⁶",
    insight:
      "This is a dimension-three illustration of Theorem 140, not an additional assumption beyond the lecture statement.",
    scene: scene3D({
      bounds: { x: [-0.5, 2.8], y: [-0.5, 2.8], z: [-0.5, 2.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.75, pitch: 0.5, distance: 6.1 },
      meshes: [boxMesh("integral-cube", [2,2,2], "P=[0,2]³")],
      markers: integerBoxMarkers([2,2,2], "integral-cube-lattice"),
      caption: {
        primary: "Integral 3D polytope",
        secondary: "All eight vertices are lattice points.",
      },
    }),
  },
  {
    id: "tdi-integrality-3d-minimal-faces",
    kicker: "Theorem 140 · Minimal faces",
    title: "In a bounded 3D polytope, the minimal faces are the vertices",
    description:
      "The eight corners of the cube are all integral, so the cube is integral in the sense used throughout the notes.",
    formula: "vertices(P)⊂ℤ³",
    insight:
      "For unbounded polyhedra, the definition is broader: every minimal face must contain an integer point.",
    scene: scene3D({
      bounds: { x: [-0.5, 2.8], y: [-0.5, 2.8], z: [-0.5, 2.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.75, pitch: 0.5, distance: 6.1 },
      meshes: [boxMesh("integral-cube-vertices", [2,2,2], "P", "ghost", 0.1)],
      markers: [
        marker3D("v000", [0,0,0], "integer vertex", "optimum"),
        marker3D("v200", [2,0,0], undefined, "optimum"),
        marker3D("v220", [2,2,0], undefined, "optimum"),
        marker3D("v020", [0,2,0], undefined, "optimum"),
        marker3D("v002", [0,0,2], undefined, "optimum"),
        marker3D("v202", [2,0,2], undefined, "optimum"),
        marker3D("v222", [2,2,2], undefined, "optimum"),
        marker3D("v022", [0,2,2], undefined, "optimum"),
      ],
      caption: {
        primary: "All minimal faces contain lattice points",
        secondary: "For this polytope they are exactly the eight vertices.",
      },
    }),
  },
  {
    id: "tdi-integrality-3d-fractional-b",
    kicker: "Theorem 140 · Fractional right-hand side",
    title: "A fractional bound immediately creates a fractional vertex",
    description:
      "Change only the upper bound on x₁ to 1/2. The coordinate-normal system is still TDI, but vertices with first coordinate 1/2 are fractional.",
    formula: "P'=[0,1/2]×[0,2]×[0,2]",
    insight:
      "Again, TDI controls the dual multipliers; integrality of b is what converts those integral multipliers into integer optimal values.",
    scene: scene3D({
      bounds: { x: [-0.4, 1.4], y: [-0.5, 2.8], z: [-0.5, 2.8] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.75, pitch: 0.5, distance: 5.8 },
      meshes: [boxMesh("fractional-box", [0.5,2,2], "P'=[0,1/2]×[0,2]²")],
      markers: [
        marker3D("fractional-v", [0.5,2,2], "fractional vertex", "fractional", 0.11),
        marker3D("integral-origin", [0,0,0], "integer vertex", "integer"),
      ],
      caption: {
        primary: "TDI does not rescue a fractional right-hand side",
        secondary: "Theorem 140 explicitly requires b∈ℤᵐ.",
      },
    }),
  },
];

const examples: VisualizationExample[] = [
  { id: "tdi-integrality-2d", title: "2D · Box", stages: stages2D },
  { id: "tdi-integrality-3d", title: "3D · Box", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "tdi-implies-integral-polyhedron",
  title: "TDI III — From Integral Duals to Integral Polyhedra",
  shortTitle: "TDI + integral b ⇒ integral P",
  chapter: "Total dual integrality",
  order: 3,
  description:
    "Theorem 140: if Ax≤b is TDI and both A and b are integral, then the polyhedron {x:Ax≤b} is integral.",
  difficulty: "Advanced",
  duration: 12,
  accent: TDI_COLORS.orange,
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Contradiction structure of Theorem 140",
    steps: [
      "Assume a minimal face F contains no integer point.",
      "The integer Farkas lemma produces a rational nonnegative multiplier z with c=zᵀA_I integral but γ=zᵀb_I nonintegral.",
      "Theorem 139 supplies an integral optimal dual y* for c.",
      "Since b is integral, bᵀy* is integral, yet strong duality gives bᵀy*=cᵀx=γ for x∈F, a contradiction.",
    ],
  },
};

export default visualization;
