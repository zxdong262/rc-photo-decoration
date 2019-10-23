const { HotModuleReplacementPlugin, LoaderOptionsPlugin } = require('webpack')
require('dotenv').config()
const { identity } = require('lodash')
const pack = require('../package.json')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const pack = require('../package.json')
const { resolve } = require('path')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { env } = process
const devPort = env.devPort || 6066
const host = env.host || 'localhost'
const { version } = pack
let isProd = env.NODE_ENV === 'production'
const extractTextPlugin1 = new MiniCssExtractPlugin({
  filename: 'css/[name].styles.bundle.css'
})
const stylusSettingPlugin = new LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  },
  'resolve url': false
})
const pug = {
  loader: 'pug-html-loader',
  options: {
    data: {
      version,
      cdn: '',
      _global: {
        version,
        cdn: ''
      }
    }
  }
}
const config = {
  mode: 'development',
  entry: {
    rcp: './src/client/index.js',
    index: './src/views/index.pug'
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  output: {
    path: resolve(__dirname, '../docs'),
    filename: 'js/[name].bundle.js',
    publicPath: '/',
    chunkFilename: 'js/[name].bundle.js',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
              // modifyVars: theme
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|svg|mp3)$/,
        use: ['url-loader?limit=100000&name=images/[name].[ext]']
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?cacheDirectory'
      },
      {
        test: /\.pug$/,
        use: [
          'file-loader?name=index.html',
          'concat-loader',
          'extract-loader',
          'html-loader',
          pug
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  devtool: 'source-map',
  devServer: {
    host,
    disableHostCheck: true,
    contentBase: '../dist/static',
    port: devPort,
    overlay: {
      warnings: true,
      errors: true
    },
    hot: true
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    stylusSettingPlugin,
    extractTextPlugin1
  ].filter(identity)
}

if (isProd) {
  config.plugins = [
    extractTextPlugin1,
    stylusSettingPlugin,
    new MinifyPlugin()
  ]
  config.mode = 'production'
  delete config.watch
  delete config.devtool
  delete config.devServer
}

module.exports = config
