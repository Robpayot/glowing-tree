const path = require('path')
const HandlebarsPlugin = require('handlebars-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const cssnano = require('cssnano')

const { registerHandlersHelpers } = require('./webpack.helpers.js')

const mode = process.env.NODE_ENV || 'production'

const sourceDir = path.join(__dirname, 'src')
const templateDir = path.join(__dirname, 'generated')
const buildDir = path.join(__dirname, 'build')

const isProd = mode === 'production'
const prodPlugins = [new ImageminPlugin({ test: /\.(jpeg|png|gif|svg)$/i })]

module.exports = {
  mode,
  devtool: 'source-map',
  entry: path.join(sourceDir, 'entry.js'),
  output: {
    filename: isProd ? 'bundle.[chunkhash].js' : './bundle.js',
    path: buildDir,
    publicPath: '/',
  },
  resolve: {
    alias: {
      '~constants': `${sourceDir}/js/constants`,
      '~managers': `${sourceDir}/js/managers`,
      '~utils': `${sourceDir}/js/utils`,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          isProd
            ? {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [postcssPresetEnv(), cssnano()],
              },
            }
            : null,
          'sass-loader',
        ].filter(Boolean),
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'fonts/[name].[ext]' },
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: ['webpack-glsl-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'ignore-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(sourceDir, 'views', 'layout', 'template.hbs'),
      filename: path.join(templateDir, 'template.hbs'),
      inject: false,
    }),
    new HandlebarsPlugin({
      htmlWebpackPlugin: {
        enabled: true,
        prefix: 'html',
      },
      entry: path.join(sourceDir, 'views', '*.hbs'),
      output: name => {
        const page = name !== 'index' ? name : ''
        return path.join(buildDir, page, 'index.html')
      },
      data: path.join(sourceDir, 'data', '*.json'),
      partials: [path.join(templateDir, 'template.hbs'), path.join(sourceDir, 'views', '*', '*.hbs')],
      onBeforeSetup: Handlebars => {
        return registerHandlersHelpers(Handlebars)
      },
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(sourceDir, 'img'),
        to: 'img',
      },
    ]),
    new MiniCssExtractPlugin({
      filename: isProd ? '[name].[chunkhash].css' : '[name].css',
      chunkFilename: '[id].css',
      fallback: 'style-loader',
      use: [{ loader: 'css-loader', options: { minimize: isProd } }],
    }),
  ].concat(isProd ? prodPlugins : [])
}
