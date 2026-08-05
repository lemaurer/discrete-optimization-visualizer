import type { Point2D, Primitive, Scene } from "@/engine/types";
import {
  basisVectors,
  latticePoints,
  latticeScene,
  LATTICE_COLORS,
} from "@/visualizations/helpers/lattice-scenes";
import type { Basis2D } from "@/visualizations/helpers/lattice-scenes";
import type { VisualizationDefinition } from "@/visualizations/types";

const basis: Basis2D = [
  [2, 0],
  [1, 2],
];
const gramSchmidt: Basis2D = [
  [2, 0],
  [0, 2],
];
const viewport: Scene["viewport"] = { x: [-2.5, 7], y: [-2.3, 6] };
const origin: Point2D = [0, 0];
const target: Point2D = [2.7, 2.6];
const z3: Point2D = [0, 0];
const z2: Point2D = [1, 2];
const z1: Point2D = [3, 2];
const x3: Point2D = target;
const x2: Point2D = [1.7, 0];
const x1: Point2D = [0, 0];

const latticeBackground = () => latticePoints(basis, viewport, 8);

function label(
  at: Point2D,
  text: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return { kind: "label", at, text, tone };
}

function vector(
  from: Point2D,
  to: Point2D,
  text: string,
  color: string,
  animate = true,
): Primitive {
  return { kind: "vector", from, to, label: text, color, animate };
}

function targetAndAnswer(showAnswer = false): Primitive[] {
  return [
    { kind: "point", at: target, label: "x=(2.7,2.6)", style: "fractional" },
    ...(showAnswer
      ? ([
          { kind: "point", at: z1, label: "b*=z₁=(3,2)", style: "optimum" },
        ] satisfies Primitive[])
      : []),
  ];
}

function anvScene(
  primitives: Primitive[],
  caption: Scene["caption"],
  overrides: Partial<Scene> = {},
): Scene {
  return latticeScene(basis, {
    viewport,
    primitives,
    caption,
    ...overrides,
  });
}

