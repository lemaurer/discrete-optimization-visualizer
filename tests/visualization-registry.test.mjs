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
  assert.match(generated, /\.\/cutting-planes\/lift-and-project/);
  assert.match(generated, /\.\/cutting-planes\/gomory-fractional-cut/);
  assert.match(generated, /\.\/formulations\/facility-location-formulations/);
  assert.match(generated, /\.\/graphs\/graph-definitions-and-branchings/);
  assert.match(generated, /\.\/graphs\/max-flow-min-cut-primal-dual/);
  assert.match(generated, /\.\/graphs\/mst-greedy-and-dual-flooding/);
  assert.match(generated, /\.\/lattice-theory\/lattice-foundations/);
  assert.match(generated, /\.\/lattice-theory\/gram-schmidt-lll-reduction/);
  assert.match(generated, /\.\/lattice-theory\/minkowski-convex-body-theorem/);
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
    liftAndProject,
    splitInequalities,
    facilityLocation,
    graphDefinitions,
    maxFlowMinCut,
    mstDualFlooding,
    latticeFoundations,
    gramSchmidtLll,
    minkowski,
    gomory,
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
      new URL("../visualizations/cutting-planes/lift-and-project.ts", import.meta.url),
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
        "../visualizations/graphs/max-flow-min-cut-primal-dual.ts",
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
    readFile(
      new URL(
        "../visualizations/lattice-theory/lattice-foundations.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/lattice-theory/gram-schmidt-lll-reduction.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/lattice-theory/minkowski-convex-body-theorem.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../visualizations/cutting-planes/gomory-fractional-cut.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../components/VisualizationCanvas.tsx", import.meta.url), "utf8"),
  ]);

  for (const moduleSource of [
    polyhedron,
    splitClosure,
    liftAndProject,
    splitInequalities,
    facilityLocation,
    graphDefinitions,
    maxFlowMinCut,
    mstDualFlooding,
    latticeFoundations,
    gramSchmidtLll,
    minkowski,
    gomory,
  ]) {
    assert.match(moduleSource, /chapter:/);
    assert.match(moduleSource, /(?:stages:\s*\[|const stages(?::[^=]+)?\s*=)/);
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
  assert.match(liftAndProject, /x₁\(b−Ax\)≥0/);
  assert.match(liftAndProject, /L₁\(P\)=projₓ\(M₁\)=conv\(P⁰∪P¹\)/);
  assert.match(liftAndProject, /½x₁\+x₂≤1/);
  assert.match(facilityLocation, /P_FL ⊂ P_AFL/);
  assert.match(facilityLocation, /40 < 130 = 130/);
  assert.match(graphDefinitions, /branchings = I₁∩I₂/);
  assert.match(graphDefinitions, /weight\(T\*\)=2\+2\+2=6>5/);
  assert.match(maxFlowMinCut, /max-flow=min-cut=23/);
  assert.match(maxFlowMinCut, /S=Reach_Gf\(s\)=\{s,a,b,d\}/);
  assert.match(maxFlowMinCut, /Σₑuₑzₑ=12\+7\+4=23/);
  assert.match(mstDualFlooding, /total dual value=5\+4\+3\+4\+1=17/);
  assert.match(mstDualFlooding, /dual value 17 ≤ OPT\(MST\) ≤ c\(T\)=17/);
  assert.match(latticeFoundations, /L\(B′\)=L\(B\)/);
  assert.match(latticeFoundations, /det\(L\*\)=1\/det\(L\)/);
  assert.match(gramSchmidtLll, /SizeReduce\(2,1\)/);
  assert.match(gramSchmidtLll, /B̄₂=B₁B₂\/D=49\/2/);
  assert.match(gramSchmidtLll, /δB₁=6≤B₂\+μ₂₁²B₁=25/);
  assert.match(minkowski, /vol\(K\)>2ⁿdet\(L\)/);
  assert.match(minkowski, /½K−½K⊆K/);
  assert.match(minkowski, /x−y=\(3,1\)=b₁∈L∖\{0\}/);
  assert.match(gomory, /Σⱼ f\(āⱼ\)xⱼ ≥ f\(b̄\)/);
  assert.match(gomory, /½x₂\+½\(3−2x₁−x₂\)≥½   ⇔   x₁≤1/);
  assert.match(gomory, /P¹ ⊋ conv\(P∩ℤ²\)/);
});
