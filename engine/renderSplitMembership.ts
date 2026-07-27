import {
  computeSplitMembershipGeometry,
  projectPointToConstraint,
} from "./splitMembership";
import {
  lerpPoint,
} from "./split";
import type {
  Constraint,
  Point2D,
  Scene,
} from "./types";

interface RenderSplitMembershipOptions {
  context: CanvasRenderingContext2D;
  scene: Scene;
  tx: (value: number) => number;
  ty: (value: number) => number;
  animationProgress: number;
  showLabels: boolean;
}

const INK = "#10202a";
const MUTED = "#7d898b";
const PAPER = "#f5f2e8";
const STRIP = "#e27c89";
const WITNESS = "#79c9c0";
const OVERLAP = "#d4ef77";
const RIGHT = "#8f88dc";
const WARNING = "#f28b45";
const SUCCESS = "#4f8b62";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function format(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2);
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
  if (dashed) context.setLineDash([7, 6]);
  context.strokeStyle = stroke;
  context.lineWidth = 2.2;
  context.stroke();
  context.restore();
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
  if (dashed) context.setLineDash([7, 6]);
  context.beginPath();
  context.moveTo(tx(from[0]), ty(from[1]));
  context.lineTo(tx(to[0]), ty(to[1]));
  context.stroke();
  context.restore();
}

