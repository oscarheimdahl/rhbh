const w = 16;
const h = 9;

const maxWidth = 1200;
const padding = 16 * 2; // left + right or top + bottom
const availableWidth = window.innerWidth - padding;
const availableHeight = window.innerHeight - padding;

// first, assume width is the limiting factor
let width = Math.min(maxWidth, availableWidth);
let height = (width / w) * h;

// if that height doesn't fit, scale by height instead
if (height > availableHeight) {
  height = availableHeight;
  width = (height / h) * w; // keep 4:3
}

export const WIDTH = width;
export const HEIGHT = height;
