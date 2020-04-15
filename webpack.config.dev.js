const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  devtool: 'eval',
  entry: {
    demo: './src/demo/index',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'static/[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: './index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.join(__dirname, 'src'),
      }
    ],
  },
  devServer: {
    contentBase: 'build',
    port: 3000,
  },
};