const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

// For development purposes
const dev = true;

// Disable the annoying deprecation warning
// https://github.com/webpack/loader-utils/issues/56
process.noDeprecation = true; // eslint-disable-line

// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const webpackconfig = {
  target: 'node',
  context: path.join(__dirname, 'src'),
  entry: path.join(__dirname, 'src') + '/server.js',
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader?cacheDirectory=true',
        query: {
          presets: [
            'es2015',
            'stage-0',
            [
              'env',
              {
                targets: {
                  node: 'current'
                }
              }
            ]
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src')]
  },
  // http://jlongster.com/Backend-Apps-with-Webpack--Part-I
  externals: nodeModules,
  output: {
    path: __dirname + '/dist',
    filename: 'server.js'
  }
};

// Plugins which are only available when env=dev
if (!dev) {
  webpackconfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = webpackconfig;
