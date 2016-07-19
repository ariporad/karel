import { stringify, parse } from 'circular-json';
import socketioJwt from 'socketio-jwt';
import StatusError from './StatusError';
import { getProfile } from './utils';
import {
  createWorld,
  pushWorld,
  forceWorld,
  pushWorldAll,
  forceWorldAll,
  deleteWorld,
  editWorld,
  lock,
  unlock,
  lockAll,
  unlockAll,
  forceAttempt,
} from './ducks/admin';

const debug = dbg('karel:server:admin');

export const setupSocket = (socket, io, store) => {
  const worldExists = wid => !store.getState().admin.get('worlds').has(wid)
  const emit = (event, data, cb = () => {}) => {
    const fn = data => cb(typeof data === 'string' ? parse(data) : data);
    data = data !== undefined ? stringify(data) : data;
    socket.emit(event, data, fn);
  };

  const on = (event, cb) => {
    socket.on(event, (data, fn) => {
      data = typeof data === 'string' ? parse(data) : data;
      debug('Socket.io: Got Data:', typeof data, data);
      let ret;
      try {
        ret = cb(data);
      } catch (err) {
        if (err instanceof StatusError) {
          ret = { status: err.status, err: err };
        }
        ret = { err, status: 500 };
        debug('socket.io: Error:', err);
      }
      fn(stringify(ret !== 'undefined' && ret !== null ? ret : {}));
    });
  };

  on('createWorld', world => {
    debug('Creating World:\n%s', world);
    const wid = store.dispatch(createWorld(world));
    debug('Got wid: %s', wid);
    return { wid };
  });

  on('editWorld', ({ wid, text }) => {
    debug('Updating World:', wid, 'To:\n', text);
    store.dispatch(editWorld(wid, text));
  });
  on('deleteWorld', wid => {
    debug('Deleting World:', wid);
    store.dispatch(deleteWorld(wid));
  });

  on('push',  ({ wid, uid }) => store.dispatch(pushWorld(wid, uid)));
  on('force', ({ wid, uid }) => store.dispatch(forceWorld(wid, uid)));

  on('pushAll',  wid => store.dispatch(pushWorldAll(wid)));
  on('forceAll', wid => store.dispatch(forceWorldAll(wid)));

  on('lock',   ({ uid }) => store.dispatch(lock(uid)));
  on('unlock', ({ uid }) => store.dispatch(unlock(uid)));

  on('lockAll',      () => store.dispatch(lockAll()));
  on('unlockAll',    () => store.dispatch(unlockAll()));

  on('listWorlds',   () => store.getState().admin.get('worlds').toJS());
  on('listUsers',    () => store.getState().users.toJS());

  on('forceAttempt', ({ wid, uid, num }) => store.dispatch(forceAttempt(wid, uid, num)));

  on('userInfo', uid => {
    if (!store.getState().users.has(uid)) throw StatusError(404, 'User Not Found');
    return store.getState().users.get(uid).toJS();
  });
  on('worldInfo', (wid, fn) => {
    wid = `${wid}`;
    debug('WorldInfo for wid:', wid, typeof wid);
    const state = store.getState();

    if (!state.admin.get('worlds').has(wid)) throw new StatusError(404, 'World Not Found');

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

    return { world, attempts };
  });
};

export default (io, store) => {
  io.of('/admin').on('connection', socket => {
    socket.on('authenticate', ({ token }) => socket.token = token);
    socketioJwt.authorize({
      secret: Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
      timeout: 15000,
      // Undocumented option
      additional_auth: (decoded, onSuccess, onError) => {
        getProfile(socket.token).then(profile => {
          socket.profile = profile;
          if (profile.admin === true) onSuccess();
          else onError('You\'re not an admin!', 403);
          setupSocket(socket, io, store);
        }).catch(onError);
      },
    }).call(this, socket);
  });
};
