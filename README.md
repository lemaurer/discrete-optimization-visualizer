# OR / VIS

An extensible interactive visual textbook for discrete optimization. The first lesson turns
linear inequalities into a polyhedron that can be explored, animated, and compared with its
integer hull.

## What is included

- A fixed chapter navigation generated from visualization metadata
- A shared canvas renderer for constraints, feasible regions, vertices, lattice points,
  integer hulls, labels, vectors, and objective lines
- Timeline playback with synchronized explanation and proof-intuition panels
- Interactive constraint removal, view controls, zoom, and vertex inspection
- A complete polyhedral geometry lesson with five animated stages
- Responsive keyboard, touch, and mobile navigation behavior

## Add a visualization

Create a new `.ts` file inside any chapter folder under `visualizations/` and export a
`VisualizationDefinition` as the default export:

```ts
import type { VisualizationDefinition } from "@/visualizations/types";

const lesson: VisualizationDefinition = {
  id: "my-lesson",
  title: "My lesson",
  chapter: "Graph algorithms",
  order: 1,
  description: "A short description.",
  difficulty: "Foundation",
  duration: 6,
  accent: "#d4ef77",
  stages: [
    {
      id: "definition",
      kicker: "01 · Definition",
      title: "Start with the objects",
      description: "Describe the mathematical idea.",
      scene: {
        viewport: { x: [-1, 8], y: [-1, 7] },
        constraints: [],
        primitives: [],
      },
    },
  ],
};

export default lesson;
```

The registry uses `import.meta.glob` and validates the exported metadata, so the sidebar discovers
the file automatically. Root support files without visualization metadata are ignored. Lessons
declare scenes and stages; rendering stays in `engine/` and `components/VisualizationCanvas.tsx`.

## Run locally

Requires Node.js 22.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

The `predev` script regenerates the visualization registry before the development server starts.
Restart the development server after adding a module.

## Deploy on Vercel

1. Import `lemaurer/discrete-optimization-visualizer` from the Vercel dashboard.
2. Keep the detected **Next.js** framework preset and all default build settings.
3. Deploy.

Every push to `main` will trigger a production build. The build automatically scans
`visualizations/`, regenerates the registry, and includes every `.ts` module with a default
`VisualizationDefinition` export.

No environment variables are required. Optionally set `NEXT_PUBLIC_SITE_URL` to a custom-domain
origin such as `https://example.com` to make social-preview URLs use that domain.

## Verify

```bash
npm run build
npm test
npm run lint
```
