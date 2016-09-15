const path = require('path')
module.exports = {
  devtool: 'source-map',
  entry: {
    homepage: "./js/client-entry.js",
    logged_in: "./js/logged-in-entry.js"
  },
  output: {
    path: path.join(__dirname, '/dist'),
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
