import compareArrays from './compareArrays';
import compareObjects from './compareObjects';
import filterLeafTypes from './filterLeafTypes';

function compare(collector, base, target) {

  const filters = filterLeafTypes(collector, base, target);

  if (filters.hasOwnProperty('collector')) {
    return filters.collector;
  }

  if (Array.isArray(base) && Array.isArray(target)) {
    return compareArrays(collector, base, target);
  }

  return compareObjects(collector, base, target, compare);
}

export default compare;
