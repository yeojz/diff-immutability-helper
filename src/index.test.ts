import { describe, test, expect } from "vitest";
import { applyPatch } from "fast-json-patch";
import update from "immutability-helper";
import { diff, encodePointer, toImmutabilityHelper } from "./index";

/**
 * Helper: applies an RFC 6902 patch via fast-json-patch and returns the result.
 * Uses structuredClone so the original document is not mutated.
 */
function apply(doc: unknown, patch: ReturnType<typeof diff>): unknown {
  const result = applyPatch(structuredClone(doc), structuredClone(patch));
  return result.newDocument;
}

describe("diff", () => {
  describe("objects", () => {
    test("should update a changed value", () => {
      const base = { a: 5, b: 3 };
      const target = { a: 5, b: 6 };
      const patch = diff(base, target);
      expect(patch).toEqual([{ op: "replace", path: "/b", value: 6 }]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should add new keys", () => {
      const base = {};
      const target = { a: 1, b: 2 };
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "add", path: "/a", value: 1 },
        { op: "add", path: "/b", value: 2 },
      ]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should remove keys", () => {
      const base = { a: 1, b: 2 };
      const target = {};
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "remove", path: "/a" },
        { op: "remove", path: "/b" },
      ]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle mixed add/remove/update", () => {
      const base = { a: 1, b: "old", c: true };
      const target = { a: 1, b: "new", d: false };
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
      expect(patch).toContainEqual({ op: "replace", path: "/b", value: "new" });
      expect(patch).toContainEqual({ op: "remove", path: "/c" });
      expect(patch).toContainEqual({ op: "add", path: "/d", value: false });
    });

    test("should handle deeply nested changes", () => {
      const base = { a: { b: { c: { d: 1 } } } };
      const target = { a: { b: { c: { d: 2 } } } };
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "replace", path: "/a/b/c/d", value: 2 },
      ]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should produce empty patch for equal objects", () => {
      const base = { a: 1, b: "hello" };
      const target = { a: 1, b: "hello" };
      expect(diff(base, target)).toEqual([]);
    });

    test("should produce empty patch for empty objects", () => {
      expect(diff({}, {})).toEqual([]);
    });
  });

  describe("arrays", () => {
    test("should handle simple push", () => {
      const base = [1, 2, 3];
      const target = [1, 2, 3, 4];
      const patch = diff(base, target);
      expect(patch).toEqual([{ op: "add", path: "/3", value: 4 }]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle element removal", () => {
      const base = [1, 2, 3, 4, 5];
      const target = [1, 3, 5];
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle complete replacement", () => {
      const base = [1, 2, 3];
      const target = [4, 5, 6];
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "replace", path: "/0", value: 4 },
        { op: "replace", path: "/1", value: 5 },
        { op: "replace", path: "/2", value: 6 },
      ]);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle empty to populated", () => {
      const base: number[] = [];
      const target = [1, 2, 3];
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle populated to empty", () => {
      const base = [1, 2, 3];
      const target: number[] = [];
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should produce empty patch for equal arrays", () => {
      expect(diff([1, 2, 3], [1, 2, 3])).toEqual([]);
    });

    test("should produce empty patch for empty arrays", () => {
      expect(diff([], [])).toEqual([]);
    });
  });

  describe("nested structures", () => {
    test("should handle nested collections", () => {
      const base = {
        a: [1, 2, { b: [12, 17, 15] }],
        b: [1, 2],
      };
      const target = {
        a: [1, 2, { b: [12, 13, 14, 15] }],
        b: [1, 2],
      };
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle nested object arrays", () => {
      const base = {
        a: [1, 2, 3, 4, { b: 1 }, { c: 2, d: 3 }, 6],
      };
      const target = {
        a: [1, 2, 3, { a: 1 }, { b: 2 }, { c: 2, d: 3, e: 3 }, 6, 7],
      };
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);
    });

    test("should handle the readme example", () => {
      const base = {
        a: [1, 2, { b: 1 }, 4, 5, 6],
        b: "test",
        c: "prev",
      };
      const target = {
        a: [1, 2, { b: 2 }, 4, 6],
        b: "test 2",
        d: "new",
      };
      const patch = diff(base, target);
      expect(apply(base, patch)).toEqual(target);

      // Verify specific operations
      expect(patch).toContainEqual({
        op: "replace",
        path: "/b",
        value: "test 2",
      });
      expect(patch).toContainEqual({ op: "remove", path: "/c" });
      expect(patch).toContainEqual({ op: "add", path: "/d", value: "new" });
    });
  });

  describe("primitives and type changes", () => {
    test("should handle strings", () => {
      const patch = diff("test 1", "replaced 2");
      expect(patch).toEqual([
        { op: "replace", path: "", value: "replaced 2" },
      ]);
    });

    test("should handle booleans", () => {
      const patch = diff(true, false);
      expect(patch).toEqual([{ op: "replace", path: "", value: false }]);
    });

    test("should handle numbers", () => {
      const patch = diff(1, 2);
      expect(patch).toEqual([{ op: "replace", path: "", value: 2 }]);
    });

    test("should handle array to other type", () => {
      const patch = diff(["hello", "world"], "hello world");
      expect(patch).toEqual([
        { op: "replace", path: "", value: "hello world" },
      ]);
    });

    test("should handle other type to array", () => {
      const patch = diff("hello world", ["hello", "world"]);
      expect(patch).toEqual([
        { op: "replace", path: "", value: ["hello", "world"] },
      ]);
    });

    test("should handle object to null", () => {
      const patch = diff({ a: 1 }, null);
      expect(patch).toEqual([{ op: "replace", path: "", value: null }]);
    });

    test("should handle null to object", () => {
      const patch = diff(null, { a: 1 });
      expect(patch).toEqual([{ op: "replace", path: "", value: { a: 1 } }]);
    });

    test("should handle functions", () => {
      const fn1 = () => 1;
      const fn2 = () => 2;
      const patch = diff(fn1, fn2);
      expect(patch).toEqual([{ op: "replace", path: "", value: fn2 }]);
    });
  });

  describe("identity / null / undefined", () => {
    test("should produce empty patch for identical references", () => {
      const obj = { a: 1 };
      expect(diff(obj, obj)).toEqual([]);
    });

    test("should produce empty patch for null === null", () => {
      expect(diff(null, null)).toEqual([]);
    });

    test("should produce empty patch for undefined === undefined", () => {
      expect(diff(undefined, undefined)).toEqual([]);
    });

    test("should handle null to value", () => {
      expect(diff(null, 1)).toEqual([{ op: "replace", path: "", value: 1 }]);
    });

    test("should handle undefined to value", () => {
      expect(diff(undefined, 1)).toEqual([
        { op: "replace", path: "", value: 1 },
      ]);
    });

    test("should handle value to null", () => {
      expect(diff(1, null)).toEqual([{ op: "replace", path: "", value: null }]);
    });

    test("should handle value to undefined", () => {
      expect(diff(1, undefined)).toEqual([
        { op: "replace", path: "", value: undefined },
      ]);
    });
  });

  describe("serialization", () => {
    test("patch should be JSON-serializable", () => {
      const base = {
        a: [1, 2, { b: 1 }, 4, 5, 6],
        b: "test",
        c: "prev",
      };
      const target = {
        a: [1, 2, { b: 2 }, 4, 6],
        b: "test 2",
        d: "new",
      };
      const patch = diff(base, target);
      const serialized = JSON.parse(JSON.stringify(patch));
      expect(apply(base, serialized)).toEqual(target);
    });
  });

  describe("JSON Pointer encoding", () => {
    test("should encode keys with slashes", () => {
      const base = { "a/b": 1 };
      const target = { "a/b": 2 };
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "replace", path: "/a~1b", value: 2 },
      ]);
    });

    test("should encode keys with tildes", () => {
      const base = { "a~b": 1 };
      const target = { "a~b": 2 };
      const patch = diff(base, target);
      expect(patch).toEqual([
        { op: "replace", path: "/a~0b", value: 2 },
      ]);
    });

    test("encodePointer should handle both ~ and /", () => {
      expect(encodePointer("a/b~c")).toBe("a~1b~0c");
    });
  });
});

