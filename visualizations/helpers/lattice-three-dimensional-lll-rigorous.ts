import type {
  Marker3D,
  Mesh3D,
  Point3D,
  Scene,
  Scene3D,
  Segment3D,
} from "@/engine/types";
import type {
  VisualizationExample,
  VisualizationStage,
} from "@/visualizations/types";

const COLORS = {
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
  lime: "#d4ef77",
  muted: "#7d898b",
};

const boxFaces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
];

type Basis3D = [Point3D, Point3D, Point3D];
type Bounds3D = Scene3D["bounds"];

const inputBasis: Basis3D = [
  [3, 0, 0],
  [4, 2, 0],
  [4, 4, 2],
];

const afterB2Reduction: Basis3D = [
  [3, 0, 0],
  [1, 2, 0],
  [4, 4, 2],
];

const afterB3AgainstB2: Basis3D = [
  [3, 0, 0],
  [1, 2, 0],
  [2, 0, 2],
];

const afterFirstBR1: Basis3D = [
  [3, 0, 0],
  [1, 2, 0],
  [-1, 0, 2],
];

const afterFirstSwap: Basis3D = [
  [1, 2, 0],
  [3, 0, 0],
  [-1, 0, 2],
];

const afterSecondBR1: Basis3D = [
  [1, 2, 0],
  [2, -2, 0],
  [-1, 0, 2],
];

const finalBasis: Basis3D = [
  [1, 2, 0],
  [-1, 0, 2],
  [2, -2, 0],
];

const initialGso: Basis3D = [
  [3, 0, 0],
  [0, 2, 0],
  [0, 0, 2],
];

const firstRestartGso: Basis3D = [
  [1, 2, 0],
  [12 / 5, -6 / 5, 0],
  [0, 0, 2],
];

const finalGso: Basis3D = [
  [1, 2, 0],
  [-4 / 5, 2 / 5, 2],
  [2, -1, 1],
];

const wideBounds: Bounds3D = {
  x: [-4.5, 6.5],
  y: [-4.5, 6.5],
  z: [-3.5, 4.5],
};

const compactBounds: Bounds3D = {
  x: [-4.5, 4.5],
  y: [-4.5, 4.5],
  z: [-3.5, 4.5],
};

const add3 = (left: Point3D, right: Point3D): Point3D => [
  left[0] + right[0],
  left[1] + right[1],
  left[2] + right[2],
];

const scale3 = (scalar: number, vector: Point3D): Point3D => [
  scalar * vector[0],
  scalar * vector[1],
  scalar * vector[2],
];

function scene3D(configuration: Scene3D): Scene {
  return {
    viewport: { x: [0, 1], y: [0, 1] },
    constraints: [],
    showGrid: true,
    showLattice: false,
    showVertices: true,
    scene3D: configuration,
  };
}

function segment(
  id: string,
  from: Point3D,
  to: Point3D,
  label: string,
  color: string,
  options: Partial<Segment3D> = {},
): Segment3D {
  return {
    id,
    from,
    to,
    label,
    color,
    width: 3,
    animate: true,
    ...options,
  };
}

function basisSegments(
  basis: Basis3D,
  prefix: string,
  labels: [string, string, string] = ["b₁", "b₂", "b₃"],
): Segment3D[] {
  return [
    segment(`${prefix}-b1`, [0, 0, 0], basis[0], labels[0], COLORS.orange),
    segment(`${prefix}-b2`, [0, 0, 0], basis[1], labels[1], COLORS.aqua),
    segment(`${prefix}-b3`, [0, 0, 0], basis[2], labels[2], COLORS.violet),
  ];
}

function gsoSegments(
  basis: Basis3D,
  prefix: string,
  labels: [string, string, string] = ["b̃₁", "b̃₂", "b̃₃"],
): Segment3D[] {
  return basisSegments(basis, prefix, labels).map((item) => ({
    ...item,
    dashed: true,
    width: 5,
  }));
}

function parallelepipedVertices(basis: Basis3D): Point3D[] {
  const [first, second, third] = basis;
  return [
    [0, 0, 0],
    first,
    add3(first, second),
    second,
    third,
    add3(first, third),
    add3(add3(first, second), third),
    add3(second, third),
  ];
}

