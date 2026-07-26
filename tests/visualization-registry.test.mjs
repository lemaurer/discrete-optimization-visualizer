import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the generated registry includes every visualization module", async () => {
  const generated = await readFile(
    new URL("../visualizations/generated.ts", import.meta.url),
    "utf8",
  );

  assert.match(generated, /\.\/cutting-planes\/split-closure/);
  assert.match(generated, /\.\/polyhedra\/polyhedron-geometry\.visualization/);
  assert.match(generated, /visualization0/);
  assert.match(generated, /visualization1/);
});

test("the runtime registry validates metadata and has no Vite-only APIs", async () => {
  const registry = await readFile(
    new URL("../visualizations/registry.ts", import.meta.url),
    "utf8",
  );

  assert.match(registry, /generatedVisualizations/);
  assert.match(registry, /filter\(isVisualization\)/);
  assert.doesNotMatch(registry, /import\.meta\.glob/);
});

test("visualization modules describe scenes instead of drawing them", async () => {
  const [polyhedron, splitClosure, canvas] = await Promise.all([
    readFile(
      new URL(
        "../visualizations/polyhedra/polyhedron-geometry.visualization.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../visualizations/cutting-planes/split-closure.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../components/VisualizationCanvas.tsx", import.meta.url), "utf8"),
  ]);

  for (const moduleSource of [polyhedron, splitClosure]) {
    assert.match(moduleSource, /chapter:/);
    assert.match(moduleSource, /stages:\s*\[/);
    assert.match(moduleSource, /export default visualization/);
    assert.doesNotMatch(moduleSource, /<canvas|CanvasRenderingContext2D|getContext/);
  }
  assert.match(canvas, /clipToConstraints/);
  assert.match(canvas, /integerPoints/);
  assert.match(canvas, /convexHull/);
});
