import type { Point2D, Primitive, Scene } from "@/engine/types";
import {
  basisVectors,
  fundamentalCell,
  latticePoints,
  latticeScene,
  LATTICE_COLORS,
} from "@/visualizations/helpers/lattice-scenes";
import type { Basis2D } from "@/visualizations/helpers/lattice-scenes";
import type { VisualizationDefinition } from "@/visualizations/types";

const inputBasis: Basis2D = [
  [6, 1],
  [4, 3],
];
const sizeReducedOnce: Basis2D = [
  [6, 1],
  [-2, 2],
];
const swappedBasis: Basis2D = [
  [-2, 2],
  [6, 1],
];
const reducedBasis: Basis2D = [
  [-2, 2],
  [4, 3],
];
const viewport: Scene["viewport"] = { x: [-8, 9], y: [-6, 7] };
const origin: Point2D = [0, 0];

const initialProjection: Point2D = [162 / 37, 27 / 37];
const firstReducedProjection: Point2D = [-60 / 37, -10 / 37];
const swappedProjection: Point2D = [2.5, -2.5];
const finalProjection: Point2D = [0.5, -0.5];

const latticeBackground = () => latticePoints(inputBasis, viewport, 8);

function gsoPrimitives(
  basis: Basis2D,
  projection: Point2D,
  options: {
    basisLabels?: [string, string];
    transitionFrom?: Basis2D;
    values?: string[];
  } = {},
): Primitive[] {
  const values = options.values ?? [];
  return [
    ...latticeBackground(),
    fundamentalCell(basis, "same det = 14", options.transitionFrom),
    ...basisVectors(basis, options.basisLabels),
    {
      kind: "vector",
      from: origin,
      to: projection,
      label: "μ₂₁b₁*",
      color: LATTICE_COLORS.muted,
      animate: true,
    },
    {
      kind: "vector",
      from: projection,
      to: basis[1],
      label: "b₂* ⟂ b₁*",
      color: LATTICE_COLORS.violet,
      animate: true,
    },
    ...values.map<Primitive>((text, index) => ({
      kind: "label",
      at: [-5.8, 5.9 - index * 0.55],
      text,
      tone: index === values.length - 1 ? "accent" : "default",
    })),
  ];
}

const scene = (
  basis: Basis2D,
  primitives: Primitive[],
  caption: Scene["caption"],
): Scene =>
  latticeScene(basis, {
    viewport,
    primitives,
    caption,
  });