function parallelepiped(
  id: string,
  basis: Basis3D,
  label: string,
  options: Partial<Mesh3D> = {},
): Mesh3D {
  return {
    id,
    vertices: parallelepipedVertices(basis),
    faces: boxFaces,
    label,
    color: COLORS.lime,
    opacity: 0.2,
    ...options,
  };
}

function latticeMarkers(bounds: Bounds3D): Marker3D[] {
  const markers: Marker3D[] = [];
  const [b1, b2, b3] = inputBasis;

  for (let z1 = -2; z1 <= 2; z1 += 1) {
    for (let z2 = -2; z2 <= 2; z2 += 1) {
      for (let z3 = -2; z3 <= 2; z3 += 1) {
        const point = add3(add3(scale3(z1, b1), scale3(z2, b2)), scale3(z3, b3));
        const visible =
          point[0] >= bounds.x[0] &&
          point[0] <= bounds.x[1] &&
          point[1] >= bounds.y[0] &&
          point[1] <= bounds.y[1] &&
          point[2] >= bounds.z[0] &&
          point[2] <= bounds.z[1];

        if (visible) {
          markers.push({
            id: `lll-lattice-${z1}-${z2}-${z3}`,
            at: point,
            style: "integer",
            radius: z1 === 0 && z2 === 0 && z3 === 0 ? 0.09 : 0.055,
            label: z1 === 0 && z2 === 0 && z3 === 0 ? "0" : undefined,
          });
        }
      }
    }
  }

  return markers;
}

function basisScene(
  basis: Basis3D,
  bounds: Bounds3D,
  configuration: {
    prefix: string;
    labels?: [string, string, string];
    cellLabel: string;
    previousBasis?: Basis3D;
    extraSegments?: Segment3D[];
    caption: Scene3D["caption"];
  },
): Scene {
  return scene3D({
    bounds,
    axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
    meshes: [
      parallelepiped(`${configuration.prefix}-cell`, basis, configuration.cellLabel, {
        fromVertices: configuration.previousBasis
          ? parallelepipedVertices(configuration.previousBasis)
          : undefined,
      }),
    ],
    segments: [
      ...basisSegments(basis, configuration.prefix, configuration.labels),
      ...(configuration.extraSegments ?? []),
    ],
    markers: latticeMarkers(bounds),
    showIntegerLattice: false,
    caption: configuration.caption,
  });
}

const initialDecompositionSegments: Segment3D[] = [
  segment("gso-b1-star", [0, 0, 0], [3, 0, 0], "b̃₁", COLORS.orange, {
    dashed: true,
    width: 5,
  }),
  segment("gso-b2-parallel", [0, 0, 0], [4, 0, 0], "(4/3)b̃₁", COLORS.muted, {
    dashed: true,
  }),
  segment("gso-b2-star", [4, 0, 0], [4, 2, 0], "b̃₂", COLORS.aqua, {
    dashed: true,
    width: 5,
  }),
  segment("gso-b3-first", [0, 0, 0], [4, 0, 0], "(4/3)b̃₁", COLORS.muted, {
    dashed: true,
  }),
  segment("gso-b3-second", [4, 0, 0], [4, 4, 0], "2b̃₂", COLORS.muted, {
    dashed: true,
  }),
  segment("gso-b3-star", [4, 4, 0], [4, 4, 2], "b̃₃", COLORS.violet, {
    dashed: true,
    width: 5,
  }),
];

