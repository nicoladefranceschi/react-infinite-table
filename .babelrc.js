const env = process.env.NODE_ENV;

if (env === 'development') {
  module.exports = {
    plugins: ['@babel/plugin-proposal-class-properties'],
    presets: ['@babel/preset-react'],
  };
}

if (env === 'production') {
  module.exports = {
    comments: false,
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties',
    ],
    presets: [
      ['@babel/preset-env', {modules: false}],
      '@babel/preset-react'
    ],
  };
}

if (env === 'commonjs' || env === 'es') {
  module.exports = {
    ignore: [
      'src/demo'
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties'
    ],
    presets: [
      ['@babel/preset-env', {modules: false}],
      '@babel/preset-react'
    ],
  };

  if (env === 'commonjs') {
    module.exports.plugins.push('@babel/plugin-transform-modules-commonjs');
  }
}
