import type { VisualizationDefinition } from "@/visualizations/types";
import { polyhedronGeometry3DExample } from "@/visualizations/helpers/three-dimensional-examples";

const visualization: VisualizationDefinition = {
  id: "polyhedron-geometry-3d",
  title: "The Geometry of a Polyhedron in 3D",
  shortTitle: "Polyhedron geometry 3D",
  chapter: "Polyhedral geometry",
  order: 1.5,
  description:
    "Rotate a three-dimensional tetrahedron and inspect its facets, vertices, supporting planes, and integer lattice.",
  difficulty: "Foundation",
  duration: 8,
  accent: "#d4ef77",
  controls: {
    constraints: false,
    grid: true,
    lattice: true,
    vertices: true,
    labels: true,
  },
  stages: polyhedronGeometry3DExample.stages,
  proof: polyhedronGeometry3DExample.proof,
};

export default visualization;
