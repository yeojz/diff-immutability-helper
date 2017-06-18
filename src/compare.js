import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import size from 'lodash/size';
import filterLeafTypes from './filterLeafTypes';

function compareSameKeys(collector, values) {

  const keysToCompare = intersection(values.baseKeys, values.targetKeys);

  keysToCompare.forEach((key) => {
    const result = compare(
      collector[key] || {},
      values.base[key],
      values.target[key]
    );

    if (!isEmpty(result)) {
      collector[key] = result;
    }
  });

  return collector;
}

function removeKeys(collector, values) {
  const keysToRemove = difference(values.baseKeys, values.targetKeys);

  if (size(keysToRemove) > 0) {
    collector.$apply = (obj) => omit(obj, keysToRemove);
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

function addKeys(collector, values) {
  const keysToAdd = difference(values.targetKeys, values.baseKeys);

  if (size(keysToAdd) < 1) {
    return collector;
  }

  if (Array.isArray(values.base)) {
    return setValues(keysToAdd, collector, values.target);
  }

  const added = pick(values.target, keysToAdd);
  collector.$merge = added;
  return collector;
}

function compare(collector, base, target) {

  const filters = filterLeafTypes(collector, base, target);
  if (filters.hasOwnProperty('collector')) {
    return filters.collector;
  }

  const values = {
    base,
    target,
    baseKeys: Object.keys(base),
    targetKeys: Object.keys(target),
  }

  collector = compareSameKeys(collector, values);
  collector = removeKeys(collector, values);
  collector = addKeys(collector, values);

  return collector;
}

export default compare;
