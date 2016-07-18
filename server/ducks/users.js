import Immutable from 'immutable';
import { get } from './admin';

export const CONNECT    = 'karel-server/users/CONNECT';
export const DISCONNECT = 'karel-server/users/DISCONNECT';
export const ATTEMPT    = 'karel-server/users/ATTEMPT';
export const LOCK       = 'karel-server/users/LOCK';
export const UNLOCK     = 'karel-server/users/UNLOCK';
export const PUSH       = 'karel-server/users/PUSH';

// For when a world is deleted
export const DELETE_ATTEMPTS_FOR_WORLD = 'karel-server/users/DELETE_ATTEMPTS_FOR_WORLD';

const debug = dbg('karel:server:ducks:user');


export const connect = (token, decoded, profile, socket = null) => (dispatch, getState) => {
  const uid = decoded.sub;
  const state = getState();
  let user;
  if (state.users.has(uid)) {
    debug('Found User: %s', uid);
    user = state.users.get(uid);
  } else {
    debug('Creating User: %s', uid);
    user = Immutable.fromJS({
      id: uid,
      attempts: {},
      admin: !!profile.admin,
      connected: true,
      locked: false,
      queue: [],
      socket,
      token,
      decoded,
      profile,
    });
  }
  dispatch({ type: CONNECT, payload: { user, socket } });
  return user;
}

export const disconnect = uid => (dispatch, getState) => {
  const { user } = dispatch(get(null, uid));
  dispatch({ type: DISCONNECT, payload: user });
};

export const attempt = (uid, code, wid, won) => (dispatch, getState) => {
  const { user } = dispatch(get(null, uid));
  dispatch({ type: ATTEMPT, payload: { user, code, wid, won } });
};

export default (state = new Immutable.Map(), action) => {
  switch (action.type) {
    case CONNECT: {
      let user = action.payload.user;
      user = user.set('connected', true);
      user = user.set('socket', action.payload.socket);
      return state.set(user.get('id'), user);
    }
    case DISCONNECT: {
      let user = action.payload;
      user = user.set('connected', false);
      user = user.set('socket', null);
      return state.set(user.get('id'), user);
    }
    case ATTEMPT: {
      let { user, wid, code, won } = action.payload;
      user = user.updateIn(['attempts', wid], (attempts = new Immutable.List()) => {
        return attempts.push(new Immutable.Map({ date: Date.now(), code }));
      });
      if (won) user = user.update('queue', queue => queue.unshift());
      return state.set(user.get('id'), user);
    }
    case DELETE_ATTEMPTS_FOR_WORLD: {
      const wid = action.payload;
      return state.map(user => {
        user = user.update('attempts', attempts => attempts.delete(wid))
        user = user.update('queue', queue => queue.filter(x => x.wid !== wid));
        return user;
      });
    }
    case PUSH:
      return state.set(action.payload.get('id'), action.payload);
    case LOCK:   return state.setIn([action.payload, 'locked'], true);
    case UNLOCK: return state.setIn([action.payload, 'locked'], false);
    default: return state;
  }
};

