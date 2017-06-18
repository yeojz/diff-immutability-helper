const compare = require('./compare');

function diff(base, target) {
  return compare({}, base, target)
}

module.exports = diff;
