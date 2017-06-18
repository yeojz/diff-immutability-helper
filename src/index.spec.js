const diff = require('./index');
const update = require('immutability-helper');

test('should handle simple push', function () {
  const left = [1, 2, 3];
  const right = [1, 2, 3, 4];
  const delta = diff(left, right);
  expect(update(left, delta)).toMatchObject(right);
});

test('should handle nested collections', function () {
  const left = {
    z: [1, 2, {a: [12, 17, 15]}]
  }
  const right = {
    z: [1, 2, {a: [12, 13, 14, 15]}]
  }

  const delta = diff(left, right);
  expect(update(left, delta)).toMatchObject(right);
});

test('should update a value based on its current one', function () {
  const left = {
    a: 5,
    b: 3
  };

  const right = {
    a: 5,
    b: 6
  };

  const delta = diff(left, right);
  expect(update(left, delta)).toMatchObject(right);
});

test('should handle null', function () {
  const left = null;
  const right = 1;

  const delta = diff(left, right);
  expect(update(left, delta)).toEqual(right);
});

test('should handle undefined', function () {
  const left = void 0;
  const right = 1;

  const delta = diff(left, right);
  expect(update(left, delta)).toEqual(right);
});

test('should handle setting of null', function () {
  const left = 1;
  const right = null;

  const delta = diff(left, right);
  expect(update(left, delta)).toEqual(right);
});

test('should handle strings', function () {
  const left = 'test 1';
  const right = 'replaced 2';

  const delta = diff(left, right);
  expect(update(left, delta)).toEqual(right);
});

test('should handle booleans', function () {
  const left = true;
  const right = false;

  const delta = diff(left, right);
  expect(update(left, delta)).toEqual(right);
});

