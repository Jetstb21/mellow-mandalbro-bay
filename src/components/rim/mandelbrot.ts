const STOPS: ReadonlyArray<readonly [number, number, number]> = [
  [8, 18, 24],
  [18, 92, 86],
  [232, 188, 104],
  [212, 92, 40],
  [244, 240, 230],
  [22, 52, 74],
  [10, 22, 30],
];

function mix(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = STOPS[i] ?? STOPS[0];
  const b = STOPS[Math.min(i + 1, STOPS.length - 1)] ?? a;
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ];
}

function writePixel(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  col: number,
  row: number,
  step: number,
  r: number,
  g: number,
  b: number,
) {
  const yEnd = Math.min(h, row + step);
  const xEnd = Math.min(w, col + step);
  for (let y = row; y < yEnd; y++) {
    for (let x = col; x < xEnd; x++) {
      const o = (y * w + x) * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = 255;
    }
  }
}

function sample(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  step: number,
  signal: { cancel: boolean },
): boolean {
  const maxIter = step > 1 ? 48 : 80;
  for (let row = 0; row < h; row += step) {
    if (signal.cancel) return false;
    const y0 = (row / h) * 2.5 - 1.25;
    for (let col = 0; col < w; col += step) {
      const x0 = (col / w) * 3.05 - 2.2;
      let x = 0;
      let y = 0;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xt = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xt;
        iter++;
      }
      if (iter >= maxIter) {
        writePixel(data, w, h, col, row, step, 8, 16, 22);
        continue;
      }
      const mag = x * x + y * y;
      let smooth = iter;
      if (mag > 1) {
        const nu = Math.log2(Math.log2(mag));
        if (Number.isFinite(nu)) smooth = iter + 1 - nu;
      }
      const t = Math.pow(Math.min(1, Math.max(0, smooth / maxIter)), 0.62);
      const [r, g, b] = mix(t);
      writePixel(data, w, h, col, row, step, r, g, b);
    }
  }
  return true;
}

export function renderMandelbrot(
  canvas: HTMLCanvasElement,
  signal: { cancel: boolean },
): Promise<void> {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return Promise.resolve();
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.createImageData(w, h);
  sample(img.data, w, h, 4, signal);
  if (!signal.cancel) ctx.putImageData(img, 0, 0);

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      if (signal.cancel) {
        resolve();
        return;
      }
      sample(img.data, w, h, 1, signal);
      if (!signal.cancel) ctx.putImageData(img, 0, 0);
      resolve();
    });
  });
}
