import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the OR / VIS learning workbench", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>OR \/ VIS — Make Optimization Visible<\/title>/i);
  assert.match(html, /The Geometry of a Polyhedron/);
  assert.match(html, /Constraint set/);
  assert.match(html, /Proof intuition/);
  assert.match(html, /Polyhedral geometry/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("discovers visualization modules and keeps drawing in the shared engine", async () => {
  const [registry, moduleSource, canvasSource] = await Promise.all([
    readFile(new URL("../visualizations/registry.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../visualizations/polyhedra/polyhedron-geometry.visualization.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../components/VisualizationCanvas.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(registry, /import\.meta\.glob/);
  assert.match(registry, /\.visualization\.ts/);
  assert.match(moduleSource, /chapter:\s*"Polyhedral geometry"/);
  assert.match(moduleSource, /stages:\s*\[/);
  assert.match(moduleSource, /P = \{ x ∈ ℝ² : Ax ≤ b \}/);
  assert.doesNotMatch(moduleSource, /<canvas|CanvasRenderingContext2D|getContext/);
  assert.match(canvasSource, /clipToConstraints/);
  assert.match(canvasSource, /integerPoints/);
  assert.match(canvasSource, /convexHull/);
});
