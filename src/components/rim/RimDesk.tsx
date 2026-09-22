import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  X,
} from "lucide-react";
import { renderMandelbrot } from "./mandelbrot";
import { hashString, mondrian, packTiles, tileCountFor, type Ratio } from "./pack";

type Kind = "folder" | "docx" | "xlsx" | "txt" | "png";
type Phase = "free" | "rect" | "white";

type CatalogItem = {
  id: string;
  name: string;
  kind: Kind;
  group: "Quick access" | "Files";
};

type Placement =
  | { mode: "hang"; angle: number }
  | { mode: "free"; x: number; y: number };

type Doc = {
  id: string;
  fileId: string;
  name: string;
  kind: Kind;
  placement: Placement;
  phase: Phase;
  z: number;
};

type Geom = {
  stageW: number;
  stageH: number;
  cx: number;
  cy: number;
  r: number;
};

const FILES: CatalogItem[] = [
  { id: "desktop", name: "Desktop", kind: "folder", group: "Quick access" },
  { id: "documents", name: "Documents", kind: "folder", group: "Quick access" },
  { id: "downloads", name: "Downloads", kind: "folder", group: "Quick access" },
  { id: "brief", name: "Q3-brief.docx", kind: "docx", group: "Files" },
  { id: "ledger", name: "ledger.xlsx", kind: "xlsx", group: "Files" },
  { id: "notes", name: "field-notes.txt", kind: "txt", group: "Files" },
  { id: "plan", name: "site-plan.png", kind: "png", group: "Files" },
  { id: "readme", name: "readme.txt", kind: "txt", group: "Files" },
];

const STORAGE_KEY = "rim-desk-v1";
const TITLE_H = 30;

const SEED: Array<{ fileId: string; angle: number }> = [
  { fileId: "brief", angle: -2.45 },
  { fileId: "ledger", angle: -0.42 },
  { fileId: "plan", angle: 1.2 },
];

function catalog(id: string): CatalogItem {
  return FILES.find((f) => f.id === id) ?? FILES[3];
}

function seedDocs(): Doc[] {
  return SEED.map((s, i) => {
    const file = catalog(s.fileId);
    return {
      id: `doc-${file.id}`,
      fileId: file.id,
      name: file.name,
      kind: file.kind,
      placement: { mode: "hang", angle: s.angle },
      phase: "free",
      z: i + 1,
    };
  });
}

function shortName(name: string): string {
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  if (base.length <= 12) return base;
  return base.slice(0, 11) + "…";
}

function cardSize(radius: number): { w: number; h: number } {
  const w = Math.round(Math.min(188, Math.max(108, radius * 0.78)));
  const h = Math.round(w * 0.72);
  return { w, h };
}

