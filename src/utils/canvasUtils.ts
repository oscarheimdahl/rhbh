export function drawCircle(
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string = 'rgba(255, 0, 0)',
  index?: number
) {
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, r, 0, 2 * Math.PI);
  canvasCtx.fillStyle = color;
  canvasCtx.fill();

  return;
  if (index !== undefined) {
    canvasCtx.fillStyle = 'black';
    canvasCtx.font = '12px Arial';
    canvasCtx.fillText(index!.toString(), x - 2, y + 5);
  }
}
