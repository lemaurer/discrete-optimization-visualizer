"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  activeConstraintsAt,
  clipToConstraints,
  constraintLine,
  convexHull,
  integerPoints,
} from "@/engine/geometry";
import { renderSplitProjection } from "@/engine/renderSplitProjection";
import type {
  Constraint,
  Point2D,
  Primitive,
  Scene,
} from "@/engine/types";

interface VisualizationCanvasProps {
  scene: Scene;
  enabledConstraints: Set<string>;
  showGrid: boolean;
  showLattice: boolean;
  showVertices: boolean;
  showLabels: boolean;
  zoom: number;
  animationProgress: number;
  isPlaying: boolean;
  onVertexFocus: (value: { point: Point2D; active: Constraint[] } | null) => void;
}

const EPSILON = 1e-9;

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

function formatTick(value: number) {
  const cleaned = Math.abs(value) < EPSILON ? 0 : value;
  const rounded = Math.round(cleaned * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function automaticTickStep(range: number) {
  if (range >= 2.5) return 1;

  const rough = range / 6;
  const exponent = Math.floor(Math.log10(Math.max(rough, EPSILON)));
  const magnitude = 10 ** exponent;
  const normalized = rough / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

function tickValues(minimum: number, maximum: number, step: number) {
  if (!Number.isFinite(step) || step <= 0) return [];

  const values: number[] = [];
  const first = Math.ceil((minimum - EPSILON) / step) * step;
  const maxCount = 200;

  for (let index = 0; index < maxCount; index += 1) {
    const value = first + index * step;
    if (value > maximum + EPSILON) break;
    values.push(Math.abs(value) < EPSILON ? 0 : value);
  }

  return values;
}

function drawPolygonPath(
  context: CanvasRenderingContext2D,
  points: Point2D[],
  tx: (value: number) => number,
  ty: (value: number) => number,
) {
  if (points.length === 0) return;

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(tx(point[0]), ty(point[1]));
    else context.lineTo(tx(point[0]), ty(point[1]));
  });
  context.closePath();
}

function drawArrowHead(
  context: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  size = 10,
) {
  const start = [tx(from[0]), ty(from[1])] as Point2D;
  const end = [tx(to[0]), ty(to[1])] as Point2D;
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);

  context.beginPath();
  context.moveTo(end[0], end[1]);
  context.lineTo(
    end[0] - size * Math.cos(angle - 0.45),
    end[1] - size * Math.sin(angle - 0.45),
  );
  context.lineTo(
    end[0] - size * Math.cos(angle + 0.45),
    end[1] - size * Math.sin(angle + 0.45),
  );
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function drawPrimitive(
  context: CanvasRenderingContext2D,
  primitive: Primitive,
  tx: (value: number) => number,
  ty: (value: number) => number,
  showLabels: boolean,
  animationProgress: number,
  isPlaying: boolean,
) {
  context.save();

  if (primitive.kind === "point") {
    const color =
      primitive.style === "fractional"
        ? COLORS.rose
        : primitive.style === "graph-node-active"
          ? COLORS.aqua
          : primitive.style === "graph-node-invalid"
            ? COLORS.rose
            : primitive.style === "facility"
              ? COLORS.orange
              : primitive.style === "facility-fractional"
                ? COLORS.rose
                : primitive.style === "facility-closed"
                  ? COLORS.muted
                  : primitive.style === "client"
                    ? COLORS.aqua
        : primitive.style === "integer"
          ? COLORS.orange
          : primitive.style === "optimum"
            ? COLORS.violet
            : COLORS.ink;

    const pointProgress = isPlaying ? animationProgress : 1;
    const displayedPoint: Point2D = primitive.animateFrom
      ? [
          primitive.animateFrom[0] +
            (primitive.at[0] - primitive.animateFrom[0]) * pointProgress,
          primitive.animateFrom[1] +
            (primitive.at[1] - primitive.animateFrom[1]) * pointProgress,
        ]
      : primitive.at;
    const px = tx(displayedPoint[0]);
    const py = ty(displayedPoint[1]);
    context.beginPath();
    if (
      primitive.style === "facility" ||
      primitive.style === "facility-fractional" ||
      primitive.style === "facility-closed"
    ) {
      context.rect(px - 8, py - 8, 16, 16);
    } else if (primitive.style === "client") {
      context.moveTo(px, py - 8);
      context.lineTo(px + 8, py);
      context.lineTo(px, py + 8);
      context.lineTo(px - 8, py);
      context.closePath();
    } else {
      context.arc(px, py, primitive.style === "lattice" ? 3.2 : 7, 0, Math.PI * 2);
    }
    const outlined =
      primitive.style === "facility-closed" || primitive.style === "graph-node";
    context.fillStyle = outlined ? COLORS.paper : color;
    context.fill();
    if (primitive.style !== "lattice") {
      context.strokeStyle = outlined ? color : COLORS.paper;
      context.lineWidth = outlined ? 3 : 2;
      context.stroke();
    }

    if (primitive.label && showLabels) {
      context.font = "12px var(--font-geist-mono), monospace";
      context.textAlign = "left";
      context.fillStyle = color;
      context.fillText(
        primitive.label,
        tx(displayedPoint[0]) + 11,
        ty(displayedPoint[1]) - 11,
      );
    }
  }

  if (primitive.kind === "polygon" && primitive.points.length > 1) {
    const polygonProgress = isPlaying ? animationProgress : 1;
    const displayedPoints =
      primitive.fromPoints?.length === primitive.points.length
        ? primitive.points.map<Point2D>((point, index) => [
            primitive.fromPoints![index][0] +
              (point[0] - primitive.fromPoints![index][0]) * polygonProgress,
            primitive.fromPoints![index][1] +
              (point[1] - primitive.fromPoints![index][1]) * polygonProgress,
          ])
        : primitive.points;
    drawPolygonPath(context, displayedPoints, tx, ty);
    const style = primitive.style ?? "feasible";
    context.fillStyle =
      style === "removed"
        ? "rgba(226, 124, 137, 0.22)"
        : style === "integer-hull"
          ? "rgba(242, 139, 69, 0.12)"
          : style === "component"
            ? "rgba(121, 201, 192, 0.08)"
            : "rgba(143, 136, 220, 0.11)";
    context.strokeStyle =
      style === "removed"
        ? COLORS.rose
        : style === "integer-hull"
          ? COLORS.orange
          : style === "component"
            ? COLORS.aqua
            : COLORS.violet;
    context.lineWidth = 2;
    if (style !== "removed") context.setLineDash([7, 6]);
    if (primitive.points.length > 2) context.fill();
    context.stroke();

    if (primitive.label && showLabels) {
      const center = displayedPoints.reduce<Point2D>(
        (sum, point) => [sum[0] + point[0], sum[1] + point[1]],
        [0, 0],
      );
      center[0] /= displayedPoints.length;
      center[1] /= displayedPoints.length;
      context.setLineDash([]);
      context.font = "11px var(--font-geist-mono), monospace";
      context.textAlign = "center";
      context.fillStyle = context.strokeStyle;
      context.fillText(primitive.label, tx(center[0]), ty(center[1]) - 8);
    }
  }

  if (primitive.kind === "line") {
    const color = primitive.color ?? (primitive.style === "cut" ? COLORS.rose : COLORS.ink);
    context.beginPath();
    context.moveTo(tx(primitive.from[0]), ty(primitive.from[1]));
    context.lineTo(tx(primitive.to[0]), ty(primitive.to[1]));
    context.strokeStyle = color;
    context.lineWidth = primitive.style === "cut" ? 3 : 2;
    if (primitive.style !== "constraint") context.setLineDash([8, 6]);
    context.stroke();

    if (primitive.label && showLabels) {
      context.setLineDash([]);
      context.font = "11px var(--font-geist-mono), monospace";
      context.textAlign = "center";
      context.fillStyle = color;
      context.fillText(
        primitive.label,
        (tx(primitive.from[0]) + tx(primitive.to[0])) / 2,
        (ty(primitive.from[1]) + ty(primitive.to[1])) / 2 - 9,
      );
    }
  }

  if (primitive.kind === "vector") {
    const color = primitive.color ?? COLORS.violet;
    const vectorProgress = primitive.animate && isPlaying ? animationProgress : 1;
    const displayedTo: Point2D = [
      primitive.from[0] + (primitive.to[0] - primitive.from[0]) * vectorProgress,
      primitive.from[1] + (primitive.to[1] - primitive.from[1]) * vectorProgress,
    ];
    context.beginPath();
    context.moveTo(tx(primitive.from[0]), ty(primitive.from[1]));
    context.lineTo(tx(displayedTo[0]), ty(displayedTo[1]));
    context.strokeStyle = color;
    context.lineWidth = 2.5;
    context.stroke();
    if (vectorProgress > 0.08) {
      drawArrowHead(context, primitive.from, displayedTo, tx, ty, color);
    }

    if (primitive.label && showLabels) {
      context.font = "11px var(--font-geist-mono), monospace";
      context.textAlign = "left";
      context.fillStyle = color;
      context.fillText(primitive.label, tx(displayedTo[0]) + 8, ty(displayedTo[1]) - 8);
    }
  }

  if (primitive.kind === "label" && showLabels) {
    context.font = "11px var(--font-geist-mono), monospace";
    context.textAlign = "center";
    context.fillStyle =
      primitive.tone === "accent"
        ? COLORS.rose
        : primitive.tone === "muted"
          ? COLORS.muted
          : COLORS.ink;
    context.fillText(primitive.text, tx(primitive.at[0]), ty(primitive.at[1]));
  }

  context.restore();
}

export function VisualizationCanvas({
  scene,
  enabledConstraints,
  showGrid,
  showLattice,
  showVertices,
  showLabels,
  zoom,
  animationProgress,
  isPlaying,
  onVertexFocus,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const verticesRef = useRef<Array<{ point: Point2D; screen: Point2D }>>([]);

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

    const padding = {
      x: size.width < 600 ? 42 : 72,
      y: size.height < 500 ? 38 : 58,
    };
    const xRange = scene.viewport.x[1] - scene.viewport.x[0];
    const yRange = scene.viewport.y[1] - scene.viewport.y[0];
    const availableWidth = Math.max(1, size.width - padding.x * 2);
    const availableHeight = Math.max(1, size.height - padding.y * 2);

    let xScale: number;
    let yScale: number;
    const aspectRatio = Math.max(xRange / yRange, yRange / xRange);
    const shouldStretch =
      scene.scaleMode === "stretch" ||
      (scene.scaleMode === undefined &&
        scene.latticeMode !== undefined &&
        aspectRatio > 2.5);

    if (shouldStretch) {
      xScale = (availableWidth / xRange) * zoom;
      yScale = (availableHeight / yRange) * zoom;
    } else {
      const uniformScale = Math.min(availableWidth / xRange, availableHeight / yRange) * zoom;
      xScale = uniformScale;
      yScale = uniformScale;
    }

    const plotWidth = xRange * xScale;
    const plotHeight = yRange * yScale;
    const offsetX = (size.width - plotWidth) / 2;
    const offsetY = (size.height - plotHeight) / 2;
    const tx = (value: number) => offsetX + (value - scene.viewport.x[0]) * xScale;
    const ty = (value: number) => size.height - offsetY - (value - scene.viewport.y[0]) * yScale;

    const xTickStep = scene.axisTicks?.x ?? automaticTickStep(xRange);
    const yTickStep = scene.axisTicks?.y ?? automaticTickStep(yRange);
    const xTicks = tickValues(scene.viewport.x[0], scene.viewport.x[1], xTickStep);
    const yTicks = tickValues(scene.viewport.y[0], scene.viewport.y[1], yTickStep);

    if (showGrid) {
      context.save();
      context.lineWidth = 1;
      context.strokeStyle = COLORS.grid;
      context.globalAlpha = 0.72;

      xTicks.forEach((x) => {
        context.beginPath();
        context.moveTo(tx(x), ty(scene.viewport.y[0]));
        context.lineTo(tx(x), ty(scene.viewport.y[1]));
        context.stroke();
      });

      yTicks.forEach((y) => {
        context.beginPath();
        context.moveTo(tx(scene.viewport.x[0]), ty(y));
        context.lineTo(tx(scene.viewport.x[1]), ty(y));
        context.stroke();
      });

      context.restore();
    }

    if (scene.showAxes !== false) {
      const xAxisVisible = scene.viewport.y[0] <= 0 && scene.viewport.y[1] >= 0;
      const yAxisVisible = scene.viewport.x[0] <= 0 && scene.viewport.x[1] >= 0;

    context.save();
    context.strokeStyle = COLORS.ink;
    context.fillStyle = COLORS.ink;
    context.lineWidth = 1.8;

    if (xAxisVisible) {
      const from: Point2D = [scene.viewport.x[0], 0];
      const to: Point2D = [scene.viewport.x[1], 0];
      context.beginPath();
      context.moveTo(tx(from[0]), ty(from[1]));
      context.lineTo(tx(to[0]), ty(to[1]));
      context.stroke();
      drawArrowHead(
        context,
        [scene.viewport.x[1] - xRange * 0.04, 0],
        to,
        tx,
        ty,
        COLORS.ink,
        8,
      );
    }

    if (yAxisVisible) {
      const from: Point2D = [0, scene.viewport.y[0]];
      const to: Point2D = [0, scene.viewport.y[1]];
      context.beginPath();
      context.moveTo(tx(from[0]), ty(from[1]));
      context.lineTo(tx(to[0]), ty(to[1]));
      context.stroke();
      drawArrowHead(
        context,
        [0, scene.viewport.y[1] - yRange * 0.05],
        to,
        tx,
        ty,
        COLORS.ink,
        8,
      );
    }

    context.lineWidth = 1.2;
    if (xAxisVisible) {
      xTicks.forEach((x) => {
        context.beginPath();
        context.moveTo(tx(x), ty(0) - 4);
        context.lineTo(tx(x), ty(0) + 4);
        context.stroke();
      });
    }
    if (yAxisVisible) {
      yTicks.forEach((y) => {
        context.beginPath();
        context.moveTo(tx(0) - 4, ty(y));
        context.lineTo(tx(0) + 4, ty(y));
        context.stroke();
      });
    }
    context.restore();

    if (showLabels) {
      context.save();
      context.font = "11px var(--font-geist-mono), monospace";
      context.fillStyle = COLORS.muted;

      if (xAxisVisible) {
        context.textAlign = "center";
        xTicks.forEach((x) => {
          if (Math.abs(x) < EPSILON) return;
          context.fillText(formatTick(x), tx(x), ty(0) + 18);
        });
      }

      if (yAxisVisible) {
        context.textAlign = "right";
        yTicks.forEach((y) => {
          if (Math.abs(y) < EPSILON) return;
          context.fillText(formatTick(y), tx(0) - 10, ty(y) + 4);
        });
      }

      context.fillStyle = COLORS.ink;
      context.font = "italic 14px Georgia, serif";

      if (yAxisVisible) {
        context.textAlign = "right";
        context.fillText(
          scene.axisLabels?.y ?? "x₂",
          tx(0) - 8,
          ty(scene.viewport.y[1]) + 14,
        );
      }

      if (xAxisVisible) {
        context.textAlign = "right";
        context.fillText(
          scene.axisLabels?.x ?? "x₁",
          tx(scene.viewport.x[1]) - 8,
          ty(0) + 24,
        );
      }

      context.restore();
    }
    }

    const feasible = clipToConstraints(activeConstraints, scene.viewport);
    if (scene.showFeasibleRegion && feasible.length > 2) {
      drawPolygonPath(context, feasible, tx, ty);
      const gradient = context.createLinearGradient(
        0,
        ty(scene.viewport.y[1]),
        0,
        ty(scene.viewport.y[0]),
      );
      gradient.addColorStop(0, "rgba(121, 201, 192, 0.24)");
      gradient.addColorStop(1, "rgba(212, 239, 119, 0.48)");
      context.fillStyle = gradient;
      context.fill();
      context.strokeStyle = COLORS.ink;
      context.lineWidth = 2.5;
      context.stroke();
    }

    const latticeMode = scene.latticeMode ?? "points";
    const feasibleIntegers =
      showLattice || scene.showIntegerHull
        ? integerPoints(activeConstraints, scene.viewport)
        : [];

    if (showLattice && latticeMode === "points") {
      const feasibleKeys = new Set(feasibleIntegers.map((point) => point.join(",")));
      for (let x = Math.ceil(scene.viewport.x[0]); x <= Math.floor(scene.viewport.x[1]); x += 1) {
        for (let y = Math.ceil(scene.viewport.y[0]); y <= Math.floor(scene.viewport.y[1]); y += 1) {
          const point: Point2D = [x, y];
          const isFeasible = feasibleKeys.has(point.join(","));
          context.beginPath();
          context.arc(tx(x), ty(y), isFeasible ? 4.2 : 2.5, 0, Math.PI * 2);
          context.fillStyle = isFeasible ? COLORS.ink : "rgba(16, 32, 42, .22)";
          context.fill();
        }
      }
    }

    if (showLattice && latticeMode !== "points") {
      context.save();
      context.strokeStyle = "rgba(16, 32, 42, .28)";
      context.lineWidth = 1.5;
      context.setLineDash([3, 5]);

      if (latticeMode === "x-lines") {
        for (let x = Math.ceil(scene.viewport.x[0]); x <= Math.floor(scene.viewport.x[1]); x += 1) {
          context.beginPath();
          context.moveTo(tx(x), ty(scene.viewport.y[0]));
          context.lineTo(tx(x), ty(scene.viewport.y[1]));
          context.stroke();
        }
      } else {
        for (let y = Math.ceil(scene.viewport.y[0]); y <= Math.floor(scene.viewport.y[1]); y += 1) {
          context.beginPath();
          context.moveTo(tx(scene.viewport.x[0]), ty(y));
          context.lineTo(tx(scene.viewport.x[1]), ty(y));
          context.stroke();
        }
      }

      context.restore();
    }

    if (scene.showIntegerHull && feasibleIntegers.length > 2) {
      const hull = convexHull(feasibleIntegers);
      drawPolygonPath(context, hull, tx, ty);
      context.fillStyle = "rgba(242, 139, 69, .16)";
      context.fill();
      context.setLineDash([8, 6]);
      context.strokeStyle = COLORS.orange;
      context.lineWidth = 2.5;
      context.stroke();
      context.setLineDash([]);
    }

    if (scene.showConstraints !== false) {
      activeConstraints.forEach((constraint, index) => {
        const [from, to] = constraintLine(constraint, scene.viewport);
        context.beginPath();
        context.moveTo(tx(from[0]), ty(from[1]));
        context.lineTo(tx(to[0]), ty(to[1]));
        context.strokeStyle =
          constraint.color ?? [COLORS.orange, COLORS.aqua, COLORS.lime][index % 3];
        context.lineWidth = scene.showActiveConstraints ? 2.2 : 1.4;
        context.globalAlpha = scene.showActiveConstraints ? 1 : 0.66;
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

    scene.primitives
      ?.filter((primitive) => primitive.kind === "circle")
      .forEach((primitive) => {
        const delay = Math.min(0.85, Math.max(0, primitive.animationDelay ?? 0));
        const circleProgress =
          isPlaying && primitive.animate !== false
            ? Math.min(1, Math.max(0, (animationProgress - delay) / Math.max(0.15, 1 - delay)))
            : 1;
        if (circleProgress <= 0) return;
        const radius = primitive.radius * Math.min(xScale, yScale) * circleProgress;
        const color = primitive.color ?? COLORS.aqua;
        context.beginPath();
        context.arc(tx(primitive.at[0]), ty(primitive.at[1]), radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = primitive.style === "component" ? 0.09 : 0.14;
        context.fill();
        context.globalAlpha = 0.72;
        context.strokeStyle = color;
        context.lineWidth = 1.8;
        context.setLineDash(primitive.style === "component" ? [7, 6] : []);
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;
        if (primitive.label && showLabels && circleProgress > 0.72) {
          context.font = "12px var(--font-geist-mono), monospace";
          context.textAlign = "center";
          context.fillStyle = color;
          context.fillText(
            primitive.label,
            tx(primitive.at[0]),
            ty(primitive.at[1]) - radius - 8,
          );
        }
      });

    scene.primitives
      ?.filter((primitive) => primitive.kind === "line")
      .forEach((primitive) => {
        const isAnimatedLine =
          primitive.animate !== false &&
          (primitive.style === "assignment" ||
            primitive.style === "graph-edge" ||
            primitive.style === "graph-edge-rejected" ||
            primitive.style === "graph-arc" ||
            primitive.style === "graph-rejected");
        const delay = Math.min(0.85, Math.max(0, primitive.animationDelay ?? 0));
        const lineProgress =
          isAnimatedLine && isPlaying
            ? Math.min(1, Math.max(0, (animationProgress - delay) / Math.max(0.15, 1 - delay)))
            : 1;
        const animatedTo: Point2D = [
          primitive.from[0] + (primitive.to[0] - primitive.from[0]) * lineProgress,
          primitive.from[1] + (primitive.to[1] - primitive.from[1]) * lineProgress,
        ];
        context.beginPath();
        context.moveTo(tx(primitive.from[0]), ty(primitive.from[1]));
        context.lineTo(tx(animatedTo[0]), ty(animatedTo[1]));
        context.strokeStyle = primitive.color ?? COLORS.rose;
        context.lineWidth =
          primitive.style === "constraint" || isAnimatedLine ? 2 : 2.5;
        if (primitive.style === "cut") context.setLineDash([8, 6]);
        if (primitive.style === "objective") context.setLineDash([10, 7]);
        if (primitive.style === "graph-rejected") context.setLineDash([6, 6]);
        if (primitive.style === "graph-edge-rejected") context.setLineDash([6, 6]);
        context.stroke();
        context.setLineDash([]);

        if (
          (primitive.style === "assignment" ||
            primitive.style === "graph-arc" ||
            primitive.style === "graph-rejected") &&
          lineProgress > 0.12
        ) {
          const fromScreen: Point2D = [tx(primitive.from[0]), ty(primitive.from[1])];
          const toScreen: Point2D = [tx(animatedTo[0]), ty(animatedTo[1])];
          const angle = Math.atan2(toScreen[1] - fromScreen[1], toScreen[0] - fromScreen[0]);
          context.beginPath();
          context.moveTo(toScreen[0], toScreen[1]);
          context.lineTo(
            toScreen[0] - 8 * Math.cos(angle - 0.42),
            toScreen[1] - 8 * Math.sin(angle - 0.42),
          );
          context.lineTo(
            toScreen[0] - 8 * Math.cos(angle + 0.42),
            toScreen[1] - 8 * Math.sin(angle + 0.42),
          );
          context.closePath();
          context.fillStyle = primitive.color ?? COLORS.rose;
          context.fill();
        }

        if (primitive.label && showLabels && lineProgress > 0.82) {
          const midpoint: Point2D = [
            (primitive.from[0] + primitive.to[0]) / 2,
            (primitive.from[1] + primitive.to[1]) / 2,
          ];
          context.font = "12px var(--font-geist-mono), monospace";
          context.textAlign = "left";
          context.fillStyle = COLORS.ink;
          context.fillText(primitive.label, tx(midpoint[0]) + 8, ty(midpoint[1]) - 8);
        }
      });

    if (scene.objective) {
      const direction = scene.objective.vector;
      const offset = 1.2 + animationProgress * 3.2;
      const anchor: Point2D = [
        direction[0] * offset * 0.55,
        direction[1] * offset * 0.55,
      ];
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

      const center: Point2D = [
        scene.viewport.x[0] + xRange * 0.82,
        scene.viewport.y[0] + yRange * 0.18,
      ];
      const vectorLength = Math.hypot(direction[0], direction[1]);
      const end: Point2D = [
        center[0] + (direction[0] / vectorLength) * 0.9,
        center[1] + (direction[1] / vectorLength) * 0.9,
      ];

      context.strokeStyle = COLORS.rose;
      context.lineWidth = 2.5;
      context.beginPath();
      context.moveTo(tx(center[0]), ty(center[1]));
      context.lineTo(tx(end[0]), ty(end[1]));
      context.stroke();
      drawArrowHead(context, center, end, tx, ty, COLORS.rose);

      if (showLabels) {
        context.font = "12px var(--font-geist-mono), monospace";
        context.fillStyle = COLORS.rose;
        context.fillText(scene.objective.label, tx(center[0]), ty(center[1]) + 22);
      }
    }

    const originalVerticesVisible = showVertices && scene.showFeasibleRegion !== false;
    verticesRef.current = originalVerticesVisible
      ? feasible.map((point) => ({ point, screen: [tx(point[0]), ty(point[1])] }))
      : [];

    if (originalVerticesVisible && feasible.length) {
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
          context.fillText(
            `(${round(point[0])}, ${round(point[1])})`,
            tx(point[0]) + 9,
            ty(point[1]) - 9,
          );
        }
      });
    }

    scene.primitives
      ?.filter((primitive) => primitive.kind !== "line" && primitive.kind !== "circle")
      .forEach((primitive) =>
        drawPrimitive(
          context,
          primitive,
          tx,
          ty,
          showLabels,
          animationProgress,
          isPlaying,
        ),
      );
  }, [
    activeConstraints,
    animationProgress,
    isPlaying,
    scene,
    showGrid,
    showLabels,
    showLattice,
    showVertices,
    size,
    zoom,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer: Point2D = [
      event.clientX - bounds.left,
      event.clientY - bounds.top,
    ];
    const nearest = verticesRef.current.find(
      ({ screen }) =>
        Math.hypot(screen[0] - pointer[0], screen[1] - pointer[1]) < 16,
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
        aria-label={
          scene.caption?.label ??
          scene.caption?.primary ??
          "Interactive coordinate plane showing the current polyhedron"
        }
        onPointerLeave={() => onVertexFocus(null)}
        onPointerMove={handlePointerMove}
        ref={canvasRef}
        role="img"
      />
      <div className="canvas-caption">
        <span>{scene.caption?.label ?? scene.caption?.primary ?? "ℝ² coordinate plane"}</span>
        <span>
          {scene.caption?.detail ??
            scene.caption?.secondary ??
            `${activeConstraints.length} active halfspaces`}
        </span>
      </div>
    </div>
  );
}
