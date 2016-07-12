import 'dotenv/config';
import { createServer } from 'http';
import { resolve } from 'path';
import express from 'express';
import IO from 'socket.io';
import { readFile, writeFile } from 'fs';
import mkdirp from 'mkdirp';
import setupIO from './io';
import setupAdminIO from './io.admin';
import createStore from './redux';

const debug = dbg('karel:server:index');

const storagePath = './tmp/karel.json';
mkdirp.sync('./tmp');

const app = express();
const server = createServer(app);
const io = IO(server);
const store = createStore({ path: storagePath });

if (process.env.NODE_ENV === 'development') {
  debug('Enabling Webpack');
  // Using require so they can be conditonally included.
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config');
  const compiler = webpack(webpackConfig);
  app.use(require('webpack-dev-middleware')(
    compiler,
    { publicPath: webpackConfig.output.publicPath, noInfo: true }
  ));
//  app.use(require('webpack-hot-middleware')(compiler));
} else {
  app.use('/static', express.static(resolve(__dirname, '..', dist)));
}

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(resolve(__dirname, '../admin.html'));
});

setupIO(io, store);
setupAdminIO(io, store);

server.listen(process.env.PORT || 8080, err => {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }
  debug('Listening on http://localhost:%s', process.env.PORT || 8080);
});

