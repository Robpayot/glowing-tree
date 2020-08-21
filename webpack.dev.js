const w = require('webpack-merge')
const common = require('./webpack.common.js')
const PORT = process.env.PORT || 3000
const path = require('path')

module.exports = w.merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
    compress: true,
    port: PORT,
    watchOptions: {
      poll: true,
    },
  },
})
