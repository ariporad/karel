var path = require('path');
var webpack = require('webpack');

const dev  = process.env.NODE_ENV !== 'production';
const prod = process.env.NODE_ENV === 'production';
module.exports = {
  devtool: dev ? 'sourcemap' : 'hidden-source-map',
  entry: dev ? [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ] : './src/index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
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

