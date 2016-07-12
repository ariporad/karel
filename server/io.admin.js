import socketioJwt from 'socketio-jwt';
import { getProfile } from './utils';
import { createWorld, pushWorldAll } from './ducks/admin';

const debug = dbg('karel:server:admin');

export const setupSocket = (socket, io, store) => {
  socket.on('createWorld', world => {
    debug('Creating World:\n%s', world);
    const wid = store.dispatch(createWorld(world));
    debug('Got wid: %s', wid);
    store.dispatch(pushWorldAll(wid));
  });
};

export default (io, store) => {
  io.of('/admin').on('connection', socket => {
    socket.on('authenticate', ({ token }) => socket.token = token);
    socketioJwt.authorize({
      secret: Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
      timeout: 20000,
      // Undocumented option
      additional_auth: (decoded, onSuccess, onError) => {
        getProfile(socket.token).then(profile => {
          socket.profile = profile;
          if (profile.admin === true) onSuccess();
          else onError('You\'re not an admin!', 'ENOTADMIN');
          setupSocket(socket, io, store);
        }).catch(onError);
      },
    }).call(this, socket);
  });
};
