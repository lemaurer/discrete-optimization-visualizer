import baseVisualization from "./gram-schmidt-lll-reduction-base";
import type { VisualizationDefinition } from "@/visualizations/types";

const stages = baseVisualization.stages.map((stage) => {
  if (stage.id === "adapted-data") {
    return {
      ...stage,
      kicker: "03 · BR2 Step 1",
      title: "Compute the Gram–Schmidt data used by BR1 and BR2",
      description:
        "The script computes the Gram–Schmidt orthogonalization and the multipliers μᵢⱼ. In dimension two the state is b̃₁, b̃₂ and μ₂₁.",
      formula: "b̃₁=b₁, b̃₂=b₂−μ₂₁b̃₁, μ₂₁=27/37",
      insight:
        "These are exactly the quantities appearing in Definition 103 and in Algorithms BR1 and BR2.",
    };
  }

  if (stage.id === "adapted-swap-update") {
    return {
      ...stage,
      kicker: "08 · Return to BR2 Step 1",
      title: "After the swap, recompute Gram–Schmidt as prescribed in the script",
      description:
        "BR2 does not continue with the old Gram–Schmidt data. It returns to Step 1 and recomputes the orthogonalization and all multipliers for the swapped basis.",
      formula: "B₁=8, B₂=49/2, μ₂₁=−5/4",
      insight:
        "The displayed values agree with direct recomputation. The following BR1 call must size-reduce the new coefficient because |−5/4|>1/2.",
    };
  }

  if (stage.id === "algorithm-loop") {
    return {
      ...stage,
      kicker: "12 · Algorithm BR2",
      title: "Compute GSO, apply BR1, test adjacent pairs, and restart after a swap",
      description:
        "Step 1 computes Gram–Schmidt. Step 2 applies BR1 to enforce |μᵢⱼ|≤1/2 for every j<i. Step 3 scans i=1,…,n−1; if condition (b) fails, swap bᵢ and bᵢ₊₁ and return to Step 1. Otherwise Step 4 returns the basis.",
      formula:
        "GSO → BR1 → test ‖b̃ᵢ₊₁+μᵢ₊₁,ᵢb̃ᵢ‖²≥¾‖b̃ᵢ‖² → swap & restart or return",
      insight:
        "This is the BR2 control flow used in the lecture notes, rather than the common index-based implementation of LLL.",
    };
  }

  return stage;
});

const visualization: VisualizationDefinition = {
  ...baseVisualization,
  title: "Reduced Bases: Algorithms BR1 and BR2",
  shortTitle: "BR1 & BR2",
  description:
    "Follow the exact basis-reduction algorithm from the lecture notes: Gram–Schmidt, BR1 size reduction, the 3/4 ordering test, swaps, and restarts.",
  stages,
  proof: {
    title: "Why Algorithms BR1 and BR2 return a reduced basis",
    steps: [
      "BR1 visits i=2,…,n and j=i−1,…,1. Whenever |μᵢⱼ|>1/2, it replaces bᵢ by bᵢ−⌊μᵢⱼ⌉bⱼ and recomputes Gram–Schmidt.",
      "Each replacement is an integer unimodular column operation, so the lattice and |det B| stay unchanged.",
      "BR1 terminates with |μᵢⱼ|≤1/2 for every j<i, which is condition (a) of Definition 103.",
      "BR2 then tests condition (b): ‖b̃ᵢ₊₁+μᵢ₊₁,ᵢb̃ᵢ‖²≥(3/4)‖b̃ᵢ‖² for every adjacent pair.",
      "If a test fails, BR2 swaps the corresponding adjacent basis vectors and returns to Step 1, because the swap can destroy condition (a).",
      "BR1 leaves the potential F unchanged, whereas every swap caused by a failed test decreases F by a factor below 3/4. Since F is a positive integer, only finitely many swaps occur.",
    ],
  },
};

export default visualization;
