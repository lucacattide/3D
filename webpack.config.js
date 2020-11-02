'use strict';
let webpack = require('webpack');
let path = require('path');
module.exports = {
  context: __dirname,
  entry: [
    './js/lib/bootstrap.min.js',
    './js/lib/modernizr-custom.js',
    './js/dist/main.js',
  ],
  output: {
    path: __dirname + 'js/dist',
    filename: 'bundle.js',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }],
  },
};
