const difference = require('lodash/difference');
const intersection = require('lodash/intersection');
const isEmpty = require('lodash/isEmpty');
const omit = require('lodash/omit');
const pick = require('lodash/pick');
const size = require('lodash/size');

const filterLeafTypes = require('./filterLeafTypes');

function mutateSameKeys(keys, collector, base, target) {

  keys.same.forEach((key) => {
    const result = compare(collector[key] || {}, base[key], target[key]);

    if (!isEmpty(result)) {
      collector[key] = result;
    }
  });

  return collector;
}

function mutateRemovedKeys(keys, collector) {
  if (size(keys.remove) > 0) {
    collector.$apply = (obj) => omit(obj, keys.remove);
  }
  return collector;
}

function setValues(changes, collector, target) {
    changes.forEach((key) => {
      collector[key] = collector[key] || {};
      collector[key].$set = target[key];
    });
    return collector;
}

function mutateAddedKeys(keys, collector, base, target) {
  if (size(keys.add) < 1) {
    return collector;
  }

  if (Array.isArray(base)) {
    return setValues(keys.add, collector, target);
  }

  const added = pick(keys.target, keys.add);
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

  const keys = {
    add: difference(targetKeys, baseKeys),
    base: baseKeys,
    remove: difference(baseKeys, targetKeys),
    same: intersection(baseKeys, targetKeys),
    target: targetKeys
  }

  collector = mutateSameKeys(keys, collector, base, target);
  collector = mutateRemovedKeys(keys, collector);
  collector = mutateAddedKeys(keys, collector, base, target);
  return collector;
}

module.exports = compare;
