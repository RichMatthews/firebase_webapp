const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'source-map',

  entry: {
    homepage: "./js/client-entry.js",
    logged_in: "./js/logged-in-entry.js"
  },

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "[name].bundle.js"
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  }
}
