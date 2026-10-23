#!/usr/bin/env node
// Checks the pure helpers in js/swiss-moss.js without a browser. Usage: node scripts/check-behaviours.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const noop = () => {};
const document = {
  readyState: "complete",
  documentElement: { getAttribute: () => null, setAttribute: noop, removeAttribute: noop },
  querySelectorAll: () => [],
  addEventListener: noop
};
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", "swiss-moss.js"), "utf8"), { window, document, addEventListener: noop });
const SM = window.SwissMoss;

const d = s => SM.calendar.parse(s);
const iso = SM.calendar.iso;
// October 2026 starts on a Thursday.
const oct = SM.calendar.grid(2026, 9, 1);
assert.strictEqual(oct.length, 42);
assert.strictEqual(iso(oct[0]), "2026-09-28", "Monday-first grid starts on the Monday before");
assert.strictEqual(iso(oct[3]), "2026-10-01");
assert.strictEqual(iso(SM.calendar.grid(2026, 9, 0)[0]), "2026-09-27", "Sunday-first grid");
assert.strictEqual(iso(SM.calendar.addMonths(d("2026-01-31"), 1)), "2026-02-28", "clamps to a shorter month");
assert.strictEqual(iso(SM.calendar.addMonths(d("2026-03-15"), -3)), "2025-12-15", "crosses a year");
assert.strictEqual(SM.calendar.parse("2026-13-01x"), null);

assert.strictEqual(SM.password.score("short1!"), 0);
assert.strictEqual(SM.password.score("abcdefgh"), 1);
assert.strictEqual(SM.password.score("abcdefghijkl"), 2);
assert.strictEqual(SM.password.score("Abcdefgh"), 2);
assert.strictEqual(SM.password.score("Abcdefghijk1!"), 4);

assert.strictEqual(SM.money.parse("1.234,56", "de-DE"), 1234.56);
assert.strictEqual(SM.money.parse("1,234.56", "en-US"), 1234.56);
assert.strictEqual(SM.money.parse("€ 12", "de-DE"), 12);
assert.strictEqual(SM.money.parse("-3,5", "de-DE"), -3.5);
assert.strictEqual(SM.money.parse("abc", "en-US"), null);
assert.strictEqual(SM.money.format(1234.5, "de-DE"), "1.234,50");

assert.ok(SM.table.compare("10", "9") > 0, "numbers sort as numbers");
assert.ok(SM.table.compare("Item 2", "Item 10") < 0, "text sorts naturally");
assert.ok(SM.table.compare("b", "A") > 0, "text ignores case");
assert.ok(SM.table.compare("2026-01-02", "2026-01-10") < 0, "ISO dates sort");

console.log("Behaviour helpers: all checks pass.");
