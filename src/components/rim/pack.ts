export type Ratio = "4:3" | "3:4";

export type TileLayout = {
  cols: number;
  rows: number;
  tileW: number;
  tileH: number;
  gapX: number;
  gapY: number;
  count: number;
  ratio: Ratio;
};

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function tileCountFor(id: string): number {
  return [4, 6, 8][hashString(id) % 3] ?? 4;
}

export function ratioFor(width: number, height: number): Ratio {
  return height > width ? "3:4" : "4:3";
}

/** Exact white 4:3 or 3:4 tiles. Leftover space becomes equal outer and inner margins. */
export function packTiles(width: number, height: number, count: number): TileLayout {
  const ratio = ratioFor(width, height);
  const ar = ratio === "4:3" ? 4 / 3 : 3 / 4;
  const n = Math.max(1, Math.floor(count));
  const minG = 8;
  let best: { cols: number; rows: number; tileW: number; tileH: number } | null = null;

  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const innerW = width - (cols + 1) * minG;
    const innerH = height - (rows + 1) * minG;
    if (innerW <= 0 || innerH <= 0) continue;
    const tileW = Math.min(innerW / cols, (innerH / rows) * ar);
    const tileH = tileW / ar;
    if (tileW < 12 || tileH < 12) continue;
    if (!best || tileW * tileH > best.tileW * best.tileH) {
      best = { cols, rows, tileW, tileH };
    }
  }

  if (!best) {
    const cols = 1;
    const rows = n;
    const tileW = Math.max(8, Math.min(width - minG * 2, (height / rows - minG) * ar));
    best = { cols, rows, tileW, tileH: tileW / ar };
  }

  const tileW = Math.floor(best.tileW);
  const tileH = Math.floor(best.tileH);
  const gapX = (width - best.cols * tileW) / (best.cols + 1);
  const gapY = (height - best.rows * tileH) / (best.rows + 1);

  return {
    cols: best.cols,
    rows: best.rows,
    tileW,
    tileH,
    gapX: Math.max(0, gapX),
    gapY: Math.max(0, gapY),
    count: n,
    ratio,
  };
}

export type MondrianCell = {
  x: number;
  y: number;
  w: number;
  h: number;
  band: number;
};

export function mondrian(seed: number, splits: number): MondrianCell[] {
  let rects: Array<{ x: number; y: number; w: number; h: number }> = [
    { x: 0, y: 0, w: 100, h: 100 },
  ];
  let s = seed || 1;
  for (let i = 0; i < splits; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const idx = s % rects.length;
    const r = rects[idx];
    if (!r) break;
    const vertical = ((s >>> 3) & 1) === 0 ? r.w >= r.h : r.h < r.w;
    const t = 0.34 + ((s >>> 12) % 32) / 100;
    if (vertical && r.w > 16) {
      const w1 = r.w * t;
      rects.splice(idx, 1, { ...r, w: w1 }, { x: r.x + w1, y: r.y, w: r.w - w1, h: r.h });
    } else if (r.h > 16) {
      const h1 = r.h * t;
      rects.splice(idx, 1, { ...r, h: h1 }, { x: r.x, y: r.y + h1, w: r.w, h: r.h - h1 });
    }
  }
  return rects.map((r, i) => ({ ...r, band: (seed + i * 3) % 6 }));
}
