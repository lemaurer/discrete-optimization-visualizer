import type { Mesh3D, Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  TDI_COLORS,
  label2D,
  line2D,
  marker3D,
  point2D,
  prismVertices,
  scene2D,
  scene3D,
  segment3D,
  triangle2DConstraints,
  triangle2DTdiConstraints,
  triangle2DVertexMarkers,
  trianglePrismMesh,
  vector2D,
} from "@/visualizations/helpers/tdi-scenes";

const c1: Point2D = [0, -1];
const c2: Point2D = [-2, 1];
const c3: Point2D = [2, 1];

const apexNormalsOriginal: Point2D[] = [c2, c3];
const apexNormalsHilbert: Point2D[] = [
  [-2, 1],
  [-1, 1],
  [0, 1],
  [1, 1],
  [2, 1],
];
const leftNormalsHilbert: Point2D[] = [[0, -1], [-1, 0], [-2, 1]];
const rightNormalsHilbert: Point2D[] = [[0, -1], [1, 0], [2, 1]];

const allTdiRows = [
  "−x₂≤0",
  "−2x₁+x₂≤0",
  "2x₁+x₂≤4",
  "−x₁≤0",
  "−x₁+x₂≤1",
  "x₂≤2",
  "x₁+x₂≤3",
  "x₁≤2",
];

function translatedNormal(
  origin: Point2D,
  a: Point2D,
  scale: number,
  label: string,
  color: string,
): Primitive {
  return vector2D(
    origin,
    [origin[0] + scale * a[0], origin[1] + scale * a[1]],
    label,
    color,
  );
}

function translatedCone2D(
  origin: Point2D,
  ray1: Point2D,
  ray2: Point2D,
  scale: number,
  label: string,
): Primitive {
  return {
    kind: "polygon",
    points: [
      origin,
      [origin[0] + scale * ray1[0], origin[1] + scale * ray1[1]],
      [origin[0] + scale * ray2[0], origin[1] + scale * ray2[1]],
    ],
    label,
    style: "component",
  };
}

function add3(a: Point3D, b: Point3D): Point3D {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale3(lambda: number, a: Point3D): Point3D {
  return [lambda * a[0], lambda * a[1], lambda * a[2]];
}

function translatedNormalCone3D(
  id: string,
  origin: Point3D,
  rays: [Point3D, Point3D, Point3D],
  scale: number,
): Mesh3D {
  const vertices: Point3D[] = [
    origin,
    add3(origin, scale3(scale, rays[0])),
    add3(origin, scale3(scale, rays[1])),
    add3(origin, scale3(scale, rays[2])),
  ];
  return {
    id,
    vertices,
    faces: [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]],
    label: "translated normal cone N_P(v)",
    color: TDI_COLORS.lime,
    opacity: 0.18,
    style: "ghost",
  };
}

function constructionScene2D(
  constraints = triangle2DConstraints,
  primitives: Primitive[] = [],
  secondary = "",
  viewport = {
    x: [-1.0, 3.0] as [number, number],
    y: [-1.0, 3.2] as [number, number],
  },
) {
  return scene2D(
    constraints,
    [...triangle2DVertexMarkers(), ...primitives],
    {
      viewport,
      caption: {
        primary: "Theorem 141 · constructive TDI description",
        secondary,
      },
    },
  );
}

