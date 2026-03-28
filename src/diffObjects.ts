import type { Operation } from "./types";
import { formatPath } from "./types";
import type { CompareFn } from "./compare";

/**
 * Diffs two plain objects and emits RFC 6902 operations.
 *
 * - Common keys are compared recursively.
 * - Keys only in base produce `remove` operations.
 * - Keys only in target produce `add` operations.
 */
export function diffObjects(
  base: Record<string, unknown>,
  target: Record<string, unknown>,
  path: string,
  ops: Operation[],
  compare: CompareFn,
): void {
  const baseKeys = Object.keys(base);
  const targetKeys = Object.keys(target);
  const targetKeySet = new Set(targetKeys);
  const baseKeySet = new Set(baseKeys);

  // Recursively compare common keys
  for (const key of baseKeys) {
    if (targetKeySet.has(key)) {
      compare(base[key], target[key], formatPath(path, key), ops);
    }
  }

  // Remove keys only in base
  for (const key of baseKeys) {
    if (!targetKeySet.has(key)) {
      ops.push({ op: "remove", path: formatPath(path, key) });
    }
  }

  // Add keys only in target
  for (const key of targetKeys) {
    if (!baseKeySet.has(key)) {
      ops.push({ op: "add", path: formatPath(path, key), value: target[key] });
    }
  }
}
