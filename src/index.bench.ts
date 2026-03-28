import { bench, describe } from "vitest";
import { diff, toImmutabilityHelper } from "./index";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Flat object with a handful of changed keys */
const flatBase = Object.fromEntries(
  Array.from({ length: 50 }, (_, i) => [`key${i}`, i]),
);
const flatTarget = {
  ...flatBase,
  key5: 999,
  key25: "changed",
  key49: null,
  key50: "new",
};

/** Deeply nested object (5 levels) with a single leaf change */
function nested(depth: number, leaf: unknown): Record<string, unknown> {
  if (depth === 0) return { value: leaf };
  return { child: nested(depth - 1, leaf) };
}
const deepBase = nested(10, 1);
const deepTarget = nested(10, 2);

/** Array with 1 000 elements, a few insertions / deletions */
const bigArrayBase = Array.from({ length: 1_000 }, (_, i) => i);
const bigArrayTarget = bigArrayBase.filter((n) => n % 7 !== 0); // remove every 7th
bigArrayTarget.push(9001, 9002, 9003); // append 3

/** Medium array (100 elements) — fully replaced */
const medArrayBase = Array.from({ length: 100 }, (_, i) => i);
const medArrayTarget = Array.from({ length: 100 }, (_, i) => i + 1000);

/** The README example */
const readmeBase = {
  a: [1, 2, { b: 1 }, 4, 5, 6],
  b: "test",
  c: "prev",
};
const readmeTarget = {
  a: [1, 2, { b: 2 }, 4, 6],
  b: "test 2",
  d: "new",
};

/** Mixed: object with nested arrays and objects */
const mixedBase = {
  users: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    name: `user${i}`,
    tags: [i, i * 2, i * 3],
  })),
  meta: { version: 1, active: true },
};
const mixedTarget = {
  users: [
    ...mixedBase.users.slice(0, 10),
    { id: 10, name: "updated", tags: [10, 20, 30, 40] },
    ...mixedBase.users.slice(11),
  ],
  meta: { version: 2, active: true },
};

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe("diff", () => {
  bench("flat object (50 keys, 4 changes)", () => {
    diff(flatBase, flatTarget);
  });

  bench("deeply nested object (10 levels)", () => {
    diff(deepBase, deepTarget);
  });

  bench("large array (1 000 elements, LCS)", () => {
    diff(bigArrayBase, bigArrayTarget);
  });

  bench("medium array full replacement (100 elements)", () => {
    diff(medArrayBase, medArrayTarget);
  });

  bench("readme example", () => {
    diff(readmeBase, readmeTarget);
  });

  bench("mixed nested structure", () => {
    diff(mixedBase, mixedTarget);
  });
});

describe("toImmutabilityHelper", () => {
  const flatPatch = diff(flatBase, flatTarget);
  const deepPatch = diff(deepBase, deepTarget);
  const readmePatch = diff(readmeBase, readmeTarget);
  const mixedPatch = diff(mixedBase, mixedTarget);

  bench("flat object patch", () => {
    toImmutabilityHelper(flatPatch, flatBase);
  });

  bench("deep nested patch", () => {
    toImmutabilityHelper(deepPatch, deepBase);
  });

  bench("readme example patch", () => {
    toImmutabilityHelper(readmePatch, readmeBase);
  });

  bench("mixed nested patch", () => {
    toImmutabilityHelper(mixedPatch, mixedBase);
  });
});
