import { diffArrays } from "./diffArrays";
import { diffObjects } from "./diffObjects";
import type { Operation } from "./types";

export type CompareFn = (
  base: unknown,
  target: unknown,
  path: string,
  ops: Operation[],
) => void;

/**
 * Core comparison function that dispatches to the appropriate
 * diffing strategy based on the types of base and target.
 *
 * Pushes RFC 6902 operations onto the `ops` array.
 */
export function compare(
  base: unknown,
  target: unknown,
  path: string,
  ops: Operation[],
): void {
  // Identical values — no diff
  if (base === target) return;

  // Either is nullish, either is a primitive, or type mismatch → replace
  if (
    base == null ||
    target == null ||
    typeof base !== "object" ||
    typeof target !== "object" ||
    Array.isArray(base) !== Array.isArray(target)
  ) {
    ops.push({ op: "replace", path, value: target });
    return;
  }

  // Both arrays
  if (Array.isArray(base) && Array.isArray(target)) {
    diffArrays(base, target, path, ops);
    return;
  }

  // Both objects
  diffObjects(
    base as Record<string, unknown>,
    target as Record<string, unknown>,
    path,
    ops,
    compare,
  );
}
