var path = require('path');
var webpack = require('webpack');

const test = process.env.NODE_ENV === 'test' || process.env.TEST || process.env.CI;
const dev  = process.env.NODE_ENV !== 'production' && !test;
const prod = process.env.NODE_ENV === 'production' && !test;

console.log(`dev: ${dev}, test: ${test}, prod: ${prod}`);

module.exports = {
  devtool: dev || test ? 'sourcemap' : 'hidden-source-map',
  entry: dev || test ? [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    test ? 'mocha!./test/index.js' : './src/index',
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
      Radium: 'radium',
    }),
    new webpack.DefinePlugin({
      __DEV__: dev || test,
      __PROD__: prod,
      __TEST__: test,
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
  // These are for enzyme
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};

if (dev)  module.exports.plugins.unshift(new webpack.HotModuleReplacementPlugin());
if (prod) module.exports.plugins.unshift(new webpack.optimize.UglifyJsPlugin());

