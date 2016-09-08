const path = require('path')
module.exports = {
  entry: ["./js/index.js"],
  node: {
    fs: "empty", //SHOULD I DO THIS
    net: "empty" //SHOULD I DO THIS
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "bundle.js"
  },
    module: {
      loaders: [
        {
          test: /\.json$/,
          //exclude: '/node_modules/', //SHOULD I DO THIS
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
