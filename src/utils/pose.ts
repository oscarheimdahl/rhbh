import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import { drawCircle } from "./canvasUtils";
import {
  face,
  LANDMARKS,
  leftFoot,
  leftHand,
  rightFoot,
  rightHand,
} from "./landmarks";

const ignoredLandmarks: number[] = [
  ...rightFoot,
  ...leftFoot,
  ...rightHand,
  ...leftHand,
  ...face,
];

export function drawPose(
  poseLandmarks: NormalizedLandmark[],
  ctx: CanvasRenderingContext2D,
) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawPoseLines(ctx, poseLandmarks);
  for (const [index, landmark] of poseLandmarks.entries()) {
    if (ignoredLandmarks.includes(index)) continue;
    if (landmark.visibility < 0.8) continue;
    const x = landmark.x * ctx.canvas.width;
    const y = landmark.y * ctx.canvas.height;
    drawCircle(ctx, x, y, 3, "rgba(255,255,0)", index);
  }

  ctx.restore();
}

function drawPoseLines(
  ctx: CanvasRenderingContext2D,
  bodyLandmarks: NormalizedLandmark[],
) {
  const BODY_CONNECTIONS = [
    [LANDMARKS.NOSE, LANDMARKS.RIGHT_SHOULDER],
    [LANDMARKS.NOSE, LANDMARKS.LEFT_SHOULDER],
    [LANDMARKS.RIGHT_WRIST, LANDMARKS.RIGHT_ELBOW],
    [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_SHOULDER],
    [LANDMARKS.LEFT_WRIST, LANDMARKS.LEFT_ELBOW],
    [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_SHOULDER],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.LEFT_SHOULDER],
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
    [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
    [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
    [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
  ];

  for (const [start, end] of BODY_CONNECTIONS) {
    drawBodyLine(ctx, bodyLandmarks, start, end);
  }
}

function drawBodyLine(
  ctx: CanvasRenderingContext2D,
  bodyLandmarks: NormalizedLandmark[],
  a: number,
  b: number,
) {
  const pointA = bodyLandmarks?.[a];
  const pointB = bodyLandmarks?.[b];
  if (!pointA || !pointB) return;

  const ax = pointA.x * ctx.canvas.width;
  const ay = pointA.y * ctx.canvas.height;
  const bx = pointB.x * ctx.canvas.width;
  const by = pointB.y * ctx.canvas.height;

  ctx.strokeStyle = "rgba(255,0,0,0.5)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
}
