# diff-immutability-helper

> Creates a diff between 2 JavaScript objects, allowing you to mutate one object to another using immutability-helper

[![npm package][npm-badge]][npm-link]
[![Build Status][build-badge]][build-link]
[![Coverage Status][coveralls-badge]][coveralls-link]

## Overview

`diff-immutability-helper` creates an [immutability-helper](https://www.npmjs.com/package/immutability-helper) compatible diff object between 2 JavaScript variables.

This diff object would then allow you to mutate the base object to the target object.

## Installation

```
$ npm install diff-immutability-helper --save
```

## Example

Given:

```js
  import diff from 'diff-immutability-helper';

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

  const change = diff(base, target);
```

will give a result of:

```js
  const change = {
    a: {
      $splice: [[4, 1], [2, 1, { b: 2 }]]
    },
    b: {$set: 'test 2'},
    $apply: (v) => omit(v, ['c']),
    $merge: {
      d: 'new'
    }
  }
```

thus, we can then do:

```js
  import update from 'immutability-helper';
  update(base, change); // to match target
```

## Notes

-   Array diffing uses [LCS](https://en.wikipedia.org/wiki/Longest_common_subsequence_problem)
-   Only CommonJS format (for node.js) is provided. This is to minimize library size when you bundle with your application.

## License

`diff-immutability-helper` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/diff-immutability-helper.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/diff-immutability-helper

[build-badge]: https://img.shields.io/circleci/project/github/yeojz/diff-immutability-helper/master.svg?style=flat-square
[build-link]: https://circleci.com/gh/yeojz/diff-immutability-helper.svg

[coveralls-badge]: https://img.shields.io/coveralls/yeojz/diff-immutability-helper/master.svg?style=flat-square
[coveralls-link]: https://coveralls.io/github/yeojz/diff-immutability-helper
