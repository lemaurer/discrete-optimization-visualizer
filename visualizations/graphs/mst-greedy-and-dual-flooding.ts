import type {
  CirclePrimitive,
  LinePrimitive,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const MUTED = "#7d898b";
const AQUA = "#79c9c0";
const ORANGE = "#f28b45";
const ROSE = "#e27c89";

const viewport: Scene["viewport"] = {
  x: [0, 10],
  y: [0, 8],
};

const nodes = {
  A: [1.2, 5.8] as Point2D,
  B: [3.2, 6] as Point2D,
  C: [4.9, 4.2] as Point2D,
  D: [6.8, 5.9] as Point2D,
  E: [8.7, 4.5] as Point2D,
  F: [7.7, 1.8] as Point2D,
};

interface WeightedEdge {
  id: string;
  from: keyof typeof nodes;
  to: keyof typeof nodes;
  cost: number;
}

const edges: WeightedEdge[] = [
  { id: "AB", from: "A", to: "B", cost: 1 },
  { id: "EF", from: "E", to: "F", cost: 2 },
  { id: "BC", from: "B", to: "C", cost: 3 },
  { id: "AC", from: "A", to: "C", cost: 4 },
  { id: "CD", from: "C", to: "D", cost: 5 },
  { id: "DE", from: "D", to: "E", cost: 6 },
  { id: "BF", from: "B", to: "F", cost: 7 },
  { id: "CE", from: "C", to: "E", cost: 8 },
  { id: "BD", from: "B", to: "D", cost: 9 },
  { id: "AF", from: "A", to: "F", cost: 10 },
];

const nodePrimitives = (): Primitive[] =>
  Object.entries(nodes).map(([label, at]) => ({
    kind: "point",
    at,
    label,
    style: "graph-node",
  }));

interface GraphOptions {
  selected?: string[];
  rejected?: string[];
  focus?: string[];
  bubbles?: CirclePrimitive[];
  labels?: boolean;
  labelEdges?: string[];
}

const weightedGraph = ({
  selected = [],
  rejected = [],
  focus = [],
  bubbles = [],
  labels = true,
  labelEdges,
}: GraphOptions = {}): Primitive[] => {
  const selectedSet = new Set(selected);
  const rejectedSet = new Set(rejected);
  const focusSet = new Set(focus);
  const labelSet = labelEdges ? new Set(labelEdges) : null;

  const edgePrimitives: LinePrimitive[] = edges.map((edge, index) => {
    const isSelected = selectedSet.has(edge.id);
    const isRejected = rejectedSet.has(edge.id);
    const isFocused = focusSet.has(edge.id);
    return {
      kind: "line",
      from: nodes[edge.from],
      to: nodes[edge.to],
      label: labels && (!labelSet || labelSet.has(edge.id)) ? `${edge.id} · ${edge.cost}` : undefined,
      style: isRejected ? "graph-edge-rejected" : "graph-edge",
      color: isRejected ? ROSE : isFocused ? ORANGE : isSelected ? AQUA : MUTED,
      animate: isSelected || isRejected || isFocused,
      animationDelay: Math.min(0.78, index * 0.08),
    };
  });

  return [...bubbles, ...edgePrimitives, ...nodePrimitives()];
};

const bubble = (
  at: Point2D,
  radius: number,
  color: string,
  label?: string,
  animationDelay = 0,
): CirclePrimitive => ({
  kind: "circle",
  at,
  radius,
  color,
  label,
  style: "flood",
  animationDelay,
});

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints: [],
  showGrid: false,
  showAxes: false,
  showFeasibleRegion: false,
  caption: {
    label: "Weighted graph for MST",
    detail: "6 vertices · 10 candidate edges",
  },
  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "mst-greedy-and-dual-flooding",
  title: "MST: Greedy & Dual Flooding",
  shortTitle: "MST greedy & dual",
  chapter: "Graph algorithms",
  order: 2,
  description:
    "Run Kruskal on a weighted graph, then replay the same edge choices as a dual partition-flooding process and certify optimality.",
  difficulty: "Intermediate",
  duration: 15,
  accent: ORANGE,
  visualLabel: "MST process",
  insightLabel: "Primal-dual insight",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "mst-problem",
      kicker: "01 · Minimum spanning tree",
      title: "Connect every vertex as cheaply as possible",
      description:
        "A spanning tree uses every vertex, is connected, and contains no cycle. With six vertices it must contain exactly five edges.",
      formula: "min  Σₑ cₑxₑ   ·   T connected and acyclic   ·   |T|=|V|−1=5",
      insight: "The weights matter globally: five individually cheap edges are useful only if together they connect all vertices.",
      scene: scene({ primitives: weightedGraph() }),
    },
    {
      id: "kruskal-order",
      kicker: "02 · Kruskal's rule",
      title: "Inspect edges from cheapest to most expensive",
      description:
        "Kruskal maintains a forest. It accepts an edge exactly when its endpoints currently lie in different connected components.",
      formula: "AB₁ < EF₂ < BC₃ < AC₄ < CD₅ < DE₆ < BF₇ < CE₈ < BD₉ < AF₁₀",
      insight: "Union-Find is the data structure behind the test: different components means accept and merge.",
      scene: scene({
        caption: { label: "Kruskal edge order", detail: "ascending costs" },
        primitives: [
          ...weightedGraph(),
          { kind: "label", at: [1, 7.25], text: "scan weights from 1 → 10", tone: "accent" },
        ],
      }),
    },
    {
      id: "kruskal-first",
      kicker: "03 · First merge",
      title: "Take AB with cost 1",
      description:
        "A and B start in different singleton components, so AB cannot create a cycle. Add it and merge {A} with {B}.",
      formula: "T={AB}   ·   components: {AB},{C},{D},{E},{F}",
      insight: "Every accepted edge reduces the number of connected components by exactly one.",
      scene: scene({
        caption: { label: "Kruskal accepts AB", detail: "5 components remain" },
        primitives: weightedGraph({
          selected: ["AB"],
          focus: ["AB"],
          labelEdges: ["AB"],
        }),
      }),
    },
    {
      id: "kruskal-forest",
      kicker: "04 · Grow the forest",
      title: "Take EF with cost 2, then BC with cost 3",
      description:
        "EF creates a second two-vertex component. BC then joins C to the AB component, giving the forest {ABC} and {EF} plus singleton D.",
      formula: "T={AB,EF,BC}   ·   cost so far=1+2+3=6",
      insight: "The forest can grow in several places at once; Kruskal does not commit to a single root.",
      scene: scene({
        caption: { label: "Three accepted edges", detail: "3 components remain" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC"],
          focus: ["EF", "BC"],
          labelEdges: ["AB", "EF", "BC"],
        }),
      }),
    },
    {
      id: "kruskal-reject",
      kicker: "05 · Cycle test",
      title: "Reject AC with cost 4",
      description:
        "A and C are already connected by A−B−C. Adding AC would create the cycle A−B−C−A, so Kruskal skips it permanently.",
      formula: "A,C in the same component  ⇒  T∪{AC} contains a cycle",
      insight: "This rejection is the graphic-matroid independence test from the previous lesson.",
      scene: scene({
        caption: { label: "Kruskal rejects AC", detail: "cycle edge shown dashed" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC"],
          rejected: ["AC"],
          focus: ["AC"],
          labelEdges: ["AB", "EF", "BC", "AC"],
        }),
      }),
    },
    {
      id: "kruskal-finish",
      kicker: "06 · Greedy optimum",
      title: "CD and DE complete the MST",
      description:
        "CD merges D into ABC; DE then joins the remaining EF component. Five accepted edges now connect all six vertices without a cycle.",
      formula: "T={AB,EF,BC,CD,DE}   ·   c(T)=1+2+3+5+6=17",
      insight: "Kruskal returns a spanning tree of cost 17. The dual construction will prove that no cheaper tree exists.",
      scene: scene({
        caption: { label: "Minimum spanning tree", detail: "5 edges · total cost 17" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC", "CD", "DE"],
          rejected: ["AC"],
          focus: ["CD", "DE"],
          labelEdges: ["AB", "EF", "BC", "AC", "CD", "DE"],
        }),
      }),
    },
    {
      id: "partition-dual",
      kicker: "07 · Primal and dual",
      title: "Every partition needs crossing edges",
      description:
        "If a partition 𝒫 has k parts, every spanning tree must use at least k−1 edges crossing between parts. The dual assigns a nonnegative price y𝒫 to that requirement.",
      formula:
        "Primal: x(δ(𝒫))≥|𝒫|−1   ·   Dual: max Σ𝒫(|𝒫|−1)y𝒫,  Σ𝒫:e∈δ(𝒫)y𝒫≤cₑ",
      insight: "Each edge owns a budget cₑ. Flooding may charge that edge only while its endpoints lie in different current components.",
      scene: scene({
        caption: { label: "Partition relaxation and its dual", detail: "dual load never exceeds edge cost" },
        primitives: weightedGraph(),
      }),
    },
    {
      id: "flood-six",
      kicker: "08 · Flooding level 1",
      title: "Six singleton components rise together",
      description:
        "Start with partition 𝒫₀={{A},{B},{C},{D},{E},{F}}. Raise y𝒫₀ until the cheapest crossing edge AB becomes tight at level 1.",
      formula: "y𝒫₀=1   ·   load(AB)=1=cAB   ·   dual gain=(6−1)·1=5",
      insight: "Tight means the accumulated dual load has exactly filled the edge's cost budget.",
      scene: scene({
        caption: { label: "Initial dual flooding", detail: "AB is the first tight edge" },
        primitives: [
          ...weightedGraph({
            selected: ["AB"],
            focus: ["AB"],
            labelEdges: ["AB"],
          }),
          ...Object.values(nodes).map((at, index) =>
            bubble(at, 0.68, ORANGE, undefined, index * 0.08),
          ),
          { kind: "label", at: [1, 7.25], text: "six active singleton moats", tone: "accent" },
        ],
      }),
    },
    {
      id: "flood-three-components",
      kicker: "09 · Flooding levels 2–3",
      title: "The next tight edges reproduce Kruskal",
      description:
        "After AB merges, raise the new five-part partition by 1 until EF is tight. Raise the resulting four-part partition by 1 until BC is tight.",
      formula: "dual gains: (5−1)·1=4 and (4−1)·1=3   ·   cumulative value=12",
      insight: "The flooded component changes after each merge, but only edges crossing the new partition keep accumulating load.",
      scene: scene({
        caption: { label: "Three remaining components", detail: "{ABC}, {D}, and {EF}" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC"],
          focus: ["EF", "BC"],
          labelEdges: ["AB", "EF", "BC"],
          bubbles: [
            bubble([3.05, 5.25], 2.2, AQUA, "{ABC}", 0),
            bubble(nodes.D, 0.7, ORANGE, "{D}", 0.25),
            bubble([8.2, 3.15], 1.48, AQUA, "{EF}", 0.5),
          ],
        }),
      }),
    },
    {
      id: "flood-skip-cycle",
      kicker: "10 · Internal edges stop",
      title: "AC never becomes tight after ABC merges",
      description:
        "AC has accumulated load 3, below its cost 4. Once A and C share a component, AC no longer crosses the active partition, so its load freezes forever.",
      formula: "load(AC)=1+1+1=3<4   ·   raise y𝒫₃ by 2 until load(CD)=5",
      insight: "Dual flooding explains the cycle test numerically: internal edges stop receiving dual load and can be skipped.",
      scene: scene({
        caption: { label: "Flood until CD is tight", detail: "AC remains slack inside {ABC}" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC", "CD"],
          rejected: ["AC"],
          focus: ["CD", "AC"],
          labelEdges: ["AB", "EF", "BC", "AC", "CD"],
          bubbles: [
            bubble([3.05, 5.25], 2.2, ORANGE, "{ABC}", 0),
            bubble(nodes.D, 0.7, ORANGE, "{D}", 0.2),
            bubble([8.2, 3.15], 1.48, AQUA, "{EF}", 0.4),
          ],
        }),
      }),
    },
    {
      id: "flood-final-merge",
      kicker: "11 · Final dual level",
      title: "Two components rise until DE is tight",
      description:
        "After CD merges ABC with D, only {ABCD} and {EF} remain. Raise the two-part partition by 1; DE reaches load 6 and joins them.",
      formula: "dual gain=(2−1)·1=1   ·   total dual value=5+4+3+4+1=17",
      insight: "The last tight edge completes both the primal tree and the dual certificate.",
      scene: scene({
        caption: { label: "Final partition flood", detail: "DE becomes tight at cost 6" },
        primitives: weightedGraph({
          selected: ["AB", "EF", "BC", "CD", "DE"],
          rejected: ["AC"],
          focus: ["DE"],
          labelEdges: ["AB", "EF", "BC", "AC", "CD", "DE"],
          bubbles: [
            bubble([4.05, 5.05], 2.95, ORANGE, "{ABCD}", 0),
            bubble([8.2, 3.15], 1.48, AQUA, "{EF}", 0.35),
          ],
        }),
      }),
    },
    {
      id: "strong-duality",
      kicker: "12 · Optimality certificate",
      title: "Greedy cost equals the flooding bound",
      description:
        "The five chosen edges are tight, every dual edge constraint is feasible, and the primal and dual objectives both equal 17. Weak duality leaves no room for a cheaper tree.",
      formula: "dual value 17 ≤ OPT(MST) ≤ c(T)=17   ⇒   T is a minimum spanning tree",
      insight: "Kruskal and flooding are not two unrelated algorithms: one builds the primal tree while the other records why each merge is unavoidable.",
      scene: scene({
        caption: { label: "Primal-dual equality", detail: "MST cost = dual certificate = 17" },
        primitives: [
          ...weightedGraph({
            selected: ["AB", "EF", "BC", "CD", "DE"],
            rejected: ["AC"],
            labelEdges: ["AB", "EF", "BC", "AC", "CD", "DE"],
          }),
          {
            kind: "polygon",
            points: [
              [0.55, 4.75],
              [0.65, 6.65],
              [2.7, 7.05],
              [6.9, 6.9],
              [9.4, 5.2],
              [8.8, 1],
              [7, 0.65],
              [3.5, 1.15],
            ],
            style: "component",
          },
          {
            kind: "label",
            at: [3.5, 6.72],
            text: "one connected component",
            tone: "accent",
          },
        ],
      }),
    },
  ],
  proof: {
    title: "Why does partition flooding certify Kruskal?",
    steps: [
      "For every partition 𝒫 into k parts, any spanning tree must cross between parts at least k−1 times, giving the primal inequality x(δ(𝒫))≥k−1.",
      "The dual variable y𝒫 earns k−1 units per unit of growth, while every crossing edge pays one unit of its budget cₑ.",
      "Raise only the current component partition. The next budget to become tight belongs to the cheapest edge joining two distinct components, exactly Kruskal's next edge.",
      "After a merge, internal edges stop crossing later partitions. This is the dual explanation for rejecting cycle edges such as AC.",
      "The constructed dual has value 17 and the resulting tree costs 17. By weak duality, both are optimal.",
    ],
  },
};

export default visualization;
