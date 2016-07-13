import socketioJwt from 'socketio-jwt';
import { getProfile } from './utils';
import { createWorld, pushWorld, forceWorld, pushWorldAll, forceWorldAll } from './ducks/admin';

const debug = dbg('karel:server:admin');

export const setupSocket = (socket, io, store) => {
  socket.on('createWorld', world => {
    debug('Creating World:\n%s', world);
    const wid = store.dispatch(createWorld(world));
    debug('Got wid: %s', wid);
    store.dispatch(pushWorldAll(wid));
  });

  socket.on('push', ({ wid, uid }, fn) => {
    store.dispatch(pushWorld(wid, uid))
    fn();
  });
  socket.on('force', ({ wid, uid }, fn) => {
    store.dispatch(forceWorld(wid, uid))
    fn();
  });

  socket.on('pushAll', (wid, fn) => {
    store.dispatch(pushWorldAll(wid));
    fn();
  });

  socket.on('forceAll', (wid, fn) => {
    store.dispatch(forceWorldAll(wid));
    fn();
  });

  socket.on('listWorlds', (null_, fn) => {
    fn(store.getState().admin.get('worlds').toJS());
  });
  socket.on('listUsers', (null_, fn) => {
    fn(store.getState().users.toJS());
  });
  socket.on('userInfo', (uid, fn) => {
    if (!store.getState().users.has(uid)) return fn({ error: 'No Such User!' });
    fn(store.getState().users.get(uid).toJS());
  });
  socket.on('worldInfo', (wid, fn) => {
    wid = `${wid}`;
    debug('WorldInfo for wid:', wid, typeof wid);
    const state = store.getState();

    if (!state.admin.get('worlds').has(wid)) {
      return fn({ world: null, attempts: null, error: `No Such World: ${wid}!` });
    }

    const world = state.admin.get('worlds').get(wid).toJS();

    // This could, potentially, be a lot of data.
    const attempts = [];
    state.users
      .filter(user => user.get('attempts').has(wid))
      .forEach(user => {
        user.get('attempts').get(wid).forEach(attempt => {
          attempts.push(attempt.set('user', {
            // Only the user data that's guarenteed
            name: user.get('profile').get('name'),
            nickname: user.get('profile').get('nickname'),
            user_id: user.get('profile').get('user_id'),
            uid: user.get('profile').get('user_id'),
            picture: user.get('profile').get('picture'),
          }).toJS());
        });
      });

    fn({ world, attempts });
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
