"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import type {
  Marker3D,
  Mesh3D,
  PlanePatch3D,
  Point2D,
  Point3D,
  Scene,
  Segment3D,
} from "@/engine/types";

interface VisualizationCanvas3DProps {
  scene: Scene;
  showGrid: boolean;
  showLattice: boolean;
  showVertices: boolean;
  showLabels: boolean;
  zoom: number;
  animationProgress: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  perspective: number;
}

interface PolygonRenderItem {
  id: string;
  points: ProjectedPoint[];
  fill: string;
  stroke: string;
  opacity: number;
  dashed: boolean;
  label?: string;
  centroid: ProjectedPoint;
  depth: number;
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
  green: "#4f8b62",
};

const DEFAULT_YAW = -0.72;
const DEFAULT_PITCH = 0.63;
const DEFAULT_DISTANCE = 5.4;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function lerp(a: number, b: number, progress: number) {
  return a + (b - a) * progress;
}

function lerpPoint3D(from: Point3D, to: Point3D, progress: number): Point3D {
  return [
    lerp(from[0], to[0], progress),
    lerp(from[1], to[1], progress),
    lerp(from[2], to[2], progress),
  ];
}

function averagePoint(points: ProjectedPoint[]): ProjectedPoint {
  if (!points.length) {
    return { x: 0, y: 0, depth: 0, perspective: 1 };
  }

  const sum = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
      depth: accumulator.depth + point.depth,
      perspective: accumulator.perspective + point.perspective,
    }),
    { x: 0, y: 0, depth: 0, perspective: 0 },
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
    depth: sum.depth / points.length,
    perspective: sum.perspective / points.length,
  };
}

function meshPalette(mesh: Mesh3D) {
  if (mesh.color) {
    return {
      fill: mesh.color,
      stroke: mesh.edgeColor ?? COLORS.ink,
    };
  }

  switch (mesh.style) {
    case "removed":
      return { fill: COLORS.rose, stroke: COLORS.rose };
    case "survivor":
      return { fill: COLORS.aqua, stroke: COLORS.ink };
    case "integer-hull":
      return { fill: COLORS.orange, stroke: COLORS.orange };
    case "split-hull":
      return { fill: COLORS.violet, stroke: COLORS.violet };
    case "ghost":
      return { fill: COLORS.muted, stroke: COLORS.muted };
    default:
      return { fill: COLORS.lime, stroke: COLORS.ink };
  }
}

function markerColor(marker: Marker3D) {
  if (marker.color) return marker.color;

  switch (marker.style) {
    case "fractional":
      return COLORS.rose;
    case "integer":
      return COLORS.orange;
    case "optimum":
      return COLORS.violet;
    default:
      return COLORS.ink;
  }
}

function integerValues(range: [number, number]) {
  const values: number[] = [];
  for (let value = Math.ceil(range[0]); value <= Math.floor(range[1]); value += 1) {
    values.push(value);
  }
  return values;
}

