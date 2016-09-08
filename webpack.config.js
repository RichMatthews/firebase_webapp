const path = require('path')
module.exports = {
  entry: ["./js/client-entry.js"],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "bundle.js"
  },
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel'
        }
      ]
    }
}
