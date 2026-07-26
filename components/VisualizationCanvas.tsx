"use client";

import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import {
  activeConstraintsAt,
  clipToConstraints,
  constraintLine,
  convexHull,
  integerPoints,
} from "@/engine/geometry";
import { renderSplitProjection } from "@/engine/renderSplitProjection";
import type { Constraint, Point2D, Scene } from "@/engine/types";

interface VisualizationCanvasProps {
  scene: Scene;
  enabledConstraints: Set<string>;
  showLattice: boolean;
  showVertices: boolean;
  showLabels: boolean;
  zoom: number;
  animationProgress: number;
  onVertexFocus: (value: { point: Point2D; active: Constraint[] } | null) => void;
}

interface Transform {
  x: (value: number) => number;
  y: (value: number) => number;
  scale: number;
}

const COLORS = {
  ink: "#10202a",
  muted: "#7d898b",
  paper: "#f5f2e8",
  grid: "#d9d8ce",
  lime: "#d4ef77",
  aqua: "#79c9c0",
  orange: "#f28b45",
  rose: "#e27c89",
  violet: "#8f88dc",
};

function round(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function VisualizationCanvas({
  scene,
  enabledConstraints,
  showLattice,
  showVertices,
  showLabels,
  zoom,
  animationProgress,
  onVertexFocus,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const verticesRef = useRef<Array<{ point: Point2D; screen: Point2D }>>([]);
  const transformRef = useRef<Transform | null>(null);

  const activeConstraints = scene.constraints.filter((constraint) =>
    enabledConstraints.has(constraint.id),
  );

  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, Math.floor(entry.contentRect.width)),
        height: Math.max(360, Math.floor(entry.contentRect.height)),
      });
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.width * ratio;
    canvas.height = size.height * ratio;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = COLORS.paper;
    context.fillRect(0, 0, size.width, size.height);

    const padding = { x: size.width < 600 ? 38 : 68, y: size.height < 500 ? 34 : 54 };
    const xRange = scene.viewport.x[1] - scene.viewport.x[0];
    const yRange = scene.viewport.y[1] - scene.viewport.y[0];
    const baseScale = Math.min(
      (size.width - padding.x * 2) / xRange,
      (size.height - padding.y * 2) / yRange,
    );
    const scale = baseScale * zoom;
    const plotWidth = xRange * scale;
    const plotHeight = yRange * scale;
    const offsetX = (size.width - plotWidth) / 2;
    const offsetY = (size.height - plotHeight) / 2;
    const tx = (value: number) => offsetX + (value - scene.viewport.x[0]) * scale;
    const ty = (value: number) => size.height - offsetY - (value - scene.viewport.y[0]) * scale;
    transformRef.current = { x: tx, y: ty, scale };

    if (scene.showGrid !== false) {
      context.lineWidth = 1;
      context.strokeStyle = COLORS.grid;
      context.globalAlpha = 0.72;
      for (let x = Math.ceil(scene.viewport.x[0]); x <= scene.viewport.x[1]; x += 1) {
        context.beginPath();
        context.moveTo(tx(x), ty(scene.viewport.y[0]));
        context.lineTo(tx(x), ty(scene.viewport.y[1]));
        context.stroke();
      }
      for (let y = Math.ceil(scene.viewport.y[0]); y <= scene.viewport.y[1]; y += 1) {
        context.beginPath();
        context.moveTo(tx(scene.viewport.x[0]), ty(y));
        context.lineTo(tx(scene.viewport.x[1]), ty(y));
        context.stroke();
      }
      context.globalAlpha = 1;
    }

    context.strokeStyle = COLORS.ink;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(tx(scene.viewport.x[0]), ty(0));
    context.lineTo(tx(scene.viewport.x[1]), ty(0));
    context.moveTo(tx(0), ty(scene.viewport.y[0]));
    context.lineTo(tx(0), ty(scene.viewport.y[1]));
    context.stroke();

    context.font = "11px var(--font-geist-mono), monospace";
    context.fillStyle = COLORS.muted;
    context.textAlign = "center";
    for (let x = 1; x <= Math.floor(scene.viewport.x[1]); x += 1) {
      context.fillText(String(x), tx(x), ty(0) + 18);
    }
    context.textAlign = "right";
    for (let y = 1; y <= Math.floor(scene.viewport.y[1]); y += 1) {
      context.fillText(String(y), tx(0) - 10, ty(y) + 4);
    }
    context.fillStyle = COLORS.ink;
    context.font = "italic 14px Georgia, serif";
    context.fillText("x₂", tx(0) - 8, ty(scene.viewport.y[1]) + 12);
    context.textAlign = "left";
    context.fillText("x₁", tx(scene.viewport.x[1]) - 15, ty(0) + 20);

    const feasible = clipToConstraints(activeConstraints, scene.viewport);
    if (scene.showFeasibleRegion && feasible.length > 2) {
      context.beginPath();
      feasible.forEach((point, index) => {
        const method = index === 0 ? "moveTo" : "lineTo";
        context[method](tx(point[0]), ty(point[1]));
      });
      context.closePath();
      const gradient = context.createLinearGradient(0, ty(6), 0, ty(0));
      gradient.addColorStop(0, "rgba(212, 239, 119, 0.48)");
      gradient.addColorStop(1, "rgba(121, 201, 192, 0.24)");
      context.fillStyle = gradient;
      context.fill();
      context.strokeStyle = COLORS.ink;
      context.lineWidth = 2.5;
      context.stroke();
    }

    if (showLattice || scene.showLattice) {
      const allLattice: Point2D[] = [];
      for (let x = Math.ceil(scene.viewport.x[0]); x <= scene.viewport.x[1]; x += 1) {
        for (let y = Math.ceil(scene.viewport.y[0]); y <= scene.viewport.y[1]; y += 1) {
          allLattice.push([x, y]);
        }
      }
      const feasibleIntegers = integerPoints(activeConstraints, scene.viewport);
      const feasibleKeys = new Set(feasibleIntegers.map((point) => point.join(",")));
      allLattice.forEach((point) => {
        const isFeasible = feasibleKeys.has(point.join(","));
        context.beginPath();
        context.arc(tx(point[0]), ty(point[1]), isFeasible ? 4.2 : 2.5, 0, Math.PI * 2);
        context.fillStyle = isFeasible ? COLORS.ink : "rgba(16, 32, 42, .22)";
        context.fill();
      });

      if (scene.showIntegerHull && feasibleIntegers.length > 2) {
        const hull = convexHull(feasibleIntegers);
        context.beginPath();
        hull.forEach((point, index) => {
          if (index === 0) context.moveTo(tx(point[0]), ty(point[1]));
          else context.lineTo(tx(point[0]), ty(point[1]));
        });
        context.closePath();
        context.fillStyle = "rgba(242, 139, 69, .16)";
        context.fill();
        context.setLineDash([8, 6]);
        context.strokeStyle = COLORS.orange;
        context.lineWidth = 2.5;
        context.stroke();
        context.setLineDash([]);
      }
    }

    if (scene.showConstraints !== false) {
      activeConstraints.forEach((constraint, index) => {
        const [from, to] = constraintLine(
          constraint,
          scene.viewport,
        );

        context.beginPath();
        context.moveTo(tx(from[0]), ty(from[1]));
        context.lineTo(tx(to[0]), ty(to[1]));

        context.strokeStyle =
          constraint.color ??
          [COLORS.orange, COLORS.aqua, COLORS.lime][
          index % 3
          ];

        context.lineWidth =
          scene.showActiveConstraints ? 2.2 : 1.4;

        context.globalAlpha =
          scene.showActiveConstraints ? 1 : 0.66;

        context.stroke();
        context.globalAlpha = 1;
      });
    }

    renderSplitProjection({
      context,
      scene,
      tx,
      ty,
      animationProgress,
      showLabels,
    });

    if (scene.objective) {
      const direction = scene.objective.vector;
      const offset = 1.2 + animationProgress * 3.2;
      const anchor: Point2D = [direction[0] * offset * 0.55, direction[1] * offset * 0.55];
      const perpendicular: Point2D = [-direction[1], direction[0]];
      const length = 1.6;
      const p1: Point2D = [
        anchor[0] - perpendicular[0] * length,
        anchor[1] - perpendicular[1] * length,
      ];
      const p2: Point2D = [
        anchor[0] + perpendicular[0] * length,
        anchor[1] + perpendicular[1] * length,
      ];
      context.setLineDash([10, 7]);
      context.lineWidth = 2.5;
      context.strokeStyle = COLORS.rose;
      context.beginPath();
      context.moveTo(tx(p1[0]), ty(p1[1]));
      context.lineTo(tx(p2[0]), ty(p2[1]));
      context.stroke();
      context.setLineDash([]);

      const center: Point2D = [6.4, 1.1];
      const vectorLength = Math.hypot(direction[0], direction[1]);
      const end: Point2D = [
        center[0] + (direction[0] / vectorLength) * 0.9,
        center[1] + (direction[1] / vectorLength) * 0.9,
      ];
      context.strokeStyle = COLORS.rose;
      context.fillStyle = COLORS.rose;
      context.lineWidth = 2.5;
      context.beginPath();
      context.moveTo(tx(center[0]), ty(center[1]));
      context.lineTo(tx(end[0]), ty(end[1]));
      context.stroke();
      const angle = Math.atan2(ty(end[1]) - ty(center[1]), tx(end[0]) - tx(center[0]));
      context.beginPath();
      context.moveTo(tx(end[0]), ty(end[1]));
      context.lineTo(tx(end[0]) - 10 * Math.cos(angle - 0.45), ty(end[1]) - 10 * Math.sin(angle - 0.45));
      context.lineTo(tx(end[0]) - 10 * Math.cos(angle + 0.45), ty(end[1]) - 10 * Math.sin(angle + 0.45));
      context.closePath();
      context.fill();
      if (showLabels) {
        context.font = "12px var(--font-geist-mono), monospace";
        context.fillText(scene.objective.label, tx(center[0]), ty(center[1]) + 22);
      }
    }

    verticesRef.current = feasible.map((point) => ({ point, screen: [tx(point[0]), ty(point[1])] }));
    if ((showVertices || scene.showVertices) && feasible.length) {
      feasible.forEach((point) => {
        context.beginPath();
        context.arc(tx(point[0]), ty(point[1]), 6, 0, Math.PI * 2);
        context.fillStyle = COLORS.paper;
        context.fill();
        context.strokeStyle = COLORS.ink;
        context.lineWidth = 2.5;
        context.stroke();
        if (showLabels) {
          context.font = "11px var(--font-geist-mono), monospace";
          context.textAlign = "left";
          context.fillStyle = COLORS.ink;
          context.fillText(`(${round(point[0])}, ${round(point[1])})`, tx(point[0]) + 9, ty(point[1]) - 9);
        }
      });
    }

    scene.primitives?.forEach((primitive) => {
      if (primitive.kind === "point") {
        const color =
          primitive.style === "fractional"
            ? COLORS.rose
            : primitive.style === "integer"
              ? COLORS.orange
              : COLORS.ink;
        context.beginPath();
        context.arc(tx(primitive.at[0]), ty(primitive.at[1]), 7, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.strokeStyle = COLORS.paper;
        context.lineWidth = 2;
        context.stroke();
        if (primitive.label && showLabels) {
          context.font = "12px var(--font-geist-mono), monospace";
          context.textAlign = "left";
          context.fillStyle = color;
          context.fillText(primitive.label, tx(primitive.at[0]) + 11, ty(primitive.at[1]) - 11);
        }
      }
    });
  }, [
    activeConstraints,
    animationProgress,
    scene,
    showLabels,
    showLattice,
    showVertices,
    size,
    zoom,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer: Point2D = [event.clientX - bounds.left, event.clientY - bounds.top];
    const nearest = verticesRef.current.find(
      ({ screen }) => Math.hypot(screen[0] - pointer[0], screen[1] - pointer[1]) < 16,
    );
    event.currentTarget.style.cursor = nearest ? "crosshair" : "default";
    if (nearest) {
      onVertexFocus({
        point: nearest.point,
        active: activeConstraintsAt(nearest.point, activeConstraints),
      });
    } else {
      onVertexFocus(null);
    }
  };

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <canvas
        aria-label="Interactive coordinate plane showing the current polyhedron"
        onPointerLeave={() => onVertexFocus(null)}
        onPointerMove={handlePointerMove}
        ref={canvasRef}
        role="img"
      />
      <div className="canvas-caption">
        <span>ℝ² coordinate plane</span>
        <span>{activeConstraints.length} active halfspaces</span>
      </div>
    </div>
  );
}
