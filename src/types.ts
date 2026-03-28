/**
 * RFC 6902 JSON Patch operation types.
 * @see https://datatracker.ietf.org/doc/html/rfc6902
 */

export interface AddOperation {
  op: "add";
  path: string;
  value: unknown;
}

export interface RemoveOperation {
  op: "remove";
  path: string;
}

export interface ReplaceOperation {
  op: "replace";
  path: string;
  value: unknown;
}

export type Operation = AddOperation | RemoveOperation | ReplaceOperation;

/**
 * Encodes a single JSON Pointer segment per RFC 6901.
 * `~` becomes `~0`, `/` becomes `~1`.
 */
export function encodePointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Builds a JSON Pointer path by appending a segment to a base path.
 */
export function formatPath(basePath: string, segment: string | number): string {
  if (typeof segment === "number") {
    return `${basePath}/${segment}`;
  }
  return `${basePath}/${encodePointer(segment)}`;
}
