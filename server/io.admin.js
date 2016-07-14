import { stringify, parse } from 'circular-json';
import socketioJwt from 'socketio-jwt';
import { getProfile } from './utils';
import {
  createWorld,
  pushWorld,
  forceWorld,
  pushWorldAll,
  forceWorldAll,
  deleteWorld,
  editWorld,
} from './ducks/admin';

const debug = dbg('karel:server:admin');

export const setupSocket = (socket, io, store) => {
  const emit = (event, data, cb = () => {}) => {
    const fn = data => cb(typeof data === 'string' ? parse(data) : data);
    data = data !== undefined ? stringify(data) : data;
    socket.emit(event, data, fn);
  };

  const on = (event, cb) => {
    socket.on(event, (data, fn) => {
      data = typeof data === 'string' ? parse(data) : data;
      debug('Socket.io: Got Data:', typeof data, data);
      cb(data, ret => fn(ret !== undefined ? stringify(ret) : ret));
    });
  };

  on('createWorld', (world, fn) => {
    debug('Creating World:\n%s', world);
    const wid = store.dispatch(createWorld(world));
    debug('Got wid: %s', wid);
    store.dispatch(pushWorldAll(wid));
    fn(wid);
  });

  on('editWorld', ({ wid, text }, fn) => {
    debug('Updating World:', wid, 'To:\n', text);
    store.dispatch(editWorld(wid, text));
    fn();
  });
  on('deleteWorld', (wid, fn) => {
    debug('Deleting World:', wid);
    store.dispatch(deleteWorld(wid));
    fn();
  });

  on('push', ({ wid, uid }, fn) => {
    store.dispatch(pushWorld(wid, uid))
    fn();
  });
  on('force', ({ wid, uid }, fn) => {
    store.dispatch(forceWorld(wid, uid))
    fn();
  });

  on('pushAll', (wid, fn) => {
    store.dispatch(pushWorldAll(wid));
    fn();
  });

  on('forceAll', (wid, fn) => {
    store.dispatch(forceWorldAll(wid));
    fn();
  });

  on('listWorlds', (null_, fn) => {
    fn(store.getState().admin.get('worlds').toJS());
  });
  on('listUsers', (null_, fn) => {
    fn(store.getState().users.toJS());
  });
  on('userInfo', (uid, fn) => {
    if (!store.getState().users.has(uid)) return fn({ error: 'No Such User!' });
    fn(store.getState().users.get(uid).toJS());
  });
  on('worldInfo', (wid, fn) => {
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
