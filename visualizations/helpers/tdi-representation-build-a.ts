import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS,
  label2D,
  marker3D,
  plane3D,
  point2D,
  prismVertices,
  scene2D,
  scene3D,
  triangle2DConstraints,
  triangle2DTdiConstraints,
  triangle2DVertexMarkers,
  trianglePrismMesh,
} from "@/visualizations/helpers/tdi-scenes";

const viewport2D = {
  x: [-0.8, 2.8] as [number, number],
  y: [-0.7, 2.8] as [number, number],
};

const rowBuild2D = [
  {
    id: "a4",
    row: "a₄=(−1,0)",
    rhs: "b₄=0",
    inequality: "−x₁≤0",
    source: "H₁ at F₁=(0,0)",
    labelAt: [0.12, 1.45] as Point2D,
  },
  {
    id: "a5",
    row: "a₅=(−1,1)",
    rhs: "b₅=1",
    inequality: "−x₁+x₂≤1",
    source: "H₂ at F₂=(1,2)",
    labelAt: [0.18, 1.48] as Point2D,
  },
  {
    id: "a6",
    row: "a₆=(0,1)",
    rhs: "b₆=2",
    inequality: "x₂≤2",
    source: "H₂ at F₂=(1,2)",
    labelAt: [1.18, 2.18] as Point2D,
  },
  {
    id: "a7",
    row: "a₇=(1,1)",
    rhs: "b₇=3",
    inequality: "x₁+x₂≤3",
    source: "H₂ at F₂=(1,2)",
    labelAt: [1.48, 1.72] as Point2D,
  },
  {
    id: "a8",
    row: "a₈=(1,0)",
    rhs: "b₈=2",
    inequality: "x₁≤2",
    source: "H₃ at F₃=(2,0)",
    labelAt: [1.72, 1.35] as Point2D,
  },
];

function accumulatedScene2D(
  addedRows: number,
  newLabel?: Primitive,
) {
  const constraints = triangle2DTdiConstraints.slice(0, 3 + addedRows);
  const primitives: Primitive[] = [
    ...triangle2DVertexMarkers(),
    label2D([0.25, 2.55], `rows in A: ${constraints.length}`, "accent"),
    label2D([0.25, 2.34], "filled polyhedron P stays exactly the same", "muted"),
  ];
  if (newLabel) primitives.push(newLabel);

  return scene2D(constraints, primitives, {
    viewport: viewport2D,
    showLattice: false,
    caption: {
      primary: "Build the TDI row system A while watching P",
      secondary:
        addedRows === 0
          ? "The original nonredundant system C already describes P."
          : `After ${addedRows} added supporting row${addedRows === 1 ? "" : "s"}, the feasible set is still the same triangle.`,
    },
  });
}

const buildA2DStages: VisualizationStage[] = [
  {
    id: "tdi-build-a-2d-start",
    kicker: "Theorem 141 · Build A in parallel with the geometry",
    title: "Start with the original three facet rows",
    description:
      "The proof does not build a new polyhedron from scratch: C already describes P. What changes is the inequality representation. We now keep P visible while adding the Hilbert-basis rows to A one at a time.",
    formula:
      "A⁽⁰⁾=C with rows (0,−1),(−2,1),(2,1);   b⁽⁰⁾=(0,0,4)",
    insight:
      "From this point on, every added row is a supporting inequality aᵀx≤max_{x∈P}aᵀx, so the shaded feasible region must remain unchanged.",
    scene: accumulatedScene2D(0),
  },
  ...rowBuild2D.map<VisualizationStage>((step, index) => {
    const addedRows = index + 1;
    const rowList = rowBuild2D
      .slice(0, addedRows)
      .map((item) => item.row)
      .join(", ");
    return {
      id: `tdi-build-a-2d-${step.id}`,
      kicker: `Theorem 141 · Add row ${3 + addedRows} of A`,
      title: `Add ${step.inequality}`,
      description:
        `${step.row} comes from ${step.source}. Its support value is ${step.rhs}, so it becomes the valid inequality ${step.inequality}. The new line appears, but because it supports P rather than cutting through P, the filled triangle does not change.`,
      formula:
        `A⁽${addedRows}⁾ = A⁽${addedRows - 1}⁾ ∪ {${step.row}};   new support value ${step.rhs};   added rows so far: ${rowList}`,
      insight:
        index === 0
          ? "This is the missing horizontal generator at the left vertex normal cone."
          : index < 4
            ? "These are precisely the missing integral directions from the apex normal cone H₂."
            : "This is the symmetric missing horizontal generator at the right vertex normal cone.",
      scene: accumulatedScene2D(
        addedRows,
        label2D(step.labelAt, `new: ${step.inequality}`, "accent"),
      ),
    };
  }),
  {
    id: "tdi-build-a-2d-finish",
    kicker: "Theorem 141 · Completed A",
    title: "The final system has eight rows but the same polyhedron",
    description:
      "After the five Hilbert-basis additions, A contains the three original facet normals and five additional supported normals. Geometrically all five new inequalities are redundant; arithmetically they are what makes the face cones integrally generated.",
    formula:
      "rows(A)={(0,−1),(−2,1),(2,1),(−1,0),(−1,1),(0,1),(1,1),(1,0)}",
    insight:
      "This is the key visual distinction in Theorem 141: P never changes, while its normal description becomes richer until it satisfies the TDI face-cone criterion.",
    scene: accumulatedScene2D(5),
  },
];

