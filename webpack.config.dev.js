const { merge } = require('webpack-merge');
const path = require('path');
const commonConfig = require('./webpack.config.common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: { // Start a dev server on port 2020
    contentBase: path.resolve(__dirname, 'dist'),
    port: 2020,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
});
