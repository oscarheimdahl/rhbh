export function drawCircle(
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string = "rgba(255, 0, 0)",
) {
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, r, 0, 2 * Math.PI);
  canvasCtx.fillStyle = color;
  canvasCtx.fill();
}

export function drawStrokeCircle(
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string = "rgba(255, 0, 0)",
) {
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, r, 0, 2 * Math.PI);
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = 2;
  canvasCtx.stroke();
}
