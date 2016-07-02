const webpack = require("webpack");
module.exports = {
  entry: "./js/app.js",
  output: {
    path: __dirname + "/js",
    filename: "index.min.js"
  },
  module: {
    loaders: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader",
      query: {
        presets: ['es2015']
      }
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize:true})
  ]
}
