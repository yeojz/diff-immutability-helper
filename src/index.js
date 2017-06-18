import compare from './compare';

function diff(base, target) {
  return compare({}, base, target)
}

export default diff;
