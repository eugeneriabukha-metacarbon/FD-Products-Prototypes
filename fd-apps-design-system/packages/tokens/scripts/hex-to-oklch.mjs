/**
 * Pipeline step: reformat sRGB hex primitives as OKLCH.
 *
 * Figma stores colors as sRGB/hex; we author primitives as OKLCH for a
 * perceptually-uniform base palette. This is a lossless *format* change —
 * values are the same colors, just expressed in OKLCH. Run after a Figma
 * re-sync, before `npm run verify`.
 *
 *   node scripts/hex-to-oklch.mjs [path-to-css]   (default: src/base.css)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { converter } from "culori";

const toOklch = converter("oklch");
const round = (n, d) => {
  if (n == null || Number.isNaN(n)) return 0;
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function hexToOklch(hex) {
  const c = toOklch(hex);
  const L = round(c.l, 4);
  const C = round(c.c, 4);
  const H = round(c.h ?? 0, 2);
  const base = `oklch(${L} ${C} ${H}`;
  return c.alpha != null && c.alpha < 1
    ? `${base} / ${round(c.alpha, 4)})`
    : `${base})`;
}

const file =
  process.argv[2] || new URL("../src/base.css", import.meta.url).pathname;
const src = readFileSync(file, "utf8");

let count = 0;
const out = src.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g, (m) => {
  count++;
  return hexToOklch(m);
});

writeFileSync(file, out);
console.log(`✅ converted ${count} hex values → oklch in ${file}`);