export function VisualizationCanvas3D({
  scene,
  showGrid,
  showLattice,
  showVertices,
  showLabels,
  zoom,
  animationProgress,
}: VisualizationCanvas3DProps) {
  const configuration = scene.scene3D;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const [yaw, setYaw] = useState(
    () => configuration?.camera?.yaw ?? DEFAULT_YAW,
  );
  const [pitch, setPitch] = useState(
    () => configuration?.camera?.pitch ?? DEFAULT_PITCH,
  );
  const [cameraZoom, setCameraZoom] = useState(1);

  const initialCamera = useMemo(
    () => ({
      yaw: configuration?.camera?.yaw ?? DEFAULT_YAW,
      pitch: configuration?.camera?.pitch ?? DEFAULT_PITCH,
    }),
    [configuration?.camera?.pitch, configuration?.camera?.yaw],
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

  const resetCamera = useCallback(() => {
    setYaw(initialCamera.yaw);
    setPitch(initialCamera.pitch);
    setCameraZoom(1);
  }, [initialCamera]);

  const draw = useCallback(() => {
    if (!configuration) return;

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

    const bounds = configuration.bounds;
    const verticalScale = configuration.verticalScale ?? 1;
    const center: Point3D = [
      (bounds.x[0] + bounds.x[1]) / 2,
      (bounds.y[0] + bounds.y[1]) / 2,
      (bounds.z[0] + bounds.z[1]) / 2,
    ];
    const ranges: Point3D = [
      Math.max(bounds.x[1] - bounds.x[0], 1e-6),
      Math.max(bounds.y[1] - bounds.y[0], 1e-6),
      Math.max((bounds.z[1] - bounds.z[0]) * verticalScale, 1e-6),
    ];
    const modelScale = Math.max(...ranges);
    const screenScale =
      Math.min(size.width, size.height) * 0.72 * zoom * cameraZoom;
    const cameraDistance = configuration.camera?.distance ?? DEFAULT_DISTANCE;
    const cosineYaw = Math.cos(yaw);
    const sineYaw = Math.sin(yaw);
    const cosinePitch = Math.cos(pitch);
    const sinePitch = Math.sin(pitch);

    const project = (point: Point3D): ProjectedPoint => {
      const normalizedX = (point[0] - center[0]) / modelScale;
      const normalizedY = (point[1] - center[1]) / modelScale;
      const normalizedZ =
        ((point[2] - center[2]) * verticalScale) / modelScale;

      const yawX = cosineYaw * normalizedX - sineYaw * normalizedY;
      const yawDepth = sineYaw * normalizedX + cosineYaw * normalizedY;
      const pitchDepth =
        cosinePitch * yawDepth - sinePitch * normalizedZ;
      const pitchZ = sinePitch * yawDepth + cosinePitch * normalizedZ;
      const perspective = cameraDistance / (cameraDistance - pitchDepth);

      return {
        x: size.width / 2 + yawX * screenScale * perspective,
        y: size.height / 2 - pitchZ * screenScale * perspective,
        depth: pitchDepth,
        perspective,
      };
    };

    const drawLine = (
      from: Point3D,
      to: Point3D,
      color: string,
      width = 1,
      opacity = 1,
      dashed = false,
    ) => {
      const start = project(from);
      const end = project(to);
      context.save();
      context.globalAlpha = opacity;
      context.strokeStyle = color;
      context.lineWidth = width;
      if (dashed) context.setLineDash([6, 5]);
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
      context.restore();
    };

    const drawScreenLabel = (
      text: string,
      point: ProjectedPoint,
      color = COLORS.ink,
      align: CanvasTextAlign = "left",
      offset: Point2D = [8, -8],
    ) => {
      if (!showLabels || !text) return;
      context.save();
      context.font = "11px var(--font-geist-mono), monospace";
      context.textAlign = align;
      context.fillStyle = color;
      context.fillText(text, point.x + offset[0], point.y + offset[1]);
      context.restore();
    };

    if (showGrid && configuration.showGround !== false) {
      const xValues = integerValues(bounds.x);
      const yValues = integerValues(bounds.y);
      xValues.forEach((x) => {
        drawLine(
          [x, bounds.y[0], 0],
          [x, bounds.y[1], 0],
          COLORS.grid,
          1,
          0.72,
        );
      });
      yValues.forEach((y) => {
        drawLine(
          [bounds.x[0], y, 0],
          [bounds.x[1], y, 0],
          COLORS.grid,
          1,
          0.72,
        );
      });
    }

    if (showLattice && configuration.showIntegerLattice !== false) {
      const integerAxes = configuration.integerAxes ?? ["x", "y", "z"];
      const xValues = integerValues(bounds.x);
      const yValues = integerValues(bounds.y);
      const zValues = integerValues(bounds.z);

      context.save();
      context.fillStyle = "rgba(16, 32, 42, 0.34)";

      if (integerAxes.includes("x") && integerAxes.includes("y")) {
        xValues.forEach((x) => {
          yValues.forEach((y) => {
            const point = project([x, y, 0]);
            context.beginPath();
            context.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            context.fill();
          });
        });
      } else if (integerAxes.includes("x")) {
        xValues.forEach((x) => {
          drawLine(
            [x, bounds.y[0], bounds.z[0]],
            [x, bounds.y[1], bounds.z[0]],
            COLORS.muted,
            1.2,
            0.38,
            true,
          );
        });
      } else if (integerAxes.includes("y")) {
        yValues.forEach((y) => {
          drawLine(
            [bounds.x[0], y, bounds.z[0]],
            [bounds.x[1], y, bounds.z[0]],
            COLORS.muted,
            1.2,
            0.38,
            true,
          );
        });
      }

      if (integerAxes.includes("z") && zValues.length > 1) {
        zValues.forEach((z) => {
          drawLine(
            [bounds.x[0], bounds.y[0], z],
            [bounds.x[1], bounds.y[0], z],
            COLORS.muted,
            1,
            0.22,
            true,
          );
        });
      }

      context.restore();
    }

    const polygonItems: PolygonRenderItem[] = [];
    const reveal = 0.18 + 0.82 * animationProgress;

    (configuration.meshes ?? []).forEach((mesh) => {
      const palette = meshPalette(mesh);
      const currentVertices = mesh.vertices.map((vertex, index) => {
        const from = mesh.fromVertices?.[index];
        return from
          ? lerpPoint3D(from, vertex, animationProgress)
          : vertex;
      });
      const baseOpacity =
        mesh.opacity ??
        (mesh.style === "ghost"
          ? 0.11
          : mesh.style === "removed"
            ? 0.24
            : mesh.style === "integer-hull"
              ? 0.28
              : 0.34);

      mesh.faces.forEach((face, faceIndex) => {
        const points = face
          .map((vertexIndex) => currentVertices[vertexIndex])
          .filter((point): point is Point3D => Boolean(point))
          .map(project);
        if (points.length < 3) return;
        const centroid = averagePoint(points);
        polygonItems.push({
          id: `${mesh.id}-face-${faceIndex}`,
          points,
          fill: palette.fill,
          stroke: palette.stroke,
          opacity: baseOpacity * reveal,
          dashed:
            mesh.style === "ghost" ||
            mesh.style === "integer-hull" ||
            mesh.style === "split-hull",
          label: faceIndex === 0 ? mesh.label : undefined,
          centroid,
          depth: centroid.depth,
        });
      });
    });

    (configuration.planes ?? []).forEach((plane: PlanePatch3D) => {
      const points = plane.points.map(project);
      if (points.length < 3) return;
      const centroid = averagePoint(points);
      polygonItems.push({
        id: plane.id,
        points,
        fill: plane.color ?? COLORS.rose,
        stroke: plane.color ?? COLORS.rose,
        opacity: (plane.opacity ?? 0.22) * reveal,
        dashed: plane.dashed ?? true,
        label: plane.label,
        centroid,
        depth: centroid.depth,
      });
    });

    polygonItems
      .sort((left, right) => left.depth - right.depth)
      .forEach((item) => {
        context.save();
        context.globalAlpha = item.opacity;
        context.beginPath();
        item.points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
        context.fillStyle = item.fill;
        context.fill();
        context.globalAlpha = Math.min(1, item.opacity + 0.5);
        context.strokeStyle = item.stroke;
        context.lineWidth = 1.7;
        if (item.dashed) context.setLineDash([7, 5]);
        context.stroke();
        context.restore();

        if (item.label) {
          drawScreenLabel(
            item.label,
            item.centroid,
            item.stroke,
            "center",
            [0, -7],
          );
        }
      });

    (configuration.segments ?? []).forEach((segment: Segment3D) => {
      const currentTo = segment.animate
        ? lerpPoint3D(segment.from, segment.to, animationProgress)
        : segment.to;
      drawLine(
        segment.from,
        currentTo,
        segment.color ?? COLORS.ink,
        segment.width ?? 2.2,
        reveal,
        segment.dashed,
      );
      if (segment.label) {
        const midpoint = project([
          (segment.from[0] + currentTo[0]) / 2,
          (segment.from[1] + currentTo[1]) / 2,
          (segment.from[2] + currentTo[2]) / 2,
        ]);
        drawScreenLabel(
          segment.label,
          midpoint,
          segment.color ?? COLORS.ink,
          "center",
          [0, -8],
        );
      }
    });

    if (showVertices) {
      (configuration.meshes ?? []).forEach((mesh) => {
        mesh.vertices.forEach((vertex, index) => {
          const from = mesh.fromVertices?.[index];
          const current = from
            ? lerpPoint3D(from, vertex, animationProgress)
            : vertex;
          const point = project(current);
          context.save();
          context.globalAlpha = 0.88;
          context.beginPath();
          context.arc(point.x, point.y, 4.4, 0, Math.PI * 2);
          context.fillStyle = COLORS.paper;
          context.fill();
          context.strokeStyle = mesh.edgeColor ?? COLORS.ink;
          context.lineWidth = 1.8;
          context.stroke();
          context.restore();
        });
      });
    }

    (configuration.markers ?? []).forEach((marker: Marker3D) => {
      const current = marker.animateFrom
        ? lerpPoint3D(marker.animateFrom, marker.at, animationProgress)
        : marker.at;
      const point = project(current);
      const radius = (marker.radius ?? 7) * clamp(point.perspective, 0.72, 1.3);
      const color = markerColor(marker);

      context.save();
      context.globalAlpha = reveal;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
      context.strokeStyle = COLORS.paper;
      context.lineWidth = 2;
      context.stroke();
      context.restore();

      if (marker.label) {
        drawScreenLabel(marker.label, point, color);
      }
    });

    if (configuration.showAxes !== false) {
      const origin: Point3D = [0, 0, 0];
      const axisX: Point3D = [bounds.x[1], 0, 0];
      const axisY: Point3D = [0, bounds.y[1], 0];
      const axisZ: Point3D = [0, 0, bounds.z[1]];
      drawLine(origin, axisX, COLORS.ink, 2.3, 0.9);
      drawLine(origin, axisY, COLORS.ink, 2.3, 0.9);
      drawLine(origin, axisZ, COLORS.ink, 2.3, 0.9);

      if (showLabels) {
        drawScreenLabel(
          configuration.axisLabels?.x ?? "x₁",
          project(axisX),
          COLORS.ink,
        );
        drawScreenLabel(
          configuration.axisLabels?.y ?? "x₂",
          project(axisY),
          COLORS.ink,
        );
        drawScreenLabel(
          configuration.axisLabels?.z ?? "x₃",
          project(axisZ),
          COLORS.ink,
        );
      }
    }
  }, [
    animationProgress,
    cameraZoom,
    configuration,
    pitch,
    showGrid,
    showLabels,
    showLattice,
    showVertices,
    size,
    yaw,
    zoom,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  if (!configuration) return null;

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      yaw,
      pitch,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    setYaw(drag.yaw + (event.clientX - drag.x) * 0.008);
    setPitch(
      clamp(
        drag.pitch + (event.clientY - drag.y) * 0.006,
        -0.15,
        1.35,
      ),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grab";
  };

  const handleWheel = (event: ReactWheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setCameraZoom((value) =>
      clamp(value * (event.deltaY > 0 ? 0.94 : 1.06), 0.72, 1.55),
    );
  };

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <canvas
        aria-label="Interactive three-dimensional coordinate view. Drag to rotate and use the mouse wheel to zoom."
        onDoubleClick={resetCamera}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        ref={canvasRef}
        role="img"
        style={{ cursor: "grab", touchAction: "none" }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 14,
          top: 12,
          border: "1px solid rgba(16, 32, 42, 0.16)",
          borderRadius: 999,
          background: "rgba(245, 242, 232, 0.9)",
          color: COLORS.muted,
          font: "10px var(--font-geist-mono), monospace",
          padding: "5px 9px",
          pointerEvents: "none",
        }}
      >
        drag to rotate · wheel to zoom · double-click to reset
      </div>
      <div className="canvas-caption">
        <span>{configuration.caption?.primary ?? "Interactive 3D view"}</span>
        <span>{configuration.caption?.secondary ?? "Drag the model to rotate it"}</span>
      </div>
    </div>
  );
}
