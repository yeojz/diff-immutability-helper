# diff-immutability-helper

> Creates an [RFC 6902 JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902) between 2 JavaScript objects using LCS-based array diffing

[![npm package][npm-badge]][npm-link]

## Overview

`diff-immutability-helper` computes a minimal, serializable diff between two JavaScript values. The output is a standard [RFC 6902 JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902) - an array of `add`, `remove`, and `replace` operations that can be applied with any compliant library (e.g. [`fast-json-patch`](https://www.npmjs.com/package/fast-json-patch)).

- **Standard output** — RFC 6902 JSON Patch, fully serializable as JSON
- **LCS array diffing** — uses [Longest Common Subsequence](https://en.wikipedia.org/wiki/Longest_common_subsequence_problem) for minimal array patches
- **Zero runtime dependencies**

> BREAKING:
>
> v2 adopts the JSON Patch RFC instead of a custom format which was returned by v1.

## Installation

```
npm install diff-immutability-helper
```

## Example

```ts
import { diff } from 'diff-immutability-helper';

const base = {
  a: [1, 2, { b: 1 }, 4, 5, 6],
  b: 'test',
  c: 'prev'
};

const target = {
  a: [1, 2, { b: 2 }, 4, 6],
  b: 'test 2',
  d: 'new'
};

const patch = diff(base, target);
```

produces:

```json
[
  { "op": "replace", "path": "/a/2", "value": { "b": 2 } },
  { "op": "remove", "path": "/a/4" },
  { "op": "replace", "path": "/b", "value": "test 2" },
  { "op": "remove", "path": "/c" },
  { "op": "add", "path": "/d", "value": "new" }
]
```

Apply it with any RFC 6902 library:

```ts
import { applyPatch } from 'fast-json-patch';

const { newDocument } = applyPatch(base, patch);
// newDocument deeply equals target
```

## AI Usage Disclosure

The v2 rewrite is heavily assisted with AI.

## License

`diff-immutability-helper` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/diff-immutability-helper.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/diff-immutability-helper
