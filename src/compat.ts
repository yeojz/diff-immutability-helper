import type { Operation } from "./types";

/**
 * Decodes a JSON Pointer path (RFC 6901) into an array of segments.
 * Reverses the encoding: `~1` → `/`, `~0` → `~`.
 */
function decodePath(path: string): string[] {
  if (path === "") return [];
  return path
    .slice(1)
    .split("/")
    .map((seg) => seg.replace(/~1/g, "/").replace(/~0/g, "~"));
}

/**
 * Heuristic fallback: a segment is treated as an array index if it is
 * a non-negative integer string (e.g. "0", "3", "12").
 */
function looksLikeIndex(segment: string): boolean {
  return /^\d+$/.test(segment);
}

/**
 * Walks the base document along the given path segments to determine
 * whether the parent of the final segment is an array.
 *
 * Returns `true` if the parent is an array, `false` if it's a plain
 * object, or `null` if the path can't be resolved (falls back to heuristic).
 */
function parentIsArray(base: unknown, segments: string[]): boolean | null {
  let current: unknown = base;

  // Walk to the parent (all segments except the last)
  for (let i = 0; i < segments.length - 1; i++) {
    if (current == null || typeof current !== "object") return null;

    const seg = segments[i]!;
    if (Array.isArray(current)) {
      const idx = parseInt(seg, 10);
      current = Number.isNaN(idx) ? undefined : current[idx];
    } else {
      current = (current as Record<string, unknown>)[seg];
    }
  }

  if (Array.isArray(current)) return true;
  if (current != null && typeof current === "object") return false;
  return null;
}

/**
 * Determines whether the last segment of a path targets an array element.
 *
 * When `base` is provided, walks the document for an exact answer.
 * Otherwise falls back to the numeric heuristic.
 */
function isArrayOp(
  segments: string[],
  lastSegment: string,
  base: unknown | undefined,
): boolean {
  if (base !== undefined) {
    const result = parentIsArray(base, segments);
    if (result !== null) return result;
  }
  return looksLikeIndex(lastSegment);
}

/**
 * Navigates into a nested object, creating intermediate objects as needed.
 */
function navigate(
  root: Record<string, unknown>,
  segments: string[],
): Record<string, unknown> {
  let current = root;
  for (const seg of segments) {
    if (
      !(seg in current) ||
      typeof current[seg] !== "object" ||
      current[seg] === null
    ) {
      current[seg] = {};
    }
    current = current[seg] as Record<string, unknown>;
  }
  return current;
}

/**
 * Converts an RFC 6902 JSON Patch into an `immutability-helper` update spec.
 *
 * This enables backward compatibility with codebases that use
 * `immutability-helper`'s `update()` function.
 *
 * Mapping:
 * - `replace` → `{ $set: value }` nested at the target path
 * - `add` on object key → `$merge: { key: value }` at parent
 * - `add` on array index → `$splice: [[index, 0, value]]` at parent
 * - `remove` on object key → `$unset: [key]` at parent
 * - `remove` on array index → `$splice: [[index, 1]]` at parent
 *
 * When `base` is provided, the document is walked to determine whether
 * each path targets an array element or an object key — this eliminates
 * ambiguity for objects with numeric string keys (e.g. `{ "0": "val" }`).
 *
 * Without `base`, a numeric heuristic is used as a fallback.
 *
 * @param patch - An RFC 6902 JSON Patch (as returned by `diff()`)
 * @param base  - The original document, used to disambiguate array vs object paths
 * @returns An immutability-helper compatible update specification
 *
 * @example
 * ```ts
 * import { diff, toImmutabilityHelper } from 'diff-immutability-helper';
 * import update from 'immutability-helper';
 *
 * const patch = diff(base, target);
 * const spec = toImmutabilityHelper(patch, base);
 * const result = update(base, spec);
 * ```
 */
export function toImmutabilityHelper(
  patch: Operation[],
  base?: unknown,
): Record<string, unknown> {
  if (patch.length === 0) return {};

  const root: Record<string, unknown> = {};

  for (const op of patch) {
    // Root-level operation
    if (op.path === "") {
      if (op.op === "replace") {
        return { $set: op.value };
      }
      continue;
    }

    const segments = decodePath(op.path);
    const parentSegments = segments.slice(0, -1);
    const lastSegment = segments[segments.length - 1]!;
    const arrayOp = isArrayOp(segments, lastSegment, base);

    const parent = navigate(root, parentSegments);

    switch (op.op) {
      case "replace":
        // Use $set — works for both array indices and object keys
        parent[lastSegment] = navigate(parent, [lastSegment]);
        (parent[lastSegment] as Record<string, unknown>).$set = op.value;
        break;

      case "add":
        if (arrayOp) {
          if (!parent.$splice) parent.$splice = [];
          (parent.$splice as unknown[][]).push([
            parseInt(lastSegment, 10),
            0,
            op.value,
          ]);
        } else {
          if (!parent.$merge) parent.$merge = {};
          (parent.$merge as Record<string, unknown>)[lastSegment] = op.value;
        }
        break;

      case "remove":
        if (arrayOp) {
          if (!parent.$splice) parent.$splice = [];
          (parent.$splice as unknown[][]).push([
            parseInt(lastSegment, 10),
            1,
          ]);
        } else {
          if (!parent.$unset) parent.$unset = [];
          (parent.$unset as string[]).push(lastSegment);
        }
        break;
    }
  }

  return root;
}
