import type {
  LinePrimitive,
  Point2D,
  PolygonPrimitive,
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
  s: [0.9, 4] as Point2D,
  a: [3, 6.2] as Point2D,
  b: [3, 1.8] as Point2D,
  d: [5.55, 1.8] as Point2D,
  c: [7, 6.2] as Point2D,
  t: [9.25, 4] as Point2D,
};

type NodeName = keyof typeof nodes;

interface NetworkArc {
  id: string;
  from: NodeName;
  to: NodeName;
  capacity: number;
}

const arcs: NetworkArc[] = [
  { id: "sa", from: "s", to: "a", capacity: 16 },
  { id: "sb", from: "s", to: "b", capacity: 13 },
  { id: "ab", from: "a", to: "b", capacity: 10 },
  { id: "ac", from: "a", to: "c", capacity: 12 },
  { id: "cb", from: "c", to: "b", capacity: 9 },
  { id: "bd", from: "b", to: "d", capacity: 14 },
  { id: "dc", from: "d", to: "c", capacity: 7 },
  { id: "ct", from: "c", to: "t", capacity: 20 },
  { id: "dt", from: "d", to: "t", capacity: 4 },
];

type Flow = Partial<Record<NetworkArc["id"], number>>;

const zeroFlow: Flow = {};
const firstFlow: Flow = { sa: 12, ac: 12, ct: 12 };
const secondFlow: Flow = { sa: 12, sb: 4, ac: 12, bd: 4, ct: 12, dt: 4 };
const maximumFlow: Flow = {
  sa: 12,
  sb: 11,
  ac: 12,
  bd: 11,
  dc: 7,
  ct: 19,
  dt: 4,
};

const cutArcIds = new Set(["ac", "dc", "dt"]);
const reachableNodes = new Set<NodeName>(["s", "a", "b", "d"]);

interface NetworkOptions {
  flow?: Flow;
  focus?: string[];
  cut?: boolean;
  labels?: "capacity" | "flow" | "residual";
  labelEdges?: string[];
  activeNodes?: Set<NodeName>;
  potentials?: boolean;
}

function arcLabel(
  arc: NetworkArc,
  flow: Flow,
  mode: NetworkOptions["labels"],
) {
  const value = flow[arc.id] ?? 0;
  if (mode === "flow") return `${value}/${arc.capacity}`;
  if (mode === "residual") return `r=${arc.capacity - value}`;
  return `u=${arc.capacity}`;
}

function networkPrimitives({
  flow = zeroFlow,
  focus = [],
  cut = false,
  labels = "capacity",
  labelEdges,
  activeNodes = new Set<NodeName>(),
  potentials = false,
}: NetworkOptions = {}): Primitive[] {
  const focusSet = new Set(focus);
  const labelSet = labelEdges ? new Set(labelEdges) : null;

  const edgePrimitives: LinePrimitive[] = arcs.map((arc, index) => {
    const value = flow[arc.id] ?? 0;
    const isCutArc = cut && cutArcIds.has(arc.id);
    const isFocused = focusSet.has(arc.id);
    return {
      kind: "line",
      from: nodes[arc.from],
      to: nodes[arc.to],
      label:
        !labelSet || labelSet.has(arc.id)
          ? arcLabel(arc, flow, labels)
          : undefined,
      style: "graph-arc",
      color: isCutArc ? ROSE : isFocused ? ORANGE : value > 0 ? AQUA : MUTED,
      animate: isCutArc || isFocused || value > 0,
      animationDelay: Math.min(0.78, index * 0.07),
    };
  });

  const nodePrimitives: Primitive[] = Object.entries(nodes).map(([label, at]) => {
    const name = label as NodeName;
    const potential = reachableNodes.has(name) ? 1 : 0;
    return {
      kind: "point",
      at,
      label: potentials ? `${label} · p=${potential}` : label,
      style: activeNodes.has(name) ? "graph-node-active" : "graph-node",
    };
  });

  return [...edgePrimitives, ...nodePrimitives];
}

