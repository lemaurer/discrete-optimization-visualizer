import type { Point2D, Primitive } from "@/engine/types";
import {
  basisVectors,
  fundamentalCell,
  latticePoints,
  latticeScene,
  LATTICE_COLORS,
} from "@/visualizations/helpers/lattice-scenes";
import type { Basis2D } from "@/visualizations/helpers/lattice-scenes";
import type { VisualizationDefinition } from "@/visualizations/types";

const basis: Basis2D = [
  [3, 1],
  [1, 3],
];
const alternateBasis: Basis2D = [
  [3, 1],
  [-2, 2],
];
const shortBasis: Basis2D = [
  [-2, 2],
  [3, 1],
];
const dualBasis: Basis2D = [
  [3 / 8, -1 / 8],
  [-1 / 8, 3 / 8],
];
const viewport = { x: [-8, 8] as [number, number], y: [-6, 6] as [number, number] };
const origin: Point2D = [0, 0];

const label = (at: Point2D, text: string, tone: "default" | "muted" | "accent" = "default"): Primitive => ({
  kind: "label",
  at,
  text,
  tone,
});

const visualization: VisualizationDefinition = {
  id: "lattice-foundations",
  title: "Lattice Theory: Geometry, Bases & Determinants",
  shortTitle: "Lattice foundations",
  chapter: "Lattice theory",
  order: 1,
  description:
    "See a lattice as integer combinations of a basis, tile space with a fundamental parallelepiped, change bases unimodularly, and identify short and dual vectors.",
  difficulty: "Foundation",
  duration: 15,
  accent: LATTICE_COLORS.orange,
  visualLabel: "Lattice geometry",
  insightLabel: "Lattice insight",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "integer-span",
      kicker: "01 · Lattice definition",
      title: "A lattice is an integer span, not a continuous plane",
      description:
        "Choose linearly independent vectors b₁ and b₂. Integer coefficients create a discrete additive subgroup of ℝ².",
      formula: "L(B)={Bz:z∈ℤ²}={z₁b₁+z₂b₂:z₁,z₂∈ℤ}",
      insight:
        "Real coefficients fill the whole plane; restricting the coefficients to integers leaves isolated, regularly repeated points.",
      scene: latticeScene(basis, {
        viewport,
        caption: { label: "L(B)", detail: "b₁=(3,1) · b₂=(1,3)" },
      }),
    },
    {
      id: "coordinates",
      kicker: "02 · Lattice coordinates",
      title: "Every lattice point carries integer basis coordinates",
      description:
        "The highlighted point x is reached by taking two copies of b₁ and subtracting one copy of b₂.",
      formula: "x=2b₁−b₂=2(3,1)−(1,3)=(5,−1)",
      insight:
        "Coordinates depend on the chosen basis, but the ambient point x and the lattice itself do not.",
      scene: latticeScene(basis, {
        viewport,
        caption: { label: "Integer basis coordinates", detail: "x has coordinate vector z=(2,−1)" },
        primitives: [
          ...latticePoints(basis, viewport),
          ...basisVectors(basis),
          { kind: "vector", from: origin, to: [5, -1], label: "x=2b₁−b₂", color: LATTICE_COLORS.violet, animate: true },
          { kind: "point", at: [5, -1], label: "z=(2,−1)", style: "optimum" },
        ],
      }),
    },
    {
      id: "fundamental-cell",
      kicker: "03 · Fundamental parallelepiped",
      title: "One half-open cell represents every residue class",
      description:
        "Let both basis coefficients range from zero up to, but not including, one. Translating this cell by lattice points tiles the plane without duplicated interiors.",
      formula: "𝒫(B)={λ₁b₁+λ₂b₂:0≤λ₁,λ₂<1}",
      insight:
        "Every x∈ℝ² decomposes uniquely as x=ℓ+p with ℓ∈L and p∈𝒫(B), once the boundary convention is fixed.",
      scene: latticeScene(basis, {
        viewport,
        caption: { label: "Fundamental cell", detail: "translations by L tile ℝ²" },
        primitives: [
          ...latticePoints(basis, viewport),
          fundamentalCell(basis),
          ...basisVectors(basis),
        ],
      }),
    },
    {
      id: "determinant",
      kicker: "04 · Determinant and covolume",
      title: "The determinant measures lattice density",
      description:
        "The area of every fundamental cell equals the absolute determinant of the basis matrix. Large determinant means fewer lattice points per unit area.",
      formula: "det(L)=|det B|=|3·3−1·1|=8=area(𝒫(B))",
      insight:
        "The cell shape changes under a basis change, but its area remains an invariant of the lattice.",
      scene: latticeScene(basis, {
        viewport,
        caption: { label: "Covolume 8", detail: "one lattice point per area-8 cell" },
        primitives: [
          ...latticePoints(basis, viewport),
          fundamentalCell(basis, "area = 8"),
          ...basisVectors(basis),
          label([2, 2.3], "|det B|=8", "accent"),
        ],
      }),
    },
    {
      id: "unimodular-change",
      kicker: "05 · Equivalent bases",
      title: "A unimodular column operation changes the basis, not the lattice",
      description:
        "Replace b₂ by b₂−b₁. The integer transformation has determinant one, so it is invertible over ℤ and preserves every lattice point.",
      formula: "B′=BU, U=[[1,−1],[0,1]], det U=1   ⇒   L(B′)=L(B)",
      insight:
        "Basis reduction searches through exactly these unimodular changes for vectors that are shorter and closer to orthogonal.",
      scene: latticeScene(shortBasis, {
        viewport,
        caption: { label: "Same points, new basis", detail: "b′₁=b₁ · b′₂=b₂−b₁" },
        primitives: [
          ...latticePoints(basis, viewport),
          fundamentalCell(alternateBasis, "𝒫(B′)", basis),
          ...basisVectors(alternateBasis, ["b′₁", "b′₂"]),
          { kind: "point", at: alternateBasis[1], animateFrom: basis[1], style: "integer", label: "b₂→b₂−b₁" },
        ],
      }),
    },
    {
      id: "short-vectors",
      kicker: "06 · Shortest vector problem",
      title: "A basis vector need not be a shortest lattice vector",
      description:
        "The original basis vectors both have length √10, yet their difference is the shorter nonzero lattice vector (−2,2).",
      formula: "λ₁(L)=min{‖x‖₂:x∈L∖{0}}   ·   ‖b₂−b₁‖=√8<√10=‖b₁‖=‖b₂‖",
      insight:
        "Finding an exact shortest vector is hard in high dimension; reduction instead produces provably short, well-conditioned basis vectors.",
      scene: latticeScene(basis, {
        viewport,
        caption: { label: "A hidden short vector", detail: "integer combination b₂−b₁" },
        primitives: [
          ...latticePoints(basis, viewport),
          ...basisVectors(basis),
          { kind: "vector", from: origin, to: [-2, 2], label: "b₂−b₁", color: LATTICE_COLORS.rose, animate: true },
          { kind: "circle", at: origin, radius: Math.sqrt(8), label: "radius √8", style: "component", color: LATTICE_COLORS.rose, animate: true },
        ],
      }),
    },
    {
      id: "successive-minima",
      kicker: "07 · Successive minima",
      title: "Successive minima ask for independent short directions",
      description:
        "The first minimum reaches one nonzero lattice direction. The second grows the ball until it contains two linearly independent lattice vectors.",
      formula: "λᵢ(L)=min{r:dim span(L∩rB₂)≥i}   ·   λ₁≤λ₂",
      insight:
        "A reduced basis approximates these independent short directions rather than merely repeating multiples of one shortest vector.",
      scene: latticeScene(alternateBasis, {
        viewport,
        caption: { label: "Independent short directions", detail: "λ₁ then λ₂" },
        primitives: [
          ...latticePoints(basis, viewport),
          { kind: "circle", at: origin, radius: Math.sqrt(8), label: "λ₁", style: "component", color: LATTICE_COLORS.rose, animate: true },
          { kind: "circle", at: origin, radius: Math.sqrt(10), label: "λ₂", style: "component", color: LATTICE_COLORS.aqua, animationDelay: 0.35, animate: true },
          ...basisVectors(shortBasis, ["short direction 1", "direction 2"]),
        ],
      }),
    },
    {
      id: "dual-lattice",
      kicker: "08 · Dual lattice",
      title: "The dual lattice records integral inner products",
      description:
        "A vector y belongs to L* when its inner product with every primal lattice vector is integral. The dual basis is B⁻ᵀ.",
      formula: "L*={y:⟨y,x⟩∈ℤ for all x∈L}=L(B⁻ᵀ)   ·   det(L*)=1/det(L)",
      insight:
        "Dual vectors describe lattice hyperplanes, width, and many certificates used in integer optimization.",
      scene: latticeScene(dualBasis, {
        viewport: { x: [-1.5, 1.5], y: [-1.5, 1.5] },
        axisTicks: { x: 0.5, y: 0.5 },
        caption: { label: "Dual lattice L*", detail: "B⁻ᵀ · determinant 1/8" },
        primitives: [
          ...latticePoints(dualBasis, { x: [-1.5, 1.5], y: [-1.5, 1.5] }, 8),
          ...basisVectors(dualBasis, ["b₁*", "b₂*"], [LATTICE_COLORS.violet, LATTICE_COLORS.rose]),
        ],
      }),
    },
    {
      id: "reduction-motivation",
      kicker: "09 · Why reduce a basis?",
      title: "Good coordinates make lattice algorithms tractable",
      description:
        "Equivalent bases can have wildly different lengths and angles. A reduced basis keeps the same lattice and determinant while improving numerical and combinatorial behavior.",
      formula: "same L and |det B|   ·   seek short vectors and small |μᵢⱼ|",
      insight:
        "The next lesson turns this goal into the Gram–Schmidt data, size-reduction steps, Lovász tests, and swaps of the LLL algorithm.",
      scene: latticeScene(alternateBasis, {
        viewport,
        caption: { label: "A better coordinate system", detail: "same lattice · shorter, less skew basis" },
        primitives: [
          ...latticePoints(basis, viewport),
          fundamentalCell(alternateBasis, "same area 8", basis),
          ...basisVectors(alternateBasis, ["reduced candidate", "second direction"]),
        ],
      }),
    },
  ],
  proof: {
    title: "Why do unimodular basis changes preserve the lattice?",
    steps: [
      "If B′=BU with U∈ℤⁿˣⁿ and det U=±1, then U has an integer inverse U⁻¹.",
      "Every B′z equals B(Uz), and Uz is integral, so L(B′)⊆L(B).",
      "Conversely, every Bz equals B′(U⁻¹z), and U⁻¹z is integral, so L(B)⊆L(B′).",
      "Therefore L(B′)=L(B), while |det B′|=|det B||det U|=|det B|.",
      "Size reductions and swaps in LLL are unimodular column operations, so the algorithm improves the basis without ever changing the lattice.",
    ],
  },
};

export default visualization;