const stages: VisualizationStage[] = [
  {
    id: "lll-3d-input",
    kicker: "3D example · BR2 input",
    title: "Start with an integral basis of a determinant-12 lattice",
    description:
      "The vectors b₁=(3,0,0), b₂=(4,2,0), and b₃=(4,4,2) generate the displayed lattice L(B). The point cloud shows L(B), not the full ambient lattice ℤ³.",
    formula: "B=[b₁ b₂ b₃], det(B)=12",
    insight:
      "Every later column operation and swap must preserve this exact point set and |det B|=12.",
    scene: basisScene(inputBasis, wideBounds, {
      prefix: "lll-input",
      cellLabel: "fundamental cell · volume 12",
      caption: {
        primary: "Input basis and its actual lattice",
        secondary: "L(B)=Bℤ³ · covolume 12",
      },
    }),
  },
  {
    id: "lll-3d-step1-gso",
    kicker: "3D example · BR2 Step 1",
    title: "Compute Gram–Schmidt and all three multipliers",
    description:
      "The orthogonalization is b̃₁=(3,0,0), b̃₂=(0,2,0), b̃₃=(0,0,2). The decomposition paths show the exact parallel components of b₂ and b₃.",
    formula: "μ₂₁=4/3, μ₃₁=4/3, μ₃₂=2   ·   (‖b̃₁‖²,‖b̃₂‖²,‖b̃₃‖²)=(9,4,4)",
    insight:
      "BR1 must now process i=2, then i=3; for each i it visits j=i−1,…,1 in descending order.",
    scene: scene3D({
      bounds: wideBounds,
      axisLabels: { x: "x₁", y: "x₂", z: "x₃" },
      meshes: [parallelepiped("lll-gso-cell", inputBasis, "det = 12", { opacity: 0.12 })],
      segments: [
        ...basisSegments(inputBasis, "lll-gso-original"),
        ...initialDecompositionSegments,
      ],
      markers: latticeMarkers(wideBounds),
      showIntegerLattice: false,
      caption: {
        primary: "Exact Gram–Schmidt decomposition",
        secondary: "μ₂₁=4/3 · μ₃₁=4/3 · μ₃₂=2",
      },
    }),
  },
  {
    id: "lll-3d-br1-i2-j1",
    kicker: "3D example · BR1: i=2, j=1",
    title: "Size-reduce b₂ against b₁",
    description:
      "Because |μ₂₁|=4/3>1/2, BR1 rounds μ₂₁ to 1 and replaces b₂ by b₂−b₁=(1,2,0). It then recomputes Gram–Schmidt.",
    formula: "q=⌊4/3⌉=1   ·   b₂←b₂−qb₁=(1,2,0)   ·   μ₂₁←1/3",
    insight:
      "The Gram–Schmidt vectors remain (3,0,0),(0,2,0),(0,0,2), as guaranteed for BR1 size reductions.",
    scene: basisScene(afterB2Reduction, wideBounds, {
      prefix: "lll-br1-b2",
      labels: ["b₁", "b₂←b₂−b₁", "b₃"],
      cellLabel: "same lattice · volume 12",
      previousBasis: inputBasis,
      extraSegments: gsoSegments(initialGso, "lll-br1-b2-gso"),
      caption: {
        primary: "First BR1 operation",
        secondary: "μ₂₁: 4/3 → 1/3",
      },
    }),
  },
  {
    id: "lll-3d-br1-i3-j2",
    kicker: "3D example · BR1: i=3, j=2",
    title: "Reduce b₃ first against the updated b₂",
    description:
      "BR1 uses descending j. Since μ₃₂=2, it first replaces b₃ by b₃−2b₂=(2,0,2), where b₂ is already the updated vector (1,2,0).",
    formula: "q=⌊2⌉=2   ·   b₃←(4,4,2)−2(1,2,0)=(2,0,2)",
    insight:
      "Using the original b₂ here would be wrong. The algorithm always uses the current basis and recomputes its Gram–Schmidt data.",
    scene: basisScene(afterB3AgainstB2, wideBounds, {
      prefix: "lll-br1-b3-j2",
      labels: ["b₁", "b₂", "b₃←b₃−2b₂"],
      cellLabel: "same lattice · volume 12",
      previousBasis: afterB2Reduction,
      extraSegments: gsoSegments(initialGso, "lll-br1-b3-j2-gso"),
      caption: {
        primary: "Second BR1 operation",
        secondary: "process j=2 before j=1",
      },
    }),
  },
  {
    id: "lll-3d-br1-i3-j1",
    kicker: "3D example · BR1: i=3, j=1",
    title: "Recompute, then remove the remaining b₁ component",
    description:
      "After the previous operation, recomputation gives μ₃₁=2/3. BR1 rounds it to 1 and sets b₃=(2,0,2)−b₁=(−1,0,2).",
    formula: "q=⌊2/3⌉=1   ·   b₃←b₃−b₁=(−1,0,2)   ·   (μ₂₁,μ₃₁,μ₃₂)=(1/3,−1/3,0)",
    insight:
      "Now every |μᵢⱼ|≤1/2, so BR1 has established condition (a) of Definition 103.",
    scene: basisScene(afterFirstBR1, compactBounds, {
      prefix: "lll-br1-complete",
      labels: ["b₁", "b₂", "b₃"],
      cellLabel: "BR1 output · volume 12",
      previousBasis: afterB3AgainstB2,
      extraSegments: gsoSegments(initialGso, "lll-br1-complete-gso"),
      caption: {
        primary: "BR1 complete",
        secondary: "all three size conditions hold",
      },
    }),
  },
  {
    id: "lll-3d-first-order-test",
    kicker: "3D example · BR2 Step 3, i=1",
    title: "The first 3/4 ordering test fails",
    description:
      "For i=1, the left side equals ‖b̃₂+μ₂₁b̃₁‖²=‖b₂‖²=5, while the required threshold is (3/4)‖b̃₁‖²=27/4.",
    formula: "5 < 27/4   ⇒   interchange b₁ and b₂",
    insight:
      "Condition (a) alone is insufficient: the short independent direction still appears after the longer one.",
    scene: basisScene(afterFirstBR1, compactBounds, {
      prefix: "lll-test-one",
      cellLabel: "condition (a) holds",
      extraSegments: gsoSegments(initialGso, "lll-test-one-gso"),
      caption: {
        primary: "Condition (b) fails at i=1",
        secondary: "5 < 27/4",
      },
    }),
  },
  {
    id: "lll-3d-first-swap",
    kicker: "3D example · Swap and restart",
    title: "Swap b₁ and b₂, then return to BR2 Step 1",
    description:
      "BR2 interchanges the adjacent vectors and immediately restarts. The swap preserves the lattice and absolute determinant but can destroy the size-reduced condition.",
    formula: "((3,0,0),(1,2,0),(−1,0,2)) → ((1,2,0),(3,0,0),(−1,0,2))",
    insight:
      "This restart is essential: the old Gram–Schmidt coefficients are no longer valid for the reordered basis.",
    scene: basisScene(afterFirstSwap, compactBounds, {
      prefix: "lll-first-swap",
      labels: ["new b₁", "new b₂", "b₃"],
      cellLabel: "swap · |det|=12",
      previousBasis: afterFirstBR1,
      caption: {
        primary: "First adjacent swap",
        secondary: "return to Step 1",
      },
    }),
  },
  {
    id: "lll-3d-first-restart-gso",
    kicker: "3D example · Recompute and apply BR1",
    title: "The restart creates μ₂₁=3/5, so BR1 reduces again",
    description:
      "Recomputed data are ‖b̃₁‖²=5, ‖b̃₂‖²=36/5, ‖b̃₃‖²=4 and (μ₂₁,μ₃₁,μ₃₂)=(3/5,−1/5,−1/3). Since 3/5>1/2, BR1 sets b₂←b₂−b₁=(2,−2,0).",
    formula: "b₂←(3,0,0)−(1,2,0)=(2,−2,0)   ·   μ₂₁:3/5→−2/5",
    insight:
      "This is exactly why BR2 returns to BR1 after every swap.",
    scene: basisScene(afterSecondBR1, compactBounds, {
      prefix: "lll-second-br1",
      labels: ["b₁", "b₂←b₂−b₁", "b₃"],
      cellLabel: "second BR1 output · volume 12",
      previousBasis: afterFirstSwap,
      extraSegments: gsoSegments(firstRestartGso, "lll-second-br1-gso"),
      caption: {
        primary: "Restarted BR1",
        secondary: "μ₂₁: 3/5 → −2/5",
      },
    }),
  },
  {
    id: "lll-3d-second-order-test",
    kicker: "3D example · BR2 Step 3, i=1 then i=2",
    title: "The first pair passes, but the second pair fails",
    description:
      "For i=1, 8≥15/4. For i=2, however, ‖b̃₃+μ₃₂b̃₂‖²=24/5 is smaller than (3/4)‖b̃₂‖²=27/5.",
    formula: "i=1: 8≥15/4 ✓   ·   i=2: 24/5<27/5 ✗",
    insight:
      "BR2 therefore swaps b₂ and b₃ and restarts once more.",
    scene: basisScene(afterSecondBR1, compactBounds, {
      prefix: "lll-test-two",
      cellLabel: "condition (a) holds",
      extraSegments: gsoSegments(firstRestartGso, "lll-test-two-gso"),
      caption: {
        primary: "Second ordering violation",
        secondary: "the failure occurs at i=2",
      },
    }),
  },
  {
    id: "lll-3d-second-swap",
    kicker: "3D example · Second swap",
    title: "Interchange b₂ and b₃ and return to Step 1",
    description:
      "The new ordered basis is (1,2,0), (−1,0,2), (2,−2,0). It still generates the original determinant-12 lattice.",
    formula: "B′=[(1,2,0),(−1,0,2),(2,−2,0)]   ·   det(B′)=12",
    insight:
      "The point cloud does not move because the swap changes only the basis representation of the same lattice.",
    scene: basisScene(finalBasis, compactBounds, {
      prefix: "lll-second-swap",
      labels: ["b₁", "new b₂", "new b₃"],
      cellLabel: "second swap · volume 12",
      previousBasis: afterSecondBR1,
      caption: {
        primary: "Second adjacent swap",
        secondary: "same lattice · new ordering",
      },
    }),
  },
  {
    id: "lll-3d-final-gso",
    kicker: "3D example · Final BR1 call",
    title: "Recompute the final Gram–Schmidt data",
    description:
      "The final orthogonal vectors have squared lengths 5, 24/5, and 6. The multipliers are μ₂₁=−1/5, μ₃₁=−2/5, and μ₃₂=−1/2.",
    formula: "(B₁,B₂,B₃)=(5,24/5,6)   ·   (μ₂₁,μ₃₁,μ₃₂)=(−1/5,−2/5,−1/2)",
    insight:
      "Equality |μ₃₂|=1/2 is allowed, so BR1 performs no further size reduction.",
    scene: basisScene(finalBasis, compactBounds, {
      prefix: "lll-final-gso",
      cellLabel: "candidate reduced basis",
      extraSegments: gsoSegments(finalGso, "lll-final-gso-vectors"),
      caption: {
        primary: "Final Gram–Schmidt data",
        secondary: "condition (a) holds, including equality at 1/2",
      },
    }),
  },
  {
    id: "lll-3d-output",
    kicker: "3D example · BR2 Step 4",
    title: "Both ordering tests pass, so BR2 returns the basis",
    description:
      "For i=1, the left side is 5 and the threshold is 15/4. For i=2, the left side is 36/5 and the threshold is 18/5. Conditions (a) and (b) both hold.",
    formula: "i=1: 5≥15/4 ✓   ·   i=2: 36/5≥18/5 ✓",
    insight:
      "The output is reduced in the exact sense of Definition 103, not merely shorter-looking.",
    scene: basisScene(finalBasis, compactBounds, {
      prefix: "lll-output",
      labels: ["b₁=(1,2,0)", "b₂=(−1,0,2)", "b₃=(2,−2,0)"],
      cellLabel: "BR2 output · volume 12",
      extraSegments: gsoSegments(finalGso, "lll-output-gso"),
      caption: {
        primary: "Reduced basis returned by BR2",
        secondary: "all size and 3/4 conditions verified",
      },
    }),
  },
];

