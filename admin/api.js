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
    pendingEvents.forEach(args => io.emit(...args));
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
  io.on('getState', () => io.emit('getState', store.getState()));
  io.on('action', action => store.dispatch(action));

  /**
   * Public APIs
   */
  const setStore = store_ => store = store_;

  const createWorld = text => io.emit('createWorld', text);

  const push = (wid, uid) => new Promise(done => io.emit('push', { wid, uid }, done));
  const force = (wid, uid) => new Promise(done => io.emit('force', { wid, uid }, done));

  const pushAll = wid => new Promise(done => io.emit('pushAll', wid, done));
  const forceAll = wid => new Promise(done => io.emit('forceAll', wid, done));

  const listWorlds = () => new Promise(done => io.emit('listWorlds', null, done));
  const listUsers = () => new Promise(done => io.emit('listUsers', null, done));

  const worldInfo = wid => new Promise(done => io.emit('worldInfo', wid, done));
  const userInfo = uid => new Promise(done => io.emit('userInfo', uid, done));

  const publicAPI = {
    createWorld,
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
    io.on('authenticated', () => {
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

        emit('authenticate', { token });

        io.on('unauthorized', (err, cb) => {
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