const stages2D: VisualizationStage[] = [
  {
    id: "tdi-construct-2d-theorem",
    kicker: "Chapter 23 · Theorem 141",
    title: "Every rational polyhedron admits some TDI description",
    description:
      "The theorem is about existence of a suitable inequality representation. Starting from a rational polyhedron P, the proof constructs a new system Ax≤b with integral A and rational b that describes exactly the same P and satisfies the integral face-cone criterion on every nonempty face.",
    formula:
      "P rational ⇒ ∃A∈ℤ^{r×n}, b∈ℚ^r: P={x:Ax≤b} and Ax≤b is TDI",
    insight:
      "TDI belongs to the inequality system, not to P alone. The construction may add redundant inequalities whose role is to repair the arithmetic of the tight normal cones.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [label2D([1.05, 2.55], "same P, richer row system", "accent")],
      "Running example: P=conv{(0,0),(1,2),(2,0)}.",
    ),
  },
  {
    id: "tdi-construct-2d-step1",
    kicker: "Proof step 1 · Choose a nonredundant integral description",
    title: "Start from P={x:Cx≤d} and read the facet normals",
    description:
      "The notes choose a nonredundant rational description and clear denominators so that C is integral. For the triangle the three rows are c₁=(0,−1), c₂=(−2,1), c₃=(2,1), with right-hand sides 0,0,4.",
    formula: "C={(0,−1),(−2,1),(2,1)},   d=(0,0,4)",
    insight:
      "Each cᵢ is a vector in normal space. In the drawing we translate the normal arrows to points of the corresponding facet only to make the primal geometry and normal geometry visible together.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedNormal([0.7, 0], c1, 0.55, "c₁=(0,−1)", TDI_COLORS.aqua),
        translatedNormal([0.35, 0.7], c2, 0.28, "c₂=(−2,1)", TDI_COLORS.orange),
        translatedNormal([1.65, 0.7], c3, 0.28, "c₃=(2,1)", TDI_COLORS.violet),
      ],
      "The three arrows are outward facet normals, translated to their facets.",
      { x: [-1.0, 3.0], y: [-1.1, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step2",
    kicker: "Proof step 2 · List the minimal faces",
    title: "For this polytope the minimal faces are the three vertices",
    description:
      "Let F₁,…,F_t be all minimal faces and I_i the original rows tight on F_i. Here I₁={1,2} at (0,0), I₂={2,3} at (1,2), and I₃={1,3} at (2,0).",
    formula: "F_i={x∈P:C_{I_i}x=d_{I_i}}",
    insight:
      "The proof first repairs one normal cone at each minimal face. Only later does it show that these local repairs automatically work for every larger face.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        point2D([0, 0], "F₁: I₁={1,2}", "optimum"),
        point2D([1, 2], "F₂: I₂={2,3}", "optimum"),
        point2D([2, 0], "F₃: I₃={1,3}", "optimum"),
      ],
      "The tight rows at a vertex generate its normal cone.",
    ),
  },
  {
    id: "tdi-construct-2d-step3-left",
    kicker: "Proof step 3a · Integral generators at F₁",
    title: "See the entire translated normal cone at (0,0)",
    description:
      "The actual normal cone is cone{(0,−1),(−2,1)} in normal-vector space. The shaded wedge is a truncated copy translated to the vertex (0,0). Inside it, the missing primitive lattice direction (−1,0) must be added.",
    formula: "H₁={(0,−1),(−1,0),(−2,1)}",
    insight:
      "Every arrow lies inside the shaded cone. The shading is not part of the primal feasible region; it is a translated picture of the cone of tight row normals.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedCone2D([0, 0], c1, c2, 0.52, "translated N_P(F₁)"),
        point2D([0, 0], "F₁", "optimum"),
        ...leftNormalsHilbert.map((a, i) =>
          translatedNormal(
            [0, 0],
            a,
            0.44,
            i === 0 ? "old c₁" : i === 1 ? "new (−1,0)" : "old c₂",
            i === 1 ? TDI_COLORS.rose : TDI_COLORS.orange,
          ),
        ),
      ],
      "Normal cone translated to F₁. The extra generator will become the redundant inequality −x₁≤0.",
      { x: [-1.35, 2.8], y: [-1.15, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step3-apex",
    kicker: "Proof step 3b · Integral generators at F₂",
    title: "The apex normal cone is the whole shaded wedge",
    description:
      "At F₂=(1,2), the tight original normals are c₂=(−2,1) and c₃=(2,1). Their nonnegative real combinations form the shaded wedge. The three additional lattice directions (−1,1),(0,1),(1,1) lie strictly inside that same cone but are not nonnegative integer combinations of c₂ and c₃.",
    formula: "N_P(F₂)=cone{(−2,1),(2,1)},   H₂={(−2,1),(−1,1),(0,1),(1,1),(2,1)}",
    insight:
      "The cone itself lives at the origin in normal space. Here we draw the translated copy F₂+0.48·N_P(F₂), so you can see both the primal vertex and its normal cone in one coordinate picture.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedCone2D([1, 2], c2, c3, 0.48, "translated normal cone N_P(F₂)"),
        point2D([1, 2], "F₂=(1,2)", "optimum"),
        ...apexNormalsOriginal.map((a, index) =>
          translatedNormal(
            [1, 2],
            a,
            0.42,
            index === 0 ? "old c₂=(−2,1)" : "old c₃=(2,1)",
            TDI_COLORS.orange,
          ),
        ),
        ...apexNormalsHilbert.slice(1, 4).map((a, index) =>
          translatedNormal(
            [1, 2],
            a,
            0.42,
            index === 0 ? "new (−1,1)" : index === 1 ? "new (0,1)" : "new (1,1)",
            TDI_COLORS.violet,
          ),
        ),
        label2D([1.0, 3.25], "every H₂ vector lies inside the shaded cone", "accent"),
      ],
      "Orange = original tight facet normals. Violet = additional integral generators. Shading = their translated normal cone.",
      { x: [-0.25, 2.25], y: [-0.35, 3.55] },
    ),
  },
  {
    id: "tdi-construct-2d-step3-apex-check",
    kicker: "Proof step 3b · Why those three vectors really lie in the cone",
    title: "Each missing direction is a real conic combination of the two extreme normals",
    description:
      "The additional vectors are inside the cone because they lie between its two extreme rays. Their coefficients are nonnegative real numbers, but fractional coefficients are exactly why the two extreme normals alone do not form an integral generating set.",
    formula: "(−1,1)=¾c₂+¼c₃,   (0,1)=½c₂+½c₃,   (1,1)=¼c₂+¾c₃",
    insight:
      "TDI asks for nonnegative integer generation of every lattice vector in the cone. Real conic membership is necessary, but not sufficient.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedCone2D([1, 2], c2, c3, 0.48, "translated N_P(F₂)"),
        point2D([1, 2], "F₂", "optimum"),
        ...apexNormalsHilbert.map((a, index) =>
          translatedNormal(
            [1, 2],
            a,
            0.42,
            index === 0 || index === 4 ? "extreme ray" : "interior lattice direction",
            index === 0 || index === 4 ? TDI_COLORS.orange : TDI_COLORS.violet,
          ),
        ),
      ],
      "The three interior arrows are visibly inside the same wedge, not outside it.",
      { x: [-0.25, 2.25], y: [-0.35, 3.55] },
    ),
  },
  {
    id: "tdi-construct-2d-step3-right",
    kicker: "Proof step 3c · Integral generators at F₃",
    title: "The right vertex has the symmetric translated normal cone",
    description:
      "At (2,0), the cone generated by c₁=(0,−1) and c₃=(2,1) contains the missing primitive direction (1,0). Thus H₃={(0,−1),(1,0),(2,1)}.",
    formula: "H₃ generates cone{c₁,c₃}∩ℤ²",
    insight:
      "Again, the entire shaded wedge is normal-space geometry translated to its primal vertex.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedCone2D([2, 0], c1, c3, 0.52, "translated N_P(F₃)"),
        point2D([2, 0], "F₃", "optimum"),
        ...rightNormalsHilbert.map((a, i) =>
          translatedNormal(
            [2, 0],
            a,
            0.44,
            i === 0 ? "old c₁" : i === 1 ? "new (1,0)" : "old c₃",
            i === 1 ? TDI_COLORS.rose : TDI_COLORS.violet,
          ),
        ),
      ],
      "The new generator (1,0) becomes the supporting inequality x₁≤2.",
      { x: [-0.8, 3.35], y: [-1.15, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step4",
    kicker: "Proof step 4 · Form A and define b",
    title: "Every Hilbert generator becomes a supported inequality",
    description:
      "Take all vectors in H₁∪H₂∪H₃ as rows of A. For each row a_k define b_k=max{a_kᵀx:x∈P}. If a_k∈H_i, then every point x̂∈F_i maximizes that row, giving Equation (59) from the notes.",
    formula: "b_k=max_{x∈P}a_kᵀx=a_kᵀx̂  for every x̂∈F_i when a_k∈H_i",
    insight:
      "For the three new apex normals the support values are 1,2,3, yielding −x₁+x₂≤1, x₂≤2, and x₁+x₂≤3. They are redundant geometrically but crucial arithmetically.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        point2D([1, 2], "all new apex rows are tight here", "optimum"),
        label2D([0.25, 2.65], "b=max over P ⇒ every added row is valid", "accent"),
      ],
      "Same triangle, richer inequality description.",
    ),
  },
  {
    id: "tdi-construct-2d-step5a",
    kicker: "Proof step 5a · First inclusion",
    title: "The new inequalities cannot remove a point of P",
    description:
      "For y∈P and every new row a_k, the definition of b_k immediately gives a_kᵀy≤b_k. Hence P⊆{x:Ax≤b}.",
    formula: "y∈P ⇒ a_kᵀy≤max_{x∈P}a_kᵀx=b_k",
    insight:
      "This direction uses only the support-function definition of b.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [point2D([1, 1], "arbitrary y∈P", "optimum")],
      "Every supported redundant inequality is valid for all of P.",
    ),
  },
  {
    id: "tdi-construct-2d-step5b",
    kicker: "Proof step 5b · Reverse inclusion",
    title: "Every point outside P is detected by at least one new row",
    description:
      "If y∉P, some old row c_ℓ has c_ℓᵀy>d_ℓ. Choose a minimal face F_i with ℓ∈I_i. Since H_i integrally generates its cone and c_ℓ is integral, write c_ℓ=Σ_jδ_ja_j with δ_j∈ℤ₊. Equation (59) gives d_ℓ=Σ_jδ_jb_j. Therefore not all inequalities a_jᵀy≤b_j can hold.",
    formula: "c_ℓ=Σδ_ja_j, δ_j∈ℤ₊;  c_ℓᵀy>d_ℓ=Σδ_jb_j ⇒ ∃j:a_jᵀy>b_j",
    insight:
      "This is the nontrivial part of proving that the enriched system still describes exactly the original P.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        point2D([-0.4, 0.6], "y∉P", "fractional"),
        line2D([-0.4, 0.6], [0.05, 0.38], "some new supporting row detects y", TDI_COLORS.rose),
      ],
      "Together with the first inclusion this proves P={x:Ax≤b}.",
      { x: [-1.0, 2.8], y: [-0.8, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step6",
    kicker: "Proof step 6 · Pass to an arbitrary face",
    title: "A nonminimal face cone is a face of the minimal-face cones below it",
    description:
      "Let F={x∈P:C_Ix=d_I} be any nonempty face and let F_j be all minimal faces contained in F. The notes use I⊆I_j and cone(C_I)=⋂_j cone(C_{I_j}); moreover cone(C_I) is a face of each cone(C_{I_j}).",
    formula: "cone(C_I)=⋂_{j:F_j⊆F}cone(C_{I_j})",
    insight:
      "For the left edge, I={2}, so its normal cone is just the ray cone{(−2,1)}, a face of both endpoint normal cones.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        line2D([0, 0], [1, 2], "F = left edge", TDI_COLORS.rose),
        point2D([0, 0], "minimal face below F", "integer"),
        point2D([1, 2], "minimal face below F", "integer"),
        translatedNormal([0.48, 0.95], c2, 0.3, "cone(C_I)=ray(c₂)", TDI_COLORS.orange),
      ],
      "This step is why repairing only minimal faces is enough.",
    ),
  },
  {
    id: "tdi-construct-2d-step7",
    kicker: "Proof step 7 · Restrict H_j to that face cone",
    title: "Generators outside the smaller cone face disappear automatically",
    description:
      "Choose one minimal face F_j⊆F and keep H={h∈H_j:h∈cone(C_I)}. Since cone(C_I) is a face, any nonnegative representation of a vector in it can use only generators lying in it. Thus H integrally generates cone(C_I)∩ℤⁿ.",
    formula: "H=H_j∩cone(C_I) ⇒ H generates cone(C_I)∩ℤⁿ",
    insight:
      "On the left edge this restriction leaves only the primitive normal (−2,1).",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        line2D([0, 0], [1, 2], "F", TDI_COLORS.rose),
        translatedNormal([0.55, 1.0], c2, 0.3, "kept: (−2,1)", TDI_COLORS.orange),
        translatedNormal([0.55, 1.0], [-1, 0], 0.3, "discarded", TDI_COLORS.muted),
      ],
      "The face property is the reason a representation cannot cancel back into the smaller cone using outside generators.",
    ),
  },
  {
    id: "tdi-construct-2d-step8",
    kicker: "Proof step 8 · Invoke Definition 138",
    title: "Every face now has integrally generating tight rows",
    description:
      "The new system describes exactly P, and for every nonempty face its tight row vectors integrally generate all integer points in the corresponding face cone. This is precisely the definition of a TDI system.",
    formula: "P={x:Ax≤b} and Ax≤b is TDI",
    insight:
      "The proof has two separate jobs: preserve the polyhedron and establish integral generation on every face.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        translatedCone2D([1, 2], c2, c3, 0.34, "apex normal cone"),
        ...apexNormalsHilbert.map((a, i) =>
          translatedNormal([1, 2], a, 0.29, i === 2 ? "H₂" : "", TDI_COLORS.violet),
        ),
      ],
      "Final TDI system: " + allTdiRows.join(", ") + ".",
      { x: [-0.5, 2.5], y: [-0.6, 3.25] },
    ),
  },
  {
    id: "tdi-construct-2d-corollary",
    kicker: "Corollary 142 · Separate consequence",
    title: "If P is integral, the TDI right-hand side can be chosen integral",
    description:
      "Theorem 141 guarantees integral A and rational b for every rational P. Corollary 142 adds that P is integral exactly when a TDI description exists with both A and b integral. Here the support values are all integers because the triangle's minimal faces are integer points.",
    formula: "P integral ⇔ ∃A,b integral with P={x:Ax≤b} and Ax≤b TDI",
    insight:
      "This is a separate statement from the existence theorem.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [label2D([0.2, 2.55], "b=(0,0,4,0,1,2,3,2) is integral", "accent")],
      "Corollary 142 follows after the TDI construction.",
    ),
  },
];

