export default {
  entry: './src/index.js',
  dest: 'lib/index.js',
  moduleName: 'diffImmutabilityHelper',
  format: 'umd',
  external: [
    'lodash/difference',
    'lodash/intersection',
    'lodash/isEmpty',
    'lodash/isNil',
    'lodash/omit',
    'lodash/pick',
    'lodash/size'
  ],
  globals: {
    'lodash/difference': '_.difference',
    'lodash/intersection': '_.intersection',
    'lodash/isEmpty': '_.isEmpty',
    'lodash/isNil': '_.isNil',
    'lodash/omit': '_.omit',
    'lodash/pick': '_.pick',
    'lodash/size': '_.size'
  }
};
