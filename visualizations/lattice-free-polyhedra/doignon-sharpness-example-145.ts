import type { Point2D, Point3D, Primitive } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";
import {
  LATTICE_FREE_COLORS as C,
  label2D,
  line2D,
  marker3D,
  octahedronMesh,
  point2D,
  scene2D,
  scene3D,
  segment3D,
} from "@/visualizations/helpers/lattice-free-scenes";

const constraints2D: Array<{ label: string; from: Point2D; to: Point2D }> = [
  { label: "I=∅: x₁+x₂≥1", from: [-1, 2], to: [3, -2] },
  { label: "I={1}: x₁≤x₂", from: [-1, -1], to: [3, 3] },
  { label: "I={2}: x₂≤x₁", from: [-1, -1], to: [3, 3] },
  { label: "I={1,2}: x₁+x₂≤1", from: [-1, 2], to: [3, -2] },
];

const cubeVertices: Point3D[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
];

const cubeEdges: Array<[number, number]> = [
  [0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[5,7],[6,7],[0,4],[1,5],[2,6],[3,7],
];

function subsetLabel(bits: Point3D): string {
  const entries = bits.map((v, i) => (v === 1 ? `${i + 1}` : "")).filter(Boolean);
  return entries.length ? `{${entries.join(",")}}` : "∅";
}

const stages2D: VisualizationStage[] = [
  {
    id: "sharp-145-2d-statement",
    kicker: "Chapter 24 · Example 145 · 2D",
    title: "The 2ⁿ bound is attained by one inequality for every subset I⊆N",
    description:
      "For n=2 there are four inequalities. Their common real feasible set collapses to the fractional point (1/2,1/2), while no integer point satisfies all four.",
    formula: "Σ_{i∈I}xᵢ−Σ_{i∉I}xᵢ≤|I|−1   for every I⊆N",
    insight:
      "The example is designed so that each subset I has a natural 0/1 witness χᴵ that violates exactly its own inequality.",
    scene: scene2D(
      [
        ...constraints2D.map((r, i) => line2D(r.from, r.to, i < 2 ? r.label : undefined, i % 2 ? C.aqua : C.orange, "constraint")),
        point2D([0.5, 0.5], "real feasible point (½,½)", "fractional"),
        ...[[0,0],[1,0],[0,1],[1,1]].map((p, i) => point2D(p as Point2D, `χ^I${i + 1}`, "integer")),
      ],
      {
        primary: "Example 145 in dimension two",
        secondary: "Four subset inequalities, no common integer point.",
      },
      { viewport: { x: [-0.8, 2.1], y: [-0.8, 2.1] } },
    ),
  },
  {
    id: "sharp-145-2d-partition",
    kicker: "Verification step 1 · Partition coordinates",
    title: "Any integer vector splits its coordinates into N₁ and N₀",
    description:
      "Assume an integer solution x exists. Put every index with xᵢ≥1 into N₁ and every remaining index into N₀; integrality ensures xᵢ≤0 on N₀.",
    formula: "N₁={i:xᵢ≥1},   N₀=N∖N₁={i:xᵢ≤0}",
    insight:
      "This partition picks exactly the inequality indexed by I=N₁ that will contradict integrality.",
    scene: scene2D(
      [
        point2D([1, 0], "example integer x", "optimum"),
        label2D([1.15, 0.35], "N₁={1}, N₀={2}", "accent"),
        label2D([0.1, 1.65], "choose I=N₁", "accent"),
      ],
      { primary: "Choose the subset from x itself", secondary: "Coordinates are either ≥1 or ≤0." },
      { viewport: { x: [-0.5, 2.2], y: [-0.5, 2.2] } },
    ),
  },
  {
    id: "sharp-145-2d-chain",
    kicker: "Verification step 2 · Contradiction chain",
    title: "The N₁ inequality says |N₁|≤|N₁|−1",
    description:
      "The coordinates in N₁ contribute at least one each. Feasibility of the inequality for I=N₁ gives the middle bound, while coordinates in N₀ are nonpositive.",
    formula: "|N₁|≤Σ_{i∈N₁}xᵢ≤|N₁|−1+Σ_{i∈N₀}xᵢ≤|N₁|−1",
    insight: "This contradiction works for every possible N₁, so the system has no integer solution.",
    scene: scene2D(
      [
        label2D([0.15, 1.65], "|N₁|", "accent"),
        line2D([0.65, 1.7], [1.15, 1.7], "≤", C.muted),
        label2D([1.2, 1.65], "Σ_{N₁}xᵢ", "default"),
        line2D([1.95, 1.7], [2.45, 1.7], "≤", C.muted),
        label2D([2.5, 1.65], "|N₁|−1", "accent"),
        label2D([0.75, 0.65], "contradiction: integer feasibility impossible", "accent"),
      ],
      { primary: "The notes' proof of infeasibility", secondary: "No case distinction beyond N₁/N₀ is needed." },
      { viewport: { x: [-0.2, 3.8], y: [-0.2, 2.4] } },
    ),
  },
  {
    id: "sharp-145-2d-minimality",
    kicker: "Sharpness · Extra verification",
    title: "Remove the inequality for I and χᴵ becomes feasible",
    description:
      "The notes state that the 2ⁿ bound cannot be decreased. The missing verification is immediate: χᴵ violates the I-inequality by one, while for every J≠I it satisfies the J-inequality because |I△J|≥1.",
    formula: "LHS_J(χᴵ)=|I∩J|−|I∖J|≤|J|−1   for J≠I",
    insight:
      "Thus every one of the 2ⁿ inequalities is essential. This is why Example 145 proves sharpness, not merely infeasibility.",
    scene: scene2D(
      [
        point2D([1, 0], "χ^{\{1\}}=(1,0)", "optimum"),
        line2D([-0.4, -0.4], [1.8, 1.8], "removed: x₁≤x₂", C.rose, "cut"),
        label2D([0.15, 1.55], "all other inequalities remain satisfied", "accent"),
      ],
      { primary: "A remove-one-constraint witness", secondary: "This step is implicit in the notes' sharpness claim." },
      { viewport: { x: [-0.5, 2.2], y: [-0.5, 2.2] } },
    ),
  },
];

const center3D: Point3D = [0.5, 0.5, 0.5];

function example145Scene3D(
  markers: ReturnType<typeof marker3D>[],
  segments: ReturnType<typeof segment3D>[],
  secondary: string,
  showPolyhedron = true,
) {
  return scene3D({
    bounds: { x: [-0.45, 1.45], y: [-0.45, 1.45], z: [-0.45, 1.45] },
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    camera: { yaw: -0.8, pitch: 0.46, distance: 4.8 },
    meshes: showPolyhedron ? [octahedronMesh("example145-P", center3D, 0.5, "P", "ghost", 0.2)] : [],
    markers,
    segments,
    showGround: true,
    showIntegerLattice: true,
    integerAxes: ["x","y","z"],
    caption: { primary: "Example 145 in dimension three", secondary },
  });
}

const stages3D: VisualizationStage[] = [
  {
    id: "sharp-145-3d-statement",
    kicker: "Chapter 24 · Example 145 · 3D",
    title: "The eight subset inequalities cut out a real octahedron with no integer point",
    description:
      "For n=3 the system has eight rows. Writing s_I=2χᴵ−1, the inequalities are s_Iᵀx≤|I|−1. Their common real feasible region is exactly ||x−(1/2,1/2,1/2)||₁≤1/2, the displayed octahedron.",
    formula: "P={x:Σ_{i∈I}xᵢ−Σ_{i∉I}xᵢ≤|I|−1 ∀I} = {x:||x−½1||₁≤½}",
    insight:
      "This is the true 3D feasible polyhedron. The eight 0/1 cube vertices are outside P and will serve as the remove-one-row witnesses.",
    scene: example145Scene3D(
      cubeVertices.map((p, i) => marker3D(`v-${i}`, p, i === 7 ? "0/1 witnesses" : undefined, "integer", 0.055)),
      cubeEdges.map(([a,b], i) => segment3D(`e-${i}`, cubeVertices[a], cubeVertices[b], "", C.muted, { width: 2, animate: false, dashed: true })),
      "The octahedron is the real feasible set; the wireframe cube only organizes the eight integer witnesses.",
    ),
  },
  {
    id: "sharp-145-3d-partition",
    kicker: "Verification step 1 · Partition coordinates",
    title: "A hypothetical integer x again determines N₁ and N₀ itself",
    description:
      "Take the concrete candidate x=(1,0,1). Integrality gives N₁={1,3} and N₀={2}. The proof selects exactly the row I=N₁; no geometric guess is involved.",
    formula: "x=(1,0,1) ⇒ N₁={1,3}, N₀={2}, choose I=N₁",
    insight:
      "For this row the normal is a_I=(1,−1,1) and b_I=|I|−1=1.",
    scene: example145Scene3D(
      [marker3D("candidate", [1,0,1], "x=(1,0,1) · N₁={1,3}", "optimum", 0.105)],
      [segment3D("normal", center3D, [1.05,-0.05,1.05], "a_I=(1,−1,1)", C.orange)],
      "The candidate itself determines the sign pattern of the contradicting inequality.",
    ),
  },
  {
    id: "sharp-145-3d-chain",
    kicker: "Verification step 2 · Contradiction chain",
    title: "The same inequality chain works without any 3D shortcut",
    description:
      "Coordinates in N₁ are at least one, coordinates in N₀ are at most zero, and feasibility of the I=N₁ row sits between those two facts. Therefore the same impossible bound |N₁|≤|N₁|−1 follows.",
    formula: "|N₁|≤Σ_{N₁}xᵢ≤|N₁|−1+Σ_{N₀}xᵢ≤|N₁|−1",
    insight:
      "For x=(1,0,1), the selected row gives 2≤1+0≤1, already impossible. The proof is exactly the 2D proof, only with three coordinates.",
    scene: example145Scene3D(
      [
        marker3D("bad", [1,0,1], "hypothetical integer x", "optimum", 0.1),
        marker3D("center", center3D, "real feasible region stays around ½1", "fractional", 0.075),
      ],
      [segment3D("reject", [1,0,1], center3D, "selected row excludes x", C.rose)],
      "The octahedron contains no integer point because every integer candidate defeats itself via I=N₁.",
    ),
  },
  {
    id: "sharp-145-3d-minimality",
    kicker: "Sharpness · Extra verification",
    title: "Remove row I and the corresponding cube vertex χᴵ becomes feasible",
    description:
      "Choose I={1,3}. The point χᴵ=(1,0,1) violates its own row by one. For every other J the slack is |I△J|−1≥0, so all remaining seven inequalities are satisfied.",
    formula: "(|J|−1)−LHS_J(χᴵ)=|I△J|−1≥0 for J≠I",
    insight:
      "Every one of the eight facets is essential. This is the literal three-dimensional sharpness mechanism behind the 2³ bound.",
    scene: example145Scene3D(
      cubeVertices.map((p, i) => marker3D(`w-${i}`, p, i === 5 ? "χ^{\{1,3\}} becomes feasible" : undefined, i === 5 ? "optimum" : "integer", i === 5 ? 0.11 : 0.04)),
      [segment3D("removed-normal", center3D, [1.05,-0.05,1.05], "removed facet I={1,3}", C.rose, { dashed: true })],
      "One deleted facet opens the octahedron exactly toward its associated cube vertex.",
    ),
  },
];

const examples: VisualizationExample[] = [
  { id: "example-145-2d", title: "2D · four inequalities", stages: stages2D },
  { id: "example-145-3d", title: "3D · exact octahedron and proof", stages: stages3D },
];

const visualization: VisualizationDefinition = {
  id: "doignon-sharpness-example-145",
  title: "Example 145 — Sharpness of the 2ⁿ Doignon Bound",
  shortTitle: "Sharpness · Example 145",
  chapter: "Lattice-free polyhedra",
  order: 2,
  description:
    "Visualizes the 2ⁿ-inequality construction from Example 145, the N₁/N₀ contradiction proving integer infeasibility, and the remove-one-row witnesses that make the Doignon bound sharp. The 3D option now shows the actual feasible octahedron rather than only a parity cube.",
  difficulty: "Intermediate",
  duration: 12,
  accent: C.orange,
  visualLabel: "Subset geometry",
  insightLabel: "Why 2ⁿ is necessary",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages: stages2D,
  examples,
  proof: {
    title: "Example 145 verification",
    steps: [
      "Assume x∈ℤⁿ satisfies every subset inequality and define N₁={i:xᵢ≥1}, N₀=N∖N₁.",
      "Apply the constraint indexed by I=N₁. Coordinates in N₁ sum to at least |N₁|, while coordinates in N₀ are nonpositive.",
      "Feasibility gives |N₁|≤Σ_{N₁}xᵢ≤|N₁|−1+Σ_{N₀}xᵢ≤|N₁|−1, a contradiction.",
      "To make the sharpness claim explicit: after deleting row I, χᴵ satisfies every remaining row J≠I because the slack equals |I△J|−1≥0.",
    ],
  },
};

export default visualization;