const prismIntegerMarkers = prismVertices.map((at, index) =>
  marker3D(
    `prism-v-${index}`,
    at,
    index === 5 ? "top apex (1,2,1)" : undefined,
    index === 5 ? "optimum" : "integer",
    index === 5 ? 0.11 : 0.065,
  ),
);

const topApex: Point3D = [1, 2, 1];
const topConeRays: [Point3D, Point3D, Point3D] = [
  [-2, 1, 0],
  [2, 1, 0],
  [0, 0, 1],
];

const stages3D: VisualizationStage[] = [
  {
    id: "tdi-construct-3d-theorem",
    kicker: "Theorem 141 · 3D running example",
    title: "The same proof works on a genuine three-dimensional prism",
    description:
      "Use P=T×[0,1], where T=conv{(0,0),(1,2),(2,0)}. Its nonredundant description has the three triangle facets together with −x₃≤0 and x₃≤1. The proof operations are exactly the same as in 2D.",
    formula: "P=T×[0,1]⊂ℝ³",
    insight:
      "The prism is chosen so that the 2D arithmetic obstruction appears inside a genuine 3D normal cone.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-start", "P=T×[0,1]")],
      markers: prismIntegerMarkers,
      caption: {
        primary: "Nonredundant 3D prism description",
        secondary: "Minimal faces are its six vertices.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-minimal",
    kicker: "Proof steps 1–2 · Minimal faces and tight rows",
    title: "At the top apex, three original facet normals are tight",
    description:
      "At v=(1,2,1), the original tight normals are (−2,1,0),(2,1,0),(0,0,1). They generate a three-dimensional pointed normal cone.",
    formula: "N_P(v)=cone{(−2,1,0),(2,1,0),(0,0,1)}",
    insight:
      "As in 2D, we translate the normal cone so its apex sits on the primal vertex v.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.5], y: [-0.8, 3.6], z: [-0.5, 2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.5 },
      meshes: [
        trianglePrismMesh("tdi-prism-minimal", "P", 0.08),
        translatedNormalCone3D("top-normal-cone", topApex, topConeRays, 0.5),
      ],
      markers: [marker3D("top-apex", topApex, "v=(1,2,1)", "optimum", 0.11)],
      segments: [
        segment3D("old-left", topApex, [0, 2.5, 1], "(−2,1,0)", TDI_COLORS.orange),
        segment3D("old-right", topApex, [2, 2.5, 1], "(2,1,0)", TDI_COLORS.orange),
        segment3D("old-up", topApex, [1, 2, 1.5], "(0,0,1)", TDI_COLORS.aqua),
      ],
      caption: {
        primary: "Translated 3D normal cone at v",
        secondary: "The translucent tetrahedral wedge is a bounded truncation of the full normal cone.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-generators",
    kicker: "Proof step 3 · Integral generators",
    title: "The missing horizontal lattice directions sit inside that same 3D cone",
    description:
      "The vectors (−1,1,0),(0,1,0),(1,1,0) lie in the horizontal cross-section of N_P(v). Adding them to the three original generators gives an integral generating set of the full vertex normal cone.",
    formula: "H_v={(-2,1,0),(-1,1,0),(0,1,0),(1,1,0),(2,1,0),(0,0,1)}",
    insight:
      "The 3D picture is the exact analogue of the shaded 2D wedge: original extreme generators plus additional lattice directions inside the cone.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.5], y: [-0.8, 3.6], z: [-0.5, 2.7] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.5 },
      meshes: [
        trianglePrismMesh("tdi-prism-generators", "P", 0.06),
        translatedNormalCone3D("top-normal-cone-generators", topApex, topConeRays, 0.5),
      ],
      markers: [marker3D("prism-apex", topApex, "v", "optimum", 0.11)],
      segments: [
        segment3D("n-left", topApex, [0,2.5,1], "(−2,1,0)", TDI_COLORS.orange),
        segment3D("n-midleft", topApex, [0.5,2.5,1], "(−1,1,0)", TDI_COLORS.violet),
        segment3D("n-mid", topApex, [1,2.5,1], "(0,1,0)", TDI_COLORS.violet),
        segment3D("n-midright", topApex, [1.5,2.5,1], "(1,1,0)", TDI_COLORS.violet),
        segment3D("n-right", topApex, [2,2.5,1], "(2,1,0)", TDI_COLORS.orange),
        segment3D("n-up", topApex, [1,2,1.5], "(0,0,1)", TDI_COLORS.aqua),
      ],
      caption: {
        primary: "All H_v directions lie inside the normal cone",
        secondary: "The cone is translated to v only for geometric intuition.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-rhs",
    kicker: "Proof step 4 · Support the new rows",
    title: "Turn every generator into a supporting plane of the same prism",
    description:
      "For each new row a_k set b_k=max_{x∈P}a_kᵀx. The horizontal additions have support values 1,2,3 and produce vertical supporting planes; the top and bottom generators retain x₃≤1 and −x₃≤0.",
    formula: "b_k=max_{x∈P}a_kᵀx",
    insight:
      "These rows enrich the normal system without changing the primal set.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-rhs", "same P with supported extra rows")],
      markers: prismIntegerMarkers,
      segments: [
        segment3D("support-a1", [1,2,0], [1,2,1], "−x₁+x₂=1", TDI_COLORS.rose),
        segment3D("support-a2", [1.06,2,0], [1.06,2,1], "x₂=2", TDI_COLORS.violet),
        segment3D("support-a3", [0.94,2,0], [0.94,2,1], "x₁+x₂=3", TDI_COLORS.rose),
      ],
      caption: {
        primary: "Equation (59) in 3D",
        secondary: "The new support rows are tight along the vertical apex edge.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-preserve",
    kicker: "Proof step 5 · Prove the new system still equals P",
    title: "Validity gives one inclusion; generator decomposition gives the reverse inclusion",
    description:
      "Every point in P satisfies the support rows by definition. Conversely, any outside point violates an original row c_ℓ. Expressing c_ℓ as a nonnegative integer combination of the relevant H_i forces at least one corresponding new inequality to be violated as well.",
    formula: "P⊆{Ax≤b};  y∉P ⇒ c_ℓᵀy>d_ℓ=Σδ_jb_j ⇒ ∃j:a_jᵀy>b_j",
    insight:
      "The proof does not merely add rows; it proves rigorously that the enriched description is exactly the same polyhedron.",
    scene: scene3D({
      bounds: { x: [-1.0, 3.1], y: [-0.8, 3.2], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.4 },
      meshes: [trianglePrismMesh("tdi-prism-preserve", "P", 0.12)],
      markers: [
        ...prismIntegerMarkers,
        marker3D("outside", [-0.35,0.65,0.55], "y outside P", "fractional", 0.1),
      ],
      segments: [
        segment3D("detect", [-0.35,0.65,0.55], [0.05,0.45,0.55], "violated supported row", TDI_COLORS.rose),
      ],
      caption: {
        primary: "Same prism after enrichment",
        secondary: "Outside points remain outside the new system.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-face",
    kicker: "Proof steps 6–7 · Arbitrary face",
    title: "Restrict a repaired vertex cone to the vertical apex edge",
    description:
      "For F={(1,2,z):0≤z≤1}, the tight old rows are the two slanted triangle facets. Its normal cone is the horizontal cone cone{(−2,1,0),(2,1,0)}, a face of the top and bottom vertex normal cones. Restricting H_v to that face simply discards the vertical generator.",
    formula: "H=H_v∩cone(C_I)",
    insight:
      "This cone-face restriction is the mechanism that upgrades local repairs at minimal faces to every face required by the TDI definition.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.5], y: [-0.8, 3.5], z: [-0.5, 2.2] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.5 },
      meshes: [trianglePrismMesh("tdi-prism-edge", "P", 0.06)],
      markers: [marker3D("edge-mid", [1,2,0.5], "F", "optimum", 0.1)],
      segments: [
        segment3D("edge", [1,2,0], [1,2,1], "F = apex edge", TDI_COLORS.rose, { width: 7 }),
        segment3D("r1", [1,2,0.5], [0,2.5,0.5], "(−2,1,0)", TDI_COLORS.violet),
        segment3D("r2", [1,2,0.5], [0.5,2.5,0.5], "(−1,1,0)", TDI_COLORS.violet),
        segment3D("r3", [1,2,0.5], [1,2.5,0.5], "(0,1,0)", TDI_COLORS.violet),
        segment3D("r4", [1,2,0.5], [1.5,2.5,0.5], "(1,1,0)", TDI_COLORS.violet),
        segment3D("r5", [1,2,0.5], [2,2.5,0.5], "(2,1,0)", TDI_COLORS.violet),
        segment3D("discard", [1,2,0.5], [1,2,1.35], "vertical generator is outside the edge cone", TDI_COLORS.muted, { dashed: true }),
      ],
      caption: {
        primary: "Restriction to an arbitrary face cone",
        secondary: "A face-cone representation cannot use generators outside that face.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-final",
    kicker: "Proof step 8 · TDI conclusion",
    title: "Every face cone is now integrally generated by tight rows",
    description:
      "The enriched system describes exactly P, and the restriction argument works for every nonempty face. Therefore the system is TDI by Definition 138.",
    formula: "P={x:Ax≤b} and Ax≤b is TDI",
    insight:
      "Theorem 141 is a local-to-global construction: Hilbert-basis repairs at minimal faces produce a globally TDI description.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-final", "same P, now with a TDI description")],
      markers: prismIntegerMarkers,
      caption: {
        primary: "Global TDI conclusion",
        secondary: "Vertices, edges, facets, and P itself satisfy the face-cone criterion.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-corollary",
    kicker: "Corollary 142",
    title: "For this integral prism the support values can all be integral",
    description:
      "All six prism vertices are integer. Thus this example also illustrates Corollary 142: an integral rational polyhedron admits a TDI description with both A and b integral.",
    formula: "P integral ⇔ P admits a TDI description with A,b integral",
    insight:
      "Theorem 141 gives TDI for every rational polyhedron; Corollary 142 characterizes when b may also be chosen integral.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-cor", "integral prism")],
      markers: prismIntegerMarkers,
      caption: {
        primary: "Integral TDI representation in 3D",
        secondary: "Integral minimal faces make the support values integral.",
      },
    }),
  },
];

