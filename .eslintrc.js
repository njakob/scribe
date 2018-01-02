module.exports = {
  extends: [
    '@njakob/eslint-config/es6-flow',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  env: {
    node: true,
  },
};
