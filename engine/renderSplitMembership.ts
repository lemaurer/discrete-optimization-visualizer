import {
  buildWitnessConstraints,
  computeSplitMembershipGeometry,
  constraintSlack,
  projectPointToConstraint,
} from "./splitMembership";
import {
  lerpPoint,
  pointOnPiAxis,
  projectPointOntoPi,
} from "./split";
import {
  clipToConstraints,
  constraintLine,
} from "./geometry";
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

function centroid(points: Point2D[]): Point2D {
  if (!points.length) return [0, 0];
  const total = points.reduce<Point2D>(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1]],
    [0, 0],
  );
  return [total[0] / points.length, total[1] / points.length];
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
    if (index === 0) context.moveTo(tx(point[0]), ty(point[1]));
    else context.lineTo(tx(point[0]), ty(point[1]));
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

function drawArrow(
  context: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  tx: (value: number) => number,
  ty: (value: number) => number,
  color: string,
  width = 3,
  alpha = 1,
) {
  drawSegment(context, from, to, tx, ty, color, width, alpha);

  const start: Point2D = [tx(from[0]), ty(from[1])];
  const end: Point2D = [tx(to[0]), ty(to[1])];
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(end[0], end[1]);
  context.lineTo(
    end[0] - 10 * Math.cos(angle - 0.45),
    end[1] - 10 * Math.sin(angle - 0.45),
  );
  context.lineTo(
    end[0] - 10 * Math.cos(angle + 0.45),
    end[1] - 10 * Math.sin(angle + 0.45),
  );
  context.closePath();
  context.fill();
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

function drawScreenPanel(
  context: CanvasRenderingContext2D,
  lines: Array<{ text: string; color?: string; strong?: boolean }>,
  side: "left" | "right" = "right",
) {
  const width = 330;
  const lineHeight = 24;
  const height = 24 + lines.length * lineHeight;
  const canvasWidth = context.canvas.clientWidth;
  const x = side === "right" ? Math.max(12, canvasWidth - width - 16) : 16;
  const y = 16;

  context.save();
  context.fillStyle = "rgba(245, 242, 232, 0.96)";
  context.strokeStyle = "rgba(16, 32, 42, 0.24)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(x, y, width, height, 7);
  context.fill();
  context.stroke();

  lines.forEach((line, index) => {
    context.font = `${line.strong ? "600 " : ""}11px var(--font-geist-mono), monospace`;
    context.fillStyle = line.color ?? INK;
    context.textAlign = "left";
    context.fillText(line.text, x + 14, y + 24 + index * lineHeight);
  });
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
  drawSegment(context, point, boundaryPoint, tx, ty, color, 3, 0.95, true);

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
  context.fillStyle = "rgba(245, 242, 232, 0.96)";
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
    const focused = !focusConstraintId || test.constraint.id === focusConstraintId;

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
      (Math.max(0, test.slackAtY) / maxValue) * barWidth * progress;
    const allowanceWidth =
      (Math.max(0, test.allowance) / maxValue) * barWidth * progress;

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
  const normSquared =
    configuration.pi[0] ** 2 + configuration.pi[1] ** 2;

  const projectedX = projectPointOntoPi(configuration.x, configuration.pi);
  const lowerAxisPoint = pointOnPiAxis(configuration.pi0, configuration.pi);
  const upperAxisPoint = pointOnPiAxis(configuration.pi0 + 1, configuration.pi);
  const lowerThroughX: Point2D = [
    configuration.x[0] - (geometry.alpha / normSquared) * configuration.pi[0],
    configuration.x[1] - (geometry.alpha / normSquared) * configuration.pi[1],
  ];

  const drawStrip = (alpha = 0.5) => {
    drawPolygon(
      context,
      geometry.split.strip,
      tx,
      ty,
      "rgba(226, 124, 137, 0.16)",
      stripColor,
      alpha,
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
        `πᵀu = ${configuration.pi0}`,
        [lowerThroughX[0] + 0.04, scene.viewport.y[1] - 0.15],
        tx,
        ty,
        stripColor,
      );
      const upperLabelPoint: Point2D = [
        lowerThroughX[0] + configuration.pi[0] / normSquared + 0.04,
        scene.viewport.y[1] - 0.15,
      ];
      drawText(
        context,
        `πᵀu = ${configuration.pi0 + 1}`,
        upperLabelPoint,
        tx,
        ty,
        stripColor,
      );
    }
  };

  const drawX = () => {
    drawPoint(context, configuration.x, tx, ty, stripColor, 8);
    if (showLabels) {
      drawText(
        context,
        "x",
        [configuration.x[0] + 0.1, configuration.x[1] + 0.18],
        tx,
        ty,
        stripColor,
      );
    }
  };

  const drawCoordinateAxis = (projectionProgress = 1) => {
    drawSegment(
      context,
      geometry.split.axis[0],
      geometry.split.axis[1],
      tx,
      ty,
      candidateColor,
      3,
      0.82,
      true,
    );
    drawSegment(
      context,
      configuration.x,
      projectedX,
      tx,
      ty,
      candidateColor,
      1.5,
      0.55,
      true,
    );

    const movingProjection = lerpPoint(
      configuration.x,
      projectedX,
      projectionProgress,
    );
    drawPoint(context, movingProjection, tx, ty, candidateColor, 6);
    drawPoint(context, lowerAxisPoint, tx, ty, stripColor, 5);
    drawPoint(context, upperAxisPoint, tx, ty, stripColor, 5);

    if (showLabels && projectionProgress > 0.7) {
      drawText(
        context,
        `πᵀx = ${format(geometry.xCoordinate)}`,
        [projectedX[0], projectedX[1] + 0.22],
        tx,
        ty,
        candidateColor,
        "center",
      );
      drawText(
        context,
        `π₀=${configuration.pi0}`,
        [lowerAxisPoint[0], lowerAxisPoint[1] - 0.2],
        tx,
        ty,
        stripColor,
        "center",
      );
      drawText(
        context,
        `π₀+1=${configuration.pi0 + 1}`,
        [upperAxisPoint[0], upperAxisPoint[1] - 0.2],
        tx,
        ty,
        stripColor,
        "center",
      );
    }
  };

  const focusIndex = Math.max(
    0,
    scene.constraints.findIndex(
      (constraint) => constraint.id === configuration.focusConstraintId,
    ),
  );
  const focusConstraint = scene.constraints[focusIndex];
  const witnessConstraints = buildWitnessConstraints(
    scene.constraints,
    configuration.x,
    geometry.alpha,
  );
  const focusWitnessConstraint = witnessConstraints[focusIndex];

  switch (configuration.phase) {
    case "setup": {
      drawStrip(0.35 + 0.5 * progress);
      drawX();
      break;
    }

    case "split-coordinate": {
      drawStrip(0.28);
      drawX();
      drawCoordinateAxis(progress);
      if (showLabels && progress > 0.75) {
        drawScreenPanel(context, [
          { text: "First compute the split coordinate", strong: true },
          { text: `πᵀx = ${format(geometry.xCoordinate)}`, color: candidateColor },
          { text: `${configuration.pi0} < ${format(geometry.xCoordinate)} < ${configuration.pi0 + 1}`, color: stripColor },
        ]);
      }
      break;
    }

    case "alpha-distance": {
      drawStrip(0.24);
      drawX();
      drawCoordinateAxis(1);
      drawArrow(
        context,
        lowerAxisPoint,
        projectedX,
        tx,
        ty,
        witnessColor,
        7,
        0.8 + 0.2 * progress,
      );
      drawArrow(
        context,
        lowerThroughX,
        configuration.x,
        tx,
        ty,
        witnessColor,
        5,
        progress,
      );
      drawPoint(context, lowerThroughX, tx, ty, witnessColor, 5, progress);

      if (showLabels) {
        drawText(
          context,
          `α = ${format(geometry.alpha)}`,
          [
            (lowerThroughX[0] + configuration.x[0]) / 2,
            (lowerThroughX[1] + configuration.x[1]) / 2 + 0.18,
          ],
          tx,
          ty,
          witnessColor,
          "center",
        );
        drawScreenPanel(context, [
          { text: "Now define α", strong: true },
          { text: "α := πᵀx − π₀", color: witnessColor, strong: true },
          { text: `α = ${format(geometry.xCoordinate)} − ${configuration.pi0}` },
          { text: `α = ${format(geometry.alpha)} ∈ (0,1)`, color: witnessColor },
        ]);
      }
      break;
    }

    case "slack-budget": {
      drawStrip(0.18);
      drawX();
      const slackAtX = constraintSlack(focusConstraint, configuration.x);
      const allowance = slackAtX / geometry.alpha;
      drawConstraintSlack(
        context,
        configuration.x,
        focusConstraint,
        tx,
        ty,
        witnessColor,
        `bᵢ−aᵢᵀx = ${format(slackAtX)}`,
        showLabels,
      );
      const [facetFrom, facetTo] = constraintLine(focusConstraint, scene.viewport);
      drawSegment(
        context,
        facetFrom,
        facetTo,
        tx,
        ty,
        focusConstraint.color ?? WARNING,
        4,
        0.45 + 0.55 * progress,
      );

      if (showLabels) {
        drawScreenPanel(context, [
          { text: "One row i of Ax ≤ b", strong: true },
          { text: `slack at x: bᵢ−aᵢᵀx = ${format(slackAtX)}` },
          { text: `divide by α=${format(geometry.alpha)}` },
          { text: `budget for y: ${format(slackAtX)}/${format(geometry.alpha)} = ${format(allowance)}`, color: witnessColor, strong: true },
        ]);
      }
      break;
    }

    case "witness-row": {
      drawStrip(0.15);
      drawX();
      const rowRegion = clipToConstraints(
        [...scene.constraints, focusWitnessConstraint],
        scene.viewport,
      );
      drawPolygon(
        context,
        rowRegion,
        tx,
        ty,
        "rgba(121, 201, 192, 0.22)",
        witnessColor,
        progress,
        true,
      );
      const [from, to] = constraintLine(
        focusWitnessConstraint,
        scene.viewport,
      );
      drawSegment(
        context,
        from,
        to,
        tx,
        ty,
        witnessColor,
        3,
        progress,
        true,
      );

      if (showLabels) {
        drawScreenPanel(context, [
          { text: "Turn that budget into a halfspace for y", strong: true },
          { text: `bᵢ−aᵢᵀy ≤ (bᵢ−aᵢᵀx)/α`, color: witnessColor },
          { text: "The blue region contains the y allowed by this one row." },
        ]);
      }
      break;
    }

    case "witness-region": {
      drawStrip(0.12);
      drawX();
      const revealedRows = Math.max(
        1,
        Math.min(
          witnessConstraints.length,
          Math.ceil(progress * witnessConstraints.length),
        ),
      );
      const partialRegion = clipToConstraints(
        [
          ...scene.constraints,
          ...witnessConstraints.slice(0, revealedRows),
        ],
        scene.viewport,
      );
      drawPolygon(
        context,
        partialRegion,
        tx,
        ty,
        "rgba(121, 201, 192, 0.24)",
        witnessColor,
        0.9,
        true,
      );

      witnessConstraints.slice(0, revealedRows).forEach((constraint) => {
        const [from, to] = constraintLine(constraint, scene.viewport);
        drawSegment(context, from, to, tx, ty, witnessColor, 1.4, 0.28, true);
      });

      if (showLabels) {
        drawScreenPanel(context, [
          { text: "Intersect the row halfspaces", strong: true },
          { text: `rows included: ${revealedRows}/${witnessConstraints.length}`, color: witnessColor },
          { text: "W(x) = {y∈P : b−Ay≤(b−Ax)/α}" },
        ]);
      }
      break;
    }

    case "overlap": {
      drawStrip(0.1);
      drawX();
      drawPolygon(
        context,
        geometry.witnessRegion,
        tx,
        ty,
        "rgba(121, 201, 192, 0.20)",
        witnessColor,
        0.9,
        true,
      );
      drawPolygon(
        context,
        geometry.split.right,
        tx,
        ty,
        "rgba(143, 136, 220, 0.10)",
        candidateColor,
        0.45,
        true,
      );

      if (geometry.witnessExists) {
        drawPolygon(
          context,
          geometry.witnessRegionOnRight,
          tx,
          ty,
          "rgba(212, 239, 119, 0.44)",
          overlapColor,
          progress,
        );
      }

      if (showLabels) {
        drawScreenPanel(context, [
          { text: "Existential test", strong: true },
          { text: "Does W(x) reach π₂?" },
          {
            text: geometry.witnessExists ? "W(x) ∩ π₂ ≠ ∅" : "W(x) ∩ π₂ = ∅",
            color: geometry.witnessExists ? SUCCESS : STRIP,
            strong: true,
          },
        ]);
      }
      break;
    }

    case "select-witness": {
      drawStrip(0.08);
      drawX();
      drawPolygon(
        context,
        geometry.witnessRegion,
        tx,
        ty,
        "rgba(121, 201, 192, 0.16)",
        witnessColor,
        0.7,
        true,
      );
      drawPolygon(
        context,
        geometry.witnessRegionOnRight,
        tx,
        ty,
        "rgba(212, 239, 119, 0.42)",
        overlapColor,
        0.95,
      );

      if (geometry.y) {
        const start = centroid(geometry.witnessRegionOnRight);
        const movingY = lerpPoint(start, geometry.y, progress);
        drawPoint(context, movingY, tx, ty, candidateColor, 8);
        if (showLabels) {
          drawText(
            context,
            progress > 0.75 ? "choose y ∈ W(x)∩π₂" : "candidate y",
            [movingY[0] + 0.12, movingY[1] + 0.18],
            tx,
            ty,
            candidateColor,
          );
          drawScreenPanel(context, [
            { text: "Pick one witness from the overlap", strong: true },
            { text: "y ∈ P" },
            { text: "πᵀy ≥ π₀+1" },
            { text: "b−Ay ≤ (b−Ax)/α", color: candidateColor },
          ]);
        }
      }
      break;
    }

    case "construct": {
      drawStrip(0.08);
      drawX();
      if (geometry.y && geometry.z) {
        const movingZ = lerpPoint(configuration.x, geometry.z, progress);
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
        drawPoint(context, geometry.y, tx, ty, candidateColor, 8);
        drawPoint(
          context,
          movingZ,
          tx,
          ty,
          geometry.candidateValid ? SUCCESS : WARNING,
          8,
          progress,
        );

        if (showLabels) {
          drawText(
            context,
            "y ∈ π₂",
            [geometry.y[0] + 0.12, geometry.y[1] + 0.18],
            tx,
            ty,
            candidateColor,
          );
          drawText(
            context,
            geometry.zInPi1 ? "z ∈ π₁" : "z ∉ P",
            [movingZ[0] - 0.12, movingZ[1] + 0.2],
            tx,
            ty,
            geometry.zInPi1 ? SUCCESS : STRIP,
            "right",
          );
          drawScreenPanel(context, [
            { text: "Extrapolate through x", strong: true },
            { text: "z = (x−αy)/(1−α)", color: candidateColor },
            { text: `x = (1−${format(geometry.alpha)})z + ${format(geometry.alpha)}y` },
            { text: "The slack test guarantees z ∈ P.", color: SUCCESS },
          ]);
        }
      }
      break;
    }

    case "slacks": {
      drawStrip(0.06);
      drawX();
      if (geometry.y && geometry.z && geometry.tests.length) {
        drawSegment(
          context,
          geometry.y,
          geometry.z,
          tx,
          ty,
          candidateColor,
          2.5,
          0.65,
        );
        drawPoint(context, geometry.y, tx, ty, candidateColor, 7);
        drawPoint(context, geometry.z, tx, ty, SUCCESS, 7);

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
      break;
    }

    case "conclusion": {
      drawStrip(0.05);
      drawX();
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

      if (geometry.y && geometry.z) {
        drawSegment(
          context,
          geometry.y,
          geometry.z,
          tx,
          ty,
          candidateColor,
          3,
          0.9,
        );
        drawPoint(context, geometry.y, tx, ty, candidateColor, 7);
        drawPoint(context, geometry.z, tx, ty, SUCCESS, 7);
      }

      if (showLabels) {
        drawScreenPanel(context, [
          { text: geometry.witnessExists ? "Membership certified" : "Point cut off", strong: true },
          {
            text: geometry.witnessExists
              ? "W(x) ∩ π₂ ≠ ∅  ⇒  x ∈ P⁽π,π₀⁾"
              : "W(x) ∩ π₂ = ∅  ⇒  x ∉ P⁽π,π₀⁾",
            color: geometry.witnessExists ? SUCCESS : STRIP,
            strong: true,
          },
        ]);
      }
      break;
    }
  }
}
