export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color = "white"
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}
