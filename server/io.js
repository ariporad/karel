import socketioJwt from 'socketio-jwt';
import { getProfile } from './utils';
import { connect, disconnect, attempt } from './ducks/users';

const debug = dbg('karel:server:io');

export const setupSocket = (socket, io, store) => {
  try {
    const user = store.dispatch(connect(socket.token, socket.decoded_token, socket.profile, socket));
    debug('User Connected:', user.toJS());
    user.get('queue').forEach(world => socket.emit('pushWorld', world));
    socket.on('disconnect', () => {
      debug('User Disconnected:', user.toJS());
      store.dispatch(disconnect(user))
    });
    socket.on('attempt', ({ wid, code }) => store.dispatch(attempt(user, code, wid)));
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

