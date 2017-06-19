import {diff} from 'adiff';

function compareArrays(collector, base, target) {
  const changes = diff(base, target);

  if (changes.length > 0) {
    collector.$splice = changes;
  }

  return collector;
}

export default compareArrays;