function facingSide(angle: number): "left" | "right" | "top" | "bottom" {
  const deg = ((angle * 180) / Math.PI + 360) % 360;
  if (deg >= 315 || deg < 45) return "left";
  if (deg < 135) return "top";
  if (deg < 225) return "right";
  return "bottom";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hangPoint(angle: number, card: { w: number; h: number }, geom: Geom) {
  const hx = card.w / 2;
  const hy = card.h / 2;
  const ox = Math.cos(angle) >= 0 ? -hx : hx;
  const oy = Math.sin(angle) >= 0 ? -hy : hy;
  const target = Math.max(24, geom.r - 14);

  const place = (dist: number) => {
    const wx = geom.cx + Math.cos(angle) * dist;
    const wy = geom.cy + Math.sin(angle) * dist;
    const x = wx - hx;
    const y = wy - hy;
    const cornerDist = Math.hypot(wx + ox - geom.cx, wy + oy - geom.cy);
    const inside =
      x >= 4 && y >= 4 && x + card.w <= geom.stageW - 4 && y + card.h <= geom.stageH - 4;
    return { x, y, cornerDist, inside };
  };

  let lo = 0;
  let hi = geom.r + Math.hypot(hx, hy) + 48;
  let best = place(0);
  for (let i = 0; i < 22; i++) {
    const dist = (lo + hi) / 2;
    const placed = place(dist);
    if (placed.inside && placed.cornerDist <= target) {
      best = placed;
      lo = dist;
    } else {
      hi = dist;
    }
  }
  return {
    x: clamp(best.x, 4, Math.max(4, geom.stageW - card.w - 4)),
    y: clamp(best.y, 4, Math.max(4, geom.stageH - card.h - 4)),
  };
}

function docOrigin(doc: Doc, geom: Geom): { x: number; y: number } {
  const card = cardSize(geom.r);
  if (doc.placement.mode === "hang") return hangPoint(doc.placement.angle, card, geom);
  return {
    x: clamp(doc.placement.x * geom.stageW - card.w / 2, 6, Math.max(6, geom.stageW - card.w - 6)),
    y: clamp(doc.placement.y * geom.stageH - card.h / 2, 6, Math.max(6, geom.stageH - card.h - 6)),
  };
}

function placementFromPoint(clientX: number, clientY: number, stage: DOMRect, geom: Geom): Placement {
  const px = clientX - stage.left;
  const py = clientY - stage.top;
  const dx = px - geom.cx;
  const dy = py - geom.cy;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  if (dist < geom.r + Math.min(160, geom.r * 0.55)) return { mode: "hang", angle };
  return {
    mode: "free",
    x: clamp(px / geom.stageW, 0.04, 0.96),
    y: clamp(py / geom.stageH, 0.04, 0.96),
  };
}

function nextAngle(docs: Doc[]): number {
  let a = -2.55;
  for (let i = 0; i < 18; i++) {
    const clash = docs.some((d) => {
      if (d.placement.mode !== "hang") return false;
      const delta = Math.atan2(
        Math.sin(d.placement.angle - a),
        Math.cos(d.placement.angle - a),
      );
      return Math.abs(delta) < 0.42;
    });
    if (!clash) return a;
    a += 0.72;
  }
  return a;
}

function angleOf(doc: Doc, geom: Geom | null): number {
  if (doc.placement.mode === "hang") return doc.placement.angle;
  if (!geom) return 0;
  const o = docOrigin(doc, geom);
  const card = cardSize(geom.r);
  return Math.atan2(o.y + card.h / 2 - geom.cy, o.x + card.w / 2 - geom.cx);
}

function parseStored(raw: string): Doc[] | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return null;
    const docs: Doc[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<Doc>;
      if (typeof row.id !== "string" || typeof row.fileId !== "string") return null;
      const file = FILES.find((f) => f.id === row.fileId);
      if (!file) return null;
      const phase: Phase = row.phase === "rect" || row.phase === "white" ? row.phase : "free";
      let placement: Placement = { mode: "hang", angle: 0 };
      if (row.placement && typeof row.placement === "object") {
        if (row.placement.mode === "free" && typeof row.placement.x === "number") {
          placement = { mode: "free", x: row.placement.x, y: row.placement.y ?? 0.5 };
        } else if (row.placement.mode === "hang" && typeof row.placement.angle === "number") {
          placement = { mode: "hang", angle: row.placement.angle };
        }
      }
      docs.push({
        id: row.id,
        fileId: file.id,
        name: file.name,
        kind: file.kind,
        placement,
        phase: phase === "rect" ? "white" : phase,
        z: typeof row.z === "number" ? row.z : docs.length + 1,
      });
    }
    return docs;
  } catch {
    return null;
  }
}

function FileGlyph({ kind }: { kind: Kind }) {
  const props = { size: 14, strokeWidth: 1.75, "aria-hidden": true as const };
  if (kind === "folder") return <Folder {...props} />;
  if (kind === "docx") return <FileText {...props} />;
  if (kind === "xlsx") return <FileSpreadsheet {...props} />;
  if (kind === "png") return <FileImage {...props} />;
  return <File {...props} />;
}

