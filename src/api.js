import { pushWorld, forceWorld } from './apiDuck';
import IO from 'socket.io-client';
import Auth0Lock from 'auth0-lock';

export default () => {
  let store;
  let userProfile, userToken;
  let connected = false;
  let pendingEvents = [];

  const io = IO(document.location.origin + '/client');

  io.on('connect', () => {
    console.log('Connected!');
    connected = true;
    pendingEvents.forEach(([event, data]) => io.emit(event, data));
    pendingEvents = null;
  });

  /**
   * Emit an event when the socket connects, or immidiately if we're already connected.
   */
  const emit = (event, data) => {
    if (connected) io.emit(event, data);
    else pendingEvents.push([event, data]);
  };

  // Give the server access to our store
  io.on('getState', () => emit('getState', store.getState()));
  io.on('action', action => store.dispatch(action));

  io.on('pushWorld', world => store.dispatch(pushWorld(world)));
  io.on('forceWorld', world => store.dispatch(forceWorld(world)));

  /**
   * Public APIs
   */
  const sendAttempt = (wid, code) => emit('attempt', { wid, code });

  const setStore = store_ => store = store_;

  const publicAPI = { sendAttempt, setStore };

  return new Promise((resolve, reject) => {
    io.on('authenticated', () => {
      console.log('Authed!');
      resolve(publicAPI);
    });

    const lock = new Auth0Lock(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__);
    const hash = lock.parseHash();
    if (hash) {
      if (hash.error) return reject(hash.error);

      lock.getProfile(hash.id_token, (err, profile) => {
        if (err) return reject(new Error('Cannot get User!'));
        userProfile = profile;
        userToken = hash.id_token;

        emit('authenticate', { token: userToken });

        io.on('unauthorized', (err, cb) => {
          reject(new Error('Auth Failed!'));
          return cb();
        });
      });
    } else {
      lock.show();
    }
  });
};