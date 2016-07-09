import { pushWorld, forceWorld } from './apiDuck';
import IO from 'socket.io-client';
import Auth0Lock from 'auth0-lock';

export default () => {
  let store;
  let userProfile, userToken;

  const io = IO()

  io.on('authenticated', () => {
    console.log('Authed!');
    // TODO: wait for this to happen
  });

  const lock = new Auth0Lock(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__);
  const hash = lock.parseHash();
  if (hash) {
    if (hash.error) return console.log('login error', hash.error);
    lock.getProfile(hash.id_token, (err, profile) => {
      if (err) return console.log('Cannot get user', err);
      userProfile = profile;
      userToken = hash.id_token;
      console.log('profile', userProfile);
      console.log('token', userToken);
      io.on('connect',  () => {
        console.log('conned!');
        io.emit('authenticate', { token: userToken });
      });
      io.on('unauthorized', (err, cb) => {
        console.log('Authed failed!', err);
        setTimeout(() => cb(), 30000);
      });
    });
  } else {
    lock.show();
  }


  //const socket = { on: () => {}, emit: (event, data) => console.log('Socket Event:', event, data) };

  // Give the server access to our store
  io.on('getState', () => io.emit('getState', store.getState()));
  io.on('action', action => store.dispatch(action));

  io.on('pushWorld', world => {
    store.dispatch(pushWorld(world))
  });
  io.on('forceWorld', world => store.dispatch(forceWorld(world)));

  const sendAttempt = (levelId, code) => {
    io.emit('attempt', { lid: levelId, code });
  };

  const setStore = store_ => store = store_;

  return { sendAttempt, setStore };
};
