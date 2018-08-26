import isNil from 'lodash/isNil';

const PRIMITIVE_TYPES = ['string', 'boolean', 'number', 'function'];

function filterPrimitives(base, target) {
  return PRIMITIVE_TYPES.indexOf(typeof base) > -1 && base !== target;
}

function filterArrays(base, target) {
  return (
    (Array.isArray(base) && !Array.isArray(target)) ||
    (Array.isArray(target) && !Array.isArray(base))
  );
}

function setCollector(collector, target) {
  collector.$set = target;
  return { collector };
}

function filterLeafTypes(collector, base, target) {
  if (isNil(base) && !isNil(target)) {
    return setCollector(collector, target);
  }

  if (filterPrimitives(base, target)) {
    return setCollector(collector, target);
  }

  if (filterArrays(base, target)) {
    return setCollector(collector, target);
  }

  return {};
}

export default filterLeafTypes;
