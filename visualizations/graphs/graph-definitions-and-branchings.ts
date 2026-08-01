import type { LinePrimitive, Point2D, Primitive, Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

const MUTED = "#7d898b";
const AQUA = "#79c9c0";
const ORANGE = "#f28b45";
const ROSE = "#e27c89";

const viewport: Scene["viewport"] = {
  x: [0, 10],
  y: [0, 8],
};

const graphNode = (
  at: Point2D,
  label: string,
  style: "graph-node" | "graph-node-active" | "graph-node-invalid" = "graph-node",
): Primitive => ({ kind: "point", at, label, style });

const graphLine = (
  from: Point2D,
  to: Point2D,
  options: Partial<LinePrimitive> = {},
): LinePrimitive => ({
  kind: "line",
  from,
  to,
  style: "graph-edge",
  color: MUTED,
  ...options,
});

const scene = (overrides: Partial<Scene> = {}): Scene => ({
  viewport,
  constraints: [],
  showGrid: false,
  showAxes: false,
  showFeasibleRegion: false,
  caption: {
    label: "Graph vocabulary",
    detail: "nodes, edges, and arcs",
  },
  ...overrides,
});

const squareNodes = {
  a: [1.5, 5.8] as Point2D,
  d: [6.2, 5.8] as Point2D,
  c: [6.2, 2] as Point2D,
  b: [8.6, 3.8] as Point2D,
};

const visualization: VisualizationDefinition = {
  id: "graph-definitions-and-branchings",
  title: "Graph Definitions & Branchings",
  shortTitle: "Graphs & branchings",
  chapter: "Graph algorithms",
  order: 1,
  description:
    "Build the graph vocabulary used in discrete optimization, then combine indegree and acyclicity into a branching and watch ordinary greedy fail.",
  difficulty: "Foundation",
  duration: 16,
  accent: AQUA,
  visualLabel: "Graph explorer",
  insightLabel: "Combinatorial insight",
  controls: {
    constraints: false,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages: [
    {
      id: "graph-digraph",
      kicker: "01 · Graph anatomy",
      title: "Edges are unordered; arcs have direction",
      description:
        "An undirected graph G=(V,E) stores pairs {u,v}. A digraph D=(V,A) stores ordered pairs (u,v), so reversing an arc produces a different object.",
      formula: "edge {u,v} = {v,u}   ·   arc (u,v) ≠ (v,u)",
      insight: "Direction changes which endpoint receives an arc and is essential for flows and branchings.",
      scene: scene({
        caption: { label: "Graph versus digraph", detail: "E: edges · A: arcs" },
        primitives: [
          graphLine([1.2, 5.8], [4.1, 5.8], { animationDelay: 0 }),
          graphLine([4.1, 5.8], [2.65, 3.2], { animationDelay: 0.2 }),
          graphLine([2.65, 3.2], [1.2, 5.8], { animationDelay: 0.4 }),
          graphNode([1.2, 5.8], "u"),
          graphNode([4.1, 5.8], "v"),
          graphNode([2.65, 3.2], "w"),
          graphLine([5.9, 5.8], [8.8, 5.8], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0,
          }),
          graphLine([8.8, 5.8], [7.35, 3.2], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.2,
          }),
          graphLine([7.35, 3.2], [5.9, 5.8], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.4,
          }),
          graphNode([5.9, 5.8], "u"),
          graphNode([8.8, 5.8], "v"),
          graphNode([7.35, 3.2], "w"),
          { kind: "label", at: [1.15, 7.1], text: "G=(V,E) · undirected", tone: "default" },
          { kind: "label", at: [5.85, 7.1], text: "D=(V,A) · directed", tone: "accent" },
        ],
      }),
    },
    {
      id: "incidence",
      kicker: "02 · Incidence",
      title: "Separate incoming from outgoing arcs",
      description:
        "For a vertex v, δ⁻(v) contains every arc ending at v and δ⁺(v) every arc starting at v. The superscript describes the direction at v.",
      formula: "δ⁻(v)={(u,v)∈A}   ·   δ⁺(v)={(v,w)∈A}",
      insight: "The branching rule will cap the selected incoming set δ⁻(v) at one arc.",
      scene: scene({
        caption: { label: "Incoming and outgoing incidence", detail: "focus vertex v" },
        primitives: [
          graphLine([1.5, 6.2], [5, 4], {
            style: "graph-arc",
            color: ORANGE,
            label: "incoming",
            animationDelay: 0,
          }),
          graphLine([1.5, 1.8], [5, 4], {
            style: "graph-arc",
            color: ORANGE,
            animationDelay: 0.15,
          }),
          graphLine([5, 4], [8.5, 6.2], {
            style: "graph-arc",
            color: AQUA,
            label: "outgoing",
            animationDelay: 0.35,
          }),
          graphLine([5, 4], [8.5, 1.8], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.5,
          }),
          graphNode([1.5, 6.2], "u₁"),
          graphNode([1.5, 1.8], "u₂"),
          graphNode([5, 4], "v", "graph-node-active"),
          graphNode([8.5, 6.2], "w₁"),
          graphNode([8.5, 1.8], "w₂"),
          { kind: "label", at: [1.1, 7.2], text: "δ⁻(v)", tone: "accent" },
          { kind: "label", at: [8, 7.2], text: "δ⁺(v)", tone: "accent" },
        ],
      }),
    },
    {
      id: "path-cycle",
      kicker: "03 · Paths and cycles",
      title: "A path advances; a cycle returns",
      description:
        "A path visits a sequence of distinct vertices through adjacent edges or arcs. Adding a connection back to the start closes a cycle.",
      formula: "path: v₁→v₂→⋯→vₖ   ·   cycle: path + (vₖ,v₁)",
      insight: "Acyclic edge sets are forests. Branchings inherit exactly this rule after directions are forgotten.",
      scene: scene({
        caption: { label: "Path becoming a cycle", detail: "the rose arc closes the loop" },
        primitives: [
          graphLine([1.4, 4], [3.8, 6.2], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0,
          }),
          graphLine([3.8, 6.2], [7.2, 5.8], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.2,
          }),
          graphLine([7.2, 5.8], [8.4, 2.5], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.4,
          }),
          graphLine([8.4, 2.5], [1.4, 4], {
            style: "graph-rejected",
            color: ROSE,
            label: "closes a cycle",
            animationDelay: 0.7,
          }),
          graphNode([1.4, 4], "v₁"),
          graphNode([3.8, 6.2], "v₂"),
          graphNode([7.2, 5.8], "v₃"),
          graphNode([8.4, 2.5], "v₄"),
        ],
      }),
    },
    {
      id: "stable-matching",
      kicker: "04 · Selection structures",
      title: "Stable sets choose vertices; matchings choose edges",
      description:
        "A stable set contains no adjacent pair of vertices. A matching contains no pair of edges sharing an endpoint.",
      formula: "stable S: uv∈E ⇒ |{u,v}∩S|≤1   ·   matching M: |δ(v)∩M|≤1",
      insight: "Both are local conflict rules, but one selects vertices and the other selects edges.",
      scene: scene({
        caption: { label: "Stable set and matching", detail: "selected objects are highlighted" },
        primitives: [
          graphLine([1.1, 5.8], [4.2, 5.8]),
          graphLine([1.1, 5.8], [2.65, 3.1]),
          graphLine([4.2, 5.8], [2.65, 3.1]),
          graphNode([1.1, 5.8], "u∈S", "graph-node-active"),
          graphNode([4.2, 5.8], "v"),
          graphNode([2.65, 3.1], "w∈S", "graph-node-active"),
          graphLine([5.8, 6.2], [8.8, 6.2], { color: AQUA, animationDelay: 0 }),
          graphLine([5.8, 3], [8.8, 3], { color: AQUA, animationDelay: 0.25 }),
          graphLine([5.8, 6.2], [5.8, 3], { color: MUTED, animationDelay: 0.5 }),
          graphLine([8.8, 6.2], [8.8, 3], { color: MUTED, animationDelay: 0.65 }),
          graphNode([5.8, 6.2], "a"),
          graphNode([8.8, 6.2], "b"),
          graphNode([5.8, 3], "c"),
          graphNode([8.8, 3], "d"),
          { kind: "label", at: [1.05, 7.25], text: "stable vertices", tone: "accent" },
          { kind: "label", at: [5.75, 7.25], text: "matching edges", tone: "accent" },
        ],
      }),
    },
    {
      id: "forest-tree",
      kicker: "05 · Forests and trees",
      title: "A tree is a connected forest",
      description:
        "A forest is any undirected acyclic graph. A tree is a connected forest; a spanning tree reaches every vertex of G and has exactly |V|−1 edges.",
      formula: "forest = acyclic   ·   tree = connected forest   ·   spanning tree: |T|=|V|−1",
      insight: "The graphic matroid declares precisely the forests to be independent edge sets.",
      scene: scene({
        caption: { label: "A spanning tree inside a graph", detail: "4 selected edges on 5 vertices" },
        primitives: [
          graphLine([1.3, 4], [3.5, 6.2], { color: AQUA, animationDelay: 0 }),
          graphLine([3.5, 6.2], [6.4, 5.7], { color: AQUA, animationDelay: 0.2 }),
          graphLine([6.4, 5.7], [8.7, 3.8], { color: AQUA, animationDelay: 0.4 }),
          graphLine([6.4, 5.7], [4.6, 2], { color: AQUA, animationDelay: 0.6 }),
          graphLine([1.3, 4], [4.6, 2], { color: MUTED }),
          graphLine([4.6, 2], [8.7, 3.8], { color: MUTED }),
          graphNode([1.3, 4], "v₁"),
          graphNode([3.5, 6.2], "v₂"),
          graphNode([6.4, 5.7], "v₃"),
          graphNode([8.7, 3.8], "v₄"),
          graphNode([4.6, 2], "v₅"),
          { kind: "label", at: [3.5, 7.25], text: "selected edges form a spanning tree", tone: "accent" },
        ],
      }),
    },
    {
      id: "branching",
      kicker: "06 · Branching definition",
      title: "A branching satisfies two rules at once",
      description:
        "For T⊆A, forget every arc direction and require a forest. Then restore direction and require at most one selected incoming arc at every vertex.",
      formula: "T branching ⇔ (V,T) undirected is acyclic  and  |δ⁻(v)∩T|≤1  ∀v",
      insight: "A branching may have several roots and components; each non-root vertex has at most one parent.",
      scene: scene({
        caption: { label: "Valid branching", detail: "two rooted components" },
        primitives: [
          graphLine([1.3, 6.3], [3.4, 4.6], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0,
          }),
          graphLine([1.3, 6.3], [1.4, 2.5], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.18,
          }),
          graphLine([3.4, 4.6], [4.5, 2.1], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.36,
          }),
          graphLine([6.2, 6.1], [8.6, 4.7], {
            style: "graph-arc",
            color: ORANGE,
            animationDelay: 0.54,
          }),
          graphLine([8.6, 4.7], [7.4, 2.1], {
            style: "graph-arc",
            color: ORANGE,
            animationDelay: 0.72,
          }),
          graphNode([1.3, 6.3], "root r₁", "graph-node-active"),
          graphNode([3.4, 4.6], "a"),
          graphNode([1.4, 2.5], "b"),
          graphNode([4.5, 2.1], "c"),
          graphNode([6.2, 6.1], "root r₂", "graph-node-active"),
          graphNode([8.6, 4.7], "d"),
          graphNode([7.4, 2.1], "e"),
        ],
      }),
    },
    {
      id: "indegree-violation",
      kicker: "07 · Invalid branching I",
      title: "Two parents violate the indegree rule",
      description:
        "The underlying undirected edges can still be acyclic, yet the set is not a branching when two selected arcs enter the same vertex.",
      formula: "u→v, w→v ∈T  ⇒  |δ⁻(v)∩T|=2>1",
      insight: "This is the partition-matroid part of the definition: incoming arcs are grouped by their head vertex.",
      scene: scene({
        caption: { label: "Indegree violation", detail: "vertex v has two parents" },
        primitives: [
          graphLine([1.6, 6], [5, 3.6], {
            style: "graph-arc",
            color: ROSE,
            label: "parent 1",
            animationDelay: 0,
          }),
          graphLine([8.4, 6], [5, 3.6], {
            style: "graph-arc",
            color: ROSE,
            label: "parent 2",
            animationDelay: 0.45,
          }),
          graphLine([5, 3.6], [5, 1.2], {
            style: "graph-arc",
            color: MUTED,
            animationDelay: 0.7,
          }),
          graphNode([1.6, 6], "u"),
          graphNode([8.4, 6], "w"),
          graphNode([5, 3.6], "v · indegree 2", "graph-node-invalid"),
          graphNode([5, 1.2], "z"),
        ],
      }),
    },
    {
      id: "cycle-violation",
      kicker: "08 · Invalid branching II",
      title: "Indegree one does not prevent a cycle",
      description:
        "In a directed cycle every vertex has exactly one incoming arc, so the local rule passes. The underlying undirected graph still contains a cycle.",
      formula: "|δ⁻(v)∩T|=1  ∀v   but   v₁−v₂−v₃−v₁ is a cycle",
      insight: "This is why the graphic-matroid rule is independently necessary.",
      scene: scene({
        caption: { label: "Cycle violation", detail: "local indegrees pass, forest rule fails" },
        primitives: [
          graphLine([2, 5.8], [8, 5.8], {
            style: "graph-arc",
            color: ROSE,
            animationDelay: 0,
          }),
          graphLine([8, 5.8], [5, 1.6], {
            style: "graph-arc",
            color: ROSE,
            animationDelay: 0.3,
          }),
          graphLine([5, 1.6], [2, 5.8], {
            style: "graph-arc",
            color: ROSE,
            label: "cycle closes",
            animationDelay: 0.6,
          }),
          graphNode([2, 5.8], "v₁", "graph-node-invalid"),
          graphNode([8, 5.8], "v₂", "graph-node-invalid"),
          graphNode([5, 1.6], "v₃", "graph-node-invalid"),
        ],
      }),
    },
    {
      id: "matroid-intersection",
      kicker: "09 · Two independence systems",
      title: "Branchings live in a matroid intersection",
      description:
        "I₁ enforces at most one incoming arc per vertex and is a partition matroid. I₂ contains all arc sets whose undirected edges form a forest and is a graphic matroid.",
      formula: "branchings = I₁∩I₂   ·   I₁ partition matroid   ·   I₂ graphic matroid",
      insight: "Each rule alone is a matroid, but their intersection is generally not a matroid.",
      scene: scene({
        caption: { label: "Branching as an intersection", detail: "both checks must pass" },
        primitives: [
          graphLine([2.1, 6.2], [5, 4.2], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0,
          }),
          graphLine([5, 4.2], [8, 6.1], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.25,
          }),
          graphLine([5, 4.2], [5, 1.5], {
            style: "graph-arc",
            color: AQUA,
            animationDelay: 0.5,
          }),
          graphNode([2.1, 6.2], "root"),
          graphNode([5, 4.2], "v", "graph-node-active"),
          graphNode([8, 6.1], "w"),
          graphNode([5, 1.5], "z"),
          { kind: "label", at: [0.7, 7.25], text: "I₁ ✓ one incoming", tone: "accent" },
          { kind: "label", at: [6.2, 7.25], text: "I₂ ✓ no cycle", tone: "accent" },
          { kind: "label", at: [3.65, 0.65], text: "intersection ✓ branching", tone: "default" },
        ],
      }),
    },
    {
      id: "greedy-trap",
      kicker: "10 · Why ordinary greedy fails",
      title: "One heavy arc blocks two later choices",
      description:
        "Descending greedy first takes a→d of weight 3. It then rejects b→d by indegree, takes d→c, and rejects c→a because that would close a cycle.",
      formula: "greedy T={a→d,d→c}   ·   weight(T)=3+2=5",
      insight: "A locally best arc can consume one partition choice and later complete a graphic cycle.",
      scene: scene({
        caption: { label: "Greedy branching", detail: "solid selected · dashed rejected" },
        primitives: [
          graphLine(squareNodes.a, squareNodes.d, {
            style: "graph-arc",
            color: AQUA,
            label: "3 · take",
            animationDelay: 0,
          }),
          graphLine(squareNodes.b, squareNodes.d, {
            style: "graph-rejected",
            color: ROSE,
            label: "2 · indegree",
            animationDelay: 0.25,
          }),
          graphLine(squareNodes.d, squareNodes.c, {
            style: "graph-arc",
            color: AQUA,
            label: "2 · take",
            animationDelay: 0.5,
          }),
          graphLine(squareNodes.c, squareNodes.a, {
            style: "graph-rejected",
            color: ROSE,
            label: "2 · cycle",
            animationDelay: 0.75,
          }),
          graphNode(squareNodes.a, "a", "graph-node-active"),
          graphNode(squareNodes.b, "b"),
          graphNode(squareNodes.c, "c", "graph-node-active"),
          graphNode(squareNodes.d, "d", "graph-node-active"),
        ],
      }),
    },
    {
      id: "optimal-branching",
      kicker: "11 · Better global choice",
      title: "Three medium arcs form the better branching",
      description:
        "Skip the tempting weight-3 arc. The remaining three weight-2 arcs form the directed path b→d→c→a: every indegree is at most one and the underlying graph is a tree.",
      formula: "T*={b→d,d→c,c→a}   ·   weight(T*)=2+2+2=6>5",
      insight: "Branching optimization needs a matroid-intersection algorithm; the one-matroid greedy guarantee no longer applies.",
      scene: scene({
        caption: { label: "Optimal branching", detail: "a directed spanning path of weight 6" },
        primitives: [
          graphLine(squareNodes.a, squareNodes.d, {
            style: "graph-rejected",
            color: MUTED,
            label: "3 · skip",
            animationDelay: 0,
          }),
          graphLine(squareNodes.b, squareNodes.d, {
            style: "graph-arc",
            color: ORANGE,
            label: "2",
            animationDelay: 0.2,
          }),
          graphLine(squareNodes.d, squareNodes.c, {
            style: "graph-arc",
            color: ORANGE,
            label: "2",
            animationDelay: 0.4,
          }),
          graphLine(squareNodes.c, squareNodes.a, {
            style: "graph-arc",
            color: ORANGE,
            label: "2",
            animationDelay: 0.6,
          }),
          graphNode(squareNodes.a, "a", "graph-node-active"),
          graphNode(squareNodes.b, "b", "graph-node-active"),
          graphNode(squareNodes.c, "c", "graph-node-active"),
          graphNode(squareNodes.d, "d", "graph-node-active"),
          { kind: "label", at: [3.65, 0.75], text: "global structure beats local weight", tone: "accent" },
        ],
      }),
    },
  ],
  proof: {
    title: "Why are branchings a matroid intersection?",
    steps: [
      "Group all arcs by their head v. Choosing at most one arc from every group gives the partition matroid I₁.",
      "Forget directions. Arc sets whose underlying undirected edges contain no cycle are the independent sets of the graphic matroid I₂.",
      "A set T is a branching exactly when it passes both tests, hence T∈I₁∩I₂.",
      "The four-node example shows ordinary descending greedy returns weight 5 although a branching of weight 6 exists, so the intersection is not generally a matroid.",
    ],
  },
};

export default visualization;