const cutRegion: PolygonPrimitive = {
  kind: "polygon",
  points: [
    [0.25, 0.65],
    [0.25, 7.35],
    [6.1, 7.35],
    [6.1, 0.65],
  ],
  label: "S = {s,a,b,d}",
  style: "component",
};

const cutBoundary: LinePrimitive = {
  kind: "line",
  from: [6.1, 0.65],
  to: [6.1, 7.35],
  label: "cut (S,V∖S)",
  style: "cut",
  color: ROSE,
  animate: true,
};

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints: [],
  showGrid: false,
  showAxes: false,
  showFeasibleRegion: false,
  caption: {
    label: "Capacitated s–t network",
    detail: "arc labels show capacity u",
  },
  ...overrides,
});

const visualization: VisualizationDefinition = {
  id: "max-flow-min-cut-primal-dual",
  title: "Max-Flow Min-Cut: The Primal-Dual Proof",
  shortTitle: "Max-flow min-cut",
  chapter: "Graph algorithms",
  order: 3,
  description:
    "Build a maximum flow with residual augmentations, then read a minimum cut from reachability and watch primal and dual objectives meet at 23.",
  difficulty: "Intermediate",
  duration: 16,
  accent: AQUA,
  visualLabel: "Flow and residual network",
  insightLabel: "Primal-dual certificate",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "theorem",
      kicker: "01 · The theorem",
      title: "The most flow equals the cheapest separating cut",
      description:
        "Every arc (v,w) has capacity uᵥw. A feasible s–t flow respects capacities and conserves flow at every internal vertex.",
      formula: "max {|f| : 0≤f≤u, flow conservation} = min {u(δ⁺(S)) : s∈S, t∉S}",
      insight:
        "The left side constructs a primal object; the right side is a dual certificate that no flow can be larger.",
      scene: scene({ primitives: networkPrimitives() }),
    },
    {
      id: "primal-dual-lps",
      kicker: "02 · Primal and dual",
      title: "Flow variables push; dual potentials separate",
      description:
        "The primal chooses arc flows and a value F. The dual assigns vertex potentials p and nonnegative arc prices z; a unit potential drop from s to t must be paid for by arcs.",
      formula:
        "(P) max F, 0≤fₑ≤uₑ, Af=F(eₛ−eₜ)  ·  (D) min Σₑuₑzₑ, zᵥw≥pᵥ−p_w, pₛ−pₜ≥1",
      insight:
        "A cut is a 0–1 dual solution: p=1 on S, p=0 outside, and z=1 exactly on arcs leaving S.",
      scene: scene({
        caption: { label: "A dual cut", detail: "p=1 on S · p=0 on V∖S" },
        primitives: [
          cutRegion,
          cutBoundary,
          ...networkPrimitives({ cut: true, potentials: true, labelEdges: ["ac", "dc", "dt"] }),
        ],
      }),
    },
    {
      id: "weak-duality",
      kicker: "03 · Weak duality",
      title: "Every cut upper-bounds every flow",
      description:
        "Net flow out of any set S containing s but not t equals the flow value. Incoming cut flow is nonnegative, while outgoing flow cannot exceed outgoing capacity.",
      formula: "|f| = f(δ⁺(S))−f(δ⁻(S)) ≤ f(δ⁺(S)) ≤ u(δ⁺(S))",
      insight:
        "For the highlighted cut, u(δ⁺(S))=u_ac+u_dc+u_dt=12+7+4=23. So OPT≤23 before we find the optimum flow.",
      scene: scene({
        caption: { label: "Dual upper bound", detail: "cut capacity 12+7+4=23" },
        primitives: [
          cutRegion,
          cutBoundary,
          ...networkPrimitives({ cut: true, labelEdges: ["ac", "dc", "dt", "cb"] }),
        ],
      }),
    },
    {
      id: "residual-network",
      kicker: "04 · Primal algorithm",
      title: "Residual capacity records every legal change",
      description:
        "Start with zero flow. A forward residual arc can add uᵥw−fᵥw units; a backward residual arc can cancel fᵥw units. Any residual s–t path permits an augmentation.",
      formula: "r_f(v,w)=uᵥw−fᵥw   ·   r_f(w,v)=fᵥw   ·   Δ=min {r_f(e):e∈P}",
      insight:
        "Backward residual arcs make an early routing reversible, which is why augmenting paths can repair previous choices.",
      scene: scene({
        caption: { label: "Residual network at f=0", detail: "forward residual equals capacity" },
        primitives: networkPrimitives({ labels: "residual" }),
      }),
    },
    {
      id: "augment-one",
      kicker: "05 · Augmentation 1",
      title: "Send 12 along s→a→c→t",
      description:
        "The bottleneck is a→c with capacity 12. Increasing all three path arcs by 12 preserves conservation and raises the primal objective from 0 to 12.",
      formula: "P₁=s→a→c→t   ·   Δ₁=min{16,12,20}=12   ·   |f|=12",
      insight: "The saturated arc a→c will later become part of the minimum cut.",
      scene: scene({
        caption: { label: "First augmenting path", detail: "flow/capacity · value 12" },
        primitives: networkPrimitives({
          flow: firstFlow,
          focus: ["sa", "ac", "ct"],
          labels: "flow",
          labelEdges: ["sa", "ac", "ct"],
        }),
      }),
    },
    {
      id: "augment-two",
      kicker: "06 · Augmentation 2",
      title: "Send 4 along s→b→d→t",
      description:
        "The direct lower route is limited by d→t. Augmenting by four gives a feasible flow of value 16.",
      formula: "P₂=s→b→d→t   ·   Δ₂=min{13,14,4}=4   ·   |f|=12+4=16",
      insight:
        "A saturated sink arc does not end the algorithm while another residual s–t path still exists.",
      scene: scene({
        caption: { label: "Second augmenting path", detail: "flow/capacity · value 16" },
        primitives: networkPrimitives({
          flow: secondFlow,
          focus: ["sb", "bd", "dt"],
          labels: "flow",
          labelEdges: ["sa", "sb", "ac", "bd", "ct", "dt"],
        }),
      }),
    },
    {
      id: "augment-three",
      kicker: "07 · Augmentation 3",
      title: "The residual path through d→c adds seven",
      description:
        "The path s→b→d→c→t has residual capacities 9, 10, 7, and 8. Its bottleneck is d→c, so the flow value reaches 23.",
      formula: "P₃=s→b→d→c→t   ·   Δ₃=min{9,10,7,8}=7   ·   |f|=23",
      insight:
        "We now match the dual upper bound 23, but the residual graph explains where the optimal cut comes from.",
      scene: scene({
        caption: { label: "Third augmenting path", detail: "flow/capacity · value 23" },
        primitives: networkPrimitives({
          flow: maximumFlow,
          focus: ["sb", "bd", "dc", "ct"],
          labels: "flow",
          labelEdges: ["sa", "sb", "ac", "bd", "dc", "ct", "dt"],
        }),
      }),
    },
    {
      id: "reachable-set",
      kicker: "08 · No augmenting path",
      title: "Residual reachability stops at a saturated barrier",
      description:
        "From s, positive residual arcs reach a, b, and d, but no arc with residual capacity crosses from this set to c or t. Thus S={s,a,b,d} and t∉S.",
      formula: "S=Reach_Gf(s)={s,a,b,d}   ·   r_f(ac)=r_f(dc)=r_f(dt)=0",
      insight:
        "If t were reachable, its path would augment the flow. Non-reachability therefore constructs the dual cut automatically.",
      scene: scene({
        caption: { label: "Terminal residual graph", detail: "reachable S highlighted" },
        primitives: [
          cutRegion,
          ...networkPrimitives({
            flow: maximumFlow,
            labels: "residual",
            labelEdges: ["sa", "sb", "ab", "bd", "ac", "dc", "dt"],
            activeNodes: reachableNodes,
          }),
        ],
      }),
    },
    {
      id: "cut-from-residual",
      kicker: "09 · Dual certificate",
      title: "The residual barrier is a minimum cut",
      description:
        "Every arc leaving S is saturated. Every arc entering S has zero flow; otherwise its backward residual arc would make its tail reachable too.",
      formula: "f(δ⁺(S))=u(δ⁺(S))=12+7+4=23   ·   f(δ⁻(S))=f_cb=0",
      insight:
        "This is the complementary-slackness picture: positive cut prices sit on saturated primal arcs.",
      scene: scene({
        caption: { label: "Cut extracted from reachability", detail: "three saturated outgoing arcs" },
        primitives: [
          cutRegion,
          cutBoundary,
          ...networkPrimitives({
            flow: maximumFlow,
            cut: true,
            labels: "flow",
            labelEdges: ["ac", "dc", "dt", "cb"],
            activeNodes: reachableNodes,
          }),
        ],
      }),
    },
    {
      id: "primal-dual-equality",
      kicker: "10 · Strong duality",
      title: "Primal value and dual value meet at 23",
      description:
        "The constructed flow is primal feasible and the reachable-set cut is dual feasible. Weak duality and equal objective values prove that both are optimal.",
      formula: "23=|f| ≤ max-flow ≤ min-cut ≤ u(δ⁺(S))=23",
      insight: "Therefore max-flow=min-cut=23; no separate optimality guess or enumeration is needed.",
      scene: scene({
        caption: { label: "Optimal primal-dual pair", detail: "flow value = cut capacity = 23" },
        primitives: [
          cutRegion,
          cutBoundary,
          ...networkPrimitives({
            flow: maximumFlow,
            cut: true,
            labels: "flow",
            labelEdges: ["sa", "sb", "ac", "bd", "dc", "ct", "dt"],
            activeNodes: reachableNodes,
          }),
          { kind: "label", at: [5, 7.65], text: "PRIMAL 23 = DUAL 23", tone: "accent" },
        ],
      }),
    },
    {
      id: "dual-variables",
      kicker: "11 · LP certificate",
      title: "The cut is an explicit feasible dual solution",
      description:
        "Set p=1 on residual-reachable vertices and p=0 elsewhere. Set z=1 on arcs crossing from potential 1 to 0 and z=0 on all other arcs.",
      formula: "z_ac=z_dc=z_dt=1, all other zₑ=0   ·   Σₑuₑzₑ=12+7+4=23",
      insight:
        "The algorithm has produced the optimal primal flow and the optimal LP-dual certificate in the same final state.",
      scene: scene({
        caption: { label: "Explicit dual solution", detail: "p separates s from t · z prices the cut" },
        primitives: [
          cutRegion,
          cutBoundary,
          ...networkPrimitives({
            flow: maximumFlow,
            cut: true,
            potentials: true,
            labelEdges: ["ac", "dc", "dt"],
            activeNodes: reachableNodes,
          }),
        ],
      }),
    },
  ],
  proof: {
    title: "Why does the residual graph prove max-flow=min-cut?",
    steps: [
      "For every feasible flow f and every s–t cut S, flow conservation gives |f|=f(δ⁺(S))−f(δ⁻(S))≤u(δ⁺(S)). This is weak duality.",
      "While the residual graph contains an s–t path, augment by the path's smallest residual capacity. Feasibility and conservation are preserved while |f| increases.",
      "When no augmenting path remains, let S be the vertices reachable from s by positive-residual arcs. Then s∈S and t∉S.",
      "Every arc from S to V∖S is saturated; otherwise it would be a positive forward residual arc. Every arc entering S carries zero flow; otherwise its reverse residual arc would leave S.",
      "Consequently |f|=f(δ⁺(S))−f(δ⁻(S))=u(δ⁺(S)). A primal flow and dual cut have equal values, so both are optimal.",
      "For the LP dual, choose p=1 on S and p=0 outside, with z=1 exactly on δ⁺(S). Its objective is the cut capacity, making the certificate explicit.",
    ],
  },
};

export default visualization;
