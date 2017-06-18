const difference = require('lodash/difference');
const intersection = require('lodash/intersection');
const isEmpty = require('lodash/isEmpty');
const omit = require('lodash/omit');
const pick = require('lodash/pick');
const size = require('lodash/size');

const filterLeafTypes = require('./filterLeafTypes');

function mutateSameKeys(keys, collector, base, target) {

  keys.forEach((key) => {
    const result = compare(collector[key] || {}, base[key], target[key]);

    if (!isEmpty(result)) {
      collector[key] = result;
    }
  });

  return collector;
}

function mutateRemovedKeys(keys, collector) {
  if (size(keys) > 0) {
    collector.$apply = (obj) => omit(obj, keys);
  }
  return collector;
}

function setValues(keys, collector, target) {
    keys.forEach((key) => {
      collector[key] = collector[key] || {};
      collector[key].$set = target[key];
    });
    return collector;
}

function mutateAddedKeys(keys, collector, base, target) {
  if (size(keys) < 1) {
    return collector;
  }

  if (Array.isArray(base)) {
    return setValues(keys, collector, target);
  }

  const added = pick(target, keys);
  collector.$merge = added;
  return collector;
}

function compare(collector, base, target) {

  const filters = filterLeafTypes(collector, base, target);
  if (filters.hasOwnProperty('collector')) {
    return filters.collector;
  }

  const baseKeys = Object.keys(base);
  const targetKeys = Object.keys(target);

  const add = difference(targetKeys, baseKeys);
  const remove = difference(baseKeys, targetKeys);
  const same = intersection(baseKeys, targetKeys);

  collector = mutateSameKeys(same, collector, base, target);
  collector = mutateRemovedKeys(remove, collector);
  collector = mutateAddedKeys(add, collector, base, target);

  return collector;
}

module.exports = compare;
