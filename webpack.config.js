const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  devtool: isProd ? 'source-map' : 'eval',
  entry: {
    demo: './src/demo/index'
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'static/[name].js'
  },
  performance: { hints: false },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: './src/demo/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.join(__dirname, 'src')
      }
    ]
  },
  devServer: isProd ? undefined : {
    contentBase: 'build',
    port: 3000
  }
}
