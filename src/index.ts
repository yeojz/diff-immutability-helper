import { compare } from "./compare";
import type { Operation } from "./types";

/**
 * Creates an RFC 6902 JSON Patch that transforms `base` into `target`.
 *
 * The returned patch is a serializable array of operations that can be
 * applied using any RFC 6902-compliant library (e.g. `fast-json-patch`).
 *
 * Uses LCS-based array diffing for minimal patches.
 *
 * @param base - The original value
 * @param target - The desired value
 * @returns An array of RFC 6902 JSON Patch operations
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6902
 *
 * @example
 * ```ts
 * import { diff } from 'diff-immutability-helper';
 * import { applyPatch } from 'fast-json-patch';
 *
 * const patch = diff(base, target);
 * const { newDocument } = applyPatch(base, patch);
 * ```
 */
export function diff(base: unknown, target: unknown): Operation[] {
  const ops: Operation[] = [];
  compare(base, target, "", ops);
  return ops;
}

export type {
  Operation,
  AddOperation,
  RemoveOperation,
  ReplaceOperation,
} from "./types";
export { encodePointer, formatPath } from "./types";
export { toImmutabilityHelper } from "./compat";
export default diff;