const supportPlanes3D = [
  plane3D(
    "build3-xlower",
    [[0, -0.2, 0], [0, 2.7, 0], [0, 2.7, 1], [0, -0.2, 1]],
    "−x₁≤0",
    TDI_COLORS.muted,
    0.11,
  ),
  plane3D(
    "build3-midleft",
    [[0, 1, 0], [2, 3, 0], [2, 3, 1], [0, 1, 1]],
    "−x₁+x₂≤1",
    TDI_COLORS.rose,
    0.11,
  ),
  plane3D(
    "build3-top",
    [[-0.2, 2, 0], [2.2, 2, 0], [2.2, 2, 1], [-0.2, 2, 1]],
    "x₂≤2",
    TDI_COLORS.violet,
    0.11,
  ),
  plane3D(
    "build3-midright",
    [[0, 3, 0], [2, 1, 0], [2, 1, 1], [0, 3, 1]],
    "x₁+x₂≤3",
    TDI_COLORS.rose,
    0.11,
  ),
  plane3D(
    "build3-xupper",
    [[2, -0.2, 0], [2, 2.7, 0], [2, 2.7, 1], [2, -0.2, 1]],
    "x₁≤2",
    TDI_COLORS.muted,
    0.11,
  ),
];

const prismMarkers = prismVertices.map((at, index) =>
  marker3D(`build-a-prism-v-${index}`, at, undefined, "integer", 0.055),
);

function accumulatedScene3D(addedRows: number) {
  return scene3D({
    bounds: { x: [-0.7, 2.8], y: [-0.7, 3.15], z: [-0.3, 1.6] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.78, pitch: 0.45, distance: 6.4 },
    meshes: [trianglePrismMesh("build-a-prism", "P=T×[0,1]", 0.17)],
    planes: supportPlanes3D.slice(0, addedRows),
    markers: prismMarkers,
    showAxes: true,
    showGround: true,
    showIntegerLattice: false,
    caption: {
      primary: `3D row construction · ${5 + addedRows} rows in A`,
      secondary:
        addedRows === 0
          ? "The five original prism facet rows already describe P."
          : "Each translucent plane is a newly added supporting row; the prism itself stays fixed.",
    },
  });
}

const originalRows3D =
  "(0,−1,0),(−2,1,0),(2,1,0),(0,0,−1),(0,0,1)";

const buildA3DStages: VisualizationStage[] = [
  {
    id: "tdi-build-a-3d-start",
    kicker: "Theorem 141 · 3D row construction",
    title: "Start with the five nonredundant prism facet rows",
    description:
      "For P=T×[0,1], the original description has the three triangle facet normals plus −e₃ and e₃. We now add the same five horizontal Hilbert-basis directions as vertical supporting planes.",
    formula: `rows(A⁽⁰⁾)={${originalRows3D}}`,
    insight:
      "The 3D construction is literally the 2D row enrichment lifted through the prism; the new rows have zero third component.",
    scene: accumulatedScene3D(0),
  },
  ...rowBuild2D.map<VisualizationStage>((step, index) => {
    const row3 =
      index === 0
        ? "(−1,0,0)"
        : index === 1
          ? "(−1,1,0)"
          : index === 2
            ? "(0,1,0)"
            : index === 3
              ? "(1,1,0)"
              : "(1,0,0)";
    return {
      id: `tdi-build-a-3d-${step.id}`,
      kicker: `Theorem 141 · Add 3D supporting row ${6 + index}`,
      title: `Lift ${step.inequality} to a vertical support plane`,
      description:
        `Append a=${row3}. Since its third component is zero, the 2D supporting line becomes a vertical plane. The plane is visible, but the solid prism remains exactly the same feasible polyhedron.`,
      formula:
        `A⁽${index + 1}⁾=A⁽${index}⁾∪{${row3}};   support value ${step.rhs}`,
      insight:
        "The translucent plane records a new row of A; it is not a new facet of P. It is redundant in primal geometry and useful in normal-cone arithmetic.",
      scene: accumulatedScene3D(index + 1),
    };
  }),
  {
    id: "tdi-build-a-3d-finish",
    kicker: "Theorem 141 · Completed 3D A",
    title: "Ten rows describe the same six-vertex prism",
    description:
      "The final 3D description contains five original facet rows and five additional horizontal support rows. Every added plane is redundant for the primal prism, but together the tight rows supply the needed integral generators of the relevant normal cones.",
    formula:
      "rows(A)=original 5 rows ∪ {(−1,0,0),(−1,1,0),(0,1,0),(1,1,0),(1,0,0)}",
    insight:
      "Watching all support planes accumulate makes the theorem's construction concrete: the set P stays fixed while the row system A is completed.",
    scene: accumulatedScene3D(5),
  },
];

export const buildAExamples: VisualizationExample[] = [
  {
    id: "tdi-build-a-row-by-row-2d",
    title: "2D · build A row by row",
    description:
      "A dedicated construction view: keep the triangle fixed and add each Hilbert-basis supporting inequality to A one at a time.",
    stages: buildA2DStages,
    proof: {
      title: "Why the polyhedron stays fixed while A grows",
      steps: [
        "The original system Cx≤d already describes P.",
        "Every added row a comes from an integral generating set H_i of a minimal-face normal cone.",
        "Set b=max{aᵀx:x∈P}; therefore aᵀx≤b is valid for every x∈P and is tight on the corresponding face.",
        "Thus adding the row cannot remove any point of P. The reverse-inclusion argument in Theorem 141 shows the completed system also cannot admit a point outside P.",
        "After all rows from the H_i have been added, the same P has a row system whose face cones are integrally generated, hence the description is TDI.",
      ],
    },
  },
  {
    id: "tdi-build-a-row-by-row-3d",
    title: "3D · build A plane by plane",
    description:
      "The prism stays solid and unchanged while the five redundant vertical support planes are added one by one to the row system.",
    stages: buildA3DStages,
  },
];
