const nodeExternals = require('webpack-node-externals')
const path = require('path')

const rootPath = path.join(__dirname, '..')

module.exports = {
  devtool: 'source-map',

  target: 'node',

  entry: {
    main: `${rootPath}/barf/index.js`,
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  output: {
    filename: '[name].[hash].js',
    path: `${rootPath}/dist`,
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },

  externals: [nodeExternals()],
}
