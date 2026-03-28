import type { Operation } from "./types";
import { formatPath } from "./types";

/**
 * Computes the Longest Common Subsequence (LCS) table for two arrays.
 */
function buildLcsTable(base: unknown[], target: unknown[]): number[][] {
  const m = base.length;
  const n = target.length;
  const table: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (base[i - 1] === target[j - 1]) {
        table[i]![j] = table[i - 1]![j - 1]! + 1;
      } else {
        table[i]![j] = Math.max(table[i - 1]![j]!, table[i]![j - 1]!);
      }
    }
  }

  return table;
}

interface LcsMatch {
  baseIdx: number;
  targetIdx: number;
}

/**
 * Recovers the LCS sequence from the DP table by backtracking.
 * Returns matched index pairs in forward order.
 */
function recoverLcs(
  base: unknown[],
  target: unknown[],
  table: number[][],
): LcsMatch[] {
  const matches: LcsMatch[] = [];
  let i = base.length;
  let j = target.length;

  while (i > 0 && j > 0) {
    if (base[i - 1] === target[j - 1]) {
      matches.push({ baseIdx: i - 1, targetIdx: j - 1 });
      i--;
      j--;
    } else if (table[i]![j - 1]! >= table[i - 1]![j]!) {
      j--;
    } else {
      i--;
    }
  }

  matches.reverse();
  return matches;
}

/**
 * Processes a gap between LCS anchors, emitting RFC 6902 operations.
 *
 * Optimizes by combining paired deletes+inserts into `replace` ops,
 * then emitting leftover `remove` or `add` ops as needed.
 *
 * Returns the updated currentIdx after all operations.
 */
function processGap(
  target: unknown[],
  deleteCount: number,
  targetStart: number,
  targetEnd: number,
  currentIdx: number,
  path: string,
  ops: Operation[],
): number {
  const insertCount = targetEnd - targetStart;
  const replaces = Math.min(deleteCount, insertCount);
  const extraDeletes = deleteCount - replaces;
  const extraInsertStart = targetStart + replaces;

  // Remove extra elements (all at the same currentIdx since each
  // removal shifts the next element into position)
  for (let i = 0; i < extraDeletes; i++) {
    ops.push({ op: "remove", path: formatPath(path, currentIdx) });
  }

  // Replace paired elements in-place
  for (let i = 0; i < replaces; i++) {
    ops.push({
      op: "replace",
      path: formatPath(path, currentIdx),
      value: target[targetStart + i],
    });
    currentIdx++;
  }

  // Insert extra elements
  for (let i = extraInsertStart; i < targetEnd; i++) {
    ops.push({
      op: "add",
      path: formatPath(path, currentIdx),
      value: target[i],
    });
    currentIdx++;
  }

  return currentIdx;
}

/**
 * Diffs two arrays using LCS and emits RFC 6902 operations.
 */
export function diffArrays(
  base: unknown[],
  target: unknown[],
  path: string,
  ops: Operation[],
): void {
  const table = buildLcsTable(base, target);
  const matches = recoverLcs(base, target, table);

  let baseIdx = 0;
  let targetIdx = 0;
  let currentIdx = 0;

  const anchors: LcsMatch[] = [
    ...matches,
    { baseIdx: base.length, targetIdx: target.length },
  ];

  for (const anchor of anchors) {
    const deleteCount = anchor.baseIdx - baseIdx;
    const targetStart = targetIdx;
    const targetEnd = anchor.targetIdx;

    if (deleteCount > 0 || targetEnd > targetStart) {
      currentIdx = processGap(
        target,
        deleteCount,
        targetStart,
        targetEnd,
        currentIdx,
        path,
        ops,
      );
    }

    // Skip the matched element (if not the sentinel)
    if (anchor.baseIdx < base.length) {
      currentIdx++;
    }

    baseIdx = anchor.baseIdx + 1;
    targetIdx = anchor.targetIdx + 1;
  }
}
