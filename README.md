# diff-immutability-helper

> Creates a diff between 2 JavaScript objects, allowing you to mutate one object to another using immutability-helper.

[![Build Status][build-badge]][build-link]
[![npm package][npm-badge]][npm-link]

## Overview

`diff-immutability-helper` allows you to generate a [immutability-helper](https://www.npmjs.com/package/immutability-helper) compatible changeset between 2 JavaScript variables, which you can use to mutate the base object to the target object.

## Example

```js
  const base = {
    a: [1, 2, {b: 1}],
    b: 'test',
    c: 'prev'
  };

  const target = {
    a: [1, 2, {b: 2}, 4],
    b: 'test 2',
    d: 'new'
  };

  const change = diff(base, target);
```

will give a result of:

```js
  const change = {
    a: {
      '2': {
        b: {$set: 2}
      },
      '3': {$set: 4}
    },
    b: {$set: 'test 2'},
    $apply: (v) => omit(v, ['c']),
    $merge: {
      d: 'new'
    }
  }
```


## Installation

Install the library:

```
npm install diff-immutability-helper --save

// or

yarn add diff-immutability-helper
```


## License

`diff-immutability-helper` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/diff-immutability-helper.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/diff-immutability-helper

[build-badge]: https://img.shields.io/circleci/project/github/yeojz/diff-immutability-helper/master.svg?style=flat-square
[build-link]: https://circleci.com/gh/yeojz/diff-immutability-helper.svg
