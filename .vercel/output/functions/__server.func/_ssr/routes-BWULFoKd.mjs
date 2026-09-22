import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FileText, c as ArrowUp, i as File, l as ArrowDown, o as FileSpreadsheet, r as Folder, s as FileImage, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BWULFoKd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STOPS = [
	[
		8,
		18,
		24
	],
	[
		18,
		92,
		86
	],
	[
		232,
		188,
		104
	],
	[
		212,
		92,
		40
	],
	[
		244,
		240,
		230
	],
	[
		22,
		52,
		74
	],
	[
		10,
		22,
		30
	]
];
function mix(t) {
	const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
	const i = Math.floor(x);
	const f = x - i;
	const a = STOPS[i] ?? STOPS[0];
	const b = STOPS[Math.min(i + 1, STOPS.length - 1)] ?? a;
	return [
		a[0] + (b[0] - a[0]) * f,
		a[1] + (b[1] - a[1]) * f,
		a[2] + (b[2] - a[2]) * f
	];
}
function writePixel(data, w, h, col, row, step, r, g, b) {
	const yEnd = Math.min(h, row + step);
	const xEnd = Math.min(w, col + step);
	for (let y = row; y < yEnd; y++) for (let x = col; x < xEnd; x++) {
		const o = (y * w + x) * 4;
		data[o] = r;
		data[o + 1] = g;
		data[o + 2] = b;
		data[o + 3] = 255;
	}
}
function sample(data, w, h, step, signal) {
	const maxIter = step > 1 ? 48 : 80;
	for (let row = 0; row < h; row += step) {
		if (signal.cancel) return false;
		const y0 = row / h * 2.5 - 1.25;
		for (let col = 0; col < w; col += step) {
			const x0 = col / w * 3.05 - 2.2;
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
			const [r, g, b] = mix(Math.pow(Math.min(1, Math.max(0, smooth / maxIter)), .62));
			writePixel(data, w, h, col, row, step, r, g, b);
		}
	}
	return true;
}
function renderMandelbrot(canvas, signal) {
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
function hashString(value) {
	let h = 2166136261;
	for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
	return h >>> 0;
}
function tileCountFor(id) {
	return [
		4,
		6,
		8
	][hashString(id) % 3] ?? 4;
}
function ratioFor(width, height) {
	return height > width ? "3:4" : "4:3";
}
/** Exact white 4:3 or 3:4 tiles. Leftover space becomes equal outer and inner margins. */
function packTiles(width, height, count) {
	const ratio = ratioFor(width, height);
	const ar = ratio === "4:3" ? 4 / 3 : 3 / 4;
	const n = Math.max(1, Math.floor(count));
	const minG = 8;
	let best = null;
	for (let cols = 1; cols <= n; cols++) {
		const rows = Math.ceil(n / cols);
		const innerW = width - (cols + 1) * minG;
		const innerH = height - (rows + 1) * minG;
		if (innerW <= 0 || innerH <= 0) continue;
		const tileW = Math.min(innerW / cols, innerH / rows * ar);
		const tileH = tileW / ar;
		if (tileW < 12 || tileH < 12) continue;
		if (!best || tileW * tileH > best.tileW * best.tileH) best = {
			cols,
			rows,
			tileW,
			tileH
		};
	}
	if (!best) {
		const cols = 1;
		const rows = n;
		const tileW = Math.max(8, Math.min(width - 16, (height / rows - minG) * ar));
		best = {
			cols,
			rows,
			tileW,
			tileH: tileW / ar
		};
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
		ratio
	};
}
function mondrian(seed, splits) {
	let rects = [{
		x: 0,
		y: 0,
		w: 100,
		h: 100
	}];
	let s = seed || 1;
	for (let i = 0; i < splits; i++) {
		s = Math.imul(s, 1664525) + 1013904223 >>> 0;
		const idx = s % rects.length;
		const r = rects[idx];
		if (!r) break;
		const vertical = (s >>> 3 & 1) === 0 ? r.w >= r.h : r.h < r.w;
		const t = .34 + (s >>> 12) % 32 / 100;
		if (vertical && r.w > 16) {
			const w1 = r.w * t;
			rects.splice(idx, 1, {
				...r,
				w: w1
			}, {
				x: r.x + w1,
				y: r.y,
				w: r.w - w1,
				h: r.h
			});
		} else if (r.h > 16) {
			const h1 = r.h * t;
			rects.splice(idx, 1, {
				...r,
				h: h1
			}, {
				x: r.x,
				y: r.y + h1,
				w: r.w,
				h: r.h - h1
			});
		}
	}
	return rects.map((r, i) => ({
		...r,
		band: (seed + i * 3) % 6
	}));
}
var FILES = [
	{
		id: "desktop",
		name: "Desktop",
		kind: "folder",
		group: "Quick access"
	},
	{
		id: "documents",
		name: "Documents",
		kind: "folder",
		group: "Quick access"
	},
	{
		id: "downloads",
		name: "Downloads",
		kind: "folder",
		group: "Quick access"
	},
	{
		id: "brief",
		name: "Q3-brief.docx",
		kind: "docx",
		group: "Files"
	},
	{
		id: "ledger",
		name: "ledger.xlsx",
		kind: "xlsx",
		group: "Files"
	},
	{
		id: "notes",
		name: "field-notes.txt",
		kind: "txt",
		group: "Files"
	},
	{
		id: "plan",
		name: "site-plan.png",
		kind: "png",
		group: "Files"
	},
	{
		id: "readme",
		name: "readme.txt",
		kind: "txt",
		group: "Files"
	}
];
var STORAGE_KEY = "rim-desk-v1";
var TITLE_H = 30;
var SEED = [
	{
		fileId: "brief",
		angle: -2.45
	},
	{
		fileId: "ledger",
		angle: -.42
	},
	{
		fileId: "plan",
		angle: 1.2
	}
];
function catalog(id) {
	return FILES.find((f) => f.id === id) ?? FILES[3];
}
function seedDocs() {
	return SEED.map((s, i) => {
		const file = catalog(s.fileId);
		return {
			id: `doc-${file.id}`,
			fileId: file.id,
			name: file.name,
			kind: file.kind,
			placement: {
				mode: "hang",
				angle: s.angle
			},
			phase: "free",
			z: i + 1
		};
	});
}
function shortName(name) {
	const base = name.replace(/\.[a-z0-9]+$/i, "");
	if (base.length <= 12) return base;
	return base.slice(0, 11) + "…";
}
function cardSize(radius) {
	const w = Math.round(Math.min(188, Math.max(108, radius * .78)));
	return {
		w,
		h: Math.round(w * .72)
	};
}
function facingSide(angle) {
	const deg = (angle * 180 / Math.PI + 360) % 360;
	if (deg >= 315 || deg < 45) return "left";
	if (deg < 135) return "top";
	if (deg < 225) return "right";
	return "bottom";
}
function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
function hangPoint(angle, card, geom) {
	const hx = card.w / 2;
	const hy = card.h / 2;
	const ox = Math.cos(angle) >= 0 ? -hx : hx;
	const oy = Math.sin(angle) >= 0 ? -hy : hy;
	const target = Math.max(24, geom.r - 14);
	const place = (dist) => {
		const wx = geom.cx + Math.cos(angle) * dist;
		const wy = geom.cy + Math.sin(angle) * dist;
		const x = wx - hx;
		const y = wy - hy;
		return {
			x,
			y,
			cornerDist: Math.hypot(wx + ox - geom.cx, wy + oy - geom.cy),
			inside: x >= 4 && y >= 4 && x + card.w <= geom.stageW - 4 && y + card.h <= geom.stageH - 4
		};
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
		} else hi = dist;
	}
	return {
		x: clamp(best.x, 4, Math.max(4, geom.stageW - card.w - 4)),
		y: clamp(best.y, 4, Math.max(4, geom.stageH - card.h - 4))
	};
}
function docOrigin(doc, geom) {
	const card = cardSize(geom.r);
	if (doc.placement.mode === "hang") return hangPoint(doc.placement.angle, card, geom);
	return {
		x: clamp(doc.placement.x * geom.stageW - card.w / 2, 6, Math.max(6, geom.stageW - card.w - 6)),
		y: clamp(doc.placement.y * geom.stageH - card.h / 2, 6, Math.max(6, geom.stageH - card.h - 6))
	};
}
function placementFromPoint(clientX, clientY, stage, geom) {
	const px = clientX - stage.left;
	const py = clientY - stage.top;
	const dx = px - geom.cx;
	const dy = py - geom.cy;
	const dist = Math.hypot(dx, dy);
	const angle = Math.atan2(dy, dx);
	if (dist < geom.r + Math.min(160, geom.r * .55)) return {
		mode: "hang",
		angle
	};
	return {
		mode: "free",
		x: clamp(px / geom.stageW, .04, .96),
		y: clamp(py / geom.stageH, .04, .96)
	};
}
function nextAngle(docs) {
	let a = -2.55;
	for (let i = 0; i < 18; i++) {
		if (!docs.some((d) => {
			if (d.placement.mode !== "hang") return false;
			const delta = Math.atan2(Math.sin(d.placement.angle - a), Math.cos(d.placement.angle - a));
			return Math.abs(delta) < .42;
		})) return a;
		a += .72;
	}
	return a;
}
function angleOf(doc, geom) {
	if (doc.placement.mode === "hang") return doc.placement.angle;
	if (!geom) return 0;
	const o = docOrigin(doc, geom);
	const card = cardSize(geom.r);
	return Math.atan2(o.y + card.h / 2 - geom.cy, o.x + card.w / 2 - geom.cx);
}
function parseStored(raw) {
	try {
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) return null;
		const docs = [];
		for (const item of data) {
			if (!item || typeof item !== "object") return null;
			const row = item;
			if (typeof row.id !== "string" || typeof row.fileId !== "string") return null;
			const file = FILES.find((f) => f.id === row.fileId);
			if (!file) return null;
			const phase = row.phase === "rect" || row.phase === "white" ? row.phase : "free";
			let placement = {
				mode: "hang",
				angle: 0
			};
			if (row.placement && typeof row.placement === "object") {
				if (row.placement.mode === "free" && typeof row.placement.x === "number") placement = {
					mode: "free",
					x: row.placement.x,
					y: row.placement.y ?? .5
				};
				else if (row.placement.mode === "hang" && typeof row.placement.angle === "number") placement = {
					mode: "hang",
					angle: row.placement.angle
				};
			}
			docs.push({
				id: row.id,
				fileId: file.id,
				name: file.name,
				kind: file.kind,
				placement,
				phase: phase === "rect" ? "white" : phase,
				z: typeof row.z === "number" ? row.z : docs.length + 1
			});
		}
		return docs;
	} catch {
		return null;
	}
}
function FileGlyph({ kind }) {
	const props = {
		size: 14,
		strokeWidth: 1.75,
		"aria-hidden": true
	};
	if (kind === "folder") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { ...props });
	if (kind === "docx") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { ...props });
	if (kind === "xlsx") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { ...props });
	if (kind === "png") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { ...props });
}
function FreeBody({ kind, name }) {
	if (kind === "xlsx") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet",
		"aria-hidden": true,
		children: [
			"",
			"A",
			"B",
			"C",
			"1",
			"12",
			"4∶3",
			"0",
			"2",
			"18",
			"9",
			"1",
			"3",
			"6",
			"2",
			"8"
		].map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: i < 4 || i % 4 === 0 ? "sheet-h" : "",
			children: cell
		}, i))
	});
	if (kind === "png") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "swatch",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "band-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "band-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "band-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "band-4" })
		]
	});
	if (kind === "folder") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "folder-list",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "brief" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ledger" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "notes" })
		]
	});
	if (kind === "txt") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "note",
		children: name.includes("readme") ? "rim\nplace anywhere\ntriple-click" : "field\nrim holds\nwhite at 4∶3"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "prose",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Quarter brief" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Hang it on the rim." })]
	});
}
function WhiteMosaic({ id }) {
	const hostRef = (0, import_react.useRef)(null);
	const [box, setBox] = (0, import_react.useState)(null);
	const [formed, setFormed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = hostRef.current;
		if (!el) return;
		const measure = () => {
			const w = el.clientWidth;
			const h = el.clientHeight;
			if (w > 0 && h > 0) setBox({
				w,
				h
			});
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!box) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: hostRef,
		className: "mosaic-host",
		children: layout && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mosaic",
			"data-ratio": layout.ratio,
			style: {
				gridTemplateColumns: `repeat(${layout.cols}, ${layout.tileW}px)`,
				gridTemplateRows: `repeat(${layout.rows}, ${layout.tileH}px)`,
				columnGap: gapX,
				rowGap: gapY,
				padding: `${gapY}px ${gapX}px`
			},
			children: Array.from({ length: layout.count }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tile" }, i))
		})
	});
}
function RectField({ id }) {
	const cells = (0, import_react.useMemo)(() => mondrian(hashString(id), 5), [id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rects",
		"aria-hidden": true,
		children: cells.map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `rect band-${cell.band}`,
			style: {
				left: `${cell.x}%`,
				top: `${cell.y}%`,
				width: `${cell.w}%`,
				height: `${cell.h}%`,
				animationDelay: `${i * 40}ms`
			}
		}, i))
	});
}
function ratioLabel(width, height) {
	return height > width ? "3:4" : "4:3";
}
function RimDesk() {
	const stageRef = (0, import_react.useRef)(null);
	const wellRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const geomRef = (0, import_react.useRef)(null);
	const zRef = (0, import_react.useRef)(4);
	const clicks = (0, import_react.useRef)({});
	const timers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [geom, setGeom] = (0, import_react.useState)(null);
	const [docs, setDocs] = (0, import_react.useState)(seedDocs);
	const [selected, setSelected] = (0, import_react.useState)("doc-brief");
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [pulse, setPulse] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const stored = parseStored(localStorage.getItem(STORAGE_KEY) ?? "");
			if (stored && stored.length) {
				setDocs(stored);
				zRef.current = stored.reduce((m, d) => Math.max(m, d.z), 1) + 1;
				setSelected(stored[0]?.id ?? null);
			}
		} catch {}
		setBooted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!booted) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
		} catch {}
	}, [docs, booted]);
	(0, import_react.useEffect)(() => {
		const stage = stageRef.current;
		const well = wellRef.current;
		if (!stage || !well) return;
		const measure = () => {
			const s = stage.getBoundingClientRect();
			const w = well.getBoundingClientRect();
			const next = {
				stageW: s.width,
				stageH: s.height,
				cx: w.left - s.left + w.width / 2,
				cy: w.top - s.top + w.height / 2,
				r: w.width / 2
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
	(0, import_react.useEffect)(() => {
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
			renderMandelbrot(canvas, current);
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(well);
		return () => {
			signal.cancel = true;
			ro.disconnect();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const pending = timers.current;
		return () => {
			for (const id of pending.values()) window.clearTimeout(id);
		};
	}, []);
	function bringFront(id) {
		zRef.current += 1;
		const z = zRef.current;
		setDocs((list) => list.map((d) => d.id === id ? {
			...d,
			z
		} : d));
		setSelected(id);
	}
	function descend(ids) {
		if (!ids.length) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		setDocs((list) => list.map((d) => ids.includes(d.id) && d.phase !== "white" ? {
			...d,
			phase: reduce ? "white" : "rect"
		} : d));
		if (reduce) return;
		for (const id of ids) {
			const prev = timers.current.get(id);
			if (prev) window.clearTimeout(prev);
			const handle = window.setTimeout(() => {
				setDocs((list) => list.map((d) => d.id === id && d.phase === "rect" ? {
					...d,
					phase: "white"
				} : d));
				timers.current.delete(id);
			}, 680);
			timers.current.set(id, handle);
		}
	}
	function surface(ids) {
		for (const id of ids) {
			const prev = timers.current.get(id);
			if (prev) window.clearTimeout(prev);
			timers.current.delete(id);
		}
		setDocs((list) => list.map((d) => ids.includes(d.id) ? {
			...d,
			phase: "free"
		} : d));
	}
	function toggleDoc(id) {
		const doc = docs.find((d) => d.id === id);
		if (!doc) return;
		if (doc.phase === "white") surface([id]);
		else if (doc.phase === "free") descend([id]);
	}
	function noteClick(key, onTriple) {
		const now = performance.now();
		const prev = clicks.current[key];
		if (!prev || now - prev.t > 520) {
			clicks.current[key] = {
				n: 1,
				t: now
			};
			return;
		}
		const n = prev.n + 1;
		if (n >= 3) {
			clicks.current[key] = {
				n: 0,
				t: now
			};
			onTriple();
			return;
		}
		clicks.current[key] = {
			n,
			t: now
		};
	}
	function onDock() {
		if (!docs.length) return;
		const pending = docs.filter((d) => d.phase !== "white");
		if (!pending.length) {
			surface(docs.map((d) => d.id));
			return;
		}
		descend(selected && pending.some((d) => d.id === selected) ? [selected] : pending.map((d) => d.id));
	}
	function addFile(fileId) {
		const existing = docs.find((d) => d.fileId === fileId);
		if (existing) {
			bringFront(existing.id);
			return existing.id;
		}
		const file = catalog(fileId);
		zRef.current += 1;
		const doc = {
			id: `doc-${file.id}`,
			fileId: file.id,
			name: file.name,
			kind: file.kind,
			placement: {
				mode: "hang",
				angle: nextAngle(docs)
			},
			phase: "free",
			z: zRef.current
		};
		setDocs((list) => [...list, doc]);
		setSelected(doc.id);
		return doc.id;
	}
	function removeDoc(id) {
		const prev = timers.current.get(id);
		if (prev) window.clearTimeout(prev);
		setDocs((list) => list.filter((d) => d.id !== id));
		setSelected((cur) => cur === id ? null : cur);
	}
	function bindDrag(docId) {
		return (event) => {
			if (event.target.closest("button")) return;
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
			const move = (ev) => {
				if (ev.pointerId !== pointerId) return;
				if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
				dragged = true;
				const g = geomRef.current;
				const box = stage.getBoundingClientRect();
				if (!g) return;
				const placement = placementFromPoint(ev.clientX, ev.clientY, box, g);
				setDocs((list) => list.map((d) => d.id === docId ? {
					...d,
					placement
				} : d));
			};
			const up = (ev) => {
				if (ev.pointerId !== pointerId) return;
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
				if (!dragged) noteClick(docId, () => toggleDoc(docId));
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		};
	}
	function onFilePointerDown(file, event) {
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
		const move = (ev) => {
			if (ev.pointerId !== pointerId) return;
			if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
			dragged = true;
			const g = geomRef.current;
			const box = stage.getBoundingClientRect();
			if (!g) return;
			const placement = placementFromPoint(ev.clientX, ev.clientY, box, g);
			setDocs((list) => list.map((d) => d.id === id ? {
				...d,
				placement
			} : d));
		};
		const up = (ev) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "desk",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "files",
				"aria-label": "Windows files",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "files-chrome",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mark",
						children: "Rim"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "files-path",
						children: "This PC › Documents"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "files-scroll",
					children: ["Files", "Quick access"].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "files-group",
						children: group
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: FILES.filter((f) => f.group === group).map((file) => {
						const out = docs.some((d) => d.fileId === file.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: out ? "file-row is-out" : "file-row",
							onPointerDown: (e) => onFilePointerDown(file, e),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { kind: file.kind }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: file.name })]
						}) }, file.id);
					}) })] }, group))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage",
				ref: stageRef,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: pulse ? "well is-pulse" : "well",
					ref: wellRef,
					onPointerUp: onWellPointerUp,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "fractal",
						"aria-label": "Mandelbrot well"
					})
				}), geom && docs.map((doc) => {
					const origin = docOrigin(doc, geom);
					const card = cardSize(geom.r);
					const side = facingSide(angleOf(doc, geom));
					const bodyW = card.w;
					const bodyH = card.h - TITLE_H;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: selected === doc.id ? "win is-selected" : "win",
						style: {
							width: card.w,
							height: card.h,
							transform: `translate(${origin.x}px, ${origin.y}px)`,
							zIndex: doc.z
						},
						onPointerDown: bindDrag(doc.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `tab tab-${side}`,
								children: shortName(doc.name)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "win-bar",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { kind: doc.kind }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "win-name",
										children: doc.name
									}),
									doc.phase === "white" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ratio",
										children: ratioLabel(bodyW, bodyH)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "win-x",
										"aria-label": `Return ${doc.name} to the column`,
										onClick: () => removeDoc(doc.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											size: 14,
											strokeWidth: 1.75
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: doc.phase === "free" ? "win-body" : "win-body is-dark",
								children: [
									doc.phase === "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreeBody, {
										kind: doc.kind,
										name: doc.name
									}),
									doc.phase === "rect" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RectField, { id: doc.id }),
									doc.phase === "white" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhiteMosaic, { id: doc.id })
								]
							})
						]
					}, doc.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "dock-note",
					children: "Triple-click a document or the well. The button stays here."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dock-btn",
					onClick: onDock,
					children: [dockMode === "surface" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
						size: 16,
						strokeWidth: 1.75
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
						size: 16,
						strokeWidth: 1.75
					}), dockMode === "surface" ? "Surface" : "Descend"]
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RimDesk, {});
}
//#endregion
export { Home as component };