const examples: VisualizationExample[] = [
  {
    id: "tdi-construction-2d",
    title: "2D · full proof + translated normal cones",
    description:
      "The exact triangle from Problem 12.1, expanded to follow Theorem 141 step by step while drawing each normal cone at its corresponding primal vertex.",
    stages: stages2D,
  },
  {
    id: "tdi-construction-3d",
    title: "3D · proof-parallel prism + normal cone",
    description:
      "A genuine 3D example with the vertex normal cone drawn as a translucent translated cone and the same proof structure as in 2D.",
    stages: stages3D,
  },
];

const visualization: VisualizationDefinition = {
  id: "tdi-representation-construction",
  title: "Theorem 141 — Every Rational Polyhedron Has a TDI Description",
  shortTitle: "Construct a TDI system · Thm 141",
  chapter: "Total dual integrality",
  order: 4,
  description:
    "A proof-faithful construction of Theorem 141: start from a nonredundant integral-row description, draw and repair the normal cone at every minimal face, support the new rows on P, prove the new system describes exactly P, and restrict generators to arbitrary face cones to obtain TDI.",
  difficulty: "Advanced",
  duration: 30,
  accent: TDI_COLORS.rose,
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 141 · proof structure from the notes",
    steps: [
      "Choose a nonredundant rational description P={x:Cx≤d} and clear denominators so C is integral.",
      "Let F₁,…,F_t be all minimal faces and I_i the original row indices tight on F_i.",
      "For each i choose an integral generating set H_i of cone({C_j:j∈I_i})∩ℤⁿ. The visualized shaded cones are translated copies of these normal cones.",
      "Form A from all rows in ⋃_i H_i. Define b_k=max{a_kᵀx:x∈P}. If a_k∈H_i, then b_k=a_kᵀx̂ for every x̂∈F_i (Equation (59)).",
      "Show P⊆{x:Ax≤b}: every new row is valid by definition of b_k.",
      "Show {x:Ax≤b}⊆P: if y∉P violates c_ℓᵀx≤d_ℓ, choose F_i with ℓ∈I_i, write c_ℓ=Σ_jδ_ja_j with δ_j∈ℤ₊, use d_ℓ=Σ_jδ_jb_j, and conclude that some new row is violated.",
      "For an arbitrary nonempty face F={x∈P:C_Ix=d_I}, the cone cone(C_I) is the intersection of—and a face of—the minimal-face cones cone(C_{I_j}) below F.",
      "Restrict H_j to H_j∩cone(C_I). Because cone(C_I) is a face, these retained vectors integrally generate cone(C_I)∩ℤⁿ.",
      "Thus every face has integrally generating tight rows, so Ax≤b is TDI by Definition 138.",
      "Corollary 142 is separate: P is integral iff it admits a TDI description with A and b both integral.",
    ],
  },
};

export default visualization;
