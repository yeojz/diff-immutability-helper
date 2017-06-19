import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import size from 'lodash/size';

function compareSameKeys(collector, values, compare) {

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

function addKeys(collector, values) {
  const keysToAdd = difference(values.targetKeys, values.baseKeys);

  if (size(keysToAdd) < 1) {
    return collector;
  }

  const added = pick(values.target, keysToAdd);
  collector.$merge = added;
  return collector;
}

function compareObjects(collector, base, target, compare) {
  const values = {
    base,
    target,
    baseKeys: Object.keys(base),
    targetKeys: Object.keys(target),
  }

  collector = compareSameKeys(collector, values, compare);
  collector = removeKeys(collector, values);
  collector = addKeys(collector, values);

  return collector;
}

export default compareObjects;