const stages = [
  {
    id: "input",
    kicker: "01 · Input from the script",
    title: "Start with a reduced basis, its Gram–Schmidt vectors, and a target",
    description:
      "ANV receives the reduced basis b₁=(2,0), b₂=(1,2), its orthogonalization b̃₁=(2,0), b̃₂=(0,2), and the non-lattice target x=(2.7,2.6).",
    formula: "input: b₁,…,bₙ; b̃₁,…,b̃ₙ; x∈ℚⁿ∖L",
    insight:
      "The reduced basis controls the approximation factor; the Gram–Schmidt vectors expose the orthogonal coordinates that will be rounded backwards.",
    scene: anvScene(
      [
        ...latticeBackground(),
        ...basisVectors(basis),
        vector(origin, gramSchmidt[1], "b̃₂ ⟂ b̃₁", LATTICE_COLORS.violet),
        ...targetAndAnswer(),
      ],
      { label: "ANV input", detail: "reduced basis · orthogonal data · target x" },
    ),
  },
  {
    id: "initialize",
    kicker: "02 · Script step 1",
    title: "Initialize the lattice accumulator and the working target",
    description:
      "For n=2, the script starts one index beyond the loop: the accumulated lattice vector is zero and the working vector is the original target.",
    formula: "zₙ₊₁=0, xₙ₊₁=x   ⇒   z₃=(0,0), x₃=(2.7,2.6)",
    insight:
      "The z-sequence accumulates rounded basis multiples. The x-sequence removes one orthogonal direction per iteration.",
    scene: anvScene(
      [
        ...latticeBackground(),
        ...basisVectors(basis),
        { kind: "point", at: z3, label: "z₃=0", style: "integer" },
        vector(origin, x3, "x₃=x", LATTICE_COLORS.rose),
        ...targetAndAnswer(),
      ],
      { label: "Initialization", detail: "z₃=0 · x₃=x" },
    ),
  },
  {
    id: "expand-i2",
    kicker: "03 · Loop i=2 · step (a)",
    title: "Expand x₃ in the first two Gram–Schmidt directions",
    description:
      "Because b̃₁ and b̃₂ are orthogonal, the coefficients are read from the horizontal and vertical components of x₃.",
    formula: "x₃=1.35b̃₁+1.30b̃₂   ⇒   σ₂,₁=1.35, σ₂,₂=1.30",
    insight:
      "Only the last coefficient σ₂,₂ is rounded in this iteration. The earlier component remains for the next pass.",
    scene: anvScene(
      [
        ...latticeBackground(),
        vector(origin, [2.7, 0], "σ₂,₁b̃₁", LATTICE_COLORS.aqua),
        vector([2.7, 0], x3, "σ₂,₂b̃₂", LATTICE_COLORS.violet),
        ...targetAndAnswer(),
        label([-1.9, 5.25], "x₃=1.35b̃₁+1.30b̃₂", "accent"),
      ],
      { label: "Orthogonal expansion", detail: "σ₂,₂=1.30 is the active coefficient" },
    ),
  },
  {
    id: "round-i2",
    kicker: "04 · Loop i=2 · step (b)",
    title: "Round σ₂,₂ to the nearest integer",
    description:
      "The script uses nearest-integer notation [·]. Rounding 1.30 gives 1, leaving the signed remainder λ₂=−0.30 within [−1/2,1/2].",
    formula: "[σ₂,₂]=[1.30]=1   ·   λ₂=[σ₂,₂]−σ₂,₂=−0.30",
    insight:
      "Geometrically, ANV chooses the affine lattice layer with b̃₂-coordinate 1: the horizontal layer y=2 nearest to x.",
    scene: anvScene(
      [
        ...latticeBackground(),
        { kind: "line", from: [-2.2, 2], to: [6.7, 2], label: "chosen layer · [σ₂,₂]=1", style: "cut", color: LATTICE_COLORS.violet, animate: true },
        vector([2.7, 2], target, "0.30b̃₂", LATTICE_COLORS.rose),
        ...targetAndAnswer(),
        label([-1.9, 5.25], "λ₂=1−1.30=−0.30", "accent"),
      ],
      { label: "Nearest-plane choice", detail: "round 1.30 to layer 1" },
    ),
  },
  {
    id: "update-z2",
    kicker: "05 · Loop i=2 · step (c)",
    title: "Add the rounded multiple of b₂ to the accumulator",
    description:
      "The accumulator moves from z₃=0 to the lattice point z₂=b₂. This is the first part of the final answer.",
    formula: "z₂=z₃+[σ₂,₂]b₂=0+1·b₂=(1,2)",
    insight:
      "Every zᵢ stays in L because it is built only from integer multiples of lattice basis vectors.",
    scene: anvScene(
      [
        ...latticeBackground(),
        ...basisVectors(basis),
        vector(z3, z2, "+1·b₂", LATTICE_COLORS.orange),
        { kind: "point", at: z2, label: "z₂=(1,2)", style: "integer", animateFrom: z3 },
        ...targetAndAnswer(),
      ],
      { label: "Accumulator update", detail: "z₃ → z₂=z₃+b₂" },
    ),
  },
  {
    id: "update-x2",
    kicker: "06 · Loop i=2 · step (d)",
    title: "Remove the b₂ choice and cancel the b̃₂ remainder",
    description:
      "The prescribed update makes the active orthogonal coordinate vanish. After subtracting b₂ and adding λ₂b̃₂, x₂ lies entirely in span(b̃₁).",
    formula: "x₂=x₃−b₂+λ₂b̃₂=(2.7,2.6)−(1,2)−0.30(0,2)=(1.7,0)",
    insight:
      "This is the key invariant: after iteration i, the next working vector xᵢ has no component along b̃ᵢ,…,b̃ₙ.",
    scene: anvScene(
      [
        ...latticeBackground(),
        vector(origin, x3, "x₃", LATTICE_COLORS.muted),
        vector(origin, x2, "x₂∈span(b̃₁)", LATTICE_COLORS.aqua),
        vector([1.7, 0.6], x2, "λ₂b̃₂", LATTICE_COLORS.rose),
        { kind: "point", at: x2, label: "x₂=(1.7,0)", style: "fractional", animateFrom: x3 },
      ],
      { label: "Working-vector update", detail: "the b̃₂-coordinate is now zero" },
    ),
  },
  {
    id: "expand-i1",
    kicker: "07 · Loop i=1 · step (a)",
    title: "Expand x₂ in the one remaining direction",
    description:
      "Only b̃₁ remains. Since x₂=(1.7,0)=0.85(2,0), the last Gram–Schmidt coefficient is σ₁,₁=0.85.",
    formula: "x₂=σ₁,₁b̃₁=0.85b̃₁   ⇒   σ₁,₁=0.85",
    insight:
      "The backward loop has reduced the two-dimensional choice to a one-dimensional rounding decision.",
    scene: anvScene(
      [
        ...latticeBackground(),
        vector(origin, gramSchmidt[0], "b̃₁", LATTICE_COLORS.orange),
        vector(origin, x2, "x₂=0.85b̃₁", LATTICE_COLORS.aqua),
        { kind: "point", at: x2, label: "σ₁,₁=0.85", style: "fractional" },
      ],
      { label: "Final orthogonal expansion", detail: "one coefficient remains" },
    ),
  },
  {
    id: "round-i1",
    kicker: "08 · Loop i=1 · step (b)",
    title: "Round σ₁,₁ and record the final remainder",
    description:
      "The nearest integer to 0.85 is 1. The resulting multiplier λ₁=0.15 again satisfies the required half-interval bound.",
    formula: "[σ₁,₁]=[0.85]=1   ·   λ₁=1−0.85=0.15",
    insight:
      "Both output coefficients now obey |λᵢ|≤1/2: λ₁=0.15 and λ₂=−0.30.",
    scene: anvScene(
      [
        ...latticeBackground(),
        { kind: "line", from: [1, -1.9], to: [1, 5.7], label: "within chosen b₂-layer", style: "cut", color: LATTICE_COLORS.orange, animate: true },
        vector(x2, gramSchmidt[0], "0.15b̃₁", LATTICE_COLORS.rose),
        { kind: "point", at: x2, label: "0.85", style: "fractional" },
        label([-1.9, 5.25], "λ₁=1−0.85=0.15", "accent"),
      ],
      { label: "Last nearest-integer choice", detail: "round 0.85 to 1" },
    ),
  },
  {
    id: "update-z1",
    kicker: "09 · Loop i=1 · step (c)",
    title: "Complete the lattice accumulator",
    description:
      "Add one copy of b₁ to z₂. The accumulator reaches z₁=(3,2), the lattice point that ANV will return.",
    formula: "z₁=z₂+[σ₁,₁]b₁=(1,2)+1·(2,0)=(3,2)",
    insight:
      "The output is visibly a lattice vector: z₁=b₁+b₂.",
    scene: anvScene(
      [
        ...latticeBackground(),
        vector(origin, z2, "z₂=b₂", LATTICE_COLORS.aqua),
        vector(z2, z1, "+1·b₁", LATTICE_COLORS.orange),
        { kind: "point", at: z1, label: "z₁=b₁+b₂", style: "optimum", animateFrom: z2 },
        ...targetAndAnswer(),
      ],
      { label: "Final accumulator", detail: "z₁=(3,2)∈L" },
    ),
  },
  {
    id: "update-x1",
    kicker: "10 · Loop i=1 · step (d)",
    title: "The final working vector collapses to zero",
    description:
      "The last update removes the chosen b₁ multiple and adds the remainder correction. No Gram–Schmidt direction remains.",
    formula: "x₁=x₂−b₁+λ₁b̃₁=(1.7,0)−(2,0)+0.15(2,0)=0",
    insight:
      "Unrolling the two x-updates and using x₁=0 produces the output error decomposition from the script.",
    scene: anvScene(
      [
        ...latticeBackground(),
        vector(origin, x2, "x₂", LATTICE_COLORS.muted),
        vector(x2, origin, "−b₁+λ₁b̃₁", LATTICE_COLORS.rose),
        { kind: "point", at: x1, label: "x₁=0", style: "integer", animateFrom: x2 },
      ],
      { label: "Backward elimination complete", detail: "x₁=0" },
    ),
  },
  {
    id: "return",
    kicker: "11 · Script step 3",
    title: "Return b*=z₁ and the bounded multipliers",
    description:
      "ANV outputs b*=(3,2), λ₁=0.15, and λ₂=−0.30. The error from x to b* is exactly their Gram–Schmidt combination.",
    formula: "b*−x=(0.3,−0.6)=0.15b̃₁−0.30b̃₂",
    insight:
      "The error lies in the centered Gram–Schmidt box with coefficient range [−1/2,1/2] in every orthogonal direction.",
    scene: anvScene(
      [
        ...latticeBackground(),
        ...basisVectors(basis),
        ...targetAndAnswer(true),
        vector(target, z1, "b*−x", LATTICE_COLORS.rose),
        vector(target, [3, 2.6], "λ₁b̃₁", LATTICE_COLORS.orange),
        vector([3, 2.6], z1, "λ₂b̃₂", LATTICE_COLORS.violet),
      ],
      { label: "ANV output", detail: "b*=(3,2) · λ=(0.15,−0.30)" },
    ),
  },
  {
    id: "guarantee",
    kicker: "12 · Guarantee from the script",
    title: "A reduced basis turns nearest-plane rounding into an approximation",
    description:
      "In dimension two the theorem guarantees a factor √(2²−1)=√3. For this example, ANV actually finds the exact closest lattice vector.",
    formula: "‖b*−x‖≤√(2ⁿ−1)·dist(x,L)   ·   here: ‖b*−x‖=√0.45=dist(x,L)",
    insight:
      "The factor comes from bounding the earlier Gram–Schmidt lengths by the reduced-basis growth inequalities; the algorithm itself is only backward expansion and rounding.",
    scene: anvScene(
      [
        ...latticeBackground(),
        ...targetAndAnswer(true),
        { kind: "circle", at: target, radius: Math.sqrt(0.45), label: "dist(x,L)=√0.45", style: "component", color: LATTICE_COLORS.rose, animate: true },
        vector(target, z1, "exact here · ≤√3 factor in general", LATTICE_COLORS.rose),
      ],
      { label: "Approximate nearest vector", detail: "general √(2ⁿ−1) guarantee · exact on this input" },
    ),
  },
] satisfies VisualizationDefinition["stages"];

