import type {
  Constraint,
  Point2D,
  PolygonPrimitive,
  Primitive,
  Scene,
} from "@/engine/types";
import {
  add,
  basisVectors,
  fundamentalCell,
  latticePoints,
  latticeScene,
  LATTICE_COLORS,
  scale,
} from "@/visualizations/helpers/lattice-scenes";
import type { Basis2D } from "@/visualizations/helpers/lattice-scenes";
import type { VisualizationDefinition } from "@/visualizations/types";

const SQRT3 = Math.sqrt(3);
const basis: Basis2D = [
  [2, 0],
  [1, SQRT3],
];
const viewport: Scene["viewport"] = { x: [-6.2, 6.2], y: [-4.8, 4.8] };
const origin: Point2D = [0, 0];

const relevantVectors: Point2D[] = [
  [2, 0],
  [1, SQRT3],
  [-1, SQRT3],
  [-2, 0],
  [-1, -SQRT3],
  [1, -SQRT3],
];

const cellVertices: Point2D[] = [
  [1, 1 / SQRT3],
  [0, 2 / SQRT3],
  [-1, 1 / SQRT3],
  [-1, -1 / SQRT3],
  [0, -2 / SQRT3],
  [1, -1 / SQRT3],
];

function halfspace(vector: Point2D, id: string): Constraint {
  return {
    id,
    a: vector[0],
    b: vector[1],
    limit: (vector[0] ** 2 + vector[1] ** 2) / 2,
    label: `${vector[0].toFixed(0)}x₁${vector[1] < 0 ? "−" : "+"}${Math.abs(vector[1]).toFixed(2)}x₂≤2`,
    color: LATTICE_COLORS.violet,
  };
}

const relevantConstraints = relevantVectors.map((vector, index) =>
  halfspace(vector, `relevant-${index}`),
);

function voronoiCell(
  center: Point2D = origin,
  label = "Vor(0)",
  style: PolygonPrimitive["style"] = "integer-hull",
): PolygonPrimitive {
  return {
    kind: "polygon",
    points: cellVertices.map((point) => add(center, point)),
    label,
    style,
  };
}

function translatedCells(range = 2): PolygonPrimitive[] {
  const cells: PolygonPrimitive[] = [];
  for (let first = -range; first <= range; first += 1) {
    for (let second = -range; second <= range; second += 1) {
      const center = add(scale(first, basis[0]), scale(second, basis[1]));
      if (
        center[0] < viewport.x[0] - 2 ||
        center[0] > viewport.x[1] + 2 ||
        center[1] < viewport.y[0] - 2 ||
        center[1] > viewport.y[1] + 2
      ) {
        continue;
      }
      cells.push(voronoiCell(center, first === 0 && second === 0 ? "Vor(0)" : "", "component"));
    }
  }
  return cells;
}

function cosetPoints(): Primitive[] {
  const points: Primitive[] = [];
  for (let first = -2; first <= 2; first += 1) {
    for (let second = -2; second <= 2; second += 1) {
      const point = add(
        basis[0],
        add(scale(2 * first, basis[0]), scale(2 * second, basis[1])),
      );
      if (
        point[0] < viewport.x[0] ||
        point[0] > viewport.x[1] ||
        point[1] < viewport.y[0] ||
        point[1] > viewport.y[1]
      ) {
        continue;
      }
      const isShortest =
        (Math.abs(point[0] - 2) < 1e-9 && Math.abs(point[1]) < 1e-9) ||
        (Math.abs(point[0] + 2) < 1e-9 && Math.abs(point[1]) < 1e-9);
      points.push({
        kind: "point",
        at: point,
        label: isShortest ? (point[0] > 0 ? "v" : "−v") : undefined,
        style: isShortest ? "optimum" : "lattice",
      });
    }
  }
  return points;
}

function label(
  at: Point2D,
  text: string,
  tone: "default" | "muted" | "accent" = "default",
): Primitive {
  return { kind: "label", at, text, tone };
}

