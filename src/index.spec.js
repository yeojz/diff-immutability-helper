import omit from 'lodash/omit';
import update from 'immutability-helper';
import diff from './index';

test('should handle simple push', () => {
  const base = [1, 2, 3];
  const target = [1, 2, 3, 4];
  const delta = diff(base, target);
  expect(update(base, delta)).toMatchObject(target);
});

test('should handle nested collections', () => {
  const base = {
    a: [1, 2, { b: [12, 17, 15] }],
    b: [1, 2]
  };
  const target = {
    a: [1, 2, { b: [12, 13, 14, 15] }],
    b: [1, 2]
  };

  const delta = diff(base, target);
  expect(update(base, delta)).toMatchObject(target);
});

test('should update a value based on its current one', () => {
  const base = {
    a: 5,
    b: 3
  };

  const target = {
    a: 5,
    b: 6
  };

  const delta = diff(base, target);
  expect(update(base, delta)).toMatchObject(target);
});

test('should handle nested object arrays', () => {
  const base = {
    a: [1, 2, 3, 4, { b: 1 }, { c: 2, d: 3 }, 6]
  };

  const target = {
    a: [1, 2, 3, { a: 1 }, { b: 2 }, { c: 2, d: 3, e: 3 }, 6, 7]
  };

  const delta = diff(base, target);
  expect(update(base, delta)).toMatchObject(target);
});

test('should handle null', () => {
  const base = null;
  const target = 1;

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('should handle undefined', () => {
  const base = void 0;
  const target = 1;

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('should handle setting of null', () => {
  const base = 1;
  const target = null;

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('should handle strings', () => {
  const base = 'test 1';
  const target = 'replaced 2';

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('should handle booleans', () => {
  const base = true;
  const target = false;

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('should handle arrays to other types', () => {
  const base = ['hello', 'world'];
  const target = 'hello world';

  const delta = diff(base, target);
  expect(update(base, delta)).toEqual(target);
});

test('example in readme should generate expected result', () => {
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

  const delta = diff(base, target);

  const delta2 = {
    a: {
      $splice: [[4, 1], [2, 1, { b: 2 }]]
    },
    b: { $set: 'test 2' },
    $apply: v => omit(v, ['c']),
    $merge: {
      d: 'new'
    }
  };

  expect(update(base, delta)).toEqual(target);
  expect(update(base, delta2)).toEqual(target);
});
