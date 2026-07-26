import type {
  Point2D,
  Scene,
} from "./types";

import {
  computeSplitGeometry,
  lerpPoint,
} from "./split";

interface RenderSplitProjectionOptions {
  context: CanvasRenderingContext2D;
  scene: Scene;
  tx: (value: number) => number;
  ty: (value: number) => number;
  animationProgress: number;
  showLabels: boolean;
}

const DEFAULT_ACCENT = "#7a70df";
const DEFAULT_STRIP = "#e27c89";
const INK = "#10202a";
const PAPER = "#f5f2e8";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function drawSegment(
  context: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  width = 2,
  alpha = 1,
  dashed = false,
) {
  context.save();

  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = width;

  if (dashed) {
    context.setLineDash([7, 6]);
  }

  context.beginPath();
  context.moveTo(tx(from[0]), ty(from[1]));
  context.lineTo(tx(to[0]), ty(to[1]));
  context.stroke();

  context.restore();
}

function drawPolygon(
  context: CanvasRenderingContext2D,
  points: Point2D[],
  tx: (value: number) => number,
  ty: (value: number) => number,
  fill: string,
  stroke: string,
  alpha = 1,
  dashed = false,
) {
  if (points.length < 2) return;

  context.save();
  context.globalAlpha = alpha;

  context.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(tx(point[0]), ty(point[1]));
    } else {
      context.lineTo(tx(point[0]), ty(point[1]));
    }
  });

  if (points.length > 2) {
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }

  if (dashed) {
    context.setLineDash([8, 6]);
  }

  context.strokeStyle = stroke;
  context.lineWidth = 2.5;
  context.stroke();

  context.restore();
}

function drawPoint(
  context: CanvasRenderingContext2D,
  point: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  radius = 5,
) {
  context.save();

  context.beginPath();
  context.arc(
    tx(point[0]),
    ty(point[1]),
    radius,
    0,
    Math.PI * 2,
  );

  context.fillStyle = color;
  context.fill();

  context.strokeStyle = PAPER;
  context.lineWidth = 1.5;
  context.stroke();

  context.restore();
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  point: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
) {
  context.save();

  context.font =
    "12px var(--font-geist-mono), monospace";
  context.fillStyle = color;
  context.textAlign = "center";

  context.fillText(
    text,
    tx(point[0]),
    ty(point[1]) - 12,
  );

  context.restore();
}

function drawArrow(
  context: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
) {
  drawSegment(
    context,
    from,
    to,
    tx,
    ty,
    color,
    3,
  );

  const screenFrom: Point2D = [
    tx(from[0]),
    ty(from[1]),
  ];

  const screenTo: Point2D = [
    tx(to[0]),
    ty(to[1]),
  ];

  const angle = Math.atan2(
    screenTo[1] - screenFrom[1],
    screenTo[0] - screenFrom[0],
  );

  context.save();

  context.fillStyle = color;
  context.beginPath();
  context.moveTo(screenTo[0], screenTo[1]);

  context.lineTo(
    screenTo[0] - 11 * Math.cos(angle - 0.45),
    screenTo[1] - 11 * Math.sin(angle - 0.45),
  );

  context.lineTo(
    screenTo[0] - 11 * Math.cos(angle + 0.45),
    screenTo[1] - 11 * Math.sin(angle + 0.45),
  );

  context.closePath();
  context.fill();

  context.restore();
}