const visualization: VisualizationDefinition = {
  id: "gram-schmidt-lll-reduction",
  title: "Reduced Bases: Adapted Gram–Schmidt & LLL",
  shortTitle: "Gram–Schmidt & LLL",
  chapter: "Lattice theory",
  order: 2,
  description:
    "Watch Gram–Schmidt data evolve during size reduction, a failed Lovász test, a swap, the adapted update formulas, and the final LLL-reduced basis.",
  difficulty: "Advanced",
  duration: 20,
  accent: LATTICE_COLORS.violet,
  visualLabel: "LLL execution",
  insightLabel: "Reduction invariant",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "input-basis",
      kicker: "01 · Reduction problem",
      title: "The input basis is valid but long and skew",
      description:
        "The vectors b₁=(6,1) and b₂=(4,3) generate a determinant-14 lattice. The first vector is unnecessarily long compared with nearby lattice directions.",
      formula: "B=[b₁ b₂]=[[6,4],[1,3]]   ·   |det B|=14",
      insight:
        "Reduction may alter the basis by integer column operations, but it must preserve every lattice point and the determinant.",
      scene: scene(
        inputBasis,
        [...latticeBackground(), fundamentalCell(inputBasis), ...basisVectors(inputBasis)],
        { label: "LLL input", detail: "long, correlated basis vectors" },
      ),
    },
    {
      id: "gram-schmidt",
      kicker: "02 · Gram–Schmidt",
      title: "Split b₂ into parallel and orthogonal parts",
      description:
        "Keep b₁*=b₁. Project b₂ onto b₁*, then subtract that projection. The violet component b₂* is orthogonal to b₁*.",
      formula: "μ₂₁=⟨b₂,b₁*⟩/‖b₁*‖²=27/37   ·   b₂*=b₂−μ₂₁b₁*=(-14/37,84/37)",
      insight:
        "The lattice basis remains integral; the orthogonal vectors are analytic bookkeeping and usually are not lattice vectors.",
      scene: scene(
        inputBasis,
        gsoPrimitives(inputBasis, initialProjection, {
          values: ["B₁=‖b₁*‖²=37", "μ₂₁=27/37≈0.73", "B₂=‖b₂*‖²=196/37"],
        }),
        { label: "Gram–Schmidt decomposition", detail: "b₂=μ₂₁b₁*+b₂*" },
      ),
    },
    {
      id: "adapted-data",
      kicker: "03 · Adapted Gram–Schmidt",
      title: "LLL stores μ-coefficients and squared orthogonal lengths",
      description:
        "Instead of recomputing every orthogonal vector after each integer operation, the adapted version maintains μᵢⱼ and Bᵢ=‖bᵢ*‖².",
      formula: "state=(B₁,B₂,μ₂₁)=(37,196/37,27/37)",
      insight:
        "These three numbers are enough in dimension two to perform size reduction, test Lovász, and update after a swap.",
      scene: scene(
        inputBasis,
        gsoPrimitives(inputBasis, initialProjection, {
          values: ["stored: B₁=37", "stored: B₂=196/37", "stored: μ₂₁=27/37"],
        }),
        { label: "Adapted GSO state", detail: "update data rather than restart Gram–Schmidt" },
      ),
    },
    {
      id: "first-size-reduction",
      kicker: "04 · SizeReduce(2,1)",
      title: "Subtract the nearest integer multiple of b₁",
      description:
        "Round μ₂₁ to q=1 and replace b₂ by b₂−b₁=(-2,2). The lattice and b₂* stay unchanged, while μ₂₁ moves into the interval [−1/2,1/2].",
      formula: "q=⌊μ₂₁⌉=1   ·   b₂←b₂−qb₁=(-2,2)   ·   μ₂₁←27/37−1=−10/37",
      insight:
        "Size reduction removes a large parallel component without changing the orthogonal component or the determinant.",
      scene: scene(
        sizeReducedOnce,
        gsoPrimitives(sizeReducedOnce, firstReducedProjection, {
          basisLabels: ["b₁", "b₂←b₂−b₁"],
          transitionFrom: inputBasis,
          values: ["q=1", "μ₂₁: 27/37 → −10/37", "B₁,B₂ unchanged"],
        }),
        { label: "First size reduction", detail: "the cell shears but the lattice stays fixed" },
      ),
    },
    {
      id: "size-reduced-condition",
      kicker: "05 · Size-reduced basis",
      title: "All Gram–Schmidt coefficients are now small",
      description:
        "A basis is size-reduced when every coefficient μᵢⱼ lies between −1/2 and 1/2. In two dimensions there is only μ₂₁ to check.",
      formula: "|μ₂₁|=10/37≈0.27≤1/2",
      insight:
        "Size reduction controls correlation, but it does not yet guarantee that earlier orthogonal directions are sufficiently short.",
      scene: scene(
        sizeReducedOnce,
        gsoPrimitives(sizeReducedOnce, firstReducedProjection, {
          values: ["parallel part is small", "|μ₂₁|≈0.27≤0.5", "next: Lovász test"],
        }),
        { label: "Size-reduced", detail: "small Gram–Schmidt coefficient" },
      ),
    },
    {
      id: "lovasz-fails",
      kicker: "06 · Lovász condition",
      title: "The ordering test fails, so the vectors must swap",
      description:
        "With δ=3/4, the first orthogonal direction is far too long relative to the second. The current ordering is therefore not LLL-reduced.",
      formula: "δB₁=¾·37=27.75 > B₂+μ₂₁²B₁=‖b₂‖²=8",
      insight:
        "A failed Lovász test detects that a shorter independent direction is hiding later in the basis.",
      scene: scene(
        sizeReducedOnce,
        [
          ...gsoPrimitives(sizeReducedOnce, firstReducedProjection, {
            values: ["left side: δB₁=27.75", "right side: ‖b₂‖²=8", "27.75>8 ⇒ SWAP"],
          }),
          { kind: "circle", at: origin, radius: Math.sqrt(8), label: "‖b₂‖=√8", style: "component", color: LATTICE_COLORS.rose, animate: true },
        ],
        { label: "Lovász test fails", detail: "the short direction appears second" },
      ),
    },
    {
      id: "swap",
      kicker: "07 · Swap(1,2)",
      title: "Move the shorter vector to the front",
      description:
        "Exchange the two basis vectors. A column swap is unimodular with determinant −1, so it preserves the lattice and absolute determinant.",
      formula: "(b₁,b₂):((6,1),(−2,2)) → ((−2,2),(6,1))",
      insight:
        "The basis vectors swap instantly, but the adapted Gram–Schmidt data must be updated consistently before the loop continues.",
      scene: scene(
        swappedBasis,
        [
          ...latticeBackground(),
          fundamentalCell(swappedBasis, "swap · same |det|", sizeReducedOnce),
          ...basisVectors(swappedBasis, ["new b₁", "new b₂"]),
          { kind: "point", at: swappedBasis[0], animateFrom: sizeReducedOnce[0], style: "integer", label: "b₂→position 1" },
          { kind: "point", at: swappedBasis[1], animateFrom: sizeReducedOnce[1], style: "integer", label: "b₁→position 2" },
        ],
        { label: "Basis swap", detail: "shorter direction comes first" },
      ),
    },
    {
      id: "adapted-swap-update",
      kicker: "08 · Adapted GSO update",
      title: "Update B and μ algebraically after the swap",
      description:
        "Let D=B₂+μ²B₁. The adapted update obtains the new orthogonal lengths and coefficient directly, without running Gram–Schmidt from the beginning.",
      formula: "D=8   ·   B̄₁=D=8   ·   μ̄₂₁=μB₁/D=−5/4   ·   B̄₂=B₁B₂/D=49/2",
      insight:
        "The displayed orthogonal component rotates to the updated frame while the product B₁B₂=det(L)²=196 remains invariant.",
      scene: scene(
        swappedBasis,
        gsoPrimitives(swappedBasis, swappedProjection, {
          basisLabels: ["b̄₁=(−2,2)", "b̄₂=(6,1)"],
          values: ["D=8", "B̄₁=8 · B̄₂=49/2", "μ̄₂₁=−5/4"],
        }),
        { label: "Adapted update after swap", detail: "new GSO data in constant work for this pair" },
      ),
    },
    {
      id: "second-size-reduction",
      kicker: "09 · SizeReduce again",
      title: "The swap creates a large coefficient; reduce it immediately",
      description:
        "Round μ̄₂₁=−5/4 to q=−1. Replacing b₂ by b₂+b₁ gives (4,3), and the coefficient becomes −1/4.",
      formula: "q=⌊−5/4⌉=−1   ·   b₂←b₂−qb₁=(4,3)   ·   μ₂₁←−5/4+1=−1/4",
      insight:
        "Again, the integer shear changes only the parallel part: B₁=8 and B₂=49/2 remain unchanged.",
      scene: scene(
        reducedBasis,
        gsoPrimitives(reducedBasis, finalProjection, {
          basisLabels: ["b₁=(−2,2)", "b₂=(4,3)"],
          transitionFrom: swappedBasis,
          values: ["q=−1", "μ₂₁: −5/4 → −1/4", "B₁=8 · B₂=49/2"],
        }),
        { label: "Second size reduction", detail: "b₂←b₂+b₁" },
      ),
    },
    {
      id: "lovasz-passes",
      kicker: "10 · Lovász passes",
      title: "The reduced ordering now satisfies both LLL conditions",
      description:
        "The Gram–Schmidt coefficient is small, and the second orthogonal direction is not too short relative to the first.",
      formula: "|μ₂₁|=1/4≤1/2   ·   δB₁=6≤B₂+μ₂₁²B₁=25",
      insight:
        "No swap is needed. Increment k; in this two-vector example the algorithm terminates.",
      scene: scene(
        reducedBasis,
        gsoPrimitives(reducedBasis, finalProjection, {
          values: ["size: 1/4≤1/2 ✓", "Lovász: 6≤25 ✓", "k=3>n ⇒ STOP"],
        }),
        { label: "LLL conditions satisfied", detail: "size-reduced and Lovász-reduced" },
      ),
    },
    {
      id: "reduced-basis",
      kicker: "11 · LLL output",
      title: "The output basis is shorter and nearly orthogonal",
      description:
        "The first vector shrinks from length √37 to √8, while the final pair meets at an angle close to 98°. The lattice and determinant remain unchanged.",
      formula: "B_red=[(−2,2),(4,3)]   ·   |det B_red|=14   ·   μ₂₁=−1/4",
      insight:
        "LLL does not promise an exact shortest basis, but it gives polynomial-time, dimension-dependent approximation guarantees.",
      scene: scene(
        reducedBasis,
        [
          ...latticeBackground(),
          fundamentalCell(reducedBasis, "LLL-reduced cell", inputBasis),
          ...basisVectors(reducedBasis, ["short b₁", "b₂"]),
          { kind: "circle", at: origin, radius: Math.sqrt(8), label: "‖b₁‖=√8", style: "component", color: LATTICE_COLORS.orange, animate: true },
          { kind: "label", at: [-5.7, 5.7], text: "same lattice · same determinant 14", tone: "accent" },
        ],
        { label: "LLL-reduced basis", detail: "shorter and better conditioned" },
      ),
    },
    {
      id: "algorithm-loop",
      kicker: "12 · Complete algorithm",
      title: "Size-reduce, test, swap or advance, then repeat",
      description:
        "For k=2,…,n, reduce b_k against earlier vectors. If Lovász fails, swap with b_{k−1}, update the adapted GSO data, and step backward; otherwise advance.",
      formula: "SizeReduce → Lovász?  pass:k←k+1  ·  fail:Swap, adapted-GSO-update, k←max(k−1,2)",
      insight:
        "A decreasing potential based on the Gram–Schmidt lengths proves termination, while every operation stays unimodular.",
      scene: scene(
        reducedBasis,
        [
          ...latticeBackground(),
          fundamentalCell(reducedBasis, "output"),
          ...basisVectors(reducedBasis),
          { kind: "label", at: [-4.9, 5.8], text: "1  GSO data", tone: "default" },
          { kind: "label", at: [-4.9, 5.15], text: "2  size-reduce", tone: "default" },
          { kind: "label", at: [-4.9, 4.5], text: "3  Lovász test", tone: "default" },
          { kind: "label", at: [-4.9, 3.85], text: "4  swap/update or advance", tone: "accent" },
        ],
        { label: "LLL control loop", detail: "local updates · global basis improvement" },
      ),
    },
  ],
  proof: {
    title: "Why do the adapted updates match recomputed Gram–Schmidt?",
    steps: [
      "Before a swap, write b_k=μb_{k−1}*+b_k* plus components in earlier orthogonal directions. Let B_i=‖b_i*‖².",
      "After swapping b_{k−1} and b_k, the new first orthogonal vector for this pair has squared length D=B_k+μ²B_{k−1}.",
      "Project the old b_{k−1} onto that new vector. This gives the updated coefficient μ̄=μB_{k−1}/D.",
      "The two-dimensional volume of the pair is invariant, so B̄_{k−1}B̄_k=B_{k−1}B_k. Hence B̄_k=B_{k−1}B_k/D.",
      "Coefficients involving earlier and later basis vectors update by the same projection identities; no full orthogonalization is needed.",
      "Size reductions leave every b_i* and B_i unchanged because they subtract integer combinations of earlier basis vectors, changing only μ-coefficients.",
    ],
  },
};

export default visualization;