function drawPoint(
  context: CanvasRenderingContext2D,
  point: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  radius = 7,
  alpha = 1,
) {
  context.save();
  context.globalAlpha = alpha;
  context.beginPath();
  context.arc(tx(point[0]), ty(point[1]), radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = PAPER;
  context.lineWidth = 2;
  context.stroke();
  context.restore();
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  point: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color = INK,
  align: CanvasTextAlign = "left",
) {
  context.save();
  context.font = "12px var(--font-geist-mono), monospace";
  context.textAlign = align;
  context.fillStyle = color;
  context.fillText(text, tx(point[0]), ty(point[1]));
  context.restore();
}

function drawConstraintSlack(
  context: CanvasRenderingContext2D,
  point: Point2D,
  constraint: Constraint,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  label: string,
  showLabels: boolean,
) {
  const boundaryPoint = projectPointToConstraint(point, constraint);
  drawSegment(
    context,
    point,
    boundaryPoint,
    tx,
    ty,
    color,
    3,
    0.95,
    true,
  );

  if (showLabels) {
    const midpoint: Point2D = [
      (point[0] + boundaryPoint[0]) / 2,
      (point[1] + boundaryPoint[1]) / 2,
    ];
    drawText(
      context,
      label,
      [midpoint[0] + 0.08, midpoint[1] + 0.08],
      tx,
      ty,
      color,
    );
  }
}

function drawSlackPanel(
  context: CanvasRenderingContext2D,
  tests: ReturnType<typeof computeSplitMembershipGeometry>["tests"],
  progress: number,
  focusConstraintId?: string,
) {
  if (!tests.length) return;

  const width = 310;
  const rowHeight = 39;
  const height = 52 + tests.length * rowHeight;
  const canvasWidth = context.canvas.clientWidth;
  const x = Math.max(12, canvasWidth - width - 16);
  const y = 16;

  context.save();
  context.fillStyle = "rgba(245, 242, 232, 0.95)";
  context.strokeStyle = "rgba(16, 32, 42, 0.24)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(x, y, width, height, 7);
  context.fill();
  context.stroke();

  context.fillStyle = INK;
  context.font = "600 11px var(--font-geist-mono), monospace";
  context.textAlign = "left";
  context.fillText("COMPONENTWISE SLACK TEST", x + 14, y + 20);

  context.font = "9px var(--font-geist-mono), monospace";
  context.fillStyle = MUTED;
  context.fillText("bᵢ−aᵢᵀy", x + 166, y + 37);
  context.fillText("(bᵢ−aᵢᵀx)/α", x + 235, y + 37);

  tests.forEach((test, index) => {
    const rowY = y + 50 + index * rowHeight;
    const focused =
      !focusConstraintId ||
      test.constraint.id === focusConstraintId;

    if (test.constraint.id === focusConstraintId) {
      context.fillStyle = "rgba(242, 139, 69, 0.12)";
      context.fillRect(x + 7, rowY - 11, width - 14, rowHeight - 3);
    }

    context.font = "9px var(--font-geist-mono), monospace";
    context.fillStyle = focused ? INK : "rgba(16, 32, 42, 0.42)";
    const label =
      test.constraint.label.length > 19
        ? `${test.constraint.label.slice(0, 18)}…`
        : test.constraint.label;
    context.fillText(label, x + 14, rowY + 5);

    const maxValue = Math.max(test.slackAtY, test.allowance, 0.01);
    const barStart = x + 119;
    const barWidth = 112;
    const yWidth =
      (Math.max(0, test.slackAtY) / maxValue) *
      barWidth *
      progress;
    const allowanceWidth =
      (Math.max(0, test.allowance) / maxValue) *
      barWidth *
      progress;

    context.fillStyle = "rgba(143, 136, 220, 0.18)";
    context.fillRect(barStart, rowY - 4, barWidth, 7);
    context.fillStyle = test.satisfied ? RIGHT : STRIP;
    context.fillRect(barStart, rowY - 4, yWidth, 7);

    context.strokeStyle = WITNESS;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(barStart + allowanceWidth, rowY - 8);
    context.lineTo(barStart + allowanceWidth, rowY + 7);
    context.stroke();

    context.fillStyle = test.satisfied ? SUCCESS : STRIP;
    context.font = "600 11px var(--font-geist-mono), monospace";
    context.textAlign = "right";
    context.fillText(test.satisfied ? "✓" : "×", x + width - 14, rowY + 5);

    context.textAlign = "left";
    context.font = "8px var(--font-geist-mono), monospace";
    context.fillStyle = MUTED;
    context.fillText(format(test.slackAtY), x + 166, rowY + 17);
    context.fillText(format(test.allowance), x + 235, rowY + 17);
  });

  context.restore();
}

export function renderSplitMembership({
  context,
  scene,
  tx,
  ty,
  animationProgress,
  showLabels,
}: RenderSplitMembershipOptions) {
  const configuration = scene.splitMembership;
  if (!configuration) return;

  const progress = clamp01(animationProgress);
  const geometry = computeSplitMembershipGeometry({
    constraints: scene.constraints,
    viewport: scene.viewport,
    pi: configuration.pi,
    pi0: configuration.pi0,
    x: configuration.x,
    y: configuration.y,
  });

  const stripColor = configuration.stripColor ?? STRIP;
  const witnessColor = configuration.witnessColor ?? WITNESS;
  const overlapColor = configuration.overlapColor ?? OVERLAP;
  const candidateColor = configuration.candidateColor ?? RIGHT;

  drawPolygon(
    context,
    geometry.split.strip,
    tx,
    ty,
    "rgba(226, 124, 137, 0.16)",
    stripColor,
    configuration.phase === "setup" ? 0.35 + 0.5 * progress : 0.5,
  );
  drawSegment(
    context,
    geometry.split.lowerBoundary[0],
    geometry.split.lowerBoundary[1],
    tx,
    ty,
    stripColor,
    2.2,
    0.9,
    true,
  );
  drawSegment(
    context,
    geometry.split.upperBoundary[0],
    geometry.split.upperBoundary[1],
    tx,
    ty,
    stripColor,
    2.2,
    0.9,
    true,
  );

  if (showLabels) {
    drawText(
      context,
      `πᵀx = ${configuration.pi0}`,
      [configuration.pi0 + 0.03, scene.viewport.y[1] - 0.15],
      tx,
      ty,
      stripColor,
    );
    drawText(
      context,
      `πᵀx = ${configuration.pi0 + 1}`,
      [configuration.pi0 + 1.03, scene.viewport.y[1] - 0.15],
      tx,
      ty,
      stripColor,
    );
  }

  const showWitnessRegion =
    configuration.phase === "witness-region" ||
    configuration.phase === "overlap" ||
    configuration.phase === "construct" ||
    configuration.phase === "slacks" ||
    configuration.phase === "conclusion";

  if (showWitnessRegion) {
    drawPolygon(
      context,
      geometry.witnessRegion,
      tx,
      ty,
      "rgba(121, 201, 192, 0.20)",
      witnessColor,
      configuration.phase === "witness-region" ? progress : 0.85,
      true,
    );
  }

  const showOverlap =
    configuration.phase === "overlap" ||
    configuration.phase === "construct" ||
    configuration.phase === "slacks" ||
    configuration.phase === "conclusion";

  if (showOverlap) {
    drawPolygon(
      context,
      geometry.split.right,
      tx,
      ty,
      "rgba(143, 136, 220, 0.08)",
      candidateColor,
      configuration.phase === "overlap" ? 0.28 + 0.3 * progress : 0.32,
      true,
    );

    if (geometry.witnessExists) {
      drawPolygon(
        context,
        geometry.witnessRegionOnRight,
        tx,
        ty,
        "rgba(212, 239, 119, 0.42)",
        overlapColor,
        configuration.phase === "overlap" ? progress : 0.95,
      );
    }
  }

  drawPoint(
    context,
    configuration.x,
    tx,
    ty,
    stripColor,
    8,
  );

  if (showLabels) {
    drawText(
      context,
      "x",
      [configuration.x[0] + 0.1, configuration.x[1] + 0.18],
      tx,
      ty,
      stripColor,
    );
    drawText(
      context,
      `α = πᵀx − π₀ = ${format(geometry.alpha)}`,
      [configuration.x[0] + 0.14, configuration.x[1] - 0.18],
      tx,
      ty,
      stripColor,
    );
  }

  if (
    (configuration.phase === "construct" ||
      configuration.phase === "slacks" ||
      configuration.phase === "conclusion") &&
    geometry.y &&
    geometry.z
  ) {
    const movingZ = lerpPoint(
      configuration.x,
      geometry.z,
      configuration.phase === "construct" ? progress : 1,
    );

    drawSegment(
      context,
      geometry.y,
      movingZ,
      tx,
      ty,
      candidateColor,
      3,
      0.95,
    );
    drawPoint(
      context,
      geometry.y,
      tx,
      ty,
      candidateColor,
      7,
    );
    drawPoint(
      context,
      movingZ,
      tx,
      ty,
      geometry.candidateValid ? SUCCESS : WARNING,
      7,
      configuration.phase === "construct" ? progress : 1,
    );

    if (showLabels) {
      drawText(
        context,
        "y ∈ π₂",
        [geometry.y[0] + 0.1, geometry.y[1] + 0.18],
        tx,
        ty,
        candidateColor,
      );
      drawText(
        context,
        geometry.zInPi1 ? "z ∈ π₁" : "z ∉ P",
        [movingZ[0] - 0.1, movingZ[1] + 0.2],
        tx,
        ty,
        geometry.zInPi1 ? SUCCESS : STRIP,
        "right",
      );

      if (configuration.phase !== "construct" || progress > 0.75) {
        const zxMidpoint: Point2D = [
          (geometry.z[0] + configuration.x[0]) / 2,
          (geometry.z[1] + configuration.x[1]) / 2,
        ];
        const xyMidpoint: Point2D = [
          (configuration.x[0] + geometry.y[0]) / 2,
          (configuration.x[1] + geometry.y[1]) / 2,
        ];
        drawText(
          context,
          `α = ${format(geometry.alpha)}`,
          [zxMidpoint[0], zxMidpoint[1] + 0.12],
          tx,
          ty,
          candidateColor,
          "center",
        );
        drawText(
          context,
          `1−α = ${format(1 - geometry.alpha)}`,
          [xyMidpoint[0], xyMidpoint[1] + 0.12],
          tx,
          ty,
          candidateColor,
          "center",
        );
      }
    }
  }

  if (
    configuration.phase === "slacks" &&
    geometry.y &&
    geometry.tests.length
  ) {
    const focusTest =
      geometry.tests.find(
        (test) => test.constraint.id === configuration.focusConstraintId,
      ) ?? geometry.tests[0];

    drawConstraintSlack(
      context,
      configuration.x,
      focusTest.constraint,
      tx,
      ty,
      witnessColor,
      `bᵢ−aᵢᵀx = ${format(focusTest.slackAtX)}`,
      showLabels,
    );
    drawConstraintSlack(
      context,
      geometry.y,
      focusTest.constraint,
      tx,
      ty,
      candidateColor,
      `bᵢ−aᵢᵀy = ${format(focusTest.slackAtY)}`,
      showLabels,
    );

    if (showLabels) {
      drawSlackPanel(
        context,
        geometry.tests,
        progress,
        configuration.focusConstraintId,
      );
    }
  }

  if (configuration.phase === "conclusion") {
    drawPolygon(
      context,
      geometry.split.splitHull,
      tx,
      ty,
      geometry.witnessExists
        ? "rgba(79, 139, 98, 0.12)"
        : "rgba(143, 136, 220, 0.10)",
      geometry.witnessExists ? SUCCESS : RIGHT,
      0.95,
      true,
    );

    if (showLabels) {
      const message = geometry.witnessExists
        ? "W(x) ∩ π₂ ≠ ∅  ⇒  x ∈ P⁽π,π₀⁾"
        : "W(x) ∩ π₂ = ∅  ⇒  x ∉ P⁽π,π₀⁾";
      const canvasWidth = context.canvas.clientWidth;
      context.save();
      context.font = "600 13px var(--font-geist-mono), monospace";
      context.textAlign = "center";
      context.fillStyle = geometry.witnessExists ? SUCCESS : STRIP;
      context.fillText(message, canvasWidth / 2, 28);
      context.restore();
    }
  }
}
