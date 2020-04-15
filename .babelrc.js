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
    presets: ['@babel/preset-env', '@babel/preset-react'],
  };
}
