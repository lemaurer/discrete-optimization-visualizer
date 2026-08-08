import type { Point2D, Primitive } from "@/engine/types";
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

const apexNormalsOriginal: Point2D[] = [[-2, 1], [2, 1]];
const apexNormalsHilbert: Point2D[] = [[-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]];
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

function translatedNormal(origin: Point2D, a: Point2D, scale: number, label: string, color: string): Primitive {
  return vector2D(origin, [origin[0] + scale * a[0], origin[1] + scale * a[1]], label, color);
}

function constructionScene2D(
  constraints = triangle2DConstraints,
  primitives: Primitive[] = [],
  secondary = "",
  viewport = { x: [-1.0, 3.0] as [number, number], y: [-1.0, 3.2] as [number, number] },
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
      "The theorem is about existence of a good inequality representation, not about every representation being TDI. Starting from a rational polyhedron P, the proof constructs a new system Ax≤b with integral A and rational b that describes exactly the same P and satisfies Definition 138 on every face.",
    formula: "P rational ⇒ ∃A∈ℤ^{r×n}, b∈ℚ^r: P={x:Ax≤b} and Ax≤b is TDI",
    insight:
      "The construction may add many redundant inequalities. Their purpose is arithmetic: the tight row normals must integrally generate the integer points of every face cone.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [label2D([1.05, 2.55], "same P, representation will change", "accent")],
      "Running example: P=conv{(0,0),(1,2),(2,0)}.",
    ),
  },
  {
    id: "tdi-construct-2d-step1",
    kicker: "Proof step 1 · Choose a nonredundant integral description",
    title: "Clear denominators and start from P={x:Cx≤d}",
    description:
      "The notes first choose a nonredundant rational description and scale each row so that C is integral. For the triangle, the three facet rows are c₁=(0,−1), c₂=(−2,1), c₃=(2,1), with right-hand sides 0,0,4.",
    formula: "C={(0,−1),(−2,1),(2,1)},   d=(0,0,4)",
    insight:
      "At this point the description is exact but not TDI: the two rows tight at the apex do not integrally generate every lattice vector in their cone.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        translatedNormal([0.2, 0.15], [0, -1], 0.45, "c₁", TDI_COLORS.aqua),
        translatedNormal([0.2, 0.15], [-2, 1], 0.27, "c₂", TDI_COLORS.orange),
        translatedNormal([1.8, 0.15], [2, 1], 0.27, "c₃", TDI_COLORS.violet),
      ],
      "Each cᵢ is the outward normal of one facet inequality cᵢᵀx≤dᵢ.",
    ),
  },
  {
    id: "tdi-construct-2d-step2",
    kicker: "Proof step 2 · List the minimal faces",
    title: "For a polytope, the minimal faces are its vertices",
    description:
      "Let F₁,…,F_t be all minimal faces and I_i the old rows tight on F_i. In this triangle the minimal faces are the three vertices. At (0,0), rows {1,2} are tight; at (1,2), rows {2,3}; at (2,0), rows {1,3}.",
    formula: "F_i={x∈P:C_{I_i}x=d_{I_i}}",
    insight:
      "The construction is local: it first repairs the normal cone at each minimal face, then the proof shows that all larger faces are automatically repaired too.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        point2D([0, 0], "F₁: I₁={1,2}", "optimum"),
        point2D([1, 2], "F₂: I₂={2,3}", "optimum"),
        point2D([2, 0], "F₃: I₃={1,3}", "optimum"),
      ],
      "The index set I_i records exactly which original facet normals generate the normal cone at F_i.",
    ),
  },
  {
    id: "tdi-construct-2d-step3-left",
    kicker: "Proof step 3a · Integral generators at F₁",
    title: "Complete the normal cone at (0,0)",
    description:
      "The original cone cone{(0,−1),(−2,1)} contains the additional primitive integer direction (−1,0). An integral generating set is H₁={(0,−1),(−1,0),(−2,1)}.",
    formula: "H₁ generates cone{c₁,c₂}∩ℤ²",
    insight:
      "Gordan's theorem guarantees a finite integral generating set for each rational cone; in this 2D example we can see the missing direction directly.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        point2D([0, 0], "F₁", "optimum"),
        ...leftNormalsHilbert.map((a, i) =>
          translatedNormal([0, 0], a, 0.42, i === 1 ? "new generator (−1,0)" : "", i === 1 ? TDI_COLORS.rose : TDI_COLORS.orange),
        ),
      ],
      "The extra row normal will later become the redundant inequality −x₁≤0.",
      { x: [-1.25, 2.8], y: [-1.1, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step3-apex",
    kicker: "Proof step 3b · Integral generators at F₂",
    title: "The apex needs three additional integer directions",
    description:
      "At (1,2), cone{(−2,1),(2,1)} contains the lattice directions (−1,1),(0,1),(1,1), none of which is a nonnegative integer combination of the two original facet normals. The five vectors form the integral basis of this pointed cone.",
    formula: "H₂={(−2,1),(−1,1),(0,1),(1,1),(2,1)}",
    insight:
      "This is the main arithmetic obstruction in the running example: real conic generation is not enough for TDI; integral conic generation is required.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        point2D([1, 2], "F₂={(1,2)}", "optimum"),
        ...apexNormalsOriginal.map((a, index) =>
          translatedNormal([1, 2], a, 0.35, index === 0 ? "original" : "", TDI_COLORS.orange),
        ),
        ...apexNormalsHilbert.slice(1, 4).map((a, index) =>
          translatedNormal([1, 2], a, 0.35, index === 1 ? "missing integer normals" : "", TDI_COLORS.violet),
        ),
      ],
      "The translated arrows show the normal cone; their base point is moved to F₂ only for visualization.",
      { x: [-0.8, 2.8], y: [-0.8, 3.5] },
    ),
  },
  {
    id: "tdi-construct-2d-step3-right",
    kicker: "Proof step 3c · Integral generators at F₃",
    title: "Complete the normal cone at (2,0)",
    description:
      "Symmetrically, H₃={(0,−1),(1,0),(2,1)} integrally generates the cone of the two rows tight at (2,0). The new direction (1,0) will produce x₁≤2.",
    formula: "H₃ generates cone{c₁,c₃}∩ℤ²",
    insight:
      "The matrix A in Theorem 141 is simply formed by taking the union of all rows appearing in H₁,H₂,H₃.",
    scene: constructionScene2D(
      triangle2DConstraints,
      [
        point2D([2, 0], "F₃", "optimum"),
        ...rightNormalsHilbert.map((a, i) =>
          translatedNormal([2, 0], a, 0.42, i === 1 ? "new generator (1,0)" : "", i === 1 ? TDI_COLORS.rose : TDI_COLORS.violet),
        ),
      ],
      "The union H₁∪H₂∪H₃ gives all row directions needed in the new system.",
      { x: [-0.8, 3.25], y: [-1.1, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step4",
    kicker: "Proof step 4 · Define the new right-hand side",
    title: "Support every new row on the original polyhedron",
    description:
      "For every new row a_k define b_k=max{a_kᵀx:x∈P}. If a_k belongs to H_i, then a_k lies in the cone of normals tight on F_i, so every point x̂∈F_i maximizes a_kᵀx. This is Equation (59) in the notes.",
    formula: "b_k=max_{x∈P} a_kᵀx = a_kᵀx̂  for every x̂∈F_i when a_k∈H_i",
    insight:
      "For the apex generators the supporting values are 0,1,2,3,4; hence the new rows −x₁+x₂≤1, x₂≤2 and x₁+x₂≤3 all touch P exactly at the apex.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        point2D([1, 2], "all three new apex rows are tight here", "optimum"),
        label2D([0.2, 2.65], "b=max over P ⇒ every added row is valid", "accent"),
      ],
      "The new inequalities support P; they do not cut any point of P away.",
    ),
  },
  {
    id: "tdi-construct-2d-step5-inclusion-one",
    kicker: "Proof step 5a · First inclusion",
    title: "Why P⊆{x:Ax≤b} is immediate",
    description:
      "Take any y∈P. By definition of b_k as the maximum of a_kᵀx over P, we have a_kᵀy≤b_k for every new row. Therefore every point of the original P satisfies the entire new system.",
    formula: "y∈P ⇒ a_kᵀy≤max_{x∈P}a_kᵀx=b_k  ∀k",
    insight:
      "This direction uses only the supporting-value definition of b. No integral-generation argument is needed yet.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        point2D([1, 1], "arbitrary y∈P", "optimum"),
        label2D([1.35, 1.15], "satisfies all 8 new rows", "accent"),
      ],
      "Every added inequality is valid for P, so the new feasible set cannot be smaller than P.",
    ),
  },
  {
    id: "tdi-construct-2d-step5-inclusion-two",
    kicker: "Proof step 5b · Reverse inclusion",
    title: "Any point outside P violates at least one new row",
    description:
      "Let y∉P. Then an old row c_ℓ satisfies c_ℓᵀy>d_ℓ. Choose a minimal face F_i contained in that old facet, so ℓ∈I_i. Since c_ℓ is integral and H_i integrally generates its cone, write c_ℓ=Σ_j δ_j a_j with δ_j∈ℤ₊. Equation (59) gives d_ℓ=Σ_jδ_jb_j. Therefore Σ_jδ_j a_jᵀy>Σ_jδ_jb_j, so at least one a_jᵀy>b_j.",
    formula: "c_ℓ=Σδ_j a_j, δ_j∈ℤ₊  and  c_ℓᵀy>d_ℓ=Σδ_jb_j ⇒ ∃j*:a_{j*}ᵀy>b_{j*}",
    insight:
      "This is the key preservation argument: the integral generators are strong enough to detect every violation of the original system, hence {x:Ax≤b}⊆P.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        point2D([-0.4, 0.6], "y∉P", "fractional"),
        line2D([-0.4, 0.6], [0.05, 0.38], "violates left supporting family", TDI_COLORS.rose),
        label2D([0.15, 1.15], "old violated row c₂", "accent"),
        label2D([0.15, 0.85], "⇒ some generator row is violated", "accent"),
      ],
      "In this concrete triangle the primitive old facet row itself already belongs to H_i; the displayed algebra is the general proof from the notes.",
      { x: [-1.0, 2.8], y: [-0.8, 3.0] },
    ),
  },
  {
    id: "tdi-construct-2d-step6-arbitrary-face",
    kicker: "Proof step 6 · Pass from minimal faces to an arbitrary face",
    title: "A larger face cone is a face of every minimal-face cone below it",
    description:
      "Now let F={x∈P:C_Ix=d_I} be any nonempty face. Let F_j be the minimal faces contained in F. The notes use I⊆I_j and the identity cone(C_I)=⋂_j cone(C_{I_j}); moreover cone(C_I) is a face of each cone(C_{I_j}).",
    formula: "cone{C_i:i∈I}=⋂_{j:F_j⊆F} cone{C_i:i∈I_j}",
    insight:
      "For the left edge of the triangle, I={2}. Its cone is just the ray cone{(−2,1)}, and it is a face of the normal cone at each endpoint vertex.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        line2D([0, 0], [1, 2], "F = left edge", TDI_COLORS.rose),
        point2D([0, 0], "minimal F₁⊂F", "integer"),
        point2D([1, 2], "minimal F₂⊂F", "integer"),
        translatedNormal([0.45, 0.9], [-2, 1], 0.28, "cone(C_I)", TDI_COLORS.orange),
      ],
      "The arbitrary-face step is the part that was missing from the previous short visualization.",
    ),
  },
  {
    id: "tdi-construct-2d-step7-restrict-generators",
    kicker: "Proof step 7 · Restrict one H_j to the face cone",
    title: "Integral generators restrict correctly to a face of a cone",
    description:
      "Choose one minimal face F_j⊆F and keep only those elements of H_j that lie in cone(C_I). Because cone(C_I) is a face of cone(C_{I_j}), any nonnegative representation of a vector in the smaller face can use only generators lying in that face. Hence the retained subset H integrally generates cone(C_I)∩ℤⁿ.",
    formula: "H={h∈H_j:h∈cone(C_I)} ⇒ H generates cone(C_I)∩ℤⁿ",
    insight:
      "On the left edge, restricting either endpoint Hilbert basis leaves only the primitive ray (−2,1), exactly the tight normal needed on that edge.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        line2D([0, 0], [1, 2], "F", TDI_COLORS.rose),
        translatedNormal([0.55, 1.0], [-2, 1], 0.3, "kept: (−2,1)", TDI_COLORS.orange),
        translatedNormal([0.55, 1.0], [-1, 0], 0.3, "discard: not in face cone", TDI_COLORS.muted),
        label2D([1.25, 0.45], "restriction of H_j", "accent"),
      ],
      "This cone-face argument is what upgrades the construction from minimal faces to every face required by Definition 138.",
    ),
  },
  {
    id: "tdi-construct-2d-step8-tdi",
    kicker: "Proof step 8 · Invoke Definition 138",
    title: "Every face now has integrally generating tight rows, so Ax≤b is TDI",
    description:
      "The new system describes exactly P, and for every nonempty face its tight row vectors contain an integral generating set for the integer points of the corresponding face cone. This is precisely Definition 138, so the constructed system is TDI.",
    formula: "∀ nonempty faces F: tight rows integrally generate the integer points of their cone",
    insight:
      "The proof has two logically separate jobs: first preserve P, then verify the integral-generation property on every face. Both are necessary.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [
        label2D([0.15, 2.65], "TDI", "accent"),
        label2D([0.15, 2.35], "all face cones are integrally generated", "accent"),
        ...apexNormalsHilbert.map((a, i) =>
          translatedNormal([1, 2], a, 0.25, i === 2 ? "apex generators" : "", TDI_COLORS.violet),
        ),
      ],
      "The final 2D system has eight rows: " + allTdiRows.join(", ") + ".",
      { x: [-0.8, 2.8], y: [-0.8, 3.45] },
    ),
  },
  {
    id: "tdi-construct-2d-corollary",
    kicker: "Corollary 142 · When can b also be integral?",
    title: "For integral P, the same construction can use integral right-hand sides",
    description:
      "Theorem 141 only guarantees integral A and rational b. Corollary 142 says that P is integral exactly when a TDI description exists with both A and b integral. In this triangle every minimal face contains an integer point, and evaluating a_k on such a point makes the corresponding supporting value b_k integral.",
    formula: "P integral ⇔ ∃A,b integral with P={x:Ax≤b} and Ax≤b TDI",
    insight:
      "Do not conflate the two statements: every rational polyhedron has a TDI description; only integral polyhedra are guaranteed an integral right-hand side in a TDI description.",
    scene: constructionScene2D(
      triangle2DTdiConstraints,
      [label2D([0.2, 2.55], "b=(0,0,4,0,1,2,3,2) is integral", "accent")],
      "Corollary 142 is a separate integrality statement following Theorem 141.",
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

const stages3D: VisualizationStage[] = [
  {
    id: "tdi-construct-3d-theorem",
    kicker: "Theorem 141 · 3D running example",
    title: "The same construction works face-by-face in three dimensions",
    description:
      "Use P=T×[0,1], where T=conv{(0,0),(1,2),(2,0)}. Its nonredundant description has the three triangle facets together with −x₃≤0 and x₃≤1. The proof steps are exactly the same as in 2D; only the normal cones are now three-dimensional.",
    formula: "P=T×[0,1]⊂ℝ³",
    insight:
      "The 3D example is deliberately a prism so that every abstract proof operation has a visible analogue of the 2D construction rather than being replaced by a summary scene.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-start", "P=T×[0,1]")],
      markers: prismIntegerMarkers,
      caption: {
        primary: "Nonredundant 3D prism description",
        secondary: "We will repair its minimal-face normal cones and then verify the full proof.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-minimal-faces",
    kicker: "Proof steps 1–2 · Description and minimal faces",
    title: "The six vertices are the minimal faces of the prism",
    description:
      "Each prism vertex is determined by two triangle facets and one horizontal facet. At the top apex v=(1,2,1), the tight original normals are (−2,1,0),(2,1,0),(0,0,1).",
    formula: "I_v={left triangle facet, right triangle facet, top facet}",
    insight:
      "The construction computes one integral generating set H_v for every vertex normal cone, just as it did for each triangle vertex.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-minimal", "P", 0.11)],
      markers: prismVertices.map((at, index) => marker3D(`min-${index}`, at, `F${index + 1}`, index === 5 ? "optimum" : "integer", index === 5 ? 0.11 : 0.065)),
      caption: {
        primary: "Minimal faces in 3D",
        secondary: "For a polytope, every minimal face is a vertex.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-generators",
    kicker: "Proof step 3 · Integral generating set H_v",
    title: "Complete the top-apex normal cone with the missing horizontal directions",
    description:
      "At v=(1,2,1), the horizontal cone generated by (−2,1,0) and (2,1,0) needs (−1,1,0),(0,1,0),(1,1,0). Together with the primitive vertical generator (0,0,1), these vectors integrally generate the full 3D normal cone.",
    formula: "H_v={(-2,1,0),(-1,1,0),(0,1,0),(1,1,0),(2,1,0),(0,0,1)}",
    insight:
      "The arithmetic repair is still local to a minimal face; the additional z-direction simply enlarges the cone by one primitive coordinate ray.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.5], y: [-0.8, 3.6], z: [-0.5, 2.6] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.5 },
      meshes: [trianglePrismMesh("tdi-prism-generators", "P", 0.07)],
      markers: [marker3D("prism-apex", [1, 2, 1], "v", "optimum", 0.11)],
      segments: [
        segment3D("n-left", [1,2,1], [0,2.5,1], "(−2,1,0)", TDI_COLORS.orange),
        segment3D("n-midleft", [1,2,1], [0.5,2.5,1], "(−1,1,0)", TDI_COLORS.violet),
        segment3D("n-mid", [1,2,1], [1,2.5,1], "(0,1,0)", TDI_COLORS.violet),
        segment3D("n-midright", [1,2,1], [1.5,2.5,1], "(1,1,0)", TDI_COLORS.violet),
        segment3D("n-right", [1,2,1], [2,2.5,1], "(2,1,0)", TDI_COLORS.orange),
        segment3D("n-up", [1,2,1], [1,2,2], "(0,0,1)", TDI_COLORS.aqua),
      ],
      caption: {
        primary: "Integral generating set at one minimal face",
        secondary: "Translated normals are drawn from the vertex v.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-rhs",
    kicker: "Proof step 4 · Supporting right-hand sides",
    title: "Each generator becomes a supporting plane of exactly the same prism",
    description:
      "For a=(−1,1,0),(0,1,0),(1,1,0), the support values are 1,2,3. Since these rows ignore x₃, their supporting planes are vertical and touch the whole vertical lift of the relevant triangle support. The horizontal generators retain −x₃≤0 and x₃≤1.",
    formula: "b_k=max_{x∈P}a_kᵀx",
    insight:
      "Again, adding rows enriches the normal system without shrinking P.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-rhs", "same P with supported extra rows")],
      markers: prismIntegerMarkers,
      segments: [
        segment3D("support-a1", [1,2,0], [1,2,1], "−x₁+x₂=1 along apex edge", TDI_COLORS.rose),
        segment3D("support-a2", [1.06,2,0], [1.06,2,1], "x₂=2", TDI_COLORS.violet),
        segment3D("support-a3", [0.94,2,0], [0.94,2,1], "x₁+x₂=3", TDI_COLORS.rose),
      ],
      caption: {
        primary: "Support rows on P",
        secondary: "Equation (59) becomes visible as equality along the vertical apex edge.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-preserve-p",
    kicker: "Proof step 5 · Show the new system still describes P",
    title: "Validity gives one inclusion; generator decomposition gives the other",
    description:
      "Every p∈P satisfies every supported row by definition of b. Conversely, an outside point violates some original facet row c_ℓ. Choose a vertex F_i of that facet and represent c_ℓ as a nonnegative integer combination of H_i. If every corresponding new inequality were satisfied, their weighted sum would contradict c_ℓᵀy>d_ℓ. Thus some new row is violated.",
    formula: "P⊆{Ax≤b};  y∉P ⇒ c_ℓᵀy>d_ℓ=Σδ_jb_j ⇒ ∃j:a_jᵀy>b_j",
    insight:
      "This is exactly the same two-inclusion argument as in 2D; dimensionality does not alter the logic.",
    scene: scene3D({
      bounds: { x: [-1.0, 3.1], y: [-0.8, 3.2], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.4 },
      meshes: [trianglePrismMesh("tdi-prism-preserve", "P", 0.12)],
      markers: [
        ...prismIntegerMarkers,
        marker3D("outside", [-0.35,0.65,0.55], "y outside P", "fractional", 0.1),
      ],
      segments: [segment3D("detect", [-0.35,0.65,0.55], [0.05,0.45,0.55], "violated supporting row", TDI_COLORS.rose)],
      caption: {
        primary: "The new feasible set equals the old prism",
        secondary: "Outside points are detected by at least one generator inequality.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-arbitrary-face",
    kicker: "Proof step 6 · An arbitrary nonminimal face",
    title: "Look at the vertical apex edge rather than only its endpoint vertices",
    description:
      "Take F={(1,2,z):0≤z≤1}. The old rows tight on its relative interior are the two slanted triangle facets, so its face cone is cone{(−2,1,0),(2,1,0)}. The top and bottom vertices are minimal faces contained in F, and this 2D cone is a face of each corresponding 3D vertex normal cone.",
    formula: "cone(C_I)=⋂_{j:F_j⊆F} cone(C_{I_j})",
    insight:
      "This is the geometric step that ensures repairing only minimal faces is enough to make the final system TDI on edges, facets, and the whole polyhedron too.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.2], y: [-0.8, 3.3], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.4 },
      meshes: [trianglePrismMesh("tdi-prism-edge", "P", 0.08)],
      markers: [
        marker3D("edge-bottom", [1,2,0], "minimal face", "integer", 0.08),
        marker3D("edge-top", [1,2,1], "minimal face", "integer", 0.08),
      ],
      segments: [
        segment3D("edge", [1,2,0], [1,2,1], "F = apex edge", TDI_COLORS.rose, { width: 7 }),
        segment3D("edge-n1", [1,2,0.5], [0.2,2.4,0.5], "(−2,1,0)", TDI_COLORS.orange),
        segment3D("edge-n2", [1,2,0.5], [1.8,2.4,0.5], "(2,1,0)", TDI_COLORS.orange),
      ],
      caption: {
        primary: "Face cone of a nonminimal edge",
        secondary: "It is a common face of the two endpoint normal cones.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-restrict",
    kicker: "Proof step 7 · Restrict H_j to the face cone",
    title: "Discard the vertical generator and retain exactly the edge-cone Hilbert basis",
    description:
      "From the top-apex H_j, keep only generators lying in the horizontal edge cone. This removes (0,0,1) and keeps (−2,1,0),(−1,1,0),(0,1,0),(1,1,0),(2,1,0), which integrally generate all lattice points of the edge cone.",
    formula: "H=H_j∩cone(C_I)",
    insight:
      "Because cone(C_I) is a face, a nonnegative representation of a vector in it cannot use a generator pointing outside it.",
    scene: scene3D({
      bounds: { x: [-0.8, 3.5], y: [-0.8, 3.5], z: [-0.5, 2.5] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.5 },
      meshes: [trianglePrismMesh("tdi-prism-restrict", "P", 0.06)],
      markers: [marker3D("edge-mid", [1,2,0.5], "F", "optimum", 0.1)],
      segments: [
        segment3D("r1", [1,2,0.5], [0,2.5,0.5], "(−2,1,0)", TDI_COLORS.violet),
        segment3D("r2", [1,2,0.5], [0.5,2.5,0.5], "(−1,1,0)", TDI_COLORS.violet),
        segment3D("r3", [1,2,0.5], [1,2.5,0.5], "(0,1,0)", TDI_COLORS.violet),
        segment3D("r4", [1,2,0.5], [1.5,2.5,0.5], "(1,1,0)", TDI_COLORS.violet),
        segment3D("r5", [1,2,0.5], [2,2.5,0.5], "(2,1,0)", TDI_COLORS.violet),
        segment3D("discard-up", [1,2,0.5], [1,2,1.4], "discard vertical generator", TDI_COLORS.muted, { dashed: true }),
      ],
      caption: {
        primary: "Restrict the minimal-face generators",
        secondary: "The retained rows integrally generate the arbitrary edge face cone.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-final",
    kicker: "Proof step 8 · TDI conclusion",
    title: "The face-cone condition now holds everywhere",
    description:
      "The new rows describe exactly the same prism, and the restriction argument works for every nonempty face. Therefore the tight rows at every face integrally generate the integer points of their cone, which is Definition 138 of a TDI system.",
    formula: "P={x:Ax≤b} and Ax≤b is TDI",
    insight:
      "Theorem 141 is therefore a construction theorem: local Hilbert-basis repairs at minimal faces produce a globally TDI inequality description.",
    scene: scene3D({
      bounds: { x: [-0.8, 2.8], y: [-0.8, 3.0], z: [-0.5, 2.0] },
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      camera: { yaw: -0.78, pitch: 0.45, distance: 6.3 },
      meshes: [trianglePrismMesh("tdi-prism-final", "same P, now with a TDI description")],
      markers: prismIntegerMarkers,
      caption: {
        primary: "Global TDI conclusion from local repairs",
        secondary: "Vertices, edges, facets, and P itself satisfy the integral face-cone criterion.",
      },
    }),
  },
  {
    id: "tdi-construct-3d-corollary",
    kicker: "Corollary 142",
    title: "This prism is integral, so b can be chosen integral too",
    description:
      "All six vertices are integer. The lifted TDI system has the integral triangle right-hand sides 0,0,4,0,1,2,3,2 together with −x₃≤0 and x₃≤1. Thus this example also illustrates the converse direction of Corollary 142.",
    formula: "P integral ⇔ P admits a TDI description with A,b integral",
    insight:
      "Theorem 141 gives TDI for every rational P; Corollary 142 characterizes when the constructed support values can all be integral.",
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
    title: "2D · full proof walkthrough",
    description:
      "The exact triangle from Problem 12.1, expanded to follow every logical step of Theorem 141 and Corollary 142.",
    stages: stages2D,
  },
  {
    id: "tdi-construction-3d",
    title: "3D · proof-parallel triangular prism",
    description:
      "A genuine 3D example that mirrors the theorem proof: minimal faces, integral normal generators, support rows, equality of descriptions, arbitrary-face restriction, and TDI conclusion.",
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
    "A proof-faithful construction of Theorem 141: start from a nonredundant integral row description, repair every minimal-face normal cone with an integral generating set, support the new rows on P, prove the new system describes exactly P, then restrict generators to arbitrary face cones to obtain TDI. Corollary 142 is shown separately at the end.",
  difficulty: "Advanced",
  duration: 28,
  accent: TDI_COLORS.rose,
  controls: { constraints: true, grid: true, lattice: true, vertices: true, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Theorem 141 · exact proof structure from the notes",
    steps: [
      "Choose a nonredundant rational description P={x:Cx≤d}; clear denominators so C is integral.",
      "Let F₁,…,F_t be all minimal faces and I_i the original row indices tight on F_i.",
      "For every i, choose a finite integral generating set H_i of cone({C_j:j∈I_i})∩ℤⁿ. Existence follows from finite generation of rational polyhedral cones.",
      "Form A from all vectors in ⋃_i H_i. For each row a_k define b_k=max{a_kᵀx:x∈P}. If a_k∈H_i, then b_k=a_kᵀx̂ for every x̂∈F_i (Equation (59)).",
      "Show P⊆{x:Ax≤b}: every new row is valid by the definition of b_k.",
      "Show {x:Ax≤b}⊆P: if y∉P violates an original row c_ℓ, choose a minimal face F_i with ℓ∈I_i, write c_ℓ=Σ_jδ_ja_j with δ_j∈ℤ₊ using H_i, use d_ℓ=Σ_jδ_jb_j from Equation (59), and conclude that at least one new row a_jᵀy≤b_j is violated.",
      "To prove TDI, take any nonempty face F={x∈P:C_Ix=d_I}. If F_j are the minimal faces contained in F, then I⊆I_j and cone(C_I)=⋂_j cone(C_{I_j}); cone(C_I) is a face of every cone(C_{I_j}).",
      "Choose one such j and retain H={h∈H_j:h∈cone(C_I)}. Because cone(C_I) is a face, H integrally generates cone(C_I)∩ℤⁿ.",
      "Thus the tight rows of the new description integrally generate the integer points of every face cone. By Definition 138, Ax≤b is TDI.",
      "Corollary 142 is separate: P is integral iff it admits a TDI description with both A and b integral.",
    ],
  },
};

export default visualization;
