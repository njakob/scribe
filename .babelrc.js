module.exports = {
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-proposal-class-properties',
    ['module-resolver', { root: ['./src'] }],
  ],
};
