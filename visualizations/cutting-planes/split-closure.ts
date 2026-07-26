import type { Scene } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";

import {
  createIterations,
} from "@/engine/iterative";


const viewport: Scene["viewport"] = {
  x: [-1, 7],
  y: [-1, 7],
};


const baseConstraints: Scene["constraints"] = [
  {
    id: "x1",
    a: -1,
    b: 0,
    limit: 0,
    label: "x₁ ≥ 0",
    color: "#f49a4a",
  },
  {
    id: "x2",
    a: 0,
    b: -1,
    limit: 0,
    label: "x₂ ≥ 0",
    color: "#7ecbc4",
  },
  {
    id: "sum",
    a: 1,
    b: 1,
    limit: 5.5,
    label: "x₁+x₂≤5.5",
    color: "#d4ef77",
  },
  {
    id: "box",
    a: 1,
    b: 0,
    limit: 5,
    label: "x₁≤5",
    color: "#a7a0ed",
  },
];


const scene = (
  overrides: Partial<Scene> = {}
): Scene => ({
  viewport,
  constraints: baseConstraints,
  showGrid: true,
  showFeasibleRegion: true,
  showVertices: true,
  showLattice: true,
  ...overrides,
});


// finite example
const finiteRounds = createIterations(
  4,
  (iteration) => ({
    iteration,

    title:
      iteration === 0
        ? "Original LP relaxation"
        : `Split closure round ${iteration}`,

    description:
      iteration === 0
        ? "The LP relaxation contains fractional vertices."
        : "Applying more split cuts shrinks the relaxation.",

    state: iteration,
  })
);


const visualization: VisualizationDefinition = {

  id: "split-closure",
  title: "Split Closure",
  shortTitle: "Split closure",

  chapter: "Cutting planes",
  order: 4,

  description:
    "Visualize how repeated split closures shrink LP relaxations towards the integer hull.",

  difficulty: "Intermediate",
  duration: 12,

  accent: "#ff8c69",


  controls: {
    lattice: true,
    vertices: true,
    labels: true,
  },


  stages: [

    {
      id: "definition",

      kicker: "01 · Split cuts",

      title:
        "A split removes fractional regions",

      description:
        "A split divides space into two integer sides. The forbidden strip contains no integer points.",

      formula:
        "πᵀx≤π₀  ∨  πᵀx≥π₀+1",

      insight:
        "All integer feasible points survive the split.",

      scene: scene({
        primitives: [
          {
            kind: "point",
            at: [3.5,2],
            label: "fractional point",
            style: "fractional",
          },
        ],
      }),
    },


    ...finiteRounds.map((round) => ({

      id:
        `round-${round.iteration}`,

      kicker:
        `02 · Iteration ${round.iteration}`,

      title:
        round.title,

      description:
        round.description,

      formula:
        round.iteration === 0
          ? "P⁰=P"
          : `P${round.iteration}=(P${round.iteration-1})ˢ`,

      insight:
        "P⁰ ⊇ P¹ ⊇ P² ⊇ ...",

      scene: scene({

        showIntegerHull:
          round.iteration === 4,

        primitives:
          round.iteration < 4
          ? [
              {
                kind:"point",
                at:[
                  3.5-round.iteration*0.4,
                  2
                ],
                label:
                  "remaining fractional vertex",
                style:
                  "fractional",
              },
            ]
          : [],
      }),

    })),


    {

      id:"infinite",

      kicker:
        "03 · Infinite split rank",

      title:
        "Some split closures never finish",

      description:
        "There exist polyhedra where every finite number of split rounds still leaves fractional points.",

      formula:
        "P⁰ ⊃ P¹ ⊃ P² ⊃ ...",

      insight:
        "The limit can equal the integer hull, but no finite iteration reaches it.",


      scene: scene({

        primitives:[
          {
            kind:"point",
            at:[2.5,2.5],
            label:
              "fractional point survives",
            style:
              "fractional",
          }
        ],

      }),
    },

  ],


  proof: {

    title:
      "Why are integer points preserved?",

    steps:[

      "The split direction π is integral.",

      "Therefore πᵀx is integer for every integer x.",

      "The open interval π₀ < πᵀx < π₀+1 contains no integer values.",

      "Hence split cuts only remove fractional points.",

    ],
  },

};


export default visualization;
