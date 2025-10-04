const landscapeRatio = { w: 16, h: 9 };
// const portraitRatio = { w: 9, h: 16 };

const maxWidth = 1200;
const padding = 16 * 2; // left + right or top + bottom
const availableWidth = window.innerWidth - padding;
const availableHeight = window.innerHeight - padding;

// pick ratio depending on orientation
const isPortrait = window.innerHeight > window.innerWidth;
const { w, h } = isPortrait ? landscapeRatio : landscapeRatio;

// first, assume width is the limiting factor
let width = Math.min(maxWidth, availableWidth);
let height = (width / w) * h;

// if that height doesn't fit, scale by height instead
if (height > availableHeight) {
  height = availableHeight;
  width = (height / h) * w;
}

export const WIDTH = Math.floor(width);
export const HEIGHT = Math.floor(height);