function FreeBody({ kind, name }: { kind: Kind; name: string }) {
  if (kind === "xlsx") {
    const cells = ["", "A", "B", "C", "1", "12", "4∶3", "0", "2", "18", "9", "1", "3", "6", "2", "8"];
    return (
      <div className="sheet" aria-hidden>
        {cells.map((cell, i) => (
          <span key={i} className={i < 4 || i % 4 === 0 ? "sheet-h" : ""}>
            {cell}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "png") {
    return (
      <div className="swatch" aria-hidden>
        <span className="band-1" />
        <span className="band-3" />
        <span className="band-2" />
        <span className="band-4" />
      </div>
    );
  }
  if (kind === "folder") {
    return (
      <ul className="folder-list">
        <li>brief</li>
        <li>ledger</li>
        <li>notes</li>
      </ul>
    );
  }
  if (kind === "txt") {
    return (
      <pre className="note">{name.includes("readme") ? "rim\nplace anywhere\ntriple-click" : "field\nrim holds\nwhite at 4∶3"}</pre>
    );
  }
  return (
    <div className="prose">
      <strong>Quarter brief</strong>
      <p>Hang it on the rim.</p>
    </div>
  );
}

function WhiteMosaic({ id }: { id: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setBox({ w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!box) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setFormed(true);
      return;
    }
    setFormed(false);
    const frame = requestAnimationFrame(() => setFormed(true));
    return () => cancelAnimationFrame(frame);
  }, [box]);

  const layout = box ? packTiles(box.w, box.h, tileCountFor(id)) : null;
  const gapX = layout && formed ? layout.gapX : 0;
  const gapY = layout && formed ? layout.gapY : 0;

  return (
    <div ref={hostRef} className="mosaic-host">
      {layout && (
        <div
          className="mosaic"
          data-ratio={layout.ratio}
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, ${layout.tileW}px)`,
            gridTemplateRows: `repeat(${layout.rows}, ${layout.tileH}px)`,
            columnGap: gapX,
            rowGap: gapY,
            padding: `${gapY}px ${gapX}px`,
          }}
        >
          {Array.from({ length: layout.count }, (_, i) => (
            <span key={i} className="tile" />
          ))}
        </div>
      )}
    </div>
  );
}

function RectField({ id }: { id: string }) {
  const cells = useMemo(() => mondrian(hashString(id), 5), [id]);
  return (
    <div className="rects" aria-hidden>
      {cells.map((cell, i) => (
        <span
          key={i}
          className={`rect band-${cell.band}`}
          style={{
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            width: `${cell.w}%`,
            height: `${cell.h}%`,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ratioLabel(width: number, height: number): Ratio {
  return height > width ? "3:4" : "4:3";
}

export function RimDesk() {
  const stageRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geomRef = useRef<Geom | null>(null);
  const zRef = useRef(4);
  const clicks = useRef<Record<string, { n: number; t: number }>>({});
  const timers = useRef<Map<string, number>>(new Map());
  const [geom, setGeom] = useState<Geom | null>(null);
  const [docs, setDocs] = useState<Doc[]>(seedDocs);
  const [selected, setSelected] = useState<string | null>("doc-brief");
  const [booted, setBooted] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      const stored = parseStored(localStorage.getItem(STORAGE_KEY) ?? "");
      if (stored && stored.length) {
        setDocs(stored);
        zRef.current = stored.reduce((m, d) => Math.max(m, d.z), 1) + 1;
        setSelected(stored[0]?.id ?? null);
      }
    } catch {
      /* private mode */
    }
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      /* private mode */
    }
  }, [docs, booted]);

  useEffect(() => {
    const stage = stageRef.current;
    const well = wellRef.current;
    if (!stage || !well) return;
    const measure = () => {
      const s = stage.getBoundingClientRect();
      const w = well.getBoundingClientRect();
      const next: Geom = {
        stageW: s.width,
        stageH: s.height,
        cx: w.left - s.left + w.width / 2,
        cy: w.top - s.top + w.height / 2,
        r: w.width / 2,
      };
      geomRef.current = next;
      setGeom(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(well);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const well = wellRef.current;
    if (!canvas || !well) return;
    let signal = { cancel: false };
    const paint = () => {
      signal.cancel = true;
      signal = { cancel: false };
      const current = signal;
      const size = Math.round(well.getBoundingClientRect().width);
      const backing = Math.max(280, Math.min(640, size));
      if (canvas.width !== backing || canvas.height !== backing) {
        canvas.width = backing;
        canvas.height = backing;
      }
      void renderMandelbrot(canvas, current);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(well);
    return () => {
      signal.cancel = true;
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const id of pending.values()) window.clearTimeout(id);
    };
  }, []);

  function bringFront(id: string) {
    zRef.current += 1;
    const z = zRef.current;
    setDocs((list) => list.map((d) => (d.id === id ? { ...d, z } : d)));
    setSelected(id);
  }

  function descend(ids: string[]) {
    if (!ids.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDocs((list) =>
      list.map((d) => (ids.includes(d.id) && d.phase !== "white" ? { ...d, phase: reduce ? "white" : "rect" } : d)),
    );
    if (reduce) return;
    for (const id of ids) {
      const prev = timers.current.get(id);
      if (prev) window.clearTimeout(prev);
      const handle = window.setTimeout(() => {
        setDocs((list) => list.map((d) => (d.id === id && d.phase === "rect" ? { ...d, phase: "white" } : d)));
        timers.current.delete(id);
      }, 680);
      timers.current.set(id, handle);
    }
  }

  function surface(ids: string[]) {
    for (const id of ids) {
      const prev = timers.current.get(id);
      if (prev) window.clearTimeout(prev);
      timers.current.delete(id);
    }
    setDocs((list) => list.map((d) => (ids.includes(d.id) ? { ...d, phase: "free" } : d)));
  }

  function toggleDoc(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.phase === "white") surface([id]);
    else if (doc.phase === "free") descend([id]);
  }

  function noteClick(key: string, onTriple: () => void) {
    const now = performance.now();
    const prev = clicks.current[key];
    if (!prev || now - prev.t > 520) {
      clicks.current[key] = { n: 1, t: now };
      return;
    }
    const n = prev.n + 1;
    if (n >= 3) {
      clicks.current[key] = { n: 0, t: now };
      onTriple();
      return;
    }
    clicks.current[key] = { n, t: now };
  }

  function onDock() {
    if (!docs.length) return;
    const pending = docs.filter((d) => d.phase !== "white");
    if (!pending.length) {
      surface(docs.map((d) => d.id));
      return;
    }
    const chosen =
      selected && pending.some((d) => d.id === selected) ? [selected] : pending.map((d) => d.id);
    descend(chosen);
  }

  function addFile(fileId: string) {
    const existing = docs.find((d) => d.fileId === fileId);
    if (existing) {
      bringFront(existing.id);
      return existing.id;
    }
    const file = catalog(fileId);
    zRef.current += 1;
    const doc: Doc = {
      id: `doc-${file.id}`,
      fileId: file.id,
      name: file.name,
      kind: file.kind,
      placement: { mode: "hang", angle: nextAngle(docs) },
      phase: "free",
      z: zRef.current,
    };
    setDocs((list) => [...list, doc]);
    setSelected(doc.id);
    return doc.id;
  }

  function removeDoc(id: string) {
    const prev = timers.current.get(id);
    if (prev) window.clearTimeout(prev);
    setDocs((list) => list.filter((d) => d.id !== id));
    setSelected((cur) => (cur === id ? null : cur));
  }

  function bindDrag(docId: string) {
    return (event: ReactPointerEvent<HTMLElement>) => {
      if ((event.target as HTMLElement).closest("button")) return;
      const stage = stageRef.current;
      const geomNow = geomRef.current;
      if (!stage || !geomNow) return;
      event.preventDefault();
      const pointerId = event.pointerId;
      event.currentTarget.setPointerCapture(pointerId);
      bringFront(docId);
      const startX = event.clientX;
      const startY = event.clientY;
      let dragged = false;
      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
        dragged = true;
        const g = geomRef.current;
        const box = stage.getBoundingClientRect();
        if (!g) return;
        const placement = placementFromPoint(ev.clientX, ev.clientY, box, g);
        setDocs((list) => list.map((d) => (d.id === docId ? { ...d, placement } : d)));
      };
      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (!dragged) noteClick(docId, () => toggleDoc(docId));
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  function onFilePointerDown(file: CatalogItem, event: ReactPointerEvent<HTMLButtonElement>) {
    const stage = stageRef.current;
    if (!stage || !geomRef.current) {
      addFile(file.id);
      return;
    }
    const existing = docs.find((d) => d.fileId === file.id);
    const id = existing?.id ?? addFile(file.id);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let dragged = false;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
      dragged = true;
      const g = geomRef.current;
      const box = stage.getBoundingClientRect();
      if (!g) return;
      const placement = placementFromPoint(ev.clientX, ev.clientY, box, g);
      setDocs((list) => list.map((d) => (d.id === id ? { ...d, placement } : d)));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!dragged && existing) bringFront(existing.id);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function onWellPointerUp() {
    noteClick("well", () => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 640);
      const pending = docs.filter((d) => d.phase !== "white");
      if (!pending.length) surface(docs.map((d) => d.id));
      else descend(pending.map((d) => d.id));
    });
  }

  const pending = docs.some((d) => d.phase !== "white");
  const dockMode = docs.length && !pending ? "surface" : "descend";
  const groups = ["Files", "Quick access"] as const;

  return (
    <main className="desk">
      <aside className="files" aria-label="Windows files">
        <div className="files-chrome">
          <p className="mark">Rim</p>
          <p className="files-path">This PC › Documents</p>
        </div>
        <div className="files-scroll">
          {groups.map((group) => (
            <div key={group}>
              <p className="files-group">{group}</p>
              <ul>
                {FILES.filter((f) => f.group === group).map((file) => {
                  const out = docs.some((d) => d.fileId === file.id);
                  return (
                    <li key={file.id}>
                      <button
                        type="button"
                        className={out ? "file-row is-out" : "file-row"}
                        onPointerDown={(e) => onFilePointerDown(file, e)}
                      >
                        <FileGlyph kind={file.kind} />
                        <span>{file.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="stage" ref={stageRef}>
        <div
          className={pulse ? "well is-pulse" : "well"}
          ref={wellRef}
          onPointerUp={onWellPointerUp}
        >
          <canvas ref={canvasRef} className="fractal" aria-label="Mandelbrot well" />
        </div>

        {geom &&
          docs.map((doc) => {
            const origin = docOrigin(doc, geom);
            const card = cardSize(geom.r);
            const side = facingSide(angleOf(doc, geom));
            const bodyW = card.w;
            const bodyH = card.h - TITLE_H;
            return (
              <article
                key={doc.id}
                className={selected === doc.id ? "win is-selected" : "win"}
                style={{
                  width: card.w,
                  height: card.h,
                  transform: `translate(${origin.x}px, ${origin.y}px)`,
                  zIndex: doc.z,
                }}
                onPointerDown={bindDrag(doc.id)}
              >
                <span className={`tab tab-${side}`}>{shortName(doc.name)}</span>
                <header className="win-bar">
                  <FileGlyph kind={doc.kind} />
                  <span className="win-name">{doc.name}</span>
                  {doc.phase === "white" && (
                    <span className="ratio">{ratioLabel(bodyW, bodyH)}</span>
                  )}
                  <button
                    type="button"
                    className="win-x"
                    aria-label={`Return ${doc.name} to the column`}
                    onClick={() => removeDoc(doc.id)}
                  >
                    <X size={14} strokeWidth={1.75} />
                  </button>
                </header>
                <div className={doc.phase === "free" ? "win-body" : "win-body is-dark"}>
                  {doc.phase === "free" && <FreeBody kind={doc.kind} name={doc.name} />}
                  {doc.phase === "rect" && <RectField id={doc.id} />}
                  {doc.phase === "white" && <WhiteMosaic id={doc.id} />}
                </div>
              </article>
            );
          })}
      </div>

      <footer className="dock">
        <p className="dock-note">Triple-click a document or the well. The button stays here.</p>
        <button type="button" className="dock-btn" onClick={onDock}>
          {dockMode === "surface" ? <ArrowUp size={16} strokeWidth={1.75} /> : <ArrowDown size={16} strokeWidth={1.75} />}
          {dockMode === "surface" ? "Surface" : "Descend"}
        </button>
      </footer>
    </main>
  );
}
