"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Constraint, Point2D } from "@/engine/types";
import type { VisualizationDefinition } from "@/visualizations/types";
import { VisualizationCanvas } from "./VisualizationCanvas";

const STAGE_DURATION = 7500;

function formatPoint(point: Point2D) {
  return `(${point.map((value) => (Math.round(value * 100) / 100).toString()).join(", ")})`;
}

export function VisualizationPlayer({ definition }: { definition: VisualizationDefinition }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLattice, setShowLattice] = useState(false);
  const [showVertices, setShowVertices] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [proofOpen, setProofOpen] = useState(false);
  const [focusedVertex, setFocusedVertex] = useState<{
    point: Point2D;
    active: Constraint[];
  } | null>(null);
  const [enabledConstraints, setEnabledConstraints] = useState(
    () => new Set(definition.stages[0].scene.constraints.map((constraint) => constraint.id)),
  );
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const progressRef = useRef(0);
  const stage = definition.stages[stageIndex];

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const moveToStage = useCallback(
    (nextIndex: number) => {
      const bounded = Math.max(0, Math.min(definition.stages.length - 1, nextIndex));
      setStageIndex(bounded);
      setProgress(0);
      setFocusedVertex(null);
      const nextScene = definition.stages[bounded].scene;
      setEnabledConstraints(
        new Set(nextScene.constraints.map((constraint) => constraint.id)),
      );
      if (nextScene.showLattice) setShowLattice(true);
      if (nextScene.showVertices) setShowVertices(true);
    },
    [definition.stages],
  );

  useEffect(() => {
    if (!playing) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    startedAtRef.current = performance.now() - progressRef.current * STAGE_DURATION;
    const tick = (timestamp: number) => {
      const nextProgress = Math.min(1, (timestamp - startedAtRef.current) / STAGE_DURATION);
      setProgress(nextProgress);
      if (nextProgress >= 1) {
        if (stageIndex < definition.stages.length - 1) {
          moveToStage(stageIndex + 1);
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
  }, [definition.stages.length, moveToStage, playing, stageIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "BUTTON") return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") moveToStage(stageIndex + 1);
      if (event.key === "ArrowLeft") moveToStage(stageIndex - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveToStage, stageIndex]);

  const overallProgress = useMemo(
    () => ((stageIndex + progress) / definition.stages.length) * 100,
    [definition.stages.length, progress, stageIndex],
  );

  const toggleConstraint = (id: string) => {
    setEnabledConstraints((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="lesson">
      <section className="lesson-heading">
        <div>
          <p className="eyebrow">{stage.kicker}</p>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
        <div className="lesson-number">
          <span>Lesson</span>
          <strong>{String(definition.order).padStart(2, "0")}</strong>
        </div>
      </section>

      <div className="workbench">
        <section className="visual-panel">
          <div className="visual-toolbar">
            <div className="view-tabs" aria-label="Visualization view">
              <button className="view-tab view-tab--active" type="button">
                Geometry
              </button>
              <button
                className="view-tab"
                onClick={() => setProofOpen(true)}
                type="button"
              >
                Proof intuition
              </button>
            </div>
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
              <button aria-label="Reset view" onClick={() => setZoom(1)} type="button">
                ↺
              </button>
            </div>
          </div>

          <div className="canvas-area">
            <VisualizationCanvas
              animationProgress={progress}
              enabledConstraints={enabledConstraints}
              onVertexFocus={setFocusedVertex}
              scene={stage.scene}
              showLabels={showLabels}
              showLattice={showLattice}
              showVertices={showVertices}
              zoom={zoom}
            />
            {focusedVertex && (
              <div className="vertex-inspector">
                <p>Vertex {formatPoint(focusedVertex.point)}</p>
                <span>
                  {focusedVertex.active.length
                    ? `Tight: ${focusedVertex.active.map((constraint) => constraint.label).join(", ")}`
                    : "No tight constraints"}
                </span>
              </div>
            )}
          </div>

          <div className="constraint-strip">
            <div className="constraint-title">
              <span>Constraint set</span>
              <button
                onClick={() =>
                  setEnabledConstraints(
                    new Set(stage.scene.constraints.map((constraint) => constraint.id)),
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
                    className={enabled ? "constraint-chip constraint-chip--active" : "constraint-chip"}
                    key={constraint.id}
                    onClick={() => toggleConstraint(constraint.id)}
                    style={{ "--constraint-color": constraint.color } as React.CSSProperties}
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
        </section>

        <aside className="explanation-panel">
          <div className="explanation-progress">
            <span>
              Step {stageIndex + 1} of {definition.stages.length}
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

          <div className="display-controls">
            <span className="control-label">Display</span>
            <label>
              <input
                checked={showLattice}
                onChange={(event) => setShowLattice(event.target.checked)}
                type="checkbox"
              />
              <i />
              Integer lattice
            </label>
            <label>
              <input
                checked={showVertices}
                onChange={(event) => setShowVertices(event.target.checked)}
                type="checkbox"
              />
              <i />
              Vertex labels
            </label>
            <label>
              <input
                checked={showLabels}
                onChange={(event) => setShowLabels(event.target.checked)}
                type="checkbox"
              />
              <i />
              Annotations
            </label>
          </div>

          <button
            aria-expanded={proofOpen}
            className="proof-toggle"
            onClick={() => setProofOpen((value) => !value)}
            type="button"
          >
            <span>Proof intuition</span>
            <i>{proofOpen ? "−" : "+"}</i>
          </button>
          {proofOpen && definition.proof && (
            <div className="proof-steps">
              <strong>{definition.proof.title}</strong>
              <ol>
                {definition.proof.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      <footer className="timeline">
        <button
          aria-label="Previous step"
          disabled={stageIndex === 0}
          onClick={() => moveToStage(stageIndex - 1)}
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
          aria-label="Next step"
          disabled={stageIndex === definition.stages.length - 1}
          onClick={() => moveToStage(stageIndex + 1)}
          type="button"
        >
          →
        </button>
        <div className="timeline-stages">
          {definition.stages.map((item, index) => (
            <button
              aria-label={`Go to step ${index + 1}: ${item.title}`}
              className={index === stageIndex ? "timeline-step timeline-step--active" : "timeline-step"}
              key={item.id}
              onClick={() => moveToStage(index)}
              type="button"
            >
              <i />
              <span>{index + 1}</span>
              <em>{item.title}</em>
            </button>
          ))}
          <div className="timeline-line" />
          <div className="timeline-line timeline-line--active" style={{ width: `${overallProgress}%` }} />
        </div>
        <span className="keyboard-hint">Space to play</span>
      </footer>
    </div>
  );
}