function scene(
  primitives: Primitive[],
  caption: Scene["caption"],
  constraints: Constraint[] = [],
  overrides: Partial<Scene> = {},
): Scene {
  return latticeScene(basis, {
    viewport,
    constraints,
    primitives,
    caption,
    showConstraints: constraints.length > 0,
    showFeasibleRegion: constraints.length > 0,
    ...overrides,
  });
}

const stages = [
  {
    id: "nearest-site-regions",
    kicker: "01 · Nearest lattice site",
    title: "Every point belongs to the lattice point closest to it",
    description:
      "The triangular lattice repeats across the plane. Around the origin, the Voronoi cell collects exactly the points for which 0 is a closest lattice vector.",
    formula: "Vor(0)={x∈ℝ²:‖x‖≤‖x−v‖ for every v∈L}",
    insight:
      "A Voronoi diagram turns the continuous nearest-vector question into a periodic partition indexed by lattice points.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        voronoiCell(),
        ...basisVectors(basis),
        { kind: "point", at: origin, label: "site 0", style: "optimum" },
      ],
      { label: "Voronoi cell at the origin", detail: "points at least as close to 0 as to any other lattice site" },
    ),
  },
  {
    id: "distance-comparison",
    kicker: "02 · Compare two sites",
    title: "One neighboring lattice point contributes one distance test",
    description:
      "Compare the origin with v=b₁=(2,0). Points on the vertical bisector x₁=1 have equal distance to both sites; the origin-facing side survives.",
    formula: "‖x‖≤‖x−v‖, v=(2,0)",
    insight:
      "The curved-looking distance comparison becomes a linear half-space after squaring because the ‖x‖² terms cancel.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: origin, label: "0", style: "optimum" },
        { kind: "point", at: [2, 0], label: "v=b₁", style: "integer" },
        { kind: "point", at: [1, 0], label: "midpoint v/2", style: "fractional" },
        { kind: "line", from: [1, -4.5], to: [1, 4.5], label: "equal distance", style: "cut", color: LATTICE_COLORS.rose, animate: true },
        { kind: "circle", at: origin, radius: 1, label: "same radius", style: "component", color: LATTICE_COLORS.aqua, animate: true },
        { kind: "circle", at: [2, 0], radius: 1, label: "same radius", style: "component", color: LATTICE_COLORS.orange, animate: true },
      ],
      { label: "Perpendicular bisector", detail: "boundary between 0 and b₁" },
      [relevantConstraints[0]],
    ),
  },
  {
    id: "linear-halfspace",
    kicker: "03 · Linearize the metric condition",
    title: "Squaring the norms reveals the Voronoi inequality",
    description:
      "Expand the distance comparison. The quadratic terms cancel, leaving a half-space whose normal is the competing lattice vector v.",
    formula: "‖x‖²≤‖x−v‖² ⇔ 2vᵀx≤‖v‖² ⇔ vᵀx≤½‖v‖²",
    insight:
      "Intersecting these inequalities over all lattice vectors gives a convex polyhedron, even though the definition starts with Euclidean distances.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: origin, label: "0", style: "optimum" },
        { kind: "point", at: [2, 0], label: "v", style: "integer" },
        { kind: "line", from: [1, -4.5], to: [1, 4.5], label: "vᵀx=½‖v‖²", style: "cut", color: LATTICE_COLORS.violet, animate: true },
        label([-5.4, 4], "normal vector = v", "accent"),
      ],
      { label: "Distance becomes a half-space", detail: "vᵀx≤½‖v‖²" },
      [relevantConstraints[0]],
    ),
  },
  {
    id: "first-strip",
    kicker: "04 · Add the opposite neighbor",
    title: "The pair ±b₁ traps the cell inside a strip",
    description:
      "The competitor b₁ gives x₁≤1; the competitor −b₁ gives x₁≥−1. Their intersection is the vertical strip containing the origin.",
    formula: "b₁ᵀx≤2 and (−b₁)ᵀx≤2 ⇔ −1≤x₁≤1",
    insight:
      "Central symmetry of the lattice makes the Voronoi cell centrally symmetric as well.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: origin, label: "0", style: "optimum" },
        { kind: "point", at: [2, 0], label: "b₁", style: "integer" },
        { kind: "point", at: [-2, 0], label: "−b₁", style: "integer" },
      ],
      { label: "First symmetric pair", detail: "−1≤x₁≤1" },
      [relevantConstraints[0], relevantConstraints[3]],
    ),
  },
  {
    id: "four-halfspaces",
    kicker: "05 · Add ±b₂",
    title: "A second neighbor pair cuts the strip into a parallelogram",
    description:
      "The two bisectors orthogonal to b₂=(1,√3) add |x₁+√3x₂|≤2. Four nearest-site inequalities now bound the region.",
    formula: "|b₁ᵀx|≤2 and |b₂ᵀx|≤2",
    insight:
      "This region is bounded, but two corners still belong to the third pair of closer neighbors and must be removed.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: origin, label: "0", style: "optimum" },
        { kind: "point", at: basis[1], label: "b₂", style: "integer" },
        { kind: "point", at: scale(-1, basis[1]), label: "−b₂", style: "integer" },
      ],
      { label: "Four half-spaces", detail: "bounded candidate cell" },
      [
        relevantConstraints[0],
        relevantConstraints[1],
        relevantConstraints[3],
        relevantConstraints[4],
      ],
    ),
  },
  {
    id: "hexagonal-cell",
    kicker: "06 · Add ±(b₂−b₁)",
    title: "The third neighbor pair closes the regular hexagon",
    description:
      "The remaining shortest directions are b₂−b₁=(−1,√3) and its negative. Their bisectors clip the last two corners.",
    formula: "Vor(0)=⋂v∈L {x:vᵀx≤½‖v‖²}",
    insight:
      "Although the formula intersects infinitely many lattice half-spaces, only six are facet-defining in this example.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        voronoiCell(),
        { kind: "point", at: origin, label: "0", style: "optimum" },
        ...relevantVectors.map<Primitive>((to, index) => ({
          kind: "vector",
          from: origin,
          to,
          label: index < 3 ? ["b₁", "b₂", "b₂−b₁"][index] : undefined,
          color: LATTICE_COLORS.violet,
          animate: true,
        })),
      ],
      { label: "Completed Voronoi cell", detail: "six facets · six shortest neighbor directions" },
      relevantConstraints,
    ),
  },
  {
    id: "relevant-vectors",
    kicker: "07 · Voronoi-relevant vectors",
    title: "A lattice vector is relevant exactly when its inequality defines a facet",
    description:
      "Each of the six highlighted vectors points from the origin to the lattice site across one facet. Removing any one of their inequalities opens that side of the cell.",
    formula: "v relevant ⇔ Fv={x∈Vor(0):vᵀx=½‖v‖²} is a facet",
    insight:
      "Relevant vectors are the finite certificate hidden inside the infinite half-space description of the Voronoi cell.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        voronoiCell(),
        ...relevantVectors.map<Primitive>((to) => ({
          kind: "vector",
          from: origin,
          to,
          color: LATTICE_COLORS.rose,
          animate: true,
        })),
        ...cellVertices.map<Primitive>((at) => ({ kind: "point", at, style: "vertex" })),
        label([-5.5, 4], "6 relevant vectors ↔ 6 facets", "accent"),
      ],
      { label: "Facet-vector correspondence", detail: "one neighbor across every side" },
    ),
  },
  {
    id: "coset-characterization",
    kicker: "08 · Characterization from the script",
    title: "Relevant vectors are the unique shortest pair in a parity coset",
    description:
      "For v=b₁, inspect the coset v+2L. The two vectors ±v are precisely its shortest elements, which certifies that v is Voronoi-relevant.",
    formula: "v relevant ⇔ ±v are the unique shortest vectors in v+2L",
    insight:
      "The geometric facet test can therefore be replaced by a shortest-vector statement modulo the doubled lattice.",
    scene: scene(
      [
        ...cosetPoints(),
        { kind: "circle", at: origin, radius: 2, label: "shortest radius ‖v‖", style: "component", color: LATTICE_COLORS.rose, animate: true },
        { kind: "vector", from: origin, to: [2, 0], label: "v", color: LATTICE_COLORS.rose, animate: true },
        { kind: "vector", from: origin, to: [-2, 0], label: "−v", color: LATTICE_COLORS.rose, animate: true },
      ],
      { label: "Coset v+2L", detail: "±v are its unique shortest vectors" },
    ),
  },
  {
    id: "redundant-vector",
    kicker: "09 · Non-relevant vectors",
    title: "Longer lattice vectors contribute redundant inequalities",
    description:
      "The vector w=b₁+b₂=(3,√3) also defines a valid half-space, but its bisector never touches the hexagon: nearer neighbors already imply it.",
    formula: "wᵀx≤½‖w‖²=6 is valid but not facet-defining",
    insight:
      "Validity alone does not make a vector relevant; relevance means the inequality survives as a genuine codimension-one face.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        voronoiCell(),
        { kind: "vector", from: origin, to: [3, SQRT3], label: "w=b₁+b₂", color: LATTICE_COLORS.muted, animate: true },
        { kind: "line", from: [0, 2 * SQRT3], to: [4, -2 * SQRT3], label: "redundant bisector", style: "cut", color: LATTICE_COLORS.muted, animate: true },
        label([-5.5, 4], "the bisector misses Vor(0)", "muted"),
      ],
      { label: "Redundant lattice inequality", detail: "valid, but no Voronoi facet" },
    ),
  },
  {
    id: "tessellation",
    kicker: "10 · Translate the cell",
    title: "Lattice translations tile the plane without interior overlap",
    description:
      "Every site z∈L receives the translated cell z+Vor(0). The cells cover the plane, share only boundaries, and all have the same area.",
    formula: "ℝ²=⋃z∈L(z+Vor(0))   ·   int-cells are disjoint",
    insight:
      "The Voronoi cell is another fundamental domain of the lattice, so its area equals det(L)=2√3.",
    scene: scene(
      [
        ...translatedCells(3),
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: origin, label: "0", style: "optimum" },
      ],
      { label: "Voronoi tessellation", detail: "one congruent cell per lattice point" },
    ),
  },
  {
    id: "fundamental-volume",
    kicker: "11 · Fundamental domain",
    title: "Voronoi and parallelepiped cells have different shapes but equal volume",
    description:
      "The standard half-open parallelogram and the centered hexagonal Voronoi cell both represent one lattice point per tile.",
    formula: "area(Vor(0))=area(𝒫(B))=det(L)=|det B|=2√3",
    insight:
      "The parallelepiped is adapted to basis coordinates; the Voronoi cell is adapted to Euclidean distance.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        fundamentalCell(basis, "𝒫(B) · area 2√3"),
        voronoiCell(origin, "Vor(0) · area 2√3"),
        ...basisVectors(basis),
      ],
      { label: "Two fundamental domains", detail: "same area · different geometry" },
    ),
  },
  {
    id: "closest-vector",
    kicker: "12 · Closest Vector Problem",
    title: "Translate a target into the origin cell to identify its closest lattice vector",
    description:
      "For q=(2.3,0.55), the lattice vector z=(2,0) is closest because the residual q−z=(0.3,0.55) lies inside Vor(0).",
    formula: "z is closest to q ⇔ q−z∈Vor(0)",
    insight:
      "Nearest-vector decoding asks which translated Voronoi cell contains the target.",
    scene: scene(
      [
        ...translatedCells(2),
        ...latticePoints(basis, viewport, 6),
        { kind: "point", at: [2.3, 0.55], label: "q", style: "fractional" },
        { kind: "point", at: [2, 0], label: "z=CVP(q)", style: "optimum" },
        { kind: "vector", from: [2, 0], to: [2.3, 0.55], label: "q−z∈Vor(0)", color: LATTICE_COLORS.rose, animate: true },
        { kind: "point", at: [0.3, 0.55], label: "translated residual", style: "integer", animateFrom: [2.3, 0.55] },
      ],
      { label: "Voronoi decoding", detail: "q lies in z+Vor(0)" },
    ),
  },
  {
    id: "boundary-ties",
    kicker: "13 · Facets and vertices",
    title: "Boundaries encode ties between closest lattice vectors",
    description:
      "On a facet, two lattice sites tie. At the upper-right Voronoi vertex, the origin, b₁, and b₂ are all equally close.",
    formula: "r=(1,1/√3): ‖r‖=‖r−b₁‖=‖r−b₂‖=2/√3",
    insight:
      "Cell interiors have a unique closest lattice vector; lower-dimensional faces are exactly where nearest-vector choices become non-unique.",
    scene: scene(
      [
        ...latticePoints(basis, viewport, 6),
        voronoiCell(),
        { kind: "point", at: [1, 1 / SQRT3], label: "three-way tie r", style: "fractional" },
        { kind: "point", at: origin, label: "0", style: "optimum" },
        { kind: "point", at: basis[0], label: "b₁", style: "integer" },
        { kind: "point", at: basis[1], label: "b₂", style: "integer" },
        { kind: "line", from: [1, 1 / SQRT3], to: origin, label: "2/√3", style: "assignment", color: LATTICE_COLORS.aqua, animate: true },
        { kind: "line", from: [1, 1 / SQRT3], to: basis[0], label: "2/√3", style: "assignment", color: LATTICE_COLORS.orange, animate: true },
        { kind: "line", from: [1, 1 / SQRT3], to: basis[1], label: "2/√3", style: "assignment", color: LATTICE_COLORS.violet, animate: true },
      ],
      { label: "Voronoi boundary ties", detail: "facet: two sites · vertex: three sites" },
    ),
  },
] satisfies VisualizationDefinition["stages"];

