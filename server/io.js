import { stringify, parse } from 'circular-json';
import socketioJwt from 'socketio-jwt';
import { getProfile } from './utils';
import { connect, disconnect, attempt } from './ducks/users';

const debug = dbg('karel:server:io');

export const setupSocket = (socket, io, store) => {
  // Here, we have to monkey patch, because we send the store out of scope.
  const emit = ::socket.emit;
  const on = ::socket.on;
  socket.emit = (event, data, cb = () => {}) => {
    const fn = data => cb(typeof data === 'string' ? parse(data) : data);
    data = data !== undefined ? stringify(data) : data;
    emit(event, data, fn);
  };
  socket.on = (event, cb) => {
    on(event, (data, fn) => {
      data = typeof data === 'string' ? parse(data) : data;
      cb(data, ret => fn(ret !== undefined ? stringify(ret) : ret));
    });
  };
  try {
    const user = store.dispatch(connect(socket.token, socket.decoded_token, socket.profile, socket));
    const uid = user.get('id');
    debug('User Connected:', uid);
    user.get('queue').forEach(world => socket.emit('pushWorld', world));
    if (user.get('locked')) socket.emit('lock');
    socket.on('disconnect', () => {
      debug('User Disconnected:', uid);
      store.dispatch(disconnect(uid))
    });
    socket.on('attempt', ({ wid, code, won }) => store.dispatch(attempt(uid, code, wid, won)));
  } catch (e) {
    console.error(e.message);
    console.error(e.stack);
    process.exit(1); // TODO
  }
};

export default (io, store) => {
  io.of('/client').on('connection', socket => {
    // We have to get our handler here first for some reason
    socket.on('authenticate', ({ token }) => {
      debug('Got Token: %s', token);
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
          .then(() => setupSocket(socket, io, store))
          .catch(onError);
      },
    }).call(this, socket);
  })
};

