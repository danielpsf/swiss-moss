#!/usr/bin/env node
// WCAG contrast check for tokens/tokens.css. Usage: node scripts/check-contrast.js [--all]
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "..", "tokens", "tokens.css"), "utf8");

const TEXT = 4.5;  // WCAG 1.4.3, normal text
const UI = 3;      // WCAG 1.4.11, control boundaries and state indicators

// [foreground, background, minimum ratio, where it is used]
const PAIRS = [
  ["ink", "paper", TEXT, "body text"],
  ["ink", "paper-deep", TEXT, "tags, code, hover rows"],
  ["ink", "card", TEXT, "inputs, cards"],
  ["ink", "mist", TEXT, "selected rows, chips"],
  ["muted", "paper", TEXT, "caption, hint, key, breadcrumb"],
  ["muted", "paper-deep", TEXT, "side nav, unchecked segmented, disabled inputs"],
  ["muted", "card", TEXT, "placeholder, table head, kbd"],
  ["muted", "mist", TEXT, "muted text on mist"],
  ["signal", "paper", TEXT, ".sm-error"],
  ["signal", "card", TEXT, "signal text on cards"],
  ["signal", "signal-tint", TEXT, "signal alert, tag, invalid chip"],
  ["danger", "paper", TEXT, "danger text"],
  ["danger", "card", TEXT, "danger text on cards"],
  ["danger", "danger-tint", TEXT, "danger alert, tag"],
  ["info", "paper", TEXT, "info text"],
  ["info", "info-tint", TEXT, "info alert, tag"],
  ["moss", "paper", TEXT, "link hover, breadcrumb hover"],
  ["moss-deep", "paper", TEXT, "stat delta"],
  ["moss-deep", "card", TEXT, "file drop label"],
  ["moss-deep", "mist", TEXT, "moss tag, avatar"],
  ["on-moss", "moss", TEXT, "primary button, badge"],
  ["on-moss", "moss-deep", TEXT, "primary button hover"],
  ["on-moss-muted", "moss", TEXT, "full-screen dialog secondary text"],
  ["on-toast", "toast", TEXT, "toast text"],
  ["on-toast-accent", "toast", TEXT, "toast action"],
  ["on-moss", "signal", TEXT, ".sm-badge.signal"],
  ["control-line", "paper", UI, "input, select, switch track, checkbox on paper"],
  ["control-line", "card", UI, "control border on cards"],
  ["control-line", "paper-deep", UI, "control border on paper-deep"],
  ["moss", "paper", UI, "switch on, checked box, focus"],
  ["moss", "card", UI, "checked box on cards"],
  ["focus", "paper", UI, "focus ring"],
  ["card", "control-line", UI, "switch knob on off-track"],
];

function block(re, label) {
  const m = css.match(re);
  if (!m) throw new Error(`tokens.css: ${label} block not found`);
  return m[1];
}
function vars(body) {
  const out = {};
  for (const [, k, v] of body.matchAll(/--sm-([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) out[k] = v.toUpperCase();
  return out;
}
const lightBody = block(/^:root\s*\{([^}]*)\}/m, "light :root");
const darkBody = block(/^:root\[data-theme="dark"\]\s*\{([^}]*)\}/m, 'dark :root[data-theme="dark"]');
const mediaBody = block(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/, "dark media");
const themes = { light: vars(lightBody), dark: vars(darkBody) };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failed = 0;
// The select chevron is a data-URI SVG, so its stroke hex cannot use a variable. Keep it equal to muted.
const chevrons = [...fs.readFileSync(path.join(__dirname, "..", "css", "swiss-moss.css"), "utf8")
  .matchAll(/--sm-chevron:url\("[^"]*stroke='%23([0-9A-Fa-f]{6})'/g)].map((m) => "#" + m[1].toUpperCase());
const wantChevrons = [themes.light.muted, themes.dark.muted, themes.dark.muted]; // light, system dark, data-theme dark
if (JSON.stringify(chevrons) !== JSON.stringify(wantChevrons)) {
  console.log(`FAIL select chevron colours ${chevrons} must equal muted ${wantChevrons}`);
  failed++;
}
// The two dark blocks must stay identical, or system-dark and forced-dark would drift.
if (JSON.stringify(vars(mediaBody)) !== JSON.stringify(themes.dark)) {
  console.log("FAIL dark tokens differ between the prefers-color-scheme block and [data-theme=dark]");
  failed++;
}
const show = process.argv.includes("--all");
for (const [theme, t] of Object.entries(themes)) {
  for (const [fg, bg, min, use] of PAIRS) {
    const f = fg.startsWith("#") ? fg : t[fg];
    const b = bg.startsWith("#") ? bg : t[bg];
    if (!f || !b) { console.log(`FAIL ${theme}: unknown token in ${fg} / ${bg}`); failed++; continue; }
    const r = ratio(f, b);
    const ok = r >= min;
    if (!ok) failed++;
    if (!ok || show) console.log(`${ok ? "ok  " : "FAIL"} ${theme.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min}) ${use}`);
  }
}
console.log(failed ? `${failed} contrast check(s) failed` : `all ${PAIRS.length * 2} contrast checks pass`);
process.exit(failed ? 1 : 0);
