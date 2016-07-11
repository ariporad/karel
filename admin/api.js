import IO from 'socket.io-client';
import Auth0Lock from 'auth0-lock';

const debug = dbg('karel:admin:api');

export default () => {
  let store;
  let userProfile, userToken;
  let connected = false;
  let pendingEvents = [];

  const io = IO(document.location.href, { multiplex: false });

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

  const publicAPI = { createWorld, setStore };

  return new Promise((resolve, reject) => {
    io.on('authenticated', () => {
      debug('Authenticated!');
      resolve(publicAPI);
    });

    const lock = new Auth0Lock(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__);
    const hash = lock.parseHash();
    if (hash) {
      if (hash.error) return reject(hash.error);

      lock.getProfile(hash.id_token, (err, profile) => {
        if (err) return reject(err);
        userProfile = profile;
        userToken = hash.id_token;

        if (!profile.admin) {
          alert('You\'re not an admin!');
          document.location.pathname = '';
        }

        emit('authenticate', { token: userToken });

        io.on('unauthorized', (err, cb) => {
          debug('Authed failed!\n%s\n%s', err.message, err.stack);
          reject(new Error('Auth Failed!'));

          // Send them back to Karel
          document.location.pathname = '';
        });
      });
    } else {
      lock.show();
    }
  });
};

