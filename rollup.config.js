/*eslint-disable no-console*/
const path = require('path');

const ROOT_DIR = path.resolve(__dirname);

function bundle(format, ext = '') {
  return {
    input: path.join(ROOT_DIR, 'src', 'index.js'),
    output: {
      file: path.join(ROOT_DIR, 'lib', 'index' + ext + '.js'),
      format: format
    },
    external: [
      'adiff',
      'lodash/difference',
      'lodash/intersection',
      'lodash/isEmpty',
      'lodash/isNil',
      'lodash/omit',
      'lodash/pick',
      'lodash/size'
    ]
  };
}

module.exports = [bundle('cjs'), bundle('esm', '.esm')];
