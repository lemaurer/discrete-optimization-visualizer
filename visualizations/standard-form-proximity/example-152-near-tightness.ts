import type { Point2D, Primitive } from "@/engine/types";
import type { VisualizationDefinition, VisualizationExample, VisualizationStage } from "@/visualizations/types";
import {
  PROXIMITY_COLORS as C,
  label2D,
  line2D,
  point2D,
  scene2D,
} from "@/visualizations/helpers/standard-form-proximity-scenes";

function familyStages(a: number): VisualizationStage[] {
  const A1 = a + 1;
  const A2 = a;
  const b = a * a;
  const lpX = b / A1;
  const ipY = a;
  const delta = A1;
  const distance = lpX + ipY;
  const theoremBound = 2 * delta + 1;
  const lowerScale = 2 * delta - 3;

  const base = (extra: Primitive[], secondary: string) =>
    scene2D(
      [
        line2D([0, ipY], [lpX, 0], `${A1}x+${A2}y=${b}`, C.aqua, "constraint"),
        point2D([lpX,0], `LP x*=(${lpX.toFixed(3)},0)`, "fractional"),
        point2D([0,ipY], `IP z*=(0,${ipY})`, "optimum"),
        ...extra,
      ],
      { primary: `Example 152 · a=${a}`, secondary },
      { viewport: { x: [-0.6, Math.max(lpX, ipY)+1], y: [-0.6, ipY+1] }, objective: { vector: [A1+0.2,A2], label: "c=(a+1+ε,a)" } },
    );

  return [
    {
      id: `ex152-a${a}-instance`,
      kicker: "Chapter 25 · Example 152",
      title: "The m=1 proximity bound is already tight up to a constant in two variables",
      description:
        `Take ε∈(0,1), A=[${A1} ${A2}], b=${b}. Along the LP segment, the slightly larger profit per unit of x makes the x-axis endpoint the unique LP optimum, while divisibility forces the unique integer optimum to the y-axis endpoint.`,
      formula: `(x*,y*)=(${a}-1+1/${A1},0),   z*=(0,${a})`,
      insight: "The source example is intrinsically two-variable; the selector varies a rather than inventing a fake three-dimensional version.",
      scene: base([], "Both optima lie on the same standard-form equality, but arithmetic separates them."),
    },
    {
      id: `ex152-a${a}-integer-feasibility`,
      kicker: "Why the integer optimum is forced",
      title: "Modulo arithmetic rules out every positive integer x",
      description:
        `The equality is ${A1}x+${A2}y=${a}². Modulo ${a}, it gives x≡0 (mod ${a}). Nonnegativity and ${A1}x≤${a}² imply x<${a}, hence x=0 and y=${a}.`,
      formula: `${A1}x+${A2}y=${b} ⇒ x≡0 (mod ${a}) ⇒ x=0, y=${a}`,
      insight: "The distance gap is not caused by a loose drawing; it comes from the arithmetic of the equality lattice.",
      scene: base([
        ...Array.from({ length: Math.floor(lpX)+1 }, (_, x) => point2D([x, (b-A1*x)/A2], x===0 ? "only integral feasible endpoint" : undefined, x===0 ? "optimum" : "lattice")),
      ], "Integer x-values on the segment fail to give integral y except at x=0."),
    },
    {
      id: `ex152-a${a}-distance`,
      kicker: "Near-tightness calculation",
      title: "The L1 distance grows like 2Δ",
      description:
        `Here Δ=a+1=${delta}. The actual distance is ${distance.toFixed(3)}, while the theorem gives 2Δ+1=${theoremBound}. The notes lower-bound the family by 2Δ−3=${lowerScale}.`,
      formula: `∥x*−z*∥₁=${a}-1+1/${A1}+${a} ≥ 2${a}−1 = 2Δ−3`,
      insight: "Thus the linear dependence on Δ in the m=1 specialization cannot be improved to sublinear order.",
      scene: base([
        line2D([lpX,0],[0,0], `|Δx|=${lpX.toFixed(3)}`, C.orange),
        line2D([0,0],[0,ipY], `|Δy|=${ipY}`, C.violet),
        label2D([Math.min(lpX,ipY)*0.25, ipY*0.55], `L1=${distance.toFixed(3)}`, "accent"),
      ], "The axis-aligned path displays the two contributions to the L1 norm."),
    },
  ];
}

const examples: VisualizationExample[] = [
  { id: "ex152-a3", title: "a=3 · Δ=4", stages: familyStages(3) },
  { id: "ex152-a5", title: "a=5 · Δ=6", stages: familyStages(5) },
];

const stages = familyStages(3);

const visualization: VisualizationDefinition = {
  id: "example-152-near-tightness",
  title: "Example 152 — Near-Tightness of Standard-Form Proximity",
  shortTitle: "Near-tightness · Example 152",
  chapter: "Standard-form proximity",
  order: 3,
  description:
    "Visualizes the two-variable family showing that Theorem 150's m=1 dependence on Δ is best possible up to constants, including the exact LP optimum, modular argument for the integer optimum, and L1-distance calculation.",
  difficulty: "Intermediate",
  duration: 9,
  accent: C.orange,
  visualLabel: "Arithmetic gap geometry",
  insightLabel: "Tightness",
  controls: { grid: true, lattice: true, vertices: false, labels: true },
  stages,
  examples,
};

export default visualization;
