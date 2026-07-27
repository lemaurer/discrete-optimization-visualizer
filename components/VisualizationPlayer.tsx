"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import type { Constraint, Point2D } from "@/engine/types";
import type {
  VisualizationDefinition,
  VisualizationExample,
  VisualizationNavigationMode,
} from "@/visualizations/types";
import { VisualizationCanvas } from "./VisualizationCanvas";
import { VisualizationCanvas3D } from "./VisualizationCanvas3D";

const DETAIL_STAGE_DURATION = 7500;
const SUMMARY_STAGE_DURATION = 1500;
const DEFAULT_EXAMPLE_ID = "__default__";

function formatPoint(point: Point2D) {
  return `(${point
    .map((value) => (Math.round(value * 100) / 100).toString())
    .join(", ")})`;
}

function defaultExample(definition: VisualizationDefinition): VisualizationExample {
  return {
    id: DEFAULT_EXAMPLE_ID,
    title: definition.title,
    description: definition.description,
    stages: definition.stages,
    proof: definition.proof,
  };
}

export function VisualizationPlayer({
  definition,
}: {
  definition: VisualizationDefinition;
}) {
  const examples = useMemo(
    () =>
      definition.examples?.length
        ? definition.examples
        : [defaultExample(definition)],
    [definition],
  );

  const [exampleId, setExampleId] = useState(examples[0].id);
  const activeExample =
    examples.find((example) => example.id === exampleId) ?? examples[0];
  const stages = activeExample.stages;

  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [navigationMode, setNavigationMode] =
    useState<VisualizationNavigationMode>("detail");

  const [gridOverride, setGridOverride] = useState<boolean | null>(null);
  const [latticeOverride, setLatticeOverride] = useState<boolean | null>(null);
  const [verticesOverride, setVerticesOverride] = useState<boolean | null>(null);
  const [labelsOverride, setLabelsOverride] = useState<boolean | null>(null);

  const [zoom, setZoom] = useState(1);
  const [proofOpen, setProofOpen] = useState(false);
  const [focusedVertex, setFocusedVertex] = useState<{
    point: Point2D;
    active: Constraint[];
  } | null>(null);
  const [enabledConstraints, setEnabledConstraints] = useState(
    () => new Set(stages[0].scene.constraints.map((constraint) => constraint.id)),
  );

  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const progressRef = useRef(0);

  const boundedStageIndex = Math.min(stageIndex, stages.length - 1);
  const stage = stages[boundedStageIndex];
  const isThreeDimensional = Boolean(stage.scene.scene3D);

  const showGrid = gridOverride ?? stage.scene.showGrid !== false;
  const showLattice = latticeOverride ?? Boolean(stage.scene.showLattice);
  const showVertices = verticesOverride ?? Boolean(stage.scene.showVertices);
  const showLabels = labelsOverride ?? true;

  const hasSplitMilestones = stages.some(
    (item) => item.navigation?.milestone === "split",
  );
  const hasClosureMilestones = stages.some(
    (item) => item.navigation?.milestone === "closure",
  );
  const showNavigationModes = hasSplitMilestones || hasClosureMilestones;

  const navigableIndices = useMemo(() => {
    if (navigationMode === "detail") {
      return stages.map((_, index) => index);
    }

    let milestone: "split" | "closure" =
      navigationMode === "closure" ? "closure" : "split";

    if (
      milestone === "split" &&
      !stages.some((item) => item.navigation?.milestone === "split")
    ) {
      milestone = "closure";
    }

    const selected = stages
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.navigation?.milestone === milestone)
      .map(({ index }) => index);

    return [...new Set([0, ...selected, stages.length - 1])].sort(
      (left, right) => left - right,
    );
  }, [navigationMode, stages]);

  const currentNavigationPosition = Math.max(
    0,
    navigableIndices.findIndex((index) => index === boundedStageIndex),
  );

  useEffect(() => {
    setExampleId(examples[0].id);
    setStageIndex(0);
    setProgress(0);
    setPlaying(false);
    setNavigationMode("detail");
    setGridOverride(null);
    setLatticeOverride(null);
    setVerticesOverride(null);
    setLabelsOverride(null);
  }, [definition.id, examples]);

  useEffect(() => {
    if (stageIndex >= stages.length) setStageIndex(0);
  }, [stageIndex, stages.length]);

  useEffect(() => {
    setStageIndex(0);
    setProgress(0);
    setPlaying(false);
    setFocusedVertex(null);
    setZoom(1);
  }, [exampleId]);

  useLayoutEffect(() => {
    setEnabledConstraints(
      new Set(stage.scene.constraints.map((constraint) => constraint.id)),
    );
  }, [stage.scene.constraints]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (navigationMode === "detail") return;
    if (navigableIndices.includes(boundedStageIndex)) return;

    const next =
      navigableIndices.find((index) => index >= boundedStageIndex) ??
      navigableIndices[navigableIndices.length - 1];
    setStageIndex(next);
    setProgress(0);
  }, [boundedStageIndex, navigableIndices, navigationMode]);

  const moveToStage = useCallback(
    (nextIndex: number) => {
      const bounded = Math.max(0, Math.min(stages.length - 1, nextIndex));
      setStageIndex(bounded);
      setProgress(0);
      setFocusedVertex(null);
    },
    [stages.length],
  );

  const moveByNavigation = useCallback(
    (direction: -1 | 1) => {
      let position = navigableIndices.findIndex(
        (index) => index === boundedStageIndex,
      );

      if (position < 0) {
        position = navigableIndices.findIndex(
          (index) => index > boundedStageIndex,
        );
        if (position < 0) position = navigableIndices.length - 1;
        if (direction < 0) position -= 1;
      } else {
        position += direction;
      }

      const boundedPosition = Math.max(
        0,
        Math.min(navigableIndices.length - 1, position),
      );
      moveToStage(navigableIndices[boundedPosition]);
    },
    [boundedStageIndex, moveToStage, navigableIndices],
  );

  useEffect(() => {
    if (!playing) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const duration =
      navigationMode === "detail"
        ? DETAIL_STAGE_DURATION
        : SUMMARY_STAGE_DURATION;
    startedAtRef.current = performance.now() - progressRef.current * duration;

    const tick = (timestamp: number) => {
      const nextProgress = Math.min(
        1,
        (timestamp - startedAtRef.current) / duration,
      );
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        const position = navigableIndices.findIndex(
          (index) => index === boundedStageIndex,
        );
        const nextIndex = navigableIndices[position + 1];

        if (nextIndex !== undefined) {
          setStageIndex(nextIndex);
          setProgress(0);
          startedAtRef.current = timestamp;
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setPlaying(false);
        }
      } else {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [boundedStageIndex, navigableIndices, navigationMode, playing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") moveByNavigation(1);
      if (event.key === "ArrowLeft") moveByNavigation(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveByNavigation]);

  const overallProgress = useMemo(() => {
    const position = Math.max(
      0,
      navigableIndices.findIndex((index) => index === boundedStageIndex),
    );
    return ((position + progress) / navigableIndices.length) * 100;
  }, [boundedStageIndex, navigableIndices, progress]);

  const toggleConstraint = (id: string) => {
    setEnabledConstraints((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const proof = activeExample.proof ?? definition.proof;
  const renderedProgress = navigationMode === "detail" ? progress : 1;
  const controls = definition.controls ?? {};
  const showDisplayControls =
    controls.grid !== false ||
    controls.lattice !== false ||
    controls.vertices !== false ||
    controls.labels !== false;

  return (
    <div className="lesson">
      <section className="lesson-heading">
        <div>
          <p className="eyebrow">{stage.kicker}</p>
          <h1>{definition.title}</h1>
          <p>{activeExample.description ?? definition.description}</p>
        </div>
        <div className="lesson-heading-tools">
          {examples.length > 1 && (
            <label className="example-picker">
              <span>Polyhedron</span>
              <select
                onChange={(event) => setExampleId(event.target.value)}
                value={activeExample.id}
              >
                {examples.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="lesson-number">
            <span>Lesson</span>
            <strong>{String(definition.order).padStart(2, "0")}</strong>
          </div>
        </div>
      </section>

      <div className="workbench">
        <section className="visual-panel">
          <div className="visual-toolbar">
            <div className="view-tabs" aria-label="Visualization view">
              <button className="view-tab view-tab--active" type="button">
                {isThreeDimensional ? "3D geometry" : "Geometry"}
              </button>
              <button
                className="view-tab"
                onClick={() => setProofOpen(true)}
                type="button"
              >
                Proof intuition
              </button>
            </div>

            {showNavigationModes && (
              <div className="navigation-modes" aria-label="Navigation granularity">
                {(["detail", "split", "closure"] as VisualizationNavigationMode[]).map(
                  (mode) => (
                    <button
                      aria-pressed={navigationMode === mode}
                      className={
                        navigationMode === mode
                          ? "navigation-mode navigation-mode--active"
                          : "navigation-mode"
                      }
                      key={mode}
                      onClick={() => {
                        setPlaying(false);
                        setNavigationMode(mode);
                        setProgress(0);
                      }}
                      type="button"
                    >
                      {mode === "detail"
                        ? "Detail"
                        : mode === "split"
                          ? "Splits"
                          : "Closures"}
                    </button>
                  ),
                )}
              </div>
            )}

            <div className="canvas-tools">
              <button
                aria-label="Zoom out"
                disabled={zoom <= 0.8}
                onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
                type="button"
              >
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                aria-label="Zoom in"
                disabled={zoom >= 1.2}
                onClick={() => setZoom((value) => Math.min(1.2, value + 0.1))}
                type="button"
              >
                +
              </button>
              <button aria-label="Reset zoom" onClick={() => setZoom(1)} type="button">
                ↺
              </button>
            </div>
          </div>

          <div className="canvas-area">
            {isThreeDimensional ? (
              <VisualizationCanvas3D
                animationProgress={renderedProgress}
                scene={stage.scene}
                showGrid={showGrid}
                showLabels={showLabels}
                showLattice={showLattice}
                showVertices={showVertices}
                zoom={zoom}
              />
            ) : (
              <VisualizationCanvas
                animationProgress={renderedProgress}
                enabledConstraints={enabledConstraints}
                onVertexFocus={setFocusedVertex}
                scene={stage.scene}
                showGrid={showGrid}
                showLabels={showLabels}
                showLattice={showLattice}
                showVertices={showVertices}
                zoom={zoom}
              />
            )}
            {!isThreeDimensional && focusedVertex && (
              <div className="vertex-inspector">
                <p>Vertex {formatPoint(focusedVertex.point)}</p>
                <span>
                  {focusedVertex.active.length
                    ? `Tight: ${focusedVertex.active
                        .map((constraint) => constraint.label)
                        .join(", ")}`
                    : "No tight constraints"}
                </span>
              </div>
            )}
          </div>

          {!isThreeDimensional &&
            controls.constraints !== false &&
            stage.scene.constraints.length > 0 && (
              <div className="constraint-strip">
                <div className="constraint-title">
                  <span>Constraint set</span>
                  <button
                    onClick={() =>
                      setEnabledConstraints(
                        new Set(
                          stage.scene.constraints.map((constraint) => constraint.id),
                        ),
                      )
                    }
                    type="button"
                  >
                    Reset
                  </button>
                </div>
                <div className="constraint-chips">
                  {stage.scene.constraints.map((constraint) => {
                    const enabled = enabledConstraints.has(constraint.id);
                    return (
                      <button
                        aria-pressed={enabled}
                        className={
                          enabled
                            ? "constraint-chip constraint-chip--active"
                            : "constraint-chip"
                        }
                        key={constraint.id}
                        onClick={() => toggleConstraint(constraint.id)}
                        style={
                          { "--constraint-color": constraint.color } as CSSProperties
                        }
                        type="button"
                      >
                        <i />
                        <span>{constraint.label}</span>
                        <strong>{enabled ? "×" : "+"}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </section>

        <aside className="explanation-panel">
          <div className="explanation-progress">
            <span>
              Step {currentNavigationPosition + 1} of {navigableIndices.length}
            </span>
            <strong>{String(Math.round(overallProgress)).padStart(2, "0")}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${overallProgress}%` }} />
          </div>

          <div className="explanation-content" key={stage.id}>
            <p className="eyebrow">{stage.kicker}</p>
            <h2>{stage.title}</h2>
            <p className="explanation-copy">{stage.description}</p>
            {stage.formula && <div className="formula-card">{stage.formula}</div>}
            {stage.insight && (
              <div className="insight-card">
                <span>Geometric insight</span>
                <p>{stage.insight}</p>
              </div>
            )}
          </div>

          {showDisplayControls && (
            <div className="display-controls">
              <span className="control-label">Display</span>
              {controls.grid !== false && (
                <label>
                  <input
                    checked={showGrid}
                    onChange={(event) => setGridOverride(event.target.checked)}
                    type="checkbox"
                  />
                  <i />
                  Coordinate grid
                </label>
              )}
              {controls.lattice !== false && (
                <label>
                  <input
                    checked={showLattice}
                    onChange={(event) => setLatticeOverride(event.target.checked)}
                    type="checkbox"
                  />
                  <i />
                  Integer lattice
                </label>
              )}
              {controls.vertices !== false && (
                <label>
                  <input
                    checked={showVertices}
                    onChange={(event) => setVerticesOverride(event.target.checked)}
                    type="checkbox"
                  />
                  <i />
                  Vertices
                </label>
              )}
              {controls.labels !== false && (
                <label>
                  <input
                    checked={showLabels}
                    onChange={(event) => setLabelsOverride(event.target.checked)}
                    type="checkbox"
                  />
                  <i />
                  Annotations
                </label>
              )}
            </div>
          )}

          <button
            aria-expanded={proofOpen}
            className="proof-toggle"
            onClick={() => setProofOpen((value) => !value)}
            type="button"
          >
            <span>Proof intuition</span>
            <i>{proofOpen ? "−" : "+"}</i>
          </button>
          {proofOpen && proof && (
            <div className="proof-steps">
              <strong>{proof.title}</strong>
              <ol>
                {proof.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      <footer className="timeline">
        <button
          aria-label={`Previous ${navigationMode}`}
          disabled={currentNavigationPosition === 0}
          onClick={() => moveByNavigation(-1)}
          type="button"
        >
          ←
        </button>
        <button
          aria-label={playing ? "Pause animation" : "Play animation"}
          className="play-button"
          onClick={() => setPlaying((value) => !value)}
          type="button"
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
        <button
          aria-label={`Next ${navigationMode}`}
          disabled={currentNavigationPosition === navigableIndices.length - 1}
          onClick={() => moveByNavigation(1)}
          type="button"
        >
          →
        </button>
        <div
          className="timeline-stages"
          style={{
            gridTemplateColumns: `repeat(${navigableIndices.length}, minmax(42px, 1fr))`,
          }}
        >
          {navigableIndices.map((index, position) => {
            const item = stages[index];
            return (
              <button
                aria-label={`Go to ${navigationMode} ${position + 1}: ${item.title}`}
                className={
                  index === boundedStageIndex
                    ? "timeline-step timeline-step--active"
                    : "timeline-step"
                }
                key={item.id}
                onClick={() => moveToStage(index)}
                type="button"
              >
                <i />
                <span>{position + 1}</span>
                <em>{item.title}</em>
              </button>
            );
          })}
          <div className="timeline-line" />
          <div
            className="timeline-line timeline-line--active"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <span className="keyboard-hint">
          {navigationMode === "detail"
            ? "Every animation"
            : `Jump by ${navigationMode}`}
        </span>
      </footer>
    </div>
  );
}