export function renderSplitProjection({
  context,
  scene,
  tx,
  ty,
  animationProgress,
  showLabels,
}: RenderSplitProjectionOptions) {
  const configuration = scene.splitProjection;

  if (!configuration) return;

  const progress = clamp01(animationProgress);

  const accent =
    configuration.color ?? DEFAULT_ACCENT;

  const stripColor =
    configuration.stripColor ?? DEFAULT_STRIP;

  const geometry = computeSplitGeometry(
    scene.constraints,
    scene.viewport,
    configuration.pi,
    configuration.pi0,
  );

  const drawAxis = () => {
    drawSegment(
      context,
      geometry.axis[0],
      geometry.axis[1],
      tx,
      ty,
      accent,
      3,
      0.9,
      true,
    );

    const norm = Math.hypot(
      configuration.pi[0],
      configuration.pi[1],
    );

    const arrowEnd: Point2D = [
      (configuration.pi[0] / norm) * 1.2,
      (configuration.pi[1] / norm) * 1.2,
    ];

    drawArrow(
      context,
      [0, 0],
      arrowEnd,
      tx,
      ty,
      accent,
    );

    if (showLabels) {
      drawText(
        context,
        "π",
        arrowEnd,
        tx,
        ty,
        accent,
      );
    }
  };

  const drawThresholdLabels = () => {
    if (!showLabels) return;

    drawText(
      context,
      `π₀ = ${configuration.pi0}`,
      geometry.lowerAxisPoint,
      tx,
      ty,
      stripColor,
    );

    drawText(
      context,
      `π₀ + 1 = ${configuration.pi0 + 1}`,
      geometry.upperAxisPoint,
      tx,
      ty,
      stripColor,
    );
  };

  switch (configuration.phase) {
    case "direction": {
      drawAxis();
      break;
    }

    case "project-facets": {
      drawAxis();

      geometry.facets.forEach((facet) => {
        const currentFrom = lerpPoint(
          facet.segment[0],
          facet.projectedSegment[0],
          progress,
        );

        const currentTo = lerpPoint(
          facet.segment[1],
          facet.projectedSegment[1],
          progress,
        );

        if (configuration.showGuides) {
          drawSegment(
            context,
            facet.segment[0],
            facet.projectedSegment[0],
            tx,
            ty,
            facet.constraint.color ?? accent,
            1,
            0.35,
            true,
          );

          drawSegment(
            context,
            facet.segment[1],
            facet.projectedSegment[1],
            tx,
            ty,
            facet.constraint.color ?? accent,
            1,
            0.35,
            true,
          );
        }

        drawSegment(
          context,
          currentFrom,
          currentTo,
          tx,
          ty,
          facet.constraint.color ?? accent,
          4,
          0.95,
        );
      });

      break;
    }

    case "project-polyhedron": {
      drawAxis();

      const movingPolygon =
        geometry.projectedVertices.map(
          ({ source, target }) =>
            lerpPoint(source, target, progress),
        );

      if (configuration.showGuides) {
        geometry.projectedVertices.forEach(
          ({ source, target }) => {
            drawSegment(
              context,
              source,
              target,
              tx,
              ty,
              accent,
              1,
              0.3,
              true,
            );
          },
        );
      }

      drawPolygon(
        context,
        movingPolygon,
        tx,
        ty,
        "rgba(122, 112, 223, 0.18)",
        accent,
      );

      movingPolygon.forEach((point) => {
        drawPoint(
          context,
          point,
          tx,
          ty,
          accent,
          4.5,
        );
      });

      break;
    }

    case "projected-strip": {
      drawAxis();

      drawSegment(
        context,
        geometry.projectedMinimum,
        geometry.projectedMaximum,
        tx,
        ty,
        INK,
        8,
        0.32,
      );

      drawSegment(
        context,
        geometry.lowerAxisPoint,
        geometry.upperAxisPoint,
        tx,
        ty,
        stripColor,
        13,
        0.65,
      );

      geometry.projectedVertices.forEach(
        ({ target, value }) => {
          drawPoint(
            context,
            target,
            tx,
            ty,
            accent,
            5,
          );

          if (showLabels) {
            drawText(
              context,
              value.toFixed(2),
              target,
              tx,
              ty,
              accent,
            );
          }
        },
      );

      drawThresholdLabels();
      break;
    }

    case "lift-strip": {
      drawAxis();

      drawSegment(
        context,
        geometry.lowerAxisPoint,
        geometry.upperAxisPoint,
        tx,
        ty,
        stripColor,
        13,
        0.55 * (1 - progress),
      );

      drawPolygon(
        context,
        geometry.strip,
        tx,
        ty,
        "rgba(226, 124, 137, 0.32)",
        stripColor,
        progress,
      );

      drawSegment(
        context,
        geometry.lowerBoundary[0],
        geometry.lowerBoundary[1],
        tx,
        ty,
        stripColor,
        2.5,
        progress,
        true,
      );

      drawSegment(
        context,
        geometry.upperBoundary[0],
        geometry.upperBoundary[1],
        tx,
        ty,
        stripColor,
        2.5,
        progress,
        true,
      );

      drawThresholdLabels();
      break;
    }

    case "remove-strip": {
      drawPolygon(
        context,
        geometry.left,
        tx,
        ty,
        "rgba(121, 201, 192, 0.27)",
        INK,
      );

      drawPolygon(
        context,
        geometry.right,
        tx,
        ty,
        "rgba(212, 239, 119, 0.27)",
        INK,
      );

      drawPolygon(
        context,
        geometry.strip,
        tx,
        ty,
        "rgba(226, 124, 137, 0.38)",
        stripColor,
        1 - progress,
      );

      break;
    }

    case "split-hull": {
      drawPolygon(
        context,
        geometry.left,
        tx,
        ty,
        "rgba(121, 201, 192, 0.18)",
        INK,
        0.7,
      );

      drawPolygon(
        context,
        geometry.right,
        tx,
        ty,
        "rgba(212, 239, 119, 0.18)",
        INK,
        0.7,
      );

      drawPolygon(
        context,
        geometry.splitHull,
        tx,
        ty,
        "rgba(122, 112, 223, 0.22)",
        accent,
        progress,
        true,
      );

      break;
    }
  }
}