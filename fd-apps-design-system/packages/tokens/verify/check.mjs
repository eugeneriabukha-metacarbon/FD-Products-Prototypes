import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const css = read("./out.css");
const baseCss = read("../src/base.css");
const themeCss = read("../src/theme.css");

// 1. Utilities that must exist if the token @theme registration worked.
const mustHave = [
  ".bg-background",
  ".text-foreground",
  ".border-border",
  ".rounded-xl",
  ".bg-button-brand-primary-background",
  ".text-button-brand-primary-foreground",
  ".text-button-secondary-foreground-accent", // added token (Figma)
  ".bg-card-background",
  ".text-card-foreground-muted",
  ".text-focus",
  ".text-data-purple",
  ".text-data-teal-2",
  ".bg-fader-01",
  ".text-effect-01",
  ".tracking-tight",
  ".leading-6",
  ".shadow-s",
  ".shadow-xs",
  ".fader-b",
  ".display-01",
  ".body-04", // reweighted medium→normal + renamed from body-04-medium (Figma, 2026-07-15)
  ".body-mono-04", // added text style (Figma, 2026-07-03)
  ".caption-01",
  ".button-01",
  ".p-4",
  ".blur-md",
  ".max-w-4xs",
  ".max-w-5xs", // added container step (Figma, 2026-07-09)
];

// 2. Golden values — guard the most-used tokens against silent drift on re-sync.
const golden = [
  [baseCss, "--purple-500: oklch(0.6183 0.2321 298.35)"],
  [baseCss, "--white: oklch(1 0 0)"],
  [themeCss, "--background: var(--gray-50)"], // light
  [themeCss, "--background: var(--gray-950)"], // dark
  [themeCss, "--focus: var(--purple-500)"],
  [themeCss, "--button-secondary-foreground-accent: var(--gray-850)"], // light
  [themeCss, "--button-secondary-foreground-accent: var(--gray-150)"], // dark
];

const missing = mustHave.filter((sel) => !css.includes(sel));
const driftMissing = golden
  .filter(([src, needle]) => !src.includes(needle))
  .map(([, n]) => n);
// Theme-switching sanity: the .dark override for a token must be present.
const darkOk =
  /\.dark\b/.test(css) || css.includes("--foreground: var(--gray-100)");
// Base palette must be OKLCH — no raw sRGB hex color literals may remain.
const strayHex = baseCss.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
// 3. Alpha strategy (ADR-0005): transparency is DERIVED at the semantic layer via
//    relative-color `oklch(from var(--base) l c h / N%)`, not baked into `--alpha-*`
//    primitives. Guard both halves so a Figma re-sync can't silently revert it.
const bakedAlpha = /--alpha-/.test(baseCss);
const derivedAlpha = /oklch\(from var\(/.test(themeCss);

const ok =
  !missing.length &&
  !driftMissing.length &&
  darkOk &&
  !strayHex.length &&
  !bakedAlpha &&
  derivedAlpha;
if (!ok) {
  console.error("❌ token build check FAILED");
  if (missing.length)
    console.error("   missing utilities:", missing.join(", "));
  if (driftMissing.length)
    console.error(
      "   golden value drift (not found):",
      driftMissing.join(" | "),
    );
  if (!darkOk) console.error("   dark-mode override not found in output");
  if (strayHex.length)
    console.error(
      "   hex literals left in base.css (should be OKLCH):",
      strayHex.slice(0, 5).join(", "),
    );
  if (bakedAlpha)
    console.error(
      "   baked --alpha-* primitives found in base.css (should be derived via oklch(from …)) — see ADR-0005",
    );
  if (!derivedAlpha)
    console.error(
      "   no relative-color alpha (oklch(from var(…))) found in theme.css — see ADR-0005",
    );
  process.exit(1);
}
console.log(
  `✅ token build check passed — ${mustHave.length} utilities, ${golden.length} golden values, OKLCH-only base, derived alpha, dark mode present`,
);