const visualization: VisualizationDefinition = {
  id: "approximate-nearest-vector-anv",
  title: "ANV: Approximate Nearest Vector Algorithm",
  shortTitle: "ANV algorithm",
  chapter: "Lattice theory",
  order: 4,
  description:
    "Execute the script’s ANV recursion exactly: expand in Gram–Schmidt coordinates, round backwards, update xᵢ and zᵢ, and recover the approximate nearest lattice vector.",
  difficulty: "Advanced",
  duration: 17,
  accent: LATTICE_COLORS.aqua,
  visualLabel: "Backward rounding",
  insightLabel: "ANV invariant",
  controls: {
    constraints: false,
    grid: true,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages,
  proof: {
    title: "Why do the ANV recursion and guarantee work?",
    steps: [
      "Initialize zₙ₊₁=0 and xₙ₊₁=x, then process the Gram–Schmidt directions from i=n down to 1 exactly as in the script.",
      "At iteration i, expand xᵢ₊₁=Σⱼ₌₁ⁱσᵢ,ⱼb̃ⱼ and round only the last coefficient [σᵢ,ᵢ].",
      "The definition λᵢ=[σᵢ,ᵢ]−σᵢ,ᵢ gives |λᵢ|≤1/2, while the x-update cancels the b̃ᵢ component and leaves xᵢ in span(b̃₁,…,b̃ᵢ₋₁).",
      "The z-update adds an integer multiple of bᵢ, so every zᵢ lies in L and z₁=Σᵢ[σᵢ,ᵢ]bᵢ is a lattice vector.",
      "Unrolling the recursions yields b*−x=Σᵢλᵢb̃ᵢ. Orthogonality turns its squared norm into Σᵢλᵢ²‖b̃ᵢ‖².",
      "For a reduced basis, ‖b̃ᵢ‖²≤2ᵏ⁻ⁱ‖b̃ₖ‖². Comparing with a true closest vector at the last differing index gives ‖b*−x‖≤√(2ⁿ−1)·dist(x,L).",
    ],
  },
};

export default visualization;
