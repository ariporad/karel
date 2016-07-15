import { stringify, parse } from 'circular-json';
import IO from 'socket.io-client';
import Auth0Lock from 'auth0-lock';

const debug = dbg('karel:admin:api');

export default () => {
  let store;
  let userProfile, userToken;
  let connected = false;
  let pendingEvents = [];

  const io = IO(document.location.origin + '/admin');

  io.on('connect', () => {
    debug('connected');
    connected = true;
    pendingEvents.forEach(args => emit(...args));
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

  const promiseEmit = (event, data) => new Promise((resolve, reject) => {
    emit(event, data, ({ err, ...ret }) => {
      if (err) return reject(err);
      resolve(ret);
    });
  });

  /**
   * Public APIs
   */
  const setStore = store_ => store = store_;

  const creaetWorld = text => promiseEmit('createWorld', text);
  const createWorld = text => promiseEmit('createWorld', text);
  const deleteWorld = wid  => promiseEmit('deleteWorld', wid);
  const editWorld = (wid, text) => promiseEmit('editWorld', { wid, text });

  const push = (wid, uid) => promiseEmit('push', { wid, uid });
  const force = (wid, uid) => promiseEmit('force', { wid, uid });

  const pushAll = wid => promiseEmit('pushAll', wid);
  const forceAll = wid => promiseEmit('forceAll', wid);

  const listWorlds = () => promiseEmit('listWorlds', null);
  const listUsers = () => promiseEmit('listUsers', null);

  const worldInfo = wid => promiseEmit('worldInfo', wid);
  const userInfo = uid => promiseEmit('userInfo', uid);

  const publicAPI = {
    createWorld,
    deleteWorld,
    editWorld,
    setStore,
    listWorlds,
    listUsers,
    worldInfo,
    userInfo,
    push,
    force,
    pushAll,
    forceAll,
  };

  return new Promise((resolve, reject) => {
    on('authenticated', () => {
      debug('Authenticated!');
      resolve(publicAPI);
    });

    const lock = new Auth0Lock(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__);
    const parseToken = token => {
      lock.getProfile(token, (err, profile) => {
        if (err) return reject(err);

        if (!profile.admin) {
          alert('You\'re not an admin!');
          localStorage.removeItem('token');
          document.location.pathname = '';
        }

        // We use io.emit directly here, because token is consumed by socketio-jwt, which requires
        // an object.
        io.emit('authenticate', { token });

        on('unauthorized', (err, cb) => {
          debug('Authed failed!\n%s\n%s', err.message, err.stack);
          reject(new Error('Auth Failed!'));

          localStorage.removeItem('token');

          // Send them back to Karel
          document.location.pathname = '';
        });
      });
    };

    const login = () => {
      const hash = lock.parseHash();
      if (hash) {
        if (hash.error) return reject(hash.error);
        localStorage.setItem('token', hash.id_token);
        parseToken(hash.id_token);
      } else {
        lock.show({
          callbackURL: document.location.origin + '/admin',
          responseType: 'token',
        });
      }
    };

    if (localStorage.getItem('token')) {
      parseToken(localStorage.getItem('token'));
    } else {
      login();
    }
  });
};