describe("toImmutabilityHelper", () => {
  test("should return empty object for empty patch", () => {
    expect(toImmutabilityHelper([])).toEqual({});
  });

  test("should handle root-level replace", () => {
    const spec = toImmutabilityHelper([{ op: "replace", path: "", value: 42 }]);
    expect(spec).toEqual({ $set: 42 });
  });

  test("should handle object value replace", () => {
    const base = { a: 5, b: 3 };
    const target = { a: 5, b: 6 };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle adding keys with $merge", () => {
    const base = {};
    const target = { a: 1, b: 2 };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(spec.$merge).toEqual({ a: 1, b: 2 });
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle removing keys with $unset", () => {
    const base = { a: 1, b: 2 };
    const target = {};
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(spec.$unset).toEqual(["a", "b"]);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle mixed add/remove/update", () => {
    const base = { a: 1, b: "old", c: true };
    const target = { a: 1, b: "new", d: false };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle deeply nested changes", () => {
    const base = { a: { b: { c: { d: 1 } } } };
    const target = { a: { b: { c: { d: 2 } } } };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle array push with $splice", () => {
    const base = [1, 2, 3];
    const target = [1, 2, 3, 4];
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(spec.$splice).toEqual([[3, 0, 4]]);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle array element removal", () => {
    const base = [1, 2, 3, 4, 5];
    const target = [1, 3, 5];
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle array element replacement via $set", () => {
    const base = [1, 2, 3];
    const target = [4, 5, 6];
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle the readme example end-to-end", () => {
    const base = {
      a: [1, 2, { b: 1 }, 4, 5, 6],
      b: "test",
      c: "prev",
    };
    const target = {
      a: [1, 2, { b: 2 }, 4, 6],
      b: "test 2",
      d: "new",
    };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle nested object arrays", () => {
    const base = {
      a: [1, 2, 3, 4, { b: 1 }, { c: 2, d: 3 }, 6],
    };
    const target = {
      a: [1, 2, 3, { a: 1 }, { b: 2 }, { c: 2, d: 3, e: 3 }, 6, 7],
    };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should handle nested collections", () => {
    const base = {
      a: [1, 2, { b: [12, 17, 15] }],
      b: [1, 2],
    };
    const target = {
      a: [1, 2, { b: [12, 13, 14, 15] }],
      b: [1, 2],
    };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  test("should decode JSON Pointer escapes in keys", () => {
    const base = { "a/b": 1, "c~d": 2 };
    const target = { "a/b": 10, "c~d": 20 };
    const patch = diff(base, target);
    const spec = toImmutabilityHelper(patch);
    expect(update(base, spec)).toEqual(target);
  });

  describe("numeric key disambiguation with base", () => {
    test("should treat numeric keys as object keys when base has an object", () => {
      const base = { "0": "a", "1": "b" };
      const target = { "0": "a", "1": "b", "2": "c" };
      const patch = diff(base, target);
      const spec = toImmutabilityHelper(patch, base);
      // Should use $merge, not $splice
      expect(spec.$merge).toEqual({ "2": "c" });
      expect(spec.$splice).toBeUndefined();
      expect(update(base, spec)).toEqual(target);
    });

    test("should treat numeric keys as array indices when base has an array", () => {
      const base = ["a", "b"];
      const target = ["a", "b", "c"];
      const patch = diff(base, target);
      const spec = toImmutabilityHelper(patch, base);
      // Should use $splice, not $merge
      expect(spec.$splice).toBeDefined();
      expect(spec.$merge).toBeUndefined();
      expect(update(base, spec)).toEqual(target);
    });

    test("should handle remove on object with numeric keys", () => {
      const base = { "0": "a", "1": "b", "2": "c" };
      const target = { "0": "a", "1": "b" };
      const patch = diff(base, target);
      const spec = toImmutabilityHelper(patch, base);
      // Should use $unset, not $splice
      expect(spec.$unset).toEqual(["2"]);
      expect(spec.$splice).toBeUndefined();
      expect(update(base, spec)).toEqual(target);
    });

    test("should handle nested numeric key objects", () => {
      const base = { items: { "0": "first", "1": "second" } };
      const target = { items: { "0": "first", "1": "updated" } };
      const patch = diff(base, target);
      const spec = toImmutabilityHelper(patch, base);
      expect(update(base, spec)).toEqual(target);
    });

    test("should fall back to heuristic without base", () => {
      // Without base, numeric keys are assumed to be array indices
      const patch = diff({ "0": "a" }, { "0": "a", "1": "b" });
      const withBase = toImmutabilityHelper(patch, { "0": "a" });
      const withoutBase = toImmutabilityHelper(patch);
      // With base: knows it's an object → $merge
      expect(withBase.$merge).toEqual({ "1": "b" });
      // Without base: assumes array → $splice
      expect(withoutBase.$splice).toBeDefined();
    });

    test("should still work with all existing cases when base is provided", () => {
      const base = {
        a: [1, 2, { b: 1 }, 4, 5, 6],
        b: "test",
        c: "prev",
      };
      const target = {
        a: [1, 2, { b: 2 }, 4, 6],
        b: "test 2",
        d: "new",
      };
      const patch = diff(base, target);
      const spec = toImmutabilityHelper(patch, base);
      expect(update(base, spec)).toEqual(target);
    });
  });
});
