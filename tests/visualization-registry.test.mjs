import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the generated registry includes every visualization module", async () => {
  const generated = await readFile(
    new URL("../visualizations/generated.ts", import.meta.url),
    "utf8",
  );

  assert.match(generated, /\.\/cutting-planes\/split-closure/);
  assert.match(generated, /\.\/cutting-planes\/split-inequality-description/);
  assert.match(generated, /\.\/formulations\/facility-location-formulations/);
  assert.match(generated, /\.\/graphs\/graph-definitions-and-branchings/);
  assert.match(generated, /\.\/graphs\/mst-greedy-and-dual-flooding/);
  assert.match(generated, /\.\/polyhedra\/polyhedron-geometry\.visualization/);
  assert.match(generated, /visualization0/);
  assert.match(generated, /visualization1/);
  assert.match(generated, /visualization2/);
  assert.match(generated, /visualization3/);
  assert.match(generated, /visualization4/);
  assert.match(generated, /visualization5/);
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
  const [
    polyhedron,
    splitClosure,
    splitInequalities,
    facilityLocation,
    graphDefinitions,
    mstDualFlooding,
    canvas,
  ] =
    await Promise.all([
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
    readFile(
      new URL(
        "../visualizations/cutting-planes/split-inequality-description.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/formulations/facility-location-formulations.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/graphs/graph-definitions-and-branchings.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/graphs/mst-greedy-and-dual-flooding.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../components/VisualizationCanvas.tsx", import.meta.url), "utf8"),
  ]);

  for (const moduleSource of [
    polyhedron,
    splitClosure,
    splitInequalities,
    facilityLocation,
    graphDefinitions,
    mstDualFlooding,
  ]) {
    assert.match(moduleSource, /chapter:/);
    assert.match(moduleSource, /stages:\s*\[/);
    assert.match(moduleSource, /export default visualization/);
    assert.doesNotMatch(moduleSource, /<canvas|CanvasRenderingContext2D|getContext/);
  }
  assert.match(canvas, /clipToConstraints/);
  assert.match(canvas, /integerPoints/);
  assert.match(canvas, /convexHull/);
  assert.match(canvas, /primitive\.kind === "polygon"/);
  assert.match(canvas, /primitive\.kind === "line"/);
  assert.match(canvas, /primitive\.kind === "label"/);
  assert.match(canvas, /primitive\.style === "assignment"/);
  assert.match(canvas, /primitive\.style === "graph-arc"/);
  assert.match(canvas, /primitive\.kind === "circle"/);
  assert.match(facilityLocation, /P_FL ⊂ P_AFL/);
  assert.match(facilityLocation, /40 < 130 = 130/);
  assert.match(graphDefinitions, /branchings = I₁∩I₂/);
  assert.match(graphDefinitions, /weight\(T\*\)=2\+2\+2=6>5/);
  assert.match(mstDualFlooding, /total dual value=5\+4\+3\+4\+1=17/);
  assert.match(mstDualFlooding, /dual value 17 ≤ OPT\(MST\) ≤ c\(T\)=17/);
});
