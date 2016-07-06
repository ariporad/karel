var path = require('path');
var webpack = require('webpack');

const test = process.env.NODE_ENV === 'test' || process.env.TEST || process.env.CI;
const dev  = process.env.NODE_ENV !== 'production' && !test;
const prod = process.env.NODE_ENV === 'production' && !test;
module.exports = {
  devtool: dev || test ? 'sourcemap' : 'hidden-source-map',
  entry: dev || test ? [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    test ? 'mocha!./src/test.js' : './src/index',
  ] : './src/index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: test && 0 ? 'test.js' : 'bundle.js',
    publicPath: test && 0 ? '/' : '/static/'
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.json$/,
      loaders: ['json']
    }],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
  },
};

if (dev)  module.exports.plugins.unshift(new webpack.HotModuleReplacementPlugin());
if (prod) module.exports.plugins.unshift(new webpack.optimize.UglifyJsPlugin());

