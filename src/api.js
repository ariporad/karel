import { stringify, parse } from 'circular-json';
import { pushWorld, forceWorld } from './apiDuck';
import { setCode } from './Editor/duck';
import { lock, unlock } from './Locker/duck';
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
  const emit = (event, data, cb = () => {}) => {
    const fn = data => cb(typeof data === 'string' ? parse(data) : data);
    data = data !== undefined ? stringify(data) : data;
    if (connected) io.emit(event, data, fn);
    else pendingEvents.push([event, data, fn]);
  };

  const on = (event, cb) => {
    io.on(event, (data, fn) => {
      data = typeof data === 'string' ? parse(data) : data;
      cb(data, ret => fn(ret !== undefined ? stringify(ret) : ret));
    });
  };

  const promiseEmit = (event, data) => new Promise(done => emit(event, data, done));

  /**
   * Public APIs
   */
  const sendAttempt = (wid, code, won) => emit('attempt', { wid, code, won });

  const setStore = store_ => store = store_;

  const publicAPI = { sendAttempt, setStore };

  on('pushWorld',  world => store.dispatch(pushWorld(world)));
  on('forceWorld', world => store.dispatch(forceWorld(world)));
  on('setCode',    code  => {
    debugger;
    store.dispatch(setCode(code))
  });
  on('lock', () => {
    const state = store.getState();
    api.sendAttempt(state.KarelWorld.wid, state.Editor.code, false);
    store.dispatch(lock())
  });
  on('unlock', () => store.dispatch(unlock()));


  return new Promise((resolve, reject) => {
    on('authenticated', () => {
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

        // We use io.emit directly because token is consumed by socketio-jwt, which requires an
        // object
        io.emit('authenticate', { token: userToken });

        on('unauthorized', (err, cb) => {
          reject(new Error('Auth Failed!'));
          return cb();
        });
      });
    } else {
      lock.show();
    }
  });
};