const visualization: VisualizationDefinition = {
  id: "lattice-voronoi-cells",
  title: "Voronoi Cells of a Lattice",
  shortTitle: "Voronoi cells",
  chapter: "Lattice theory",
  order: 5,
  description:
    "Build a lattice Voronoi cell from distance comparisons, identify the facet-defining relevant vectors, tile the plane, and decode closest lattice vectors.",
  difficulty: "Intermediate",
  duration: 18,
  accent: LATTICE_COLORS.rose,
  visualLabel: "Cell construction",
  insightLabel: "Voronoi insight",
  controls: {
    constraints: false,
    grid: true,
    lattice: false,
    vertices: false,
    labels: true,
  },
  stages,
  proof: {
    title: "Why do the Voronoi half-spaces and tessellation work?",
    steps: [
      "A point x belongs to Vor(0) exactly when ‖x‖≤‖x−v‖ for every lattice vector v.",
      "Squaring and expanding cancels ‖x‖², giving the linear inequality vᵀx≤½‖v‖².",
      "Their intersection is convex and centrally symmetric because v and −v occur together.",
      "Only Voronoi-relevant vectors define facets; in the triangular lattice these are ±b₁, ±b₂, and ±(b₂−b₁).",
      "For every q, a closest lattice vector z satisfies q−z∈Vor(0), so the translates z+Vor(0) cover space and have disjoint interiors.",
      "The translates form a fundamental-domain tiling; consequently vol(Vor(0))=det(L).",
    ],
  },
};

export default visualization;
