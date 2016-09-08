const path = require('path')
module.exports = {
  entry: ["./js/index.js"],
  //target: 'node',
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
          exclude: /(node_modules|bower_components)/,
          loader: 'babel'
        }
      ]
    }
}
