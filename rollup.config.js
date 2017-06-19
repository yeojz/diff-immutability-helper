export default {
  entry: './src/index.js',
  dest: 'lib/index.js',
  format: 'cjs',
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