export const gramSchmidtLll3DExample: VisualizationExample = {
  id: "three-dimensional-gram-schmidt-lll",
  title: "3D example — complete BR1/BR2 execution",
  description:
    "Run the exact basis-reduction algorithm from the lecture notes in dimension three, including the nested BR1 order, two failed 3/4 tests, two swaps, and both mandatory restarts.",
  stages,
  proof: {
    title: "Why this is a complete execution of the script’s algorithm",
    steps: [
      "Step 1 computes the Gram–Schmidt orthogonalization and all multipliers for the current ordered basis.",
      "BR1 processes i=2,3 and, for each i, j=i−1,…,1. The displayed operations use the current updated vectors and nearest-integer rounding.",
      "After the first BR1 call, every |μᵢⱼ|≤1/2, but the i=1 ordering test fails because 5<27/4.",
      "The swap b₁↔b₂ forces a restart; recomputation gives μ₂₁=3/5, so BR1 must reduce once more.",
      "The next scan passes at i=1 and fails at i=2 because 24/5<27/5, causing the second adjacent swap and restart.",
      "For the final basis, all multipliers have absolute value at most 1/2 and the two ordering inequalities are 5≥15/4 and 36/5≥18/5.",
      "Every size reduction is unimodular and every swap has determinant −1, hence the lattice point set and absolute determinant 12 remain invariant throughout.",
    ],
  },
};
