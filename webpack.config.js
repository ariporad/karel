const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const test = process.env.NODE_ENV === 'test' || process.env.TEST || process.env.CI;
const dev  = process.env.NODE_ENV !== 'production' && !test;
const prod = process.env.NODE_ENV === 'production' && !test;

console.log(`dev: ${dev}, test: ${test}, prod: ${prod}`);

const config = module.exports = {
  devtool: dev || test ? 'sourcemap' : 'hidden-source-map',
  entry: dev || test ? [
    'webpack-hot-middleware/client',
    test ? 'mocha!./test/index.js' : './src/index',
  ] : './src/index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
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
    },
    // For Auth0
    {
      test: /node_modules[\\\/]auth0-lock[\\\/].*\.js$/,
      loaders: [
        'transform-loader/cacheable?brfs',
        'transform-loader/cacheable?packageify'
      ],
    },
    {
      test: /node_modules[\\\/]auth0-lock[\\\/].*\.ejs$/,
      loader: 'transform-loader/cacheable?ejsify',
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

// Stolen from https://git.io/vKsyE
// ENV variables
const dotEnvVars = dotenv.config();
const environmentEnv = dotenv.config({
  path: path.join(path.resolve(__dirname), 'config', `${process.env.NODE_ENV}.config.js`),
  silent: true,
});
const envVariables =
    Object.assign({}, dotEnvVars, environmentEnv);

const defines =
  Object.keys(envVariables)
  .reduce((memo, key) => {
    const val = JSON.stringify(envVariables[key]);
    memo[`__${key.toUpperCase()}__`] = val;
    return memo;
  }, {
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV)
  });

config.plugins = [
  new webpack.DefinePlugin(defines)
].concat(config.plugins);
// END ENV variables
