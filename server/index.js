import 'dotenv/config';
import { createServer } from 'http';
import { resolve } from 'path';
import express from 'express';
import IO from 'socket.io';
import socketioJwt from 'socketio-jwt';
import { readFile, writeFile } from 'fs';
import fetch from 'node-fetch';

const DEFAULT_WORLD = `
Default World
The Default World! <b>Bold Text!</b>
---
moveForward();
turnLeft();
moveForward();
turnLeft();
---
. .|9 .
123 .|.|.
. @|.|#
* . . .
`;

const app = express();
const server = createServer(app);
const io = IO(server);

if (process.env.NODE_ENV === 'development') {
  // Using require so they can be conditonally included.
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config');
  const compiler = webpack(webpackConfig);
  app.use(
    require('webpack-dev-middleware')(compiler, { publicPath: webpackConfig.output.publicPath })
  );
//  app.use(require('webpack-hot-middleware')(compiler));
};

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../index.html'));
});

const getProfile = id_token => {
  console.log('getpro', id_token);
  return fetch(
    'https://' + process.env.AUTH0_DOMAIN + '/tokeninfo',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
    }
  ).then(res => res.json());
}

const setupSocket = socket => {
  socket.emit('pushWorld', DEFAULT_WORLD);
};

io
  .on('connection', socket => {
    // We have to get our handler here first for some reason
    socket.on('authenticate', ({ token }) => {
      socket.token = token;
    });
    socketioJwt.authorize({
      secret: Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
      timeout: 15000,
      // Undocumented. We're just using it to fetch the profile before continuing
      additional_auth: (decoded, onSuccess, onError) => {
        getProfile(socket.token)
          .then(profile => socket.profile = profile)
          .then(() => onSuccess())
          .then(() => setupSocket(socket))
          .catch(onError);
      },
    }).call(this, socket);

  })

io.of('/admin')
  .on('connection', socket => {
    socket.on('authenticate', ({ token }) => socket.token = token);
    socketioJwt.authorize({
      secret: Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
      timeout: 15000,
      // Undocumented option
      additional_auth: (decoded, onSuccess, onError) => {
        getProfile(socket.token).then(profile => {
          socket.profile = profile;
          if (profile.admin === true) onSuccess();
          else onError('You\'re not an admin!');
        }).catch(onError);
      },
    }).call(this, socket);
  })
  .on('authenticated', socket => {
  });

server.listen(process.env.PORT || 8080);

